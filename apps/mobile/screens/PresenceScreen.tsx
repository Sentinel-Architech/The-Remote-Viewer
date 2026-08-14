import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
  Share,
} from 'react-native';
import {
  createDidKey,
  getCurrentDidKey,
  destroyDidKey,
  signWithDidKey,
  buildDidDocument,
  DidKeyIdentity,
} from '../src/services/presence';
import {
  issueDemoCredential,
  listDemoCredentials,
  DemoCredential,
} from '../src/services/credentials';
import {
  addConnection,
  removeConnection,
  listConnections,
  exportConnectionList,
  importConnectionList,
  Connection,
} from '../src/services/connections';
import {
  createBasicMessage,
  storeMessage,
  getInbox,
  DidCommBasicMessage,
} from '../src/services/didcomm';
import {
  getLocalProfile,
  setLocalProfile,
  buildProfileEvent,
  buildFollowListEvent,
  LocalProfile,
} from '../src/services/profile';
import { speak } from '../src/services/voice';
import { VoiceField } from '../src/components/VoiceField';
import { LocaleHumanBar } from '../src/components/LocaleHumanBar';
import { t, Locale } from '../src/i18n/strings';

type Props = {
  locale?: Locale;
  onLocaleChange?: () => void;
  onReplayTutorial?: () => void;
};

export default function PresenceScreen({
  locale = 'en',
  onLocaleChange,
  onReplayTutorial,
}: Props) {
  const [identity, setIdentity] = useState<DidKeyIdentity | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [smokeResult, setSmokeResult] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<DemoCredential[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [inbox, setInbox] = useState<DidCommBasicMessage[]>([]);
  const [profile, setProfile] = useState<LocalProfile | null>(null);

  const [showDangerZone, setShowDangerZone] = useState(false);
  const [typedDid, setTypedDid] = useState('');
  const [showOpticalShare, setShowOpticalShare] = useState(false);
  const [newConnectionId, setNewConnectionId] = useState('');
  const [importPayload, setImportPayload] = useState('');
  const [msgTo, setMsgTo] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileAbout, setProfileAbout] = useState('');

  const refresh = async () => {
    const current = await getCurrentDidKey();
    setIdentity(current);
    if (current) {
      const [creds, conns, messages, prof] = await Promise.all([
        listDemoCredentials(),
        listConnections(),
        getInbox(),
        getLocalProfile(),
      ]);
      setCredentials(creds);
      setConnections(conns);
      setInbox(messages);
      setProfile(prof);
      if (prof) {
        setProfileName(prof.displayName);
        setProfileAbout(prof.about);
      }
    } else {
      setCredentials([]);
      setConnections([]);
      setInbox([]);
      setProfile(null);
      setProfileName('');
      setProfileAbout('');
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const statusSummary = () => {
    if (!identity) {
      return locale === 'es'
        ? 'Sin identidad. Cree un did key local para comenzar.'
        : 'No identity. Create a local did key to begin.';
    }
    return [
      locale === 'es' ? 'Identidad activa.' : 'Identity active.',
      profile?.displayName
        ? locale === 'es'
          ? `Perfil ${profile.displayName}.`
          : `Profile ${profile.displayName}.`
        : '',
      `${credentials.length} VCs.`,
      `${connections.length} ${locale === 'es' ? 'conexiones' : 'connections'}.`,
      `${inbox.length} ${locale === 'es' ? 'mensajes' : 'messages'}.`,
      smokeResult || '',
    ]
      .filter(Boolean)
      .join(' ');
  };

  const handleReadStatus = () => speak(statusSummary());

  const handleCreate = async () => {
    setBusy(true);
    setSmokeResult(null);
    setShowDangerZone(false);
    setTypedDid('');
    setShowOpticalShare(false);
    try {
      const newIdentity = await createDidKey();
      setIdentity(newIdentity);
      setSignature(null);
      setCredentials([]);
      setConnections([]);
      setInbox([]);
      setProfile(null);
      setProfileName('');
      setProfileAbout('');
      speak(locale === 'es' ? 'Identidad creada.' : 'Identity created.');
    } finally {
      setBusy(false);
    }
  };

  const openDangerZone = () => {
    setTypedDid('');
    setShowDangerZone(true);
    setShowOpticalShare(false);
  };

  const cancelDangerZone = () => {
    setShowDangerZone(false);
    setTypedDid('');
  };

  const didMatches =
    identity !== null && typedDid.trim() === identity.did;

  const confirmDestroy = async () => {
    if (!identity || !didMatches) return;
    Alert.alert(
      locale === 'es' ? 'Confirmación final' : 'Final confirmation',
      locale === 'es'
        ? 'Esta ruta de identidad terminará permanentemente.'
        : 'This identity path will end permanently.',
      [
        { text: t(locale, 'cancel'), style: 'cancel' },
        {
          text: t(locale, 'destroyConfirm'),
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await destroyDidKey();
              setIdentity(null);
              setSignature(null);
              setCredentials([]);
              setConnections([]);
              setInbox([]);
              setProfile(null);
              setProfileName('');
              setProfileAbout('');
              setSmokeResult(null);
              setShowDangerZone(false);
              setTypedDid('');
              setShowOpticalShare(false);
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  };

  const handleSign = async () => {
    const message = 'TRV presence proof ' + new Date().toISOString();
    const sig = await signWithDidKey(message);
    setSignature(sig);
    Alert.alert('Signed', message);
  };

  const handleShowDidDoc = () => {
    if (!identity) return;
    Alert.alert('DID Document', JSON.stringify(buildDidDocument(identity), null, 2));
  };

  const handleIssueDemoVc = async () => {
    setBusy(true);
    try {
      const entry = await issueDemoCredential();
      if (!entry) return;
      setCredentials(await listDemoCredentials());
      Alert.alert('Demo VC issued', entry.id);
    } finally {
      setBusy(false);
    }
  };

  const handleShowCredentials = () => {
    if (credentials.length === 0) {
      Alert.alert('Held credentials', 'None.');
      return;
    }
    Alert.alert(
      `Held credentials (${credentials.length})`,
      credentials.map((c, i) => `${i + 1}. ${c.id}`).join('\n')
    );
  };

  const handleShareDidOptical = async () => {
    if (!identity) return;
    try {
      await Share.share({ message: identity.did, title: 'TRV identity' });
    } catch {
      /* cancel */
    }
  };

  const handleAddConnection = async () => {
    const id = newConnectionId.trim();
    if (!id) return;
    setBusy(true);
    try {
      setConnections(await addConnection(id));
      setNewConnectionId('');
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveConnection = (id: string) => {
    Alert.alert('Remove?', id, [
      { text: t(locale, 'cancel'), style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => setConnections(await removeConnection(id)),
      },
    ]);
  };

  const handleExportConnections = async () => {
    setBusy(true);
    try {
      const payload = await exportConnectionList();
      await Share.share({
        message: JSON.stringify(payload, null, 2),
        title: 'trv-connections-v1',
      });
    } catch {
      /* cancel */
    } finally {
      setBusy(false);
    }
  };

  const handleImportConnections = async () => {
    const raw = importPayload.trim();
    if (!raw) return;
    setBusy(true);
    try {
      const result = await importConnectionList(raw);
      setConnections(result.list);
      setImportPayload('');
      Alert.alert('Import', `Added ${result.added}, skipped ${result.skipped}`);
    } catch (e) {
      Alert.alert('Import failed', e instanceof Error ? e.message : 'Invalid');
    } finally {
      setBusy(false);
    }
  };

  const handleSendLocalMessage = async () => {
    const to = msgTo.trim();
    const content = msgBody.trim();
    if (!to || !content) return;
    setBusy(true);
    try {
      const msg = await createBasicMessage(content, to);
      if (!msg) return;
      await storeMessage(msg);
      setInbox(await getInbox());
      setMsgBody('');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveProfile = async () => {
    setBusy(true);
    try {
      setProfile(await setLocalProfile(profileName, profileAbout));
    } finally {
      setBusy(false);
    }
  };

  const handleExportProfileEvent = async () => {
    const event = await buildProfileEvent();
    if (!event) return;
    try {
      await Share.share({ message: JSON.stringify(event, null, 2) });
    } catch {
      /* cancel */
    }
  };

  const handleExportFollowEvent = async () => {
    const event = await buildFollowListEvent();
    if (!event) return;
    try {
      await Share.share({ message: JSON.stringify(event, null, 2) });
    } catch {
      /* cancel */
    }
  };

  const handleSmokeTest = async () => {
    setBusy(true);
    setSmokeResult(null);
    try {
      await destroyDidKey();
      const created = await createDidKey();
      if (!created?.did) {
        setSmokeResult('FAIL');
        return;
      }
      await issueDemoCredential();
      await addConnection('did:key:smoke-test-peer');
      await setLocalProfile('Smoke', 'test');
      const msg = await createBasicMessage('smoke', 'did:key:smoke-test-peer');
      if (msg) await storeMessage(msg);
      await destroyDidKey();
      const empty =
        (await getCurrentDidKey()) === null &&
        (await listDemoCredentials()).length === 0 &&
        (await listConnections()).length === 0 &&
        (await getInbox()).length === 0 &&
        (await getLocalProfile()) === null;
      setSmokeResult(empty ? 'PASS' : 'FAIL');
      setIdentity(null);
      setCredentials([]);
      setConnections([]);
      setInbox([]);
      setProfile(null);
    } catch (e) {
      setSmokeResult(`FAIL: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>LOCAL · SCAFFOLD</Text>
      <Text style={styles.title}>{t(locale, 'identity')}</Text>
      <Text style={styles.subtitle}>
        {locale === 'es'
          ? 'Texto o voz · did:key · capa social'
          : 'Text or voice · did:key · social layer'}
      </Text>

      <LocaleHumanBar
        locale={locale}
        onLocaleChange={onLocaleChange}
        identityActive={!!identity}
        onReplayTutorial={onReplayTutorial}
      />

      <View style={styles.card}>
        {identity ? (
          <>
            <View style={styles.badgeActive}>
              <Text style={styles.badgeText}>{t(locale, 'active')}</Text>
            </View>
            <Text style={styles.label}>DID</Text>
            <Text selectable style={styles.did}>
              {identity.did}
            </Text>
            <Text style={styles.mono}>
              {profile?.displayName || '(none)'} · VCs {credentials.length} ·
              Conns {connections.length} · Msgs {inbox.length}
            </Text>
          </>
        ) : (
          <>
            <View style={styles.badgeIdle}>
              <Text style={styles.badgeTextIdle}>{t(locale, 'noIdentity')}</Text>
            </View>
            <Text style={styles.hint}>{t(locale, 'noIdentityHint')}</Text>
          </>
        )}
        {smokeResult && (
          <Text
            style={[
              styles.smoke,
              smokeResult.startsWith('PASS') ? styles.smokePass : styles.smokeFail,
            ]}
          >
            {smokeResult}
          </Text>
        )}
        <Pressable
          style={[styles.btn, styles.btnSecondary, { marginTop: 12 }]}
          onPress={handleReadStatus}
        >
          <Text style={styles.btnText}>{t(locale, 'speakStatus')}</Text>
        </Pressable>
      </View>

      {identity && showOpticalShare && (
        <View style={styles.opticalCard}>
          <View style={styles.opticalDidBox}>
            <Text selectable style={styles.opticalDid}>
              {identity.did}
            </Text>
          </View>
          <Pressable style={[styles.btn, styles.btnSecondary]} onPress={handleShareDidOptical}>
            <Text style={styles.btnText}>Share DID</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnSecondary, { marginTop: 8 }]}
            onPress={() => setShowOpticalShare(false)}
          >
            <Text style={styles.btnText}>{t(locale, 'cancel')}</Text>
          </Pressable>
        </View>
      )}

      {identity && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t(locale, 'localProfile')}</Text>
          <Text style={styles.label}>{t(locale, 'displayName')}</Text>
          <VoiceField
            value={profileName}
            onChangeText={setProfileName}
            placeholderTextColor="#555"
            editable={!busy}
          />
          <Text style={styles.label}>{t(locale, 'about')}</Text>
          <VoiceField
            value={profileAbout}
            onChangeText={setProfileAbout}
            multiline
            style={{ minHeight: 56 }}
            placeholderTextColor="#555"
            editable={!busy}
            appendDictation
          />
          <Pressable style={[styles.btn, styles.btnSecondary]} onPress={handleSaveProfile}>
            <Text style={styles.btnText}>{t(locale, 'saveProfile')}</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnSecondary, { marginTop: 8 }]}
            onPress={handleExportProfileEvent}
          >
            <Text style={styles.btnText}>Export kind-0</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnSecondary, { marginTop: 8 }]}
            onPress={handleExportFollowEvent}
          >
            <Text style={styles.btnText}>Export kind-3</Text>
          </Pressable>
        </View>
      )}

      {identity && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t(locale, 'connections')}</Text>
          <VoiceField
            value={newConnectionId}
            onChangeText={setNewConnectionId}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#555"
            editable={!busy}
          />
          <Pressable style={[styles.btn, styles.btnSecondary]} onPress={handleAddConnection}>
            <Text style={styles.btnText}>{t(locale, 'addConnection')}</Text>
          </Pressable>
          {!showOpticalShare && (
            <Pressable
              style={[styles.btn, styles.btnSecondary, { marginTop: 8 }]}
              onPress={() => setShowOpticalShare(true)}
            >
              <Text style={styles.btnText}>Optical DID</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.btn, styles.btnSecondary, { marginTop: 8 }]}
            onPress={handleExportConnections}
          >
            <Text style={styles.btnText}>
              Export ({connections.length})
            </Text>
          </Pressable>
          <VoiceField
            value={importPayload}
            onChangeText={setImportPayload}
            multiline
            style={{ minHeight: 64 }}
            autoCapitalize="none"
            placeholderTextColor="#555"
            editable={!busy}
          />
          <Pressable style={[styles.btn, styles.btnSecondary]} onPress={handleImportConnections}>
            <Text style={styles.btnText}>Import</Text>
          </Pressable>
          {connections.map((c) => (
            <View key={c.id} style={styles.connRow}>
              <Text selectable style={styles.connId} numberOfLines={2}>
                {c.id}
              </Text>
              <Pressable onPress={() => handleRemoveConnection(c.id)}>
                <Text style={styles.connRemoveText}>Remove</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {identity && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t(locale, 'localMessages')}</Text>
          <VoiceField
            value={msgTo}
            onChangeText={setMsgTo}
            autoCapitalize="none"
            placeholderTextColor="#555"
            editable={!busy}
          />
          <Text style={styles.label}>{t(locale, 'content')}</Text>
          <VoiceField
            value={msgBody}
            onChangeText={setMsgBody}
            multiline
            style={{ minHeight: 64 }}
            placeholderTextColor="#555"
            editable={!busy}
            appendDictation
          />
          <Pressable style={[styles.btn, styles.btnSecondary]} onPress={handleSendLocalMessage}>
            <Text style={styles.btnText}>Sign & store</Text>
          </Pressable>
          {inbox.slice(0, 6).map((m) => (
            <View key={m.id} style={styles.msgRow}>
              <Text style={styles.msgBody} numberOfLines={2}>
                {m.body?.content}
              </Text>
            </View>
          ))}
        </View>
      )}

      {identity && showDangerZone && (
        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>{t(locale, 'dangerZone')}</Text>
          <Text style={styles.label}>{t(locale, 'typeFullDid')}</Text>
          <VoiceField
            value={typedDid}
            onChangeText={setTypedDid}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#555"
            editable={!busy}
          />
          <View style={styles.dangerActions}>
            <Pressable style={[styles.btn, styles.btnSecondary]} onPress={cancelDangerZone}>
              <Text style={styles.btnText}>{t(locale, 'cancel')}</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, didMatches ? styles.btnDanger : styles.btnDisabled]}
              onPress={confirmDestroy}
              disabled={!didMatches || busy}
            >
              <Text style={styles.btnText}>
                {didMatches ? t(locale, 'destroyConfirm') : t(locale, 'matchDid')}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.actions}>
        {!identity ? (
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={handleCreate} disabled={busy}>
            <Text style={styles.btnText}>{t(locale, 'createDid')}</Text>
          </Pressable>
        ) : (
          <>
            <Pressable style={[styles.btn, styles.btnSecondary]} onPress={handleSign}>
              <Text style={styles.btnText}>Sign test</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnSecondary]} onPress={handleShowDidDoc}>
              <Text style={styles.btnText}>DID Document</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnSecondary]} onPress={handleIssueDemoVc}>
              <Text style={styles.btnText}>Issue Demo VC</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnSecondary]} onPress={handleShowCredentials}>
              <Text style={styles.btnText}>VCs ({credentials.length})</Text>
            </Pressable>
            {!showDangerZone && (
              <Pressable style={[styles.btn, styles.btnDanger]} onPress={openDangerZone}>
                <Text style={styles.btnText}>{t(locale, 'destroyIdentity')}</Text>
              </Pressable>
            )}
          </>
        )}
        <Pressable style={[styles.btn, styles.btnSmoke]} onPress={handleSmokeTest} disabled={busy}>
          <Text style={styles.btnText}>{busy ? '…' : 'Smoke Test'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#0a0a0a' },
  kicker: { color: '#666', fontSize: 11, letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  subtitle: { color: '#888', marginBottom: 20 },
  card: {
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 24,
  },
  opticalCard: {
    backgroundColor: '#0a1410',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a4a3a',
    marginBottom: 24,
  },
  opticalDidBox: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#2a5a4a',
  },
  opticalDid: {
    color: '#2ecc71',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  dangerCard: {
    backgroundColor: '#1a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#5c1a1a',
    marginBottom: 24,
  },
  dangerTitle: { color: '#e74c3c', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  dangerActions: { gap: 10 },
  connRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  connId: { flex: 1, color: '#aaa', fontSize: 11, fontFamily: 'monospace' },
  connRemoveText: { color: '#e74c3c', fontSize: 12, fontWeight: '600' },
  msgRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#222' },
  msgBody: { color: '#ccc', fontSize: 13 },
  badgeActive: {
    alignSelf: 'flex-start',
    backgroundColor: '#0d3d24',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  badgeIdle: {
    alignSelf: 'flex-start',
    backgroundColor: '#2a1515',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  badgeText: { color: '#2ecc71', fontSize: 12, fontWeight: '600' },
  badgeTextIdle: { color: '#e74c3c', fontSize: 12, fontWeight: '600' },
  label: { color: '#666', fontSize: 12, marginTop: 8, marginBottom: 4 },
  did: { color: '#fff', fontSize: 13, lineHeight: 18 },
  mono: { color: '#aaa', fontSize: 11, fontFamily: 'monospace' },
  hint: { color: '#888', lineHeight: 20, fontSize: 13 },
  smoke: { marginTop: 14, fontSize: 13, fontWeight: '600' },
  smokePass: { color: '#2ecc71' },
  smokeFail: { color: '#e74c3c' },
  actions: { gap: 10 },
  btn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#1a7f4b' },
  btnSecondary: { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' },
  btnDanger: { backgroundColor: '#5c1a1a' },
  btnDisabled: { backgroundColor: '#2a2a2a' },
  btnSmoke: { backgroundColor: '#1a2a3a', borderWidth: 1, borderColor: '#2a4a5a' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
