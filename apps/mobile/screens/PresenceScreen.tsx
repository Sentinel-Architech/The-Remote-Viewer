import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
  TextInput,
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
  Connection,
} from '../src/services/connections';

export default function PresenceScreen() {
  const [identity, setIdentity] = useState<DidKeyIdentity | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [smokeResult, setSmokeResult] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<DemoCredential[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  // High-friction destroy gate (local only)
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [typedDid, setTypedDid] = useState('');

  // Connection add input
  const [newConnectionId, setNewConnectionId] = useState('');

  const refresh = async () => {
    const current = await getCurrentDidKey();
    setIdentity(current);
    if (current) {
      const [creds, conns] = await Promise.all([
        listDemoCredentials(),
        listConnections(),
      ]);
      setCredentials(creds);
      setConnections(conns);
    } else {
      setCredentials([]);
      setConnections([]);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async () => {
    setBusy(true);
    setSmokeResult(null);
    setShowDangerZone(false);
    setTypedDid('');
    try {
      const newIdentity = await createDidKey();
      setIdentity(newIdentity);
      setSignature(null);
      setCredentials([]);
      setConnections([]);
    } finally {
      setBusy(false);
    }
  };

  const openDangerZone = () => {
    setTypedDid('');
    setShowDangerZone(true);
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
      'Final confirmation',
      'This identity path will end permanently. Connections and credentials held here will be wiped. There is no recovery by The Remote Viewer.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I understand — Destroy this path',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await destroyDidKey();
              setIdentity(null);
              setSignature(null);
              setCredentials([]);
              setConnections([]);
              setSmokeResult(null);
              setShowDangerZone(false);
              setTypedDid('');
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
    const doc = buildDidDocument(identity);
    Alert.alert('DID Document', JSON.stringify(doc, null, 2));
  };

  const handleIssueDemoVc = async () => {
    setBusy(true);
    try {
      const entry = await issueDemoCredential();
      if (!entry) {
        Alert.alert('Issue failed', 'No active identity or signing error.');
        return;
      }
      const list = await listDemoCredentials();
      setCredentials(list);
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
    const summary = credentials
      .map(
        (c, i) =>
          `${i + 1}. ${c.id}\n   issued ${new Date(c.issuedAt).toISOString()}`
      )
      .join('\n\n');
    Alert.alert(`Held credentials (${credentials.length})`, summary);
  };

  const handleAddConnection = async () => {
    const id = newConnectionId.trim();
    if (!id) {
      Alert.alert('Add connection', 'Paste a did:key or public identifier.');
      return;
    }
    setBusy(true);
    try {
      const list = await addConnection(id);
      setConnections(list);
      setNewConnectionId('');
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveConnection = (id: string) => {
    Alert.alert('Remove connection?', id, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const list = await removeConnection(id);
          setConnections(list);
        },
      },
    ]);
  };

  /** Smoke test includes connections wipe. */
  const handleSmokeTest = async () => {
    setBusy(true);
    setSmokeResult(null);
    setShowDangerZone(false);
    setTypedDid('');
    try {
      await destroyDidKey();

      const created = await createDidKey();
      if (!created?.did) {
        setSmokeResult('FAIL: create returned no DID');
        return;
      }

      await issueDemoCredential();
      await addConnection('did:key:smoke-test-peer');

      const midCreds = await listDemoCredentials();
      const midConns = await listConnections();
      if (midCreds.length < 1 || midConns.length < 1) {
        setSmokeResult('FAIL: VC or connection not stored');
        return;
      }

      await destroyDidKey();

      const afterId = await getCurrentDidKey();
      const afterCreds = await listDemoCredentials();
      const afterConns = await listConnections();
      if (
        afterId === null &&
        afterCreds.length === 0 &&
        afterConns.length === 0
      ) {
        setSmokeResult('PASS: Create → VC + Connection → Destroy → Empty');
        setIdentity(null);
        setSignature(null);
        setCredentials([]);
        setConnections([]);
      } else {
        setSmokeResult(
          'FAIL: identity, credentials, or connections remain after destroy'
        );
      }
    } catch (e) {
      setSmokeResult(`FAIL: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>LOCAL · SCAFFOLD · SOCIAL SLICE 1</Text>
      <Text style={styles.title}>Identity</Text>
      <Text style={styles.subtitle}>
        did:key · demo VCs · on-device connections
      </Text>

      <View style={styles.card}>
        {identity ? (
          <>
            <View style={styles.badgeActive}>
              <Text style={styles.badgeText}>ACTIVE</Text>
            </View>
            <Text style={styles.label}>DID</Text>
            <Text selectable style={styles.did}>
              {identity.did}
            </Text>
            <Text style={styles.label}>Public key</Text>
            <Text selectable style={styles.mono}>
              {identity.publicKeyHex}
            </Text>
            <Text style={styles.label}>Held demo VCs</Text>
            <Text style={styles.mono}>{credentials.length}</Text>
            <Text style={styles.label}>Connections</Text>
            <Text style={styles.mono}>{connections.length}</Text>
            {signature && (
              <>
                <Text style={styles.label}>Last signature</Text>
                <Text selectable style={styles.mono}>
                  {signature}
                </Text>
              </>
            )}
          </>
        ) : (
          <>
            <View style={styles.badgeIdle}>
              <Text style={styles.badgeTextIdle}>NO IDENTITY</Text>
            </View>
            <Text style={styles.hint}>
              Create a local did:key. Keys, demo VCs, and connections never leave
              this device and are wiped together on Destroy.
            </Text>
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
      </View>

      {/* Connections (only when identity active) */}
      {identity && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Connections (on-device)</Text>
          <Text style={styles.hint}>
            Local list only. No relays. Wiped on Destroy.
          </Text>
          <TextInput
            style={styles.didInput}
            value={newConnectionId}
            onChangeText={setNewConnectionId}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Paste did:key or public id"
            placeholderTextColor="#555"
            editable={!busy}
          />
          <Pressable
            style={[styles.btn, styles.btnSecondary]}
            onPress={handleAddConnection}
            disabled={busy}
          >
            <Text style={styles.btnText}>Add connection</Text>
          </Pressable>
          {connections.length === 0 ? (
            <Text style={[styles.hint, { marginTop: 12 }]}>No connections yet.</Text>
          ) : (
            connections.map((c) => (
              <View key={c.id} style={styles.connRow}>
                <Text selectable style={styles.connId} numberOfLines={2}>
                  {c.label ? `${c.label} · ` : ''}{c.id}
                </Text>
                <Pressable
                  style={styles.connRemove}
                  onPress={() => handleRemoveConnection(c.id)}
                >
                  <Text style={styles.connRemoveText}>Remove</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      )}

      {/* High-friction Danger Zone */}
      {identity && showDangerZone && (
        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <Text style={styles.dangerBody}>
            This action is permanent.\n\n• Your TRV identity path will end.\n• Demo
            VCs and on-device connections for this path will be destroyed.\n• There
            is no recovery by The Remote Viewer.\n\nType the full DID below to enable
            destruction. No email or phone is used.
          </Text>
          <Text style={styles.label}>Type full DID exactly</Text>
          <TextInput
            style={styles.didInput}
            value={typedDid}
            onChangeText={setTypedDid}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="did:key:…"
            placeholderTextColor="#555"
            editable={!busy}
          />
          <View style={styles.dangerActions}>
            <Pressable
              style={[styles.btn, styles.btnSecondary]}
              onPress={cancelDangerZone}
              disabled={busy}
            >
              <Text style={styles.btnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.btn,
                didMatches ? styles.btnDanger : styles.btnDisabled,
              ]}
              onPress={confirmDestroy}
              disabled={!didMatches || busy}
            >
              <Text style={styles.btnText}>
                {didMatches ? 'I understand — Destroy' : 'Type DID to enable'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.actions}>
        {!identity ? (
          <Pressable
            style={[styles.btn, styles.btnPrimary]}
            onPress={handleCreate}
            disabled={busy}
          >
            <Text style={styles.btnText}>Create did:key</Text>
          </Pressable>
        ) : (
          <>
            <Pressable style={[styles.btn, styles.btnSecondary]} onPress={handleSign}>
              <Text style={styles.btnText}>Sign test message</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnSecondary]} onPress={handleShowDidDoc}>
              <Text style={styles.btnText}>Show DID Document</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnSecondary]}
              onPress={handleIssueDemoVc}
              disabled={busy}
            >
              <Text style={styles.btnText}>Issue Demo VC</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnSecondary]} onPress={handleShowCredentials}>
              <Text style={styles.btnText}>
                Show held VCs ({credentials.length})
              </Text>
            </Pressable>
            {!showDangerZone && (
              <Pressable
                style={[styles.btn, styles.btnDanger]}
                onPress={openDangerZone}
                disabled={busy}
              >
                <Text style={styles.btnText}>Destroy identity…</Text>
              </Pressable>
            )}
          </>
        )}

        <Pressable
          style={[styles.btn, styles.btnSmoke]}
          onPress={handleSmokeTest}
          disabled={busy}
        >
          <Text style={styles.btnText}>
            {busy
              ? 'Running…'
              : 'Run Smoke Test (Create → VC + Conn → Destroy → Empty)'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#0a0a0a',
  },
  kicker: {
    color: '#666',
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    color: '#888',
    marginBottom: 20,
  },
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
    marginBottom: 4,
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
  dangerBody: {
    color: '#ccc',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  didInput: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 8,
    marginBottom: 12,
  },
  dangerActions: {
    gap: 10,
  },
  connRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  connId: {
    flex: 1,
    color: '#aaa',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  connRemove: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  connRemoveText: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: '600',
  },
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
  label: {
    color: '#666',
    fontSize: 12,
    marginTop: 12,
    marginBottom: 4,
  },
  did: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 18,
  },
  mono: {
    color: '#aaa',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  hint: {
    color: '#888',
    lineHeight: 20,
    fontSize: 13,
  },
  smoke: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: '600',
  },
  smokePass: { color: '#2ecc71' },
  smokeFail: { color: '#e74c3c' },
  actions: {
    gap: 10,
  },
  btn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
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
