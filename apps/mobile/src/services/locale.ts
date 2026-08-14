import * as SecureStore from 'expo-secure-store';
import type { Locale } from '../i18n/strings';

const KEY = 'trv_locale';

const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export async function getLocale(): Promise<Locale> {
  const v = await SecureStore.getItemAsync(KEY);
  return v === 'es' ? 'es' : 'en';
}

export async function setLocale(locale: Locale): Promise<void> {
  await SecureStore.setItemAsync(KEY, locale, SECURE_OPTIONS);
}
