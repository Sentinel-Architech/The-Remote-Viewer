import * as ed from '@noble/ed25519';
import * as SecureStore from 'expo-secure-store';
import { base58btc } from 'multiformats/bases/base58';

// Multicodec for Ed25519 public key
const ED25519_MULTICODEC = new Uint8Array([0xed, 0x01]);

const STORAGE_PRIVATE = 'did_key_private';
const STORAGE_DID = 'did_key_id';

export type DidKeyIdentity = {
  did: string;
  publicKeyHex: string;
  createdAt: number;
};

/**
 * Create a new did:key identity (Ed25519)
 * Uses device CSPRNG via expo-crypto polyfill
 */
export async function createDidKey(): Promise<DidKeyIdentity> {
  // 100% local secure random
  const privateKey = new Uint8Array(32);
  crypto.getRandomValues(privateKey);

  const publicKey = await ed.getPublicKeyAsync(privateKey);

  // Build did:key
  const multicodecKey = new Uint8Array(ED25519_MULTICODEC.length + publicKey.length);
  multicodecKey.set(ED25519_MULTICODEC, 0);
  multicodecKey.set(publicKey, ED25519_MULTICODEC.length);

  const did = `did:key:${base58btc.encode(multicodecKey)}`;

  // Store only on device
  await SecureStore.setItemAsync(STORAGE_PRIVATE, Buffer.from(privateKey).toString('hex'));
  await SecureStore.setItemAsync(STORAGE_DID, did);

  return {
    did,
    publicKeyHex: Buffer.from(publicKey).toString('hex'),
    createdAt: Date.now(),
  };
}

/**
 * Get current did:key identity (if any)
 */
export async function getCurrentDidKey(): Promise<DidKeyIdentity | null> {
  const did = await SecureStore.getItemAsync(STORAGE_DID);
  const privateKeyHex = await SecureStore.getItemAsync(STORAGE_PRIVATE);

  if (!did || !privateKeyHex) return null;

  const privateKey = Buffer.from(privateKeyHex, 'hex');
  const publicKey = await ed.getPublicKeyAsync(privateKey);

  return {
    did,
    publicKeyHex: Buffer.from(publicKey).toString('hex'),
    createdAt: 0,
  };
}

/**
 * Destroy = Restart from Square One
 */
export async function destroyDidKey() {
  await SecureStore.deleteItemAsync(STORAGE_PRIVATE);
  await SecureStore.deleteItemAsync(STORAGE_DID);
}

/**
 * Sign a message with the current did:key
 */
export async function signWithDidKey(message: string): Promise<string | null> {
  const privateKeyHex = await SecureStore.getItemAsync(STORAGE_PRIVATE);
  if (!privateKeyHex) return null;

  const privateKey = Buffer.from(privateKeyHex, 'hex');
  const messageBytes = new TextEncoder().encode(message);
  const signature = await ed.signAsync(messageBytes, privateKey);

  return Buffer.from(signature).toString('hex');
}
