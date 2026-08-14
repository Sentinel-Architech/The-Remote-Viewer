import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  getInterests,
  setTopicInterest,
  TOPICS,
  InterestsState,
  TopicId,
} from '../services/topicalLeans';
import type { Locale } from '../i18n/strings';

type Props = { locale?: Locale };

export function TopicalLeansPanel({ locale = 'en' }: Props) {
  const isEs = locale === 'es';
  const [state, setState] = useState<InterestsState>({ topics: [] });

  const refresh = useCallback(async () => {
    setState(await getInterests());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = async (id: TopicId) => {
    const on = !state.topics.includes(id);
    setState(await setTopicInterest(id, on));
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {isEs ? 'Intereses temáticos (sin presión)' : 'Topical interests (no pressure)'}
      </Text>
      <Text style={styles.hint}>
        {isEs
          ? 'Marque solo lo que le interese aprender. Religión: inclinación cristiana y piadosa. Política y otros temas: aprendizaje, no reclutamiento. Nadie es obligado.'
          : 'Mark only what you want to learn. Religion: Christian and Godly lean. Politics and other topics: learning, not recruitment. No one is forced.'}
      </Text>
      <View style={styles.wrap}>
        {TOPICS.map((t) => {
          const on = state.topics.includes(t.id);
          return (
            <Pressable
              key={t.id}
              style={[styles.chip, on && styles.chipOn]}
              onPress={() => toggle(t.id)}
            >
              <Text style={styles.chipText}>
                {isEs ? t.labelEs : t.labelEn}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {state.topics.includes('religion') && (
        <Text style={styles.lean}>
          {isEs
            ? 'Activo: inclinación cristiana y piadosa (educativa).'
            : 'Active: Christian and Godly educational lean.'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#101418',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a3a4a',
    marginBottom: 24,
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  hint: { color: '#8ab', fontSize: 12, lineHeight: 18, marginBottom: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
  },
  chipOn: { borderColor: '#c9a227', backgroundColor: '#2a2410' },
  chipText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  lean: { color: '#c9a227', fontSize: 12, fontWeight: '600', marginTop: 12 },
});
