/**
 * Local demo credential surface — Phase 1 first cut.
 * SCAFFOLD ONLY. No production security claims.
 *
 * Issues a minimal W3C-shaped Verifiable Credential signed by the
 * current did:key. Stored on-device only. Destroyed with the identity.
 */

import * as SecureStore from 'expo-secure-store';
import { Buffer } from 'buffer';
import {
  getCurrentDidKey,
  signWithDidKey,
  DidKeyIdentity,
} from './presence';

const STORAGE_CREDENTIALS = 'trv_demo_credentials';

const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  requireAuthentication: true,
};

export type DemoCredential = {
  id: string;
  raw: string; // compact JSON
  issuedAt: number;
};

export type VerifiableCredential = {
  '@context': string[];
  type: string[];
  id: string;
  issuer: string;
  validFrom: string;
  credentialSubject: {
    id: string;
    demo: boolean;
    note: string;
  };
  proof: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    proofValue: string;
  };
};

async function loadAll(): Promise<DemoCredential[]> {
  const raw = await SecureStore.getItemAsync(STORAGE_CREDENTIALS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as DemoCredential[];
  } catch {
    return [];
  }
}

async function saveAll(list: DemoCredential[]): Promise<void> {
  await SecureStore.setItemAsync(
    STORAGE_CREDENTIALS,
    JSON.stringify(list),
    SECURE_OPTIONS
  );
}

/**
 * Issue a local demo VC to the current did:key identity.
 * Self-issued for scaffold purposes. Not a production issuer.
 */
export async function issueDemoCredential(): Promise<DemoCredential | null> {
  const identity = await getCurrentDidKey();
  if (!identity) return null;

  const now = new Date().toISOString();
  const credId = `urn:trv:demo:${Date.now()}`;

  // Unsigned payload (proof added after signing)
  const unsigned = {
    '@context': [
      'https://www.w3.org/ns/credentials/v2',
      'https://www.w3.org/ns/credentials/examples/v2',
    ],
    type: ['VerifiableCredential', 'TRVDemoCredential'],
    id: credId,
    issuer: identity.did,
    validFrom: now,
    credentialSubject: {
      id: identity.did,
      demo: true,
      note: 'Local scaffold credential — not production. Destroyed with identity.',
    },
  };

  const payload = JSON.stringify(unsigned);
  const proofValue = await signWithDidKey(payload);
  if (!proofValue) return null;

  const multibaseKey = identity.did.replace('did:key:', '');
  const vc: VerifiableCredential = {
    ...unsigned,
    proof: {
      type: 'DataIntegrityProof',
      created: now,
      verificationMethod: `${identity.did}#${multibaseKey}`,
      proofPurpose: 'assertionMethod',
      proofValue,
    },
  };

  const entry: DemoCredential = {
    id: credId,
    raw: JSON.stringify(vc),
    issuedAt: Date.now(),
  };

  const list = await loadAll();
  list.push(entry);
  await saveAll(list);
  return entry;
}

export async function listDemoCredentials(): Promise<DemoCredential[]> {
  return loadAll();
}

export async function getDemoCredential(
  id: string
): Promise<VerifiableCredential | null> {
  const list = await loadAll();
  const found = list.find((c) => c.id === id);
  if (!found) return null;
  try {
    return JSON.parse(found.raw) as VerifiableCredential;
  } catch {
    return null;
  }
}

/** Wipe all demo credentials. Called from destroyDidKey path or UI. */
export async function destroyAllDemoCredentials(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_CREDENTIALS);
}
