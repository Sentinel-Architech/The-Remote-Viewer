/**
 * Local human verification attestation.
 * Sex must be Male or Female (explicit selection — not camera inference).
 * Bound to identity path; wiped on Destroy.
 */

import * as SecureStore from 'expo-secure-store';
import type { SexAttestation } from '../i18n/strings';

const KEY = 'trv_human_attestation';

const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  requireAuthentication: true,
};

export type HumanAttestation = {
  sex: SexAttestation;
  attestedAt: number;
};

export async function getHumanAttestation(): Promise<HumanAttestation | null> {
  const raw = await SecureStore.getItemAsync(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as HumanAttestation;
    if (parsed.sex !== 'male' && parsed.sex !== 'female') return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setHumanAttestation(
  sex: SexAttestation
): Promise<HumanAttestation> {
  if (sex !== 'male' && sex !== 'female') {
    throw new Error('Sex attestation must be male or female');
  }
  const record: HumanAttestation = {
    sex,
    attestedAt: Date.now(),
  };
  await SecureStore.setItemAsync(KEY, JSON.stringify(record), SECURE_OPTIONS);
  return record;
}

export async function destroyHumanAttestation(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}

export function isVerifiedHuman(a: HumanAttestation | null): boolean {
  return !!a && (a.sex === 'male' || a.sex === 'female');
}
