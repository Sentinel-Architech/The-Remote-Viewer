/**
 * Hey Sentinel wake panel — opt-in listen, question, live internet reply.
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { speak, startDictation, stopDictation } from '../services/voice';
import {
  extractAfterWake,
  answerFromInternet,
  SentinelReply,
  WAKE_PHRASES,
} from '../services/sentinelAsk';
import { webSearchUrl } from '../services/search';
import { VoiceField } from './VoiceField';
import { Locale } from '../i18n/strings';

type Phase = 'idle' | 'listening_wake' | 'listening_question' | 'thinking' | 'answered';

type Props = { locale?: Locale };

export function SentinelAskPanel({ locale = 'en' }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [manualQuestion, setManualQuestion] = useState('');
  const [reply, setReply] = useState<SentinelReply | null>(null);
  const phaseRef = useRef<Phase>('idle');

  const setPhaseBoth = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const isEs = locale === 'es';

  const runAnswer = async (question: string) => {
    setPhaseBoth('thinking');
    speak(isEs ? 'Consultando fuentes en internet.' : 'Checking internet sources.');
    try {
      const result = await answerFromInternet(question);
      setReply(result);
      setPhaseBoth('answered');
      speak(result.spoken);
    } catch (e) {
      setPhaseBoth('idle');
      Alert.alert(
        'Sentinel',
        e instanceof Error ? e.message : 'Could not reach internet sources'
      );
      speak(isEs ? 'No pude completar la búsqueda.' : 'Could not complete the search.');
    }
  };

  const stopAll = async () => {
    await stopDictation();
    setPhaseBoth('idle');
    setLiveTranscript('');
  };

  const startWakeListen = async () => {
    setReply(null);
    setLiveTranscript('');
    setPhaseBoth('listening_wake');
    speak(
      isEs
        ? 'Diganos Oye Sentinel y luego su pregunta.'
        : 'Say Hey Sentinel, then your question.'
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

        // Wake heard; listen for the question next
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
        return isEs ? 'Escuchando: Oye Sentinel…' : 'Listening for Hey Sentinel…';
      case 'listening_question':
        return isEs ? 'Escuchando la pregunta…' : 'Listening for your question…';
      case 'thinking':
        return isEs ? 'Buscando en internet…' : 'Searching the internet…';
      case 'answered':
        return isEs ? 'Respuesta lista' : 'Answer ready';
      default:
        return isEs ? 'En espera' : 'Idle';
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {isEs ? 'Hey Sentinel (fase de activación)' : 'Hey Sentinel (wake phase)'}
      </Text>
      <Text style={styles.hint}>
        {isEs
          ? 'Diga “Oye Sentinel” (o “Hey Sentinel”) y su pregunta. La respuesta usa fuentes abiertas de internet (DuckDuckGo), no solo notas locales. Usted inicia y detiene la escucha.'
          : 'Say “Hey Sentinel” then your question. Replies use live open-internet sources (DuckDuckGo Instant Answer), not only on-device notes. You start and stop listening.'}
      </Text>
      <Text style={styles.meta}>
        {isEs ? 'Frases' : 'Wake phrases'}: {WAKE_PHRASES.join(' · ')}
      </Text>
      <Text style={styles.phase}>{phaseLabel()}</Text>
      {!!liveTranscript && (
        <Text style={styles.transcript}>“{liveTranscript}”</Text>
      )}

      {phase === 'idle' || phase === 'answered' ? (
        <Pressable style={[styles.btn, styles.btnPrimary]} onPress={startWakeListen}>
          <Text style={styles.btnText}>
            {isEs ? 'Activar escucha Hey Sentinel' : 'Start Hey Sentinel listen'}
          </Text>
        </Pressable>
      ) : (
        <Pressable style={[styles.btn, styles.btnDanger]} onPress={stopAll}>
          <Text style={styles.btnText}>
            {isEs ? 'Detener' : 'Stop listening'}
          </Text>
        </Pressable>
      )}

      <Text style={styles.label}>
        {isEs ? 'O pregunte por texto / dictado' : 'Or ask by text / dictate'}
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
          {isEs ? 'Preguntar al Sentinel' : 'Ask Sentinel'}
        </Text>
      </Pressable>

      {reply && (
        <View style={styles.replyBox}>
          <Text style={styles.label}>
            {isEs ? 'Pregunta' : 'Question'}
          </Text>
          <Text style={styles.replyText}>{reply.question}</Text>
          <Text style={styles.label}>
            {isEs ? 'Respuesta (internet)' : 'Answer (internet)'}
          </Text>
          <Text style={styles.replyText}>{reply.spoken}</Text>
          {reply.sources.length > 0 && (
            <>
              <Text style={styles.label}>
                {isEs ? 'Fuentes' : 'Sources'}
              </Text>
              {reply.sources.slice(0, 5).map((s, i) => (
                <Text key={i} style={styles.source}>
                  • {s.title}
                </Text>
              ))}
            </>
          )}
          <Pressable style={[styles.btn, styles.btnSecondary, { marginTop: 10 }]} onPress={() => speak(reply.spoken)}>
            <Text style={styles.btnText}>
              {isEs ? 'Repetir respuesta' : 'Speak answer again'}
            </Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnSecondary, { marginTop: 8 }]} onPress={openSources}>
            <Text style={styles.btnText}>
              {isEs ? 'Abrir búsqueda web completa' : 'Open full web search'}
            </Text>
          </Pressable>
          <Text style={styles.attr}>Results from DuckDuckGo · scaffold Sentinel</Text>
        </View>
      )}
    </View>
  );
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
  hint: { color: '#8ab', fontSize: 12, lineHeight: 18, marginBottom: 8 },
  meta: { color: '#556', fontSize: 11, marginBottom: 8 },
  phase: { color: '#2ecc71', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  transcript: { color: '#aaa', fontStyle: 'italic', marginBottom: 10, fontSize: 13 },
  label: { color: '#666', fontSize: 12, marginTop: 10, marginBottom: 4 },
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
  source: { color: '#9ab', fontSize: 12, lineHeight: 18, marginTop: 2 },
  attr: { color: '#555', fontSize: 11, marginTop: 12 },
});
