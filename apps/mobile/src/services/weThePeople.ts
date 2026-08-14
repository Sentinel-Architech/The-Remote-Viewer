/** We the People rights floor — local acknowledgment. */

import * as SecureStore from 'expo-secure-store';

const KEY = 'trv_we_the_people_ack_v1';

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const WE_THE_PEOPLE_SUMMARY_EN =
  'NOTHING in TRV shall stand against American values, the Constitution, the Bill of Rights, or the rights of We the People. This is a floor — not a party platform.';

export const WE_THE_PEOPLE_SUMMARY_ES =
  'NADA en TRV irá en contra de los valores americanos, la Constitución, la Carta de Derechos, ni los derechos de Nosotros el Pueblo. Es un piso — no una plataforma partidista.';

export async function hasAcknowledgedWeThePeople(): Promise<boolean> {
  return (await SecureStore.getItemAsync(KEY)) === '1';
}

export async function acknowledgeWeThePeople(): Promise<void> {
  await SecureStore.setItemAsync(KEY, '1', OPTIONS);
}
