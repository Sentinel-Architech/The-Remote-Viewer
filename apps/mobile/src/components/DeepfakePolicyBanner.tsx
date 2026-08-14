import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  hasAcknowledgedDeepfakePolicy,
  acknowledgeDeepfakePolicy,
  DEEPFAKE_POLICY_SUMMARY_EN,
  DEEPFAKE_POLICY_SUMMARY_ES,
} from '../services/deepfakePolicy';
import type { Locale } from '../i18n/strings';

type Props = { locale?: Locale };

export function DeepfakePolicyBanner({ locale = 'en' }: Props) {
  const [acked, setAcked] = useState<boolean | null>(null);
  const isEs = locale === 'es';

  useEffect(() => {
    hasAcknowledgedDeepfakePolicy().then(setAcked);
  }, []);

  if (acked === null) return null;

  const onAck = async () => {
    await acknowledgeDeepfakePolicy();
    setAcked(true);
  };

  return (
    <View style={[styles.card, acked ? styles.cardQuiet : styles.cardAlert]}>
      <Text style={styles.kicker}>
        {isEs ? 'REGLA BLOQUEADA' : 'LOCKED RULE'}
      </Text>
      <Text style={styles.title}>
        {isEs
          ? 'Prohibición estricta de deepfakes humanos'
          : 'Strict prohibition on human deepfakes'}
      </Text>
      <Text style={styles.body}>
        {isEs ? DEEPFAKE_POLICY_SUMMARY_ES : DEEPFAKE_POLICY_SUMMARY_EN}
      </Text>
      {!acked ? (
        <Pressable style={styles.btn} onPress={onAck}>
          <Text style={styles.btnText}>
            {isEs
              ? 'Entiendo — no deepfakes de humanos'
              : 'I understand — no human deepfakes'}
          </Text>
        </Pressable>
      ) : (
        <Text style={styles.acked}>
          {isEs ? 'Reconocido en este dispositivo' : 'Acknowledged on this device'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  cardAlert: {
    backgroundColor: '#1a0808',
    borderColor: '#8B0000',
  },
  cardQuiet: {
    backgroundColor: '#140a0a',
    borderColor: '#3a1a1a',
  },
  kicker: {
    color: '#e74c3c',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  title: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 8 },
  body: { color: '#ccc', fontSize: 13, lineHeight: 20, marginBottom: 12 },
  btn: {
    backgroundColor: '#5c1a1a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  acked: { color: '#888', fontSize: 12, fontWeight: '600' },
});
