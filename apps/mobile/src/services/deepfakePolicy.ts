/**
 * Human deepfakes / passable synthetic humans: STRICTLY PROHIBITED.
 * Human likeness OK only when distinguishable from humanity.
 * See docs/locked/16-No-Human-Deepfakes.md
 */

import * as SecureStore from 'expo-secure-store';

const KEY = 'trv_deepfake_policy_ack_v2';

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const DEEPFAKE_POLICY_SUMMARY_EN =
  'Deepfakes of real people and any synthetic human that is not clearly distinguishable from humanity are STRICTLY PROHIBITED. Human likeness is OK only when it is obviously not a real person.';

export const DEEPFAKE_POLICY_SUMMARY_ES =
  'Los deepfakes de personas reales y cualquier humano sintético que no sea claramente distinguible de la humanidad están ESTRICTAMENTE PROHIBIDOS. La semejanza humana está bien solo cuando es obviamente no una persona real.';

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
