import * as ed from '@noble/ed25519';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const KEY_PRIVATE = 'presence_private_key';
const KEY_PROOF = 'presence_proof';

export type PresenceProof = {
  publicKey: string;
  signature: string;
  timestamp: number;
  expiresAt: number;
};

async function getOrCreateKeyPair() {
  let privateKeyHex = await SecureStore.getItemAsync(KEY_PRIVATE);

  if (!privateKeyHex) {
    const privateKey = ed.utils.randomPrivateKey();
    privateKeyHex = Buffer.from(privateKey).toString('hex');
    await SecureStore.setItemAsync(KEY_PRIVATE, privateKeyHex);
  }

  const privateKey = Buffer.from(privateKeyHex, 'hex');
  const publicKey = await ed.getPublicKey(privateKey);

  return {
    privateKey,
    publicKey: Buffer.from(publicKey).toString('hex'),
  };
}

export async function createPresenceProof(durationSeconds = 60): Promise<PresenceProof> {
  const { privateKey, publicKey } = await getOrCreateKeyPair();
  const timestamp = Date.now();
  const expiresAt = timestamp + durationSeconds * 1000;

  const message = `presence:${timestamp}:${expiresAt}`;
  const messageBytes = new TextEncoder().encode(message);
  const signature = await ed.sign(messageBytes, privateKey);

  const proof: PresenceProof = {
    publicKey,
    signature: Buffer.from(signature).toString('hex'),
    timestamp,
    expiresAt,
  };

  await SecureStore.setItemAsync(KEY_PROOF, JSON.stringify(proof));
  return proof;
}

export async function getCurrentProof(): Promise<PresenceProof | null> {
  const raw = await SecureStore.getItemAsync(KEY_PROOF);
  if (!raw) return null;

  const proof: PresenceProof = JSON.parse(raw);
  if (Date.now() > proof.expiresAt) {
    await destroyPresence();
    return null;
  }
  return proof;
}

export async function destroyPresence() {
  await SecureStore.deleteItemAsync(KEY_PRIVATE);
  await SecureStore.deleteItemAsync(KEY_PROOF);
}
