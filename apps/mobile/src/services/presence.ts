import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';
import * as SecureStore from 'expo-secure-store';
import { base58btc } from 'multiformats/bases/base58';

// Required on React Native / Expo Go (no crypto.subtle)
ed.hashes.sha512 = sha512;
ed.hashes.sha512Async = (m: Uint8Array) => Promise.resolve(sha512(m));

const ED25519_MULTICODEC = new Uint8Array([0xed, 0x01]);

const STORAGE_PRIVATE = 'did_key_private';
const STORAGE_DID = 'did_key_id';

/**
 * SecureStore options for the current scaffold:
 * - WHEN_UNLOCKED_THIS_DEVICE_ONLY → never backed up to cloud / other devices
 * - requireAuthentication: false  → Expo Go / GrapheneOS often fails silently when true
 *
 * Re-enable requireAuthentication: true in production / custom dev-client builds.
 */
const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  requireAuthentication: false,
};

export type DidKeyIdentity = {
  did: string;
  publicKeyHex: string;
  createdAt: number;
};

/** Convert Uint8Array → lowercase hex string */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Convert lowercase hex string → Uint8Array */
function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/** Overwrite a Uint8Array with zeros (best-effort zeroization) */
function zeroize(bytes: Uint8Array): void {
  bytes.fill(0);
}

export async function createDidKey(): Promise<DidKeyIdentity> {
  const privateKey = new Uint8Array(32);
  crypto.getRandomValues(privateKey);

  // Sync API — does not require crypto.subtle
  const publicKey = ed.getPublicKey(privateKey);

  const multicodecKey = new Uint8Array(ED25519_MULTICODEC.length + publicKey.length);
  multicodecKey.set(ED25519_MULTICODEC, 0);
  multicodecKey.set(publicKey, ED25519_MULTICODEC.length);

  const did = `did:key:${base58btc.encode(multicodecKey)}`;

  await SecureStore.setItemAsync(STORAGE_PRIVATE, bytesToHex(privateKey), SECURE_OPTIONS);
  await SecureStore.setItemAsync(STORAGE_DID, did, SECURE_OPTIONS);

  const publicKeyHex = bytesToHex(publicKey);

  zeroize(privateKey);

  return {
    did,
    publicKeyHex,
    createdAt: Date.now(),
  };
}

export async function getCurrentDidKey(): Promise<DidKeyIdentity | null> {
  const did = await SecureStore.getItemAsync(STORAGE_DID, SECURE_OPTIONS);
  const privateKeyHex = await SecureStore.getItemAsync(STORAGE_PRIVATE, SECURE_OPTIONS);

  if (!did || !privateKeyHex) return null;

  const privateKey = hexToBytes(privateKeyHex);
  const publicKey = ed.getPublicKey(privateKey);

  const identity: DidKeyIdentity = {
    did,
    publicKeyHex: bytesToHex(publicKey),
    createdAt: 0,
  };

  zeroize(privateKey);
  return identity;
}

export async function destroyDidKey(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_PRIVATE, SECURE_OPTIONS);
  await SecureStore.deleteItemAsync(STORAGE_DID, SECURE_OPTIONS);
}

export async function signWithDidKey(message: string): Promise<string | null> {
  const privateKeyHex = await SecureStore.getItemAsync(STORAGE_PRIVATE, SECURE_OPTIONS);
  if (!privateKeyHex) return null;

  const privateKey = hexToBytes(privateKeyHex);
  const messageBytes = new TextEncoder().encode(message);

  // Sync API — does not require crypto.subtle
  const signature = ed.sign(messageBytes, privateKey);

  const signatureHex = bytesToHex(signature);

  zeroize(privateKey);
  return signatureHex;
}

export function buildDidDocument(identity: DidKeyIdentity) {
  const did = identity.did;
  const multibaseKey = did.replace('did:key:', '');
  const keyId = `${did}#${multibaseKey}`;

  return {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1',
    ],
    id: did,
    verificationMethod: [
      {
        id: keyId,
        type: 'Ed25519VerificationKey2020',
        controller: did,
        publicKeyMultibase: multibaseKey,
      },
    ],
    authentication: [keyId],
    assertionMethod: [keyId],
  };
}
