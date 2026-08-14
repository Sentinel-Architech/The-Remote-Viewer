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

export default function PresenceScreen() {
  const [identity, setIdentity] = useState<DidKeyIdentity | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [smokeResult, setSmokeResult] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<DemoCredential[]>([]);

  // High-friction destroy gate (local only)
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [typedDid, setTypedDid] = useState('');

  const refresh = async () => {
    const current = await getCurrentDidKey();
    setIdentity(current);
    if (current) {
      const list = await listDemoCredentials();
      setCredentials(list);
    } else {
      setCredentials([]);
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
      'This identity path will end permanently. There is no recovery by The Remote Viewer.',
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

  /** Smoke test: Create → Destroy → Assert Empty. Uses programmatic destroy (UI gate is for humans). */
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
      const mid = await listDemoCredentials();
      if (mid.length < 1) {
        setSmokeResult('FAIL: demo VC not stored');
        return;
      }

      await destroyDidKey();

      const afterId = await getCurrentDidKey();
      const afterCreds = await listDemoCredentials();
      if (afterId === null && afterCreds.length === 0) {
        setSmokeResult('PASS: Create → Issue VC → Destroy → Empty');
        setIdentity(null);
        setSignature(null);
        setCredentials([]);
      } else {
        setSmokeResult('FAIL: identity or credentials remain after destroy');
      }
    } catch (e) {
      setSmokeResult(`FAIL: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>LOCAL · SCAFFOLD · PHASE 1 FIRST CUT</Text>
      <Text style={styles.title}>Identity</Text>
      <Text style={styles.subtitle}>did:key · on-device only · demo VCs</Text>

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
              Create a local did:key. Keys never leave this device. Demo VCs are
              wiped with the identity.
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

      {/* High-friction Danger Zone */}
      {identity && showDangerZone && (
        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <Text style={styles.dangerBody}>
            This action is permanent.\n\n• Your TRV identity path will end.\n• All
            TRV-issued / demo credentials held here will be destroyed.\n• There is
            no recovery by The Remote Viewer.\n\nType the full DID below to enable
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
            {busy ? 'Running…' : 'Run Smoke Test (Create → VC → Destroy → Empty)'}
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
    marginBottom: 12,
  },
  dangerActions: {
    gap: 10,
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
