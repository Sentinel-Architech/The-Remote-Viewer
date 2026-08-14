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
  LocalProfile,
} from '../src/services/profile';
import { VoiceField } from '../src/components/VoiceField';
import { LocaleHumanBar } from '../src/components/LocaleHumanBar';
import { DeepfakePolicyBanner } from '../src/components/DeepfakePolicyBanner';
import { ConductCommunityPanel } from '../src/components/ConductCommunityPanel';
import { TopicalLeansPanel } from '../src/components/TopicalLeansPanel';
import { WeThePeopleBanner } from '../src/components/WeThePeopleBanner';
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
  const [busy, setBusy] = useState(false);
  const [smokeResult, setSmokeResult] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<DemoCredential[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [inbox, setInbox] = useState<DidCommBasicMessage[]>([]);
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [typedDid, setTypedDid] = useState('');
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

  const didMatches = identity !== null && typedDid.trim() === identity.did;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>LOCAL · SCAFFOLD</Text>
      <Text style={styles.title}>{t(locale, 'identity')}</Text>
      <Text style={styles.subtitle}>
        {locale === 'es'
          ? 'Nosotros el Pueblo · soberanía'
          : 'We the People · sovereignty'}
      </Text>

      <WeThePeopleBanner locale={locale} />
      <DeepfakePolicyBanner locale={locale} />
      <TopicalLeansPanel locale={locale} />
      <ConductCommunityPanel locale={locale} />

      <LocaleHumanBar
        locale={locale}
        onLocaleChange={onLocaleChange}
        identityActive={!!identity}
        onReplayTutorial={onReplayTutorial}
      />

      <View style={styles.card}>
        {identity ? (
          <>
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
          <Text style={styles.hint}>{t(locale, 'noIdentityHint')}</Text>
        )}
        {smokeResult && <Text style={styles.smoke}>{smokeResult}</Text>}
      </View>

      {identity && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t(locale, 'localProfile')}</Text>
          <VoiceField
            value={profileName}
            onChangeText={setProfileName}
            placeholderTextColor="#555"
          />
          <VoiceField
            value={profileAbout}
            onChangeText={setProfileAbout}
            multiline
            style={{ minHeight: 48 }}
            placeholderTextColor="#555"
            appendDictation
          />
          <Pressable
            style={[styles.btn, styles.btnSecondary]}
            onPress={async () =>
              setProfile(await setLocalProfile(profileName, profileAbout))
            }
          >
            <Text style={styles.btnText}>{t(locale, 'saveProfile')}</Text>
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
            placeholderTextColor="#555"
          />
          <Pressable
            style={[styles.btn, styles.btnSecondary]}
            onPress={async () => {
              const id = newConnectionId.trim();
              if (!id) return;
              setConnections(await addConnection(id));
              setNewConnectionId('');
            }}
          >
            <Text style={styles.btnText}>{t(locale, 'addConnection')}</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnSecondary, { marginTop: 8 }]}
            onPress={async () => {
              const payload = await exportConnectionList();
              await Share.share({ message: JSON.stringify(payload, null, 2) });
            }}
          >
            <Text style={styles.btnText}>Export ({connections.length})</Text>
          </Pressable>
          <VoiceField
            value={importPayload}
            onChangeText={setImportPayload}
            multiline
            style={{ minHeight: 48 }}
            autoCapitalize="none"
            placeholderTextColor="#555"
          />
          <Pressable
            style={[styles.btn, styles.btnSecondary]}
            onPress={async () => {
              try {
                const r = await importConnectionList(importPayload.trim());
                setConnections(r.list);
                setImportPayload('');
              } catch (e) {
                Alert.alert('Import', e instanceof Error ? e.message : 'fail');
              }
            }}
          >
            <Text style={styles.btnText}>Import</Text>
          </Pressable>
          {connections.map((c) => (
            <View key={c.id} style={styles.connRow}>
              <Text style={styles.connId} numberOfLines={1}>
                {c.id}
              </Text>
              <Pressable
                onPress={async () => setConnections(await removeConnection(c.id))}
              >
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
          />
          <VoiceField
            value={msgBody}
            onChangeText={setMsgBody}
            multiline
            style={{ minHeight: 48 }}
            placeholderTextColor="#555"
            appendDictation
          />
          <Pressable
            style={[styles.btn, styles.btnSecondary]}
            onPress={async () => {
              const msg = await createBasicMessage(msgBody.trim(), msgTo.trim());
              if (!msg) return;
              await storeMessage(msg);
              setInbox(await getInbox());
              setMsgBody('');
            }}
          >
            <Text style={styles.btnText}>Sign & store</Text>
          </Pressable>
        </View>
      )}

      {identity && showDangerZone && (
        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>{t(locale, 'dangerZone')}</Text>
          <VoiceField
            value={typedDid}
            onChangeText={setTypedDid}
            autoCapitalize="none"
            placeholderTextColor="#555"
          />
          <Pressable
            style={[styles.btn, styles.btnSecondary, { marginTop: 8 }]}
            onPress={() => {
              setShowDangerZone(false);
              setTypedDid('');
            }}
          >
            <Text style={styles.btnText}>{t(locale, 'cancel')}</Text>
          </Pressable>
          <Pressable
            style={[
              styles.btn,
              didMatches ? styles.btnDanger : styles.btnDisabled,
              { marginTop: 8 },
            ]}
            disabled={!didMatches || busy}
            onPress={() => {
              if (!didMatches || !identity) return;
              Alert.alert(
                t(locale, 'destroyConfirm'),
                locale === 'es'
                  ? 'Esta ruta terminará permanentemente.'
                  : 'This path will end permanently.',
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
                        setCredentials([]);
                        setConnections([]);
                        setInbox([]);
                        setProfile(null);
                        setShowDangerZone(false);
                        setTypedDid('');
                      } finally {
                        setBusy(false);
                      }
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.btnText}>
              {didMatches ? t(locale, 'destroyConfirm') : t(locale, 'matchDid')}
            </Text>
          </Pressable>
        </View>
      )}

      <View style={styles.actions}>
        {!identity ? (
          <Pressable
            style={[styles.btn, styles.btnPrimary]}
            disabled={busy}
            onPress={async () => {
              setBusy(true);
              try {
                setIdentity(await createDidKey());
              } finally {
                setBusy(false);
              }
            }}
          >
            <Text style={styles.btnText}>{t(locale, 'createDid')}</Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              style={[styles.btn, styles.btnSecondary]}
              onPress={async () => {
                await signWithDidKey('TRV ' + new Date().toISOString());
                Alert.alert('Signed');
              }}
            >
              <Text style={styles.btnText}>Sign test</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnSecondary]}
              onPress={() =>
                identity &&
                Alert.alert(
                  'DID Document',
                  JSON.stringify(buildDidDocument(identity), null, 2)
                )
              }
            >
              <Text style={styles.btnText}>DID Document</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnSecondary]}
              onPress={async () => {
                await issueDemoCredential();
                setCredentials(await listDemoCredentials());
              }}
            >
              <Text style={styles.btnText}>Issue Demo VC</Text>
            </Pressable>
            {!showDangerZone && (
              <Pressable
                style={[styles.btn, styles.btnDanger]}
                onPress={() => setShowDangerZone(true)}
              >
                <Text style={styles.btnText}>{t(locale, 'destroyIdentity')}</Text>
              </Pressable>
            )}
          </>
        )}
        <Pressable
          style={[styles.btn, styles.btnSmoke]}
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            try {
              await destroyDidKey();
              const c = await createDidKey();
              if (!c) {
                setSmokeResult('FAIL');
                return;
              }
              await destroyDidKey();
              setSmokeResult(
                (await getCurrentDidKey()) === null ? 'PASS' : 'FAIL'
              );
              setIdentity(null);
            } catch (e) {
              setSmokeResult(String(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          <Text style={styles.btnText}>Smoke Test</Text>
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
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dangerCard: {
    backgroundColor: '#1a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#5c1a1a',
    marginBottom: 24,
  },
  dangerTitle: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
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
  label: { color: '#666', fontSize: 12, marginBottom: 4 },
  did: { color: '#fff', fontSize: 13, lineHeight: 18 },
  mono: {
    color: '#aaa',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 8,
  },
  hint: { color: '#888', lineHeight: 20, fontSize: 13 },
  smoke: { marginTop: 12, color: '#2ecc71', fontWeight: '600' },
  actions: { gap: 10 },
  btn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#1a7f4b' },
  btnSecondary: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
  },
  btnDanger: { backgroundColor: '#5c1a1a' },
  btnDisabled: { backgroundColor: '#2a2a2a' },
  btnSmoke: {
    backgroundColor: '#1a2a3a',
    borderWidth: 1,
    borderColor: '#2a4a5a',
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
