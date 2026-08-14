import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { t, Locale, SexAttestation } from '../i18n/strings';
import { setLocale as persistLocale } from '../services/locale';
import {
  getHumanAttestation,
  setHumanAttestation,
  isVerifiedHuman,
  HumanAttestation,
} from '../services/humanVerification';
import { speak } from '../services/voice';
import { resetTutorialFlag } from '../services/tutorial';

type Props = {
  locale: Locale;
  onLocaleChange?: () => void;
  identityActive: boolean;
  onReplayTutorial?: () => void;
};

export function LocaleHumanBar({
  locale,
  onLocaleChange,
  identityActive,
  onReplayTutorial,
}: Props) {
  const [attestation, setAttestation] = useState<HumanAttestation | null>(null);
  const [pendingSex, setPendingSex] = useState<SexAttestation | null>(null);

  useEffect(() => {
    if (identityActive) {
      getHumanAttestation().then((a) => {
        setAttestation(a);
        setPendingSex(a?.sex ?? null);
      });
    } else {
      setAttestation(null);
      setPendingSex(null);
    }
  }, [identityActive]);

  const switchLocale = async (next: Locale) => {
    await persistLocale(next);
    onLocaleChange?.();
  };

  const saveAttestation = async () => {
    if (!pendingSex) {
      Alert.alert(t(locale, 'humanVerification'), t(locale, 'attestationRequired'));
      return;
    }
    const record = await setHumanAttestation(pendingSex);
    setAttestation(record);
    Alert.alert(t(locale, 'humanVerification'), t(locale, 'attestationSaved'));
    speak(
      locale === 'es'
        ? `Atestado como ${pendingSex === 'male' ? 'hombre' : 'mujer'}`
        : `Attested as ${pendingSex}`
    );
  };

  const replay = async () => {
    await resetTutorialFlag();
    onReplayTutorial?.();
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t(locale, 'language')}</Text>
      <View style={styles.row}>
        <Pressable
          style={[styles.chip, locale === 'en' && styles.chipOn]}
          onPress={() => switchLocale('en')}
        >
          <Text style={styles.chipText}>{t(locale, 'english')}</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, locale === 'es' && styles.chipOn]}
          onPress={() => switchLocale('es')}
        >
          <Text style={styles.chipText}>{t(locale, 'spanish')}</Text>
        </Pressable>
      </View>

      {onReplayTutorial && (
        <Pressable style={styles.tutorialBtn} onPress={replay}>
          <Text style={styles.tutorialText}>
            {locale === 'es' ? 'Ver guía de nuevo' : 'Replay welcome guide'}
          </Text>
        </Pressable>
      )}

      {identityActive && (
        <>
          <Text style={[styles.label, { marginTop: 14 }]}>
            {t(locale, 'humanVerification')}
          </Text>
          <Text style={styles.hint}>{t(locale, 'humanVerificationHint')}</Text>
          <Text style={styles.meta}>
            {isVerifiedHuman(attestation)
              ? `${t(locale, 'verifiedHuman')} · ${t(locale, 'attestedAs')} ${
                  attestation!.sex === 'male'
                    ? t(locale, 'male')
                    : t(locale, 'female')
                }`
              : t(locale, 'notVerifiedHuman')}
          </Text>
          <Text style={styles.label}>{t(locale, 'sex')}</Text>
          <View style={styles.row}>
            <Pressable
              style={[styles.chip, pendingSex === 'male' && styles.chipOn]}
              onPress={() => setPendingSex('male')}
            >
              <Text style={styles.chipText}>{t(locale, 'male')}</Text>
            </Pressable>
            <Pressable
              style={[styles.chip, pendingSex === 'female' && styles.chipOn]}
              onPress={() => setPendingSex('female')}
            >
              <Text style={styles.chipText}>{t(locale, 'female')}</Text>
            </Pressable>
          </View>
          <Pressable style={styles.saveBtn} onPress={saveAttestation}>
            <Text style={styles.saveText}>{t(locale, 'attest')}</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 24,
  },
  label: { color: '#666', fontSize: 12, marginBottom: 6 },
  hint: { color: '#888', fontSize: 12, lineHeight: 18, marginBottom: 8 },
  meta: { color: '#9cf', fontSize: 12, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
  },
  chipOn: { borderColor: '#2ecc71', backgroundColor: '#0d3d24' },
  chipText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  saveBtn: {
    marginTop: 4,
    backgroundColor: '#1a7f4b',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '600' },
  tutorialBtn: {
    marginTop: 4,
    marginBottom: 4,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a4a5a',
    backgroundColor: '#1a2a3a',
  },
  tutorialText: { color: '#9cf', fontWeight: '600', fontSize: 13 },
});
