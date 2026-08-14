/**
 * Messages — local DIDComm-shaped inbox (scaffold upgraded).
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
} from 'react-native';
import {
  createBasicMessage,
  storeMessage,
  getInbox,
  verifyBasicMessage,
  clearInbox,
  DidCommBasicMessage,
} from '../src/services/didcomm';
import { getCurrentDidKey } from '../src/services/presence';
import { canUseFreeUnlimitedComms } from '../src/services/entitlement';
import { getModeration, isBlocked } from '../src/services/communityModeration';
import { VoiceField } from '../src/components/VoiceField';
import type { Locale } from '../src/i18n/strings';

type Props = { locale?: Locale };

export default function MessagingScreen({ locale = 'en' }: Props) {
  const isEs = locale === 'es';
  const [content, setContent] = useState('');
  const [toDid, setToDid] = useState('');
  const [inbox, setInbox] = useState<DidCommBasicMessage[]>([]);
  const [entitled, setEntitled] = useState(false);

  const refresh = useCallback(async () => {
    const [items, mod, free] = await Promise.all([
      getInbox(),
      getModeration(),
      canUseFreeUnlimitedComms(),
    ]);
    setEntitled(free);
    setInbox(items.filter((m) => !m.from || !isBlocked(mod, m.from)));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSend = async () => {
    if (!content.trim()) {
      Alert.alert(
        isEs ? 'Vacío' : 'Empty',
        isEs ? 'Escriba un mensaje.' : 'Write a message first.'
      );
      return;
    }

    const identity = await getCurrentDidKey();
    if (!identity) {
      Alert.alert(
        isEs ? 'Sin identidad' : 'No identity',
        isEs
          ? 'Cree un did:key en Identidad primero.'
          : 'Create a did:key on the Identity tab first.'
      );
      return;
    }

    const target = toDid.trim();
    if (target) {
      const mod = await getModeration();
      if (isBlocked(mod, target)) {
        Alert.alert(
          isEs ? 'Bloqueado' : 'Blocked',
          isEs
            ? 'Desbloquee en Identidad para mensajear.'
            : 'Unblock on Identity to message them.'
        );
        return;
      }
    }

    if (!entitled && target) {
      Alert.alert(
        isEs ? 'Libertad de comunicación' : 'Communication Freedom',
        isEs
          ? 'El borrador local se guarda. Comms de red ilimitados requieren suscripción anual o nodo anfitrión ENCENDIDO.'
          : 'Local draft still stores. Unlimited network TRV comms need a yearly sub or node-host ON.'
      );
    }

    const msg = await createBasicMessage(content.trim(), target || undefined);
    if (!msg) {
      Alert.alert(isEs ? 'Error' : 'Failed', isEs ? 'No se pudo crear.' : 'Could not create message.');
      return;
    }

    await storeMessage(msg);
    setContent('');
    refresh();
    Alert.alert(isEs ? 'Guardado local' : 'Stored locally', msg.id.slice(0, 8) + '…');
  };

  const handleVerify = async (msg: DidCommBasicMessage) => {
    const ok = await verifyBasicMessage(msg);
    Alert.alert(
      ok ? (isEs ? 'Firma válida' : 'Valid signature') : isEs ? 'Inválida' : 'Invalid',
      ok ? (isEs ? 'Verificado.' : 'Verified.') : isEs ? 'Falló.' : 'Check failed.'
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>LOCAL · DIDCOMM BASIC</Text>
      <Text style={styles.title}>{isEs ? 'Mensajes' : 'Messages'}</Text>
      <Text style={styles.subtitle}>
        {entitled
          ? isEs
            ? 'ILIMITADO TRV (con derecho)'
            : 'UNLIMITED TRV (entitled)'
          : isEs
            ? 'Almacén local (sin derecho de red)'
            : 'Local store (no network entitlement)'}
      </Text>

      <Text style={styles.label}>{isEs ? 'Para DID (opcional)' : 'To DID (optional)'}</Text>
      <VoiceField
        value={toDid}
        onChangeText={setToDid}
        placeholder="did:key:z6Mk…"
        placeholderTextColor="#555"
        autoCapitalize="none"
      />

      <Text style={styles.label}>{isEs ? 'Mensaje' : 'Message'}</Text>
      <VoiceField
        value={content}
        onChangeText={setContent}
        placeholder={isEs ? 'Nota…' : 'Presence note…'}
        placeholderTextColor="#555"
        multiline
        style={{ minHeight: 88 }}
        appendDictation
      />

      <Pressable style={[styles.btn, styles.btnPrimary]} onPress={handleSend}>
        <Text style={styles.btnText}>
          {isEs ? 'Enviar (local)' : 'Send (local)'}
        </Text>
      </Pressable>

      <View style={styles.row}>
        <Text style={styles.section}>
          {isEs ? 'Bandeja' : 'Inbox'} ({inbox.length})
        </Text>
        {inbox.length > 0 && (
          <Pressable
            onPress={() =>
              Alert.alert(
                isEs ? '¿Vaciar?' : 'Clear inbox?',
                isEs ? 'Solo local.' : 'Local only.',
                [
                  { text: isEs ? 'Cancelar' : 'Cancel', style: 'cancel' },
                  {
                    text: isEs ? 'Vaciar' : 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                      await clearInbox();
                      refresh();
                    },
                  },
                ]
              )
            }
          >
            <Text style={styles.clearLink}>{isEs ? 'Vaciar' : 'Clear'}</Text>
          </Pressable>
        )}
      </View>

      {inbox.length === 0 ? (
        <Text style={styles.empty}>
          {isEs ? 'Sin mensajes' : 'No messages yet'}
        </Text>
      ) : (
        inbox.map((msg) => (
          <View key={msg.id} style={styles.card}>
            <Text style={styles.meta} numberOfLines={1}>
              {msg.from || 'unknown'}
            </Text>
            <Text style={styles.body}>{msg.body?.content}</Text>
            <Pressable
              style={[styles.btn, styles.btnSmall]}
              onPress={() => handleVerify(msg)}
            >
              <Text style={styles.btnTextSmall}>
                {isEs ? 'Verificar' : 'Verify'}
              </Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#0a0a0a' },
  kicker: { color: '#666', fontSize: 11, letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  subtitle: { color: '#888', marginBottom: 20, lineHeight: 20 },
  label: { color: '#666', fontSize: 12, marginBottom: 6 },
  btn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  btnPrimary: { backgroundColor: '#1a7f4b' },
  btnSmall: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 0,
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  btnTextSmall: { color: '#ccc', fontSize: 13 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  section: { color: '#fff', fontSize: 16, fontWeight: '600' },
  clearLink: { color: '#e74c3c', fontSize: 14 },
  empty: { color: '#555' },
  card: {
    backgroundColor: '#141414',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  meta: { color: '#666', fontSize: 11, marginBottom: 6 },
  body: { color: '#fff', lineHeight: 20 },
});
