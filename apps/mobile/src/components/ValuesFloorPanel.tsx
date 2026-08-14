/**
 * Condensed rights + integrity floor — one surface, no value sacrifice.
 * See locked 16, 17, 18, 19, 20.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  WE_THE_PEOPLE_SUMMARY_EN,
  WE_THE_PEOPLE_SUMMARY_ES,
  hasAcknowledgedWeThePeople,
  acknowledgeWeThePeople,
} from '../services/weThePeople';
import {
  hasAcknowledgedDeepfakePolicy,
  acknowledgeDeepfakePolicy,
  DEEPFAKE_POLICY_SUMMARY,
} from '../services/deepfakePolicy';
import { isXxxAllowed, setXxxAllowed } from '../services/xxxPreference';
import type { Locale } from '../i18n/strings';

type Props = { locale?: Locale };

export function ValuesFloorPanel({ locale = 'en' }: Props) {
  const isEs = locale === 'es';
  const [rights, setRights] = useState(false);
  const [deepfake, setDeepfake] = useState(false);
  const [xxx, setXxx] = useState(false);

  useEffect(() => {
    (async () => {
      setRights(await hasAcknowledgedWeThePeople());
      setDeepfake(await hasAcknowledgedDeepfakePolicy());
      setXxx(await isXxxAllowed());
    })();
  }, []);

  const ackAll = async () => {
    await acknowledgeWeThePeople();
    await acknowledgeDeepfakePolicy();
    setRights(true);
    setDeepfake(true);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>
        {isEs ? 'PISO DE VALORES' : 'VALUES FLOOR'}
      </Text>

      <Text style={styles.line}>
        {isEs ? WE_THE_PEOPLE_SUMMARY_ES : WE_THE_PEOPLE_SUMMARY_EN}
      </Text>

      <Text style={[styles.line, styles.gap]}>
        {isEs
          ? 'Semejanza/animación humana OK solo si es distinguible. Deepfakes pasables de personas reales: ESTRICTAMENTE PROHIBIDOS. Adulto solo detrás de XXX.'
          : `${DEEPFAKE_POLICY_SUMMARY} Adult content only behind XXX.`}
      </Text>

      <Text style={[styles.line, styles.gap]}>
        {isEs
          ? 'Intereses temáticos opcionales: religión → inclinación cristiana y piadosa para aprender; política y demás → aprender, no presionar.'
          : 'Optional topical interests: religion → Christian and Godly learning lean; politics and others → learn, never pressure.'}
      </Text>

      <Pressable
        style={[styles.chip, xxx && styles.chipWarn]}
        onPress={async () => {
          const next = !xxx;
          await setXxxAllowed(next);
          setXxx(next);
        }}
      >
        <Text style={styles.chipText}>
          {xxx
            ? isEs
              ? 'XXX permitido'
              : 'XXX allowed'
            : isEs
              ? 'XXX bloqueado (defecto)'
              : 'XXX blocked (default)'}
        </Text>
      </Pressable>

      {rights && deepfake ? (
        <Text style={styles.ack}>
          {isEs ? 'Piso reconocido en este dispositivo' : 'Floor acknowledged on this device'}
        </Text>
      ) : (
        <Pressable style={styles.btn} onPress={ackAll}>
          <Text style={styles.btnText}>
            {isEs ? 'Reconocer piso de valores' : 'Acknowledge values floor'}
          </Text>
        </Pressable>
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
    marginBottom: 10,
  },
  line: { color: '#e0e0e0', fontSize: 13, lineHeight: 19 },
  gap: { marginTop: 10 },
  chip: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#444',
  },
  chipWarn: { borderColor: '#c97a2a', backgroundColor: '#2a1a10' },
  chipText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  btn: {
    marginTop: 14,
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
