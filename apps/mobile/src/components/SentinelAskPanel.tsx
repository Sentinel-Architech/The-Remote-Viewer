/**
 * Hey Sentinel — personality, RWB holographic shield, wake + internet answer.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Linking,
  TextInput,
} from 'react-native';
import { speak, startDictation, stopDictation } from '../services/voice';
import {
  extractAfterWake,
  answerFromInternet,
  SentinelReply,
  WAKE_PHRASES,
} from '../services/sentinelAsk';
import { webSearchUrl } from '../services/search';
import {
  getPersonality,
  setPersonality,
  applyTone,
  TONE_META,
  SentinelTone,
  PersonalityConfig,
} from '../services/sentinelPersonality';
import { VoiceField } from './VoiceField';
import { SentinelShield } from './SentinelShield';
import { Locale } from '../i18n/strings';

type Phase = 'idle' | 'listening_wake' | 'listening_question' | 'thinking' | 'answered';

type Props = { locale?: Locale };

export function SentinelAskPanel({ locale = 'en' }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [manualQuestion, setManualQuestion] = useState('');
  const [reply, setReply] = useState<SentinelReply | null>(null);
  const [personality, setPersonalityState] = useState<PersonalityConfig>({
    tone: 'steady',
    name: 'Sentinel',
  });
  const [elapsedMs, setElapsedMs] = useState(0);
  const phaseRef = useRef<Phase>('idle');
  const lookStarted = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isEs = locale === 'es';
  const looking = phase === 'thinking' || phase === 'listening_wake' || phase === 'listening_question';

  useEffect(() => {
    getPersonality().then(setPersonalityState);
  }, []);

  useEffect(() => {
    if (looking) {
      if (lookStarted.current == null) lookStarted.current = Date.now();
      tickRef.current = setInterval(() => {
        if (lookStarted.current != null) {
          setElapsedMs(Date.now() - lookStarted.current);
        }
      }, 100);
    } else {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
      if (phase === 'idle') {
        lookStarted.current = null;
        setElapsedMs(0);
      }
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [looking, phase]);

  const setPhaseBoth = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const saveTone = async (tone: SentinelTone) => {
    const next = await setPersonality({ ...personality, tone });
    setPersonalityState(next);
  };

  const saveName = async (name: string) => {
    const next = await setPersonality({ ...personality, name });
    setPersonalityState(next);
  };

  const runAnswer = async (question: string) => {
    setPhaseBoth('thinking');
    if (lookStarted.current == null) lookStarted.current = Date.now();
    const cfg = await getPersonality();
    speak(
      isEs
        ? `${cfg.name} buscando fuentes.`
        : `${cfg.name} checking sources.`
    );
    try {
      const result = await answerFromInternet(question);
      const spoken = applyTone(result.spoken, cfg, locale);
      const shaped = { ...result, spoken };
      setReply(shaped);
      setPhaseBoth('answered');
      speak(spoken);
    } catch (e) {
      setPhaseBoth('idle');
      lookStarted.current = null;
      setElapsedMs(0);
      Alert.alert(
        'Sentinel',
        e instanceof Error ? e.message : 'Could not reach internet sources'
      );
    }
  };

  const stopAll = async () => {
    await stopDictation();
    setPhaseBoth('idle');
    setLiveTranscript('');
    lookStarted.current = null;
    setElapsedMs(0);
  };

  const startWakeListen = async () => {
    setReply(null);
    setLiveTranscript('');
    lookStarted.current = Date.now();
    setElapsedMs(0);
    setPhaseBoth('listening_wake');
    speak(
      isEs
        ? `Diga Oye ${personality.name} y su pregunta.`
        : `Say Hey ${personality.name}, then your question.`
    );

    const ok = await startDictation({
      onResult: async (text) => {
        setLiveTranscript(text);
        const { woke, remainder } = extractAfterWake(text);
        if (!woke) return;

        if (remainder.length > 3) {
          await stopDictation();
          await runAnswer(remainder);
          return;
        }

        await stopDictation();
        setPhaseBoth('listening_question');
        speak(isEs ? '¿Cuál es su pregunta?' : 'What is your question?');
        await startDictation({
          onResult: async (q) => {
            setLiveTranscript(q);
            if (q.trim().length < 3) return;
            await stopDictation();
            await runAnswer(q.trim());
          },
          onError: (message) => {
            setPhaseBoth('idle');
            Alert.alert('Sentinel', message);
          },
          onEnd: () => {
            if (phaseRef.current === 'listening_question') setPhaseBoth('idle');
          },
        });
      },
      onError: (message) => {
        setPhaseBoth('idle');
        Alert.alert('Sentinel', message);
      },
      onEnd: () => {
        if (phaseRef.current === 'listening_wake') setPhaseBoth('idle');
      },
    });

    if (!ok) setPhaseBoth('idle');
  };

  const askTyped = async () => {
    const q = manualQuestion.trim();
    if (!q) {
      Alert.alert(
        'Sentinel',
        isEs ? 'Escriba o dicte una pregunta.' : 'Type or dictate a question.'
      );
      return;
    }
    lookStarted.current = Date.now();
    setElapsedMs(0);
    await runAnswer(q);
  };

  const openSources = async () => {
    if (!reply) return;
    const url = webSearchUrl(reply.question);
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
  };

  const phaseLabel = () => {
    switch (phase) {
      case 'listening_wake':
        return isEs ? 'Escuchando activación…' : 'Listening for wake…';
      case 'listening_question':
        return isEs ? 'Escuchando pregunta…' : 'Listening for question…';
      case 'thinking':
        return isEs ? 'Buscando en internet…' : 'Searching the internet…';
      case 'answered':
        return isEs
          ? `Listo · ${formatDone(elapsedMs)}`
          : `Done · took ${formatDone(elapsedMs)}`;
      default:
        return isEs ? 'En espera' : 'Idle';
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {isEs ? 'Su Sentinel (en el dispositivo)' : 'Your on-device Sentinel'}
      </Text>
      <Text style={styles.hint}>
        {isEs
          ? 'Personalice tono y nombre. El escudo RWB gira en sentido horario mientras busca. El tiempo muestra cuánto tarda.'
          : 'Customize tone and name. The RWB holographic shield spins clockwise while actively looking. The timer shows how long it is taking.'}
      </Text>

      <SentinelShield
        active={looking}
        elapsedMs={elapsedMs}
        label={(personality.name || 'SENTINEL').toUpperCase().slice(0, 12)}
      />
      <Text style={styles.phase}>{phaseLabel()}</Text>

      <Text style={styles.label}>
        {isEs ? 'Nombre de su Sentinel' : 'Your Sentinel name'}
      </Text>
      <TextInput
        style={styles.nameInput}
        value={personality.name}
        onChangeText={(name) => setPersonalityState((p) => ({ ...p, name }))}
        onEndEditing={() => saveName(personality.name)}
        placeholder="Sentinel"
        placeholderTextColor="#555"
        maxLength={32}
      />

      <Text style={styles.label}>
        {isEs ? 'Tono / personalidad' : 'Tone / personality'}
      </Text>
      <View style={styles.toneRow}>
        {(Object.keys(TONE_META) as SentinelTone[]).map((tone) => {
          const meta = TONE_META[tone];
          const on = personality.tone === tone;
          return (
            <Pressable
              key={tone}
              style={[styles.toneChip, on && styles.toneChipOn]}
              onPress={() => saveTone(tone)}
            >
              <Text style={styles.toneChipText}>
                {isEs ? meta.labelEs : meta.labelEn}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.toneHint}>
        {isEs
          ? TONE_META[personality.tone].hintEs
          : TONE_META[personality.tone].hintEn}
      </Text>

      <Text style={styles.meta}>
        {isEs ? 'Frases' : 'Wake phrases'}: {WAKE_PHRASES.join(' · ')}
      </Text>
      {!!liveTranscript && (
        <Text style={styles.transcript}>“{liveTranscript}”</Text>
      )}

      {phase === 'idle' || phase === 'answered' ? (
        <Pressable style={[styles.btn, styles.btnPrimary]} onPress={startWakeListen}>
          <Text style={styles.btnText}>
            {isEs ? 'Activar escucha' : 'Start Hey Sentinel listen'}
          </Text>
        </Pressable>
      ) : (
        <Pressable style={[styles.btn, styles.btnDanger]} onPress={stopAll}>
          <Text style={styles.btnText}>
            {isEs ? 'Detener' : 'Stop'}
          </Text>
        </Pressable>
      )}

      <Text style={styles.label}>
        {isEs ? 'O pregunte por texto' : 'Or ask by text'}
      </Text>
      <VoiceField
        value={manualQuestion}
        onChangeText={setManualQuestion}
        multiline
        style={{ minHeight: 56 }}
        placeholder={isEs ? 'Su pregunta…' : 'Your question…'}
        placeholderTextColor="#555"
        appendDictation
      />
      <Pressable
        style={[styles.btn, styles.btnSecondary]}
        onPress={askTyped}
        disabled={phase === 'thinking'}
      >
        <Text style={styles.btnText}>
          {isEs ? 'Preguntar' : 'Ask Sentinel'}
        </Text>
      </Pressable>

      {reply && (
        <View style={styles.replyBox}>
          <Text style={styles.label}>
            {isEs ? 'Pregunta' : 'Question'}
          </Text>
          <Text style={styles.replyText}>{reply.question}</Text>
          <Text style={styles.label}>
            {isEs ? 'Respuesta' : 'Answer'}
          </Text>
          <Text style={styles.replyText}>{reply.spoken}</Text>
          <Text style={styles.took}>
            {isEs ? 'Tiempo de búsqueda: ' : 'Look duration: '}
            {formatDone(elapsedMs)}
          </Text>
          <Pressable
            style={[styles.btn, styles.btnSecondary, { marginTop: 10 }]}
            onPress={() => speak(reply.spoken)}
          >
            <Text style={styles.btnText}>
              {isEs ? 'Repetir' : 'Speak again'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnSecondary, { marginTop: 8 }]}
            onPress={openSources}
          >
            <Text style={styles.btnText}>
              {isEs ? 'Abrir web' : 'Open full web search'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function formatDone(ms: number): string {
  if (ms <= 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f1419',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a3a4a',
    marginBottom: 24,
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  hint: { color: '#8ab', fontSize: 12, lineHeight: 18, marginBottom: 4 },
  phase: {
    color: '#2ecc71',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  label: { color: '#666', fontSize: 12, marginTop: 10, marginBottom: 4 },
  nameInput: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  toneRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  toneChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
  },
  toneChipOn: {
    borderColor: '#E81B23',
    backgroundColor: '#1a1020',
  },
  toneChipText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  toneHint: { color: '#888', fontSize: 12, marginTop: 6, marginBottom: 4 },
  meta: { color: '#556', fontSize: 11, marginBottom: 8, marginTop: 8 },
  transcript: { color: '#aaa', fontStyle: 'italic', marginBottom: 10, fontSize: 13 },
  btn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#1a5f7a' },
  btnSecondary: { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' },
  btnDanger: { backgroundColor: '#5c1a1a' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  replyBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#234',
  },
  replyText: { color: '#ddd', fontSize: 13, lineHeight: 20 },
  took: { color: '#9cf', fontSize: 12, marginTop: 10, fontWeight: '600' },
});
