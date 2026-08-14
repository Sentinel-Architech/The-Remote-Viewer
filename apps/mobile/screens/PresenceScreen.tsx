import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
} from 'react-native';
import {
  createDidKey,
  getCurrentDidKey,
  destroyDidKey,
  signWithDidKey,
  buildDidDocument,
  DidKeyIdentity,
} from '../src/services/presence';

export default function PresenceScreen() {
  const [identity, setIdentity] = useState<DidKeyIdentity | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [smokeResult, setSmokeResult] = useState<string | null>(null);

  const refresh = async () => {
    const current = await getCurrentDidKey();
    setIdentity(current);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async () => {
    setBusy(true);
    setSmokeResult(null);
    try {
      const newIdentity = await createDidKey();
      setIdentity(newIdentity);
      setSignature(null);
    } finally {
      setBusy(false);
    }
  };

  const handleDestroy = async () => {
    Alert.alert(
      'Destroy identity?',
      'Private key and DID will be wiped. Restart from Square One.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Destroy',
          style: 'destructive',
          onPress: async () => {
            await destroyDidKey();
            setIdentity(null);
            setSignature(null);
            setSmokeResult(null);
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

  /** Smoke test: Create → Destroy → Assert Empty. Documents Destroy = Restart. */
  const handleSmokeTest = async () => {
    setBusy(true);
    setSmokeResult(null);
    try {
      // Ensure clean start
      await destroyDidKey();

      const created = await createDidKey();
      if (!created?.did) {
        setSmokeResult('FAIL: create returned no DID');
        return;
      }

      await destroyDidKey();

      const after = await getCurrentDidKey();
      if (after === null) {
        setSmokeResult('PASS: Create → Destroy → Empty');
        setIdentity(null);
        setSignature(null);
      } else {
        setSmokeResult('FAIL: identity still present after destroy');
      }
    } catch (e) {
      setSmokeResult(`FAIL: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>LOCAL · SCAFFOLD</Text>
      <Text style={styles.title}>Identity</Text>
      <Text style={styles.subtitle}>did:key · on-device only</Text>

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
              Create a local did:key. Keys never leave this device.
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
            <Pressable style={[styles.btn, styles.btnDanger]} onPress={handleDestroy}>
              <Text style={styles.btnText}>Destroy identity</Text>
            </Pressable>
          </>
        )}

        <Pressable
          style={[styles.btn, styles.btnSmoke]}
          onPress={handleSmokeTest}
          disabled={busy}
        >
          <Text style={styles.btnText}>
            {busy ? 'Running…' : 'Run Smoke Test (Create → Destroy → Empty)'}
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
  btnSecondary: { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' },
  btnDanger: { backgroundColor: '#5c1a1a' },
  btnSmoke: { backgroundColor: '#1a2a3a', borderWidth: 1, borderColor: '#2a4a5a' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
