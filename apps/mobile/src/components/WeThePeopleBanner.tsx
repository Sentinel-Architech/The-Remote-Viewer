import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  WE_THE_PEOPLE_SUMMARY_EN,
  WE_THE_PEOPLE_SUMMARY_ES,
  hasAcknowledgedWeThePeople,
  acknowledgeWeThePeople,
} from '../services/weThePeople';
import type { Locale } from '../i18n/strings';

type Props = { locale?: Locale };

export function WeThePeopleBanner({ locale = 'en' }: Props) {
  const isEs = locale === 'es';
  const [acked, setAcked] = useState(false);

  useEffect(() => {
    hasAcknowledgedWeThePeople().then(setAcked);
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>
        {isEs ? 'NOSOTROS EL PUEBLO' : 'WE THE PEOPLE'}
      </Text>
      <Text style={styles.body}>
        {isEs ? WE_THE_PEOPLE_SUMMARY_ES : WE_THE_PEOPLE_SUMMARY_EN}
      </Text>
      <Text style={styles.detail}>
        {isEs
          ? 'Constitución · Carta de Derechos · valores de libertad ordenada. El fraude y los deepfakes indistinguibles no son derechos.'
          : 'Constitution · Bill of Rights · ordered liberty. Fraud and passable deepfakes are not rights.'}
      </Text>
      {!acked ? (
        <Pressable
          style={styles.btn}
          onPress={async () => {
            await acknowledgeWeThePeople();
            setAcked(true);
          }}
        >
          <Text style={styles.btnText}>
            {isEs ? 'Entendido — piso de derechos' : 'Understood — rights floor'}
          </Text>
        </Pressable>
      ) : (
        <Text style={styles.ack}>
          {isEs ? 'Reconocido en este dispositivo' : 'Acknowledged on this device'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0c1420',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3a4a6a',
    marginBottom: 24,
  },
  kicker: {
    color: '#c9a227',
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 8,
  },
  body: { color: '#e8e8e8', fontSize: 13, lineHeight: 20, fontWeight: '600' },
  detail: { color: '#8899aa', fontSize: 12, lineHeight: 18, marginTop: 8 },
  btn: {
    marginTop: 12,
    backgroundColor: '#1a2a4a',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c9a227',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  ack: { color: '#2ecc71', fontSize: 12, fontWeight: '600', marginTop: 12 },
});
