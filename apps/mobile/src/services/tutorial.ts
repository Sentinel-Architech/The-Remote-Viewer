import * as SecureStore from 'expo-secure-store';

const KEY = 'trv_tutorial_completed_v1';

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export async function hasCompletedTutorial(): Promise<boolean> {
  const v = await SecureStore.getItemAsync(KEY);
  return v === '1';
}

export async function markTutorialCompleted(): Promise<void> {
  await SecureStore.setItemAsync(KEY, '1', OPTIONS);
}

/** Allow Viewer to replay the tour from Identity. */
export async function resetTutorialFlag(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}
