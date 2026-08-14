/**
 * Strict prohibition: any attempts and deepfakes of humans are forbidden.
 * See docs/locked/16-No-Human-Deepfakes.md
 */

import * as SecureStore from 'expo-secure-store';

const KEY = 'trv_deepfake_policy_ack_v1';

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const DEEPFAKE_POLICY_SUMMARY_EN =
  'Any attempts and deepfakes of humans are STRICTLY PROHIBITED on The Remote Viewer. Do not create, request, host, or spread synthetic video, audio, or images of real people.';

export const DEEPFAKE_POLICY_SUMMARY_ES =
  'Cualquier intento y deepfake de seres humanos está ESTRICTAMENTE PROHIBIDO en The Remote Viewer. No cree, solicite, aloje ni difunda video, audio o imágenes sintéticas de personas reales.';

export async function hasAcknowledgedDeepfakePolicy(): Promise<boolean> {
  const v = await SecureStore.getItemAsync(KEY);
  return v === '1';
}

export async function acknowledgeDeepfakePolicy(): Promise<void> {
  await SecureStore.setItemAsync(KEY, '1', OPTIONS);
}

export async function clearDeepfakePolicyAck(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}
