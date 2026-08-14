/**
 * XXX gate · mute/report/block · IA of IA inquiry scaffold.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { isXxxAllowed, setXxxAllowed } from '../services/xxxPreference';
import {
  getModeration,
  muteDid,
  blockDid,
  reportDid,
  unmuteDid,
  unblockDid,
  ModerationState,
} from '../services/communityModeration';
import {
  draftCommunityInquiry,
  markInquirySentScaffold,
  recordFeedbackAndSteer,
  listConductStore,
  CommunityInquiryDraft,
  ConductSteerEvent,
} from '../services/iaOfIaConduct';
import type { Locale } from '../i18n/strings';

type Props = { locale?: Locale };

export function ConductCommunityPanel({ locale = 'en' }: Props) {
  const isEs = locale === 'es';
  const [xxx, setXxx] = useState(false);
  const [mod, setMod] = useState<ModerationState | null>(null);
  const [targetDid, setTargetDid] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [inquiry, setInquiry] = useState<CommunityInquiryDraft | null>(null);
  const [feedback, setFeedback] = useState('');
  const [steerLog, setSteerLog] = useState<ConductSteerEvent[]>([]);

  const refresh = useCallback(async () => {
    setXxx(await isXxxAllowed());
    setMod(await getModeration());
    const store = await listConductStore();
    setSteerLog(store.steerLog);
    if (store.inquiries[0]) setInquiry(store.inquiries[0]);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleXxx = async () => {
    const next = !xxx;
    await setXxxAllowed(next);
    setXxx(next);
  };

  const requireTarget = () => {
    const id = targetDid.trim();
    if (!id) {
      Alert.alert('TRV', isEs ? 'Indique un DID.' : 'Enter a DID.');
      return null;
    }
    return id;
  };

  const onMute = async () => {
    const id = requireTarget();
    if (!id) return;
    setMod(await muteDid(id));
  };

  const onBlock = async () => {
    const id = requireTarget();
    if (!id) return;
    setMod(await blockDid(id));
  };

  const onReport = async () => {
    const id = requireTarget();
    if (!id) return;
    setMod(await reportDid(id, reportReason));
    setReportReason('');
    Alert.alert(
      isEs ? 'Reporte' : 'Report',
      isEs
        ? 'Reporte guardado. La IA de IA puede abrir una consulta anónima formal.'
        : 'Report stored. IA of IA may open an anonymous formal inquiry.'
    );
  };

  const onDraftInquiry = async () => {
    const d = await draftCommunityInquiry();
    setInquiry(d);
    Alert.alert(
      isEs ? 'IA de IA' : 'IA of IA',
      isEs
        ? 'Borrador de consulta comunitaria privada (anónima y formal) listo.'
        : 'Private community inquiry draft (anonymous and formal) ready.'
    );
  };

  const onSendScaffold = async () => {
    if (!inquiry) return;
    const d = await markInquirySentScaffold(inquiry.id);
    if (d) setInquiry({ ...d });
  };

  const onFeedbackSteer = async () => {
    if (!inquiry) {
      Alert.alert('IA of IA', isEs ? 'Primero cree una consulta.' : 'Draft an inquiry first.');
      return;
    }
    const result = await recordFeedbackAndSteer(inquiry.id, feedback);
    if (!result) return;
    setInquiry({ ...result.inquiry });
    setFeedback('');
    await refresh();
    Alert.alert(
      isEs ? 'Conducta' : 'Conduct',
      isEs
        ? 'Comentario registrado. La IA de IA usará esto para orientar la conducta del Sentinel.'
        : 'Feedback recorded. IA of IA will use this to steer Sentinel conduct.'
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {isEs ? 'Conducta · Comunidad · IA de IA' : 'Conduct · Community · IA of IA'}
      </Text>
      <Text style={styles.hint}>
        {isEs
          ? 'Animaciones humanas OK si son distinguibles. Adulto detrás de bloqueo XXX. Mute, reporte y bloqueo por Viewers. La IA de IA pregunta en privado a la comunidad (anónimo y formal) y usa las respuestas para orientar al Sentinel.'
          : 'Human animations OK if distinguishable. Adult behind XXX block. Mute, report, block by Viewers. IA of IA asks the community in private (anonymous and formal) and uses replies to steer the Sentinel.'}
      </Text>

      <Pressable
        style={[styles.btn, xxx ? styles.btnWarn : styles.btnSecondary]}
        onPress={toggleXxx}
      >
        <Text style={styles.btnText}>
          {xxx
            ? isEs
              ? 'XXX permitido (opt-in)'
              : 'XXX allowed (opted in)'
            : isEs
              ? 'XXX bloqueado (predeterminado)'
              : 'XXX blocked (default)'}
        </Text>
      </Pressable>

      <Text style={styles.label}>
        {isEs ? 'DID objetivo' : 'Target DID'}
      </Text>
      <TextInput
        style={styles.input}
        value={targetDid}
        onChangeText={setTargetDid}
        autoCapitalize="none"
        placeholder="did:key:…"
        placeholderTextColor="#555"
      />
      <Text style={styles.label}>
        {isEs ? 'Motivo del reporte' : 'Report reason'}
      </Text>
      <TextInput
        style={[styles.input, { minHeight: 56 }]}
        value={reportReason}
        onChangeText={setReportReason}
        multiline
        placeholderTextColor="#555"
      />
      <View style={styles.row}>
        <Pressable style={[styles.btn, styles.btnSecondary, styles.flex]} onPress={onMute}>
          <Text style={styles.btnText}>{isEs ? 'Silenciar' : 'Mute'}</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnSecondary, styles.flex]} onPress={onReport}>
          <Text style={styles.btnText}>{isEs ? 'Reportar' : 'Report'}</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnDanger, styles.flex]} onPress={onBlock}>
          <Text style={styles.btnText}>{isEs ? 'Bloquear' : 'Block'}</Text>
        </Pressable>
      </View>

      {mod && (
        <Text style={styles.meta}>
          {isEs ? 'Silenciados' : 'Muted'} {mod.muted.length} ·{' '}
          {isEs ? 'Bloqueados' : 'Blocked'} {mod.blocked.length} ·{' '}
          {isEs ? 'Reportes' : 'Reports'} {mod.reports.length}
        </Text>
      )}

      {mod && mod.muted[0] && (
        <Pressable
          style={[styles.btn, styles.btnGhost]}
          onPress={async () => setMod(await unmuteDid(mod.muted[0]))}
        >
          <Text style={styles.btnText}>
            {isEs ? 'Quitar silencio del primero' : 'Unmute first'}
          </Text>
        </Pressable>
      )}
      {mod && mod.blocked[0] && (
        <Pressable
          style={[styles.btn, styles.btnGhost, { marginTop: 8 }]}
          onPress={async () => setMod(await unblockDid(mod.blocked[0]))}
        >
          <Text style={styles.btnText}>
            {isEs ? 'Desbloquear el primero' : 'Unblock first'}
          </Text>
        </Pressable>
      )}

      <Text style={[styles.section, { marginTop: 16 }]}>
        {isEs ? 'IA de IA — consulta privada' : 'IA of IA — private inquiry'}
      </Text>
      <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onDraftInquiry}>
        <Text style={styles.btnText}>
          {isEs
            ? 'Redactar consulta anónima formal'
            : 'Draft anonymous formal inquiry'}
        </Text>
      </Pressable>
      {inquiry && (
        <View style={styles.box}>
          <Text style={styles.meta}>
            {inquiry.id} · {inquiry.status} · reports≈{inquiry.reportCount}
          </Text>
          {inquiry.questions.map((q, i) => (
            <Text key={i} style={styles.q}>
              {i + 1}. {q}
            </Text>
          ))}
          <Pressable
            style={[styles.btn, styles.btnSecondary, { marginTop: 10 }]}
            onPress={onSendScaffold}
          >
            <Text style={styles.btnText}>
              {isEs ? 'Marcar enviada (andamiaje)' : 'Mark sent (scaffold)'}
            </Text>
          </Pressable>
          <Text style={styles.label}>
            {isEs
              ? 'Respuesta comunitaria privada (qué estuvo mal y cómo)'
              : 'Private community reply (what was wrong and how)'}
          </Text>
          <TextInput
            style={[styles.input, { minHeight: 64 }]}
            value={feedback}
            onChangeText={setFeedback}
            multiline
            placeholderTextColor="#555"
          />
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onFeedbackSteer}>
            <Text style={styles.btnText}>
              {isEs
                ? 'Registrar y orientar conducta del Sentinel'
                : 'Record & steer Sentinel conduct'}
            </Text>
          </Pressable>
        </View>
      )}

      {steerLog[0] && (
        <Text style={styles.steer}>
          {isEs ? 'Última orientación: ' : 'Last steer: '}
          {steerLog[0].summary}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#141018',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3a2a4a',
    marginBottom: 24,
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  hint: { color: '#a9a', fontSize: 12, lineHeight: 18, marginBottom: 12 },
  label: { color: '#666', fontSize: 12, marginTop: 10, marginBottom: 4 },
  section: { color: '#c9f', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  input: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  row: { flexDirection: 'row', gap: 8, marginTop: 10 },
  flex: { flex: 1 },
  btn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#4a1a7a' },
  btnSecondary: { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' },
  btnDanger: { backgroundColor: '#5c1a1a' },
  btnWarn: { backgroundColor: '#5c3a1a' },
  btnGhost: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: 'transparent',
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  meta: { color: '#888', fontSize: 12, marginTop: 10 },
  box: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  q: { color: '#ccc', fontSize: 12, lineHeight: 18, marginTop: 6 },
  steer: { color: '#9cf', fontSize: 12, marginTop: 12, fontWeight: '600' },
});
