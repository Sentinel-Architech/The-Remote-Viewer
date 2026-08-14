/**
 * Identity-bound local state wiped on Destroy = Restart.
 * Device prefs (locale, XXX, tutorial flag, entitlement scaffold, topical interests)
 * intentionally survive so a new path does not re-fight every setting.
 */

import * as SecureStore from 'expo-secure-store';

const KEYS = [
  'trv_moderation_v1',
  'trv_ia_conduct_log_v1',
  'trv_deepfake_policy_ack_v2',
  'trv_we_the_people_ack_v1',
] as const;

export async function wipeIdentityBoundExtras(): Promise<void> {
  await Promise.all(KEYS.map((k) => SecureStore.deleteItemAsync(k)));
}
