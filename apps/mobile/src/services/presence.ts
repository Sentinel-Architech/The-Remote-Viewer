/**
 * Local did:key identity scaffold — NOT production security.
 * Keys stay on-device via SecureStore. No platform recovery.
 *
 * RNG: use expo-crypto (RN has no crypto.getRandomValues by default).
 */
import * as ed from '@noble/ed25519';
import * as SecureStore from 'expo-secure-store';
import * as ExpoCrypto from 'expo-crypto';
import { sha512 } from '@noble/hashes/sha512';

// noble-ed25519 expects sync sha512 in RN
ed.etc.sha512Sync = (...m: Uint8Array[]) => sha512(ed.etc.concatBytes(...m));

const KEY_PRIVATE = 'trv_did_private_key_hex';
const KEY_DID = 'trv_did_key_string';

export type DidKeyIdentity = {
  did: string;
  publicKeyHex: string;
};

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.length % 2 ? '0' + hex : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/** CSPRNG without Web Crypto — avoids getRandomValues of undefined on RN */
function randomPrivateKey32(): Uint8Array {
  return ExpoCrypto.getRandomBytes(32);
}

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function base58btcEncode(data: Uint8Array): string {
  if (data.length === 0) return '';
  let zeros = 0;
  while (zeros < data.length && data[zeros] === 0) zeros++;
  const size = Math.floor(((data.length - zeros) * 138) / 100) + 1;
  const buf = new Uint8Array(size);
  let length = 0;
  for (let i = zeros; i < data.length; i++) {
    let carry = data[i];
    let j = 0;
    for (let k = size - 1; k >= 0 && (carry !== 0 || j < length); k--, j++) {
      carry += 256 * buf[k];
      buf[k] = carry % 58;
      carry = (carry / 58) | 0;
    }
    length = j;
  }
  let it = size - length;
  while (it < size && buf[it] === 0) it++;
  let str = '1'.repeat(zeros);
  for (; it < size; it++) str += B58[buf[it]];
  return str;
}

function publicKeyToDidKey(publicKey: Uint8Array): string {
  const multicodec = new Uint8Array(2 + publicKey.length);
  multicodec[0] = 0xed;
  multicodec[1] = 0x01;
  multicodec.set(publicKey, 2);
  return `did:key:z${base58btcEncode(multicodec)}`;
}

/** Create a new did:key identity and persist private key on-device only */
export async function createDidKeyIdentity(): Promise<DidKeyIdentity> {
  const privateKey = randomPrivateKey32();
  const publicKey = await ed.getPublicKeyAsync(privateKey);
  const publicKeyHex = bytesToHex(publicKey);
  const did = publicKeyToDidKey(publicKey);

  await SecureStore.setItemAsync(KEY_PRIVATE, bytesToHex(privateKey));
  await SecureStore.setItemAsync(KEY_DID, did);

  return { did, publicKeyHex };
}

/** Alias used by some screen stubs */
export async function createDidKey(): Promise<DidKeyIdentity> {
  return createDidKeyIdentity();
}

export async function getDidKeyIdentity(): Promise<DidKeyIdentity | null> {
  const did = await SecureStore.getItemAsync(KEY_DID);
  const privateKeyHex = await SecureStore.getItemAsync(KEY_PRIVATE);
  if (!did || !privateKeyHex) return null;

  const privateKey = hexToBytes(privateKeyHex);
  const publicKey = await ed.getPublicKeyAsync(privateKey);
  return { did, publicKeyHex: bytesToHex(publicKey) };
}

export async function getCurrentDidKey(): Promise<DidKeyIdentity | null> {
  return getDidKeyIdentity();
}

export async function destroyDidKeyIdentity(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_PRIVATE);
  await SecureStore.deleteItemAsync(KEY_DID);
}

export async function destroyDidKey(): Promise<void> {
  return destroyDidKeyIdentity();
}

export type PresenceProof = DidKeyIdentity & {
  publicKey: string;
  signature?: string;
  timestamp?: number;
  expiresAt?: number;
};

export async function createPresenceProof(_durationSeconds = 60): Promise<PresenceProof> {
  const id = await createDidKeyIdentity();
  return { ...id, publicKey: id.publicKeyHex };
}

export async function getCurrentProof(): Promise<PresenceProof | null> {
  const id = await getDidKeyIdentity();
  if (!id) return null;
  return { ...id, publicKey: id.publicKeyHex };
}

export async function destroyPresence(): Promise<void> {
  await destroyDidKeyIdentity();
}
