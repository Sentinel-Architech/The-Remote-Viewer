import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { getTutorialPages } from '../src/i18n/tutorial';
import { markTutorialCompleted } from '../src/services/tutorial';
import { speak } from '../src/services/voice';
import type { Locale } from '../src/i18n/strings';

type Props = {
  locale?: Locale;
  onFinished: () => void;
};

export default function TutorialScreen({ locale = 'en', onFinished }: Props) {
  const pages = useMemo(() => getTutorialPages(locale), [locale]);
  const [index, setIndex] = useState(0);
  const page = pages[index];
  const isLast = index >= pages.length - 1;
  const isEs = locale === 'es';

  const finish = async () => {
    await markTutorialCompleted();
    onFinished();
  };

  const next = () => {
    if (isLast) finish();
    else setIndex((i) => i + 1);
  };

  const back = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>
          {isEs ? 'GUÍA · UNA VEZ' : 'GUIDE · ONE TIME'}
        </Text>
        <Text style={styles.progress}>
          {index + 1} / {pages.length}
        </Text>
        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.body}>{page.body}</Text>
        <Pressable
          style={[styles.btn, styles.btnGhost]}
          onPress={() => speak(`${page.title}. ${page.body}`)}
        >
          <Text style={styles.btnText}>
            {isEs ? 'Leer en voz alta' : 'Speak this page'}
          </Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {pages.map((p, i) => (
            <View
              key={p.id}
              style={[styles.dot, i === index && styles.dotOn]}
            />
          ))}
        </View>
        <View style={styles.row}>
          {index > 0 ? (
            <Pressable style={[styles.btn, styles.btnSecondary, styles.flex]} onPress={back}>
              <Text style={styles.btnText}>{isEs ? 'Atrás' : 'Back'}</Text>
            </Pressable>
          ) : (
            <Pressable style={[styles.btn, styles.btnSecondary, styles.flex]} onPress={finish}>
              <Text style={styles.btnText}>{isEs ? 'Omitir' : 'Skip'}</Text>
            </Pressable>
          )}
          <Pressable style={[styles.btn, styles.btnPrimary, styles.flex]} onPress={next}>
            <Text style={styles.btnText}>
              {isLast
                ? isEs
                  ? 'Comenzar'
                  : 'Get started'
                : isEs
                  ? 'Siguiente'
                  : 'Next'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { padding: 24, paddingTop: 56, paddingBottom: 24 },
  kicker: { color: '#666', fontSize: 11, letterSpacing: 1.5, marginBottom: 8 },
  progress: { color: '#2ecc71', fontSize: 13, fontWeight: '600', marginBottom: 12 },
  title: { color: '#fff', fontSize: 26, fontWeight: '700', marginBottom: 16 },
  body: { color: '#ccc', fontSize: 16, lineHeight: 26 },
  footer: {
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: '#222',
    backgroundColor: '#111',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  dotOn: { backgroundColor: '#2ecc71', width: 18 },
  row: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  btn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#1a7f4b' },
  btnSecondary: { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' },
  btnGhost: {
    marginTop: 24,
    backgroundColor: '#1a2a3a',
    borderWidth: 1,
    borderColor: '#2a4a5a',
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
