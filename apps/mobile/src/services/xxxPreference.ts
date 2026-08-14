/** XXX blocking — adult content hidden unless Viewer opts in. */

import * as SecureStore from 'expo-secure-store';

const KEY = 'trv_xxx_opt_in_v1';

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/** Default: blocked (false = do not show XXX). */
export async function isXxxAllowed(): Promise<boolean> {
  const v = await SecureStore.getItemAsync(KEY);
  return v === '1';
}

export async function setXxxAllowed(allowed: boolean): Promise<void> {
  if (allowed) {
    await SecureStore.setItemAsync(KEY, '1', OPTIONS);
  } else {
    await SecureStore.setItemAsync(KEY, '0', OPTIONS);
  }
}
