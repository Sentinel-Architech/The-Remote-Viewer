import * as ed from '@noble/ed25519';
import * as SecureStore from 'expo-secure-store';
import { base58btc } from 'multiformats/bases/base58';
import { Buffer } from 'buffer';
import { destroyDidCommState } from './didcomm';
import { destroyAllDemoCredentials } from './credentials';
import { destroyAllConnections } from './connections';
import { destroyLocalProfile } from './profile';
import { destroyHumanAttestation } from './humanVerification';

const ED25519_MULTICODEC = new Uint8Array([0xed, 0x01]);

const STORAGE_PRIVATE = 'did_key_private';
const STORAGE_DID = 'did_key_id';

const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  requireAuthentication: true,
};

export type DidKeyIdentity = {
  did: string;
  publicKeyHex: string;
  createdAt: number;
};

export async function createDidKey(): Promise<DidKeyIdentity> {
  const privateKey = new Uint8Array(32);
  crypto.getRandomValues(privateKey);

  const publicKey = await ed.getPublicKeyAsync(privateKey);

  const multicodecKey = new Uint8Array(ED25519_MULTICODEC.length + publicKey.length);
  multicodecKey.set(ED25519_MULTICODEC, 0);
  multicodecKey.set(publicKey, ED25519_MULTICODEC.length);

  const did = `did:key:${base58btc.encode(multicodecKey)}`;

  await SecureStore.setItemAsync(
    STORAGE_PRIVATE,
    Buffer.from(privateKey).toString('hex'),
    SECURE_OPTIONS
  );
  await SecureStore.setItemAsync(STORAGE_DID, did, SECURE_OPTIONS);

  privateKey.fill(0);

  return {
    did,
    publicKeyHex: Buffer.from(publicKey).toString('hex'),
    createdAt: Date.now(),
  };
}

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

export async function destroyDidKey() {
  await SecureStore.deleteItemAsync(STORAGE_PRIVATE);
  await SecureStore.deleteItemAsync(STORAGE_DID);
  await destroyDidCommState();
  await destroyAllDemoCredentials();
  await destroyAllConnections();
  await destroyLocalProfile();
  await destroyHumanAttestation();
}

export async function signWithDidKey(message: string): Promise<string | null> {
  const privateKeyHex = await SecureStore.getItemAsync(STORAGE_PRIVATE);
  if (!privateKeyHex) return null;

  const privateKey = Buffer.from(privateKeyHex, 'hex');
  const messageBytes = new TextEncoder().encode(message);
  const signature = await ed.signAsync(messageBytes, privateKey);

  privateKey.fill(0);

  return Buffer.from(signature).toString('hex');
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
