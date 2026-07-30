import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
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
  const [smokeResult, setSmokeResult] = useState<string | null>(null);

  const refresh = async () => {
    const current = await getCurrentDidKey();
    setIdentity(current);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async () => {
    try {
      const newIdentity = await createDidKey();
      setIdentity(newIdentity);
      setSignature(null);
      setSmokeResult(null);
    } catch (e: any) {
      Alert.alert('Create failed', e?.message ?? String(e));
    }
  };

  const handleDestroy = async () => {
    try {
      await destroyDidKey();
      setIdentity(null);
      setSignature(null);
      setSmokeResult(null);
      Alert.alert(
        'Destroyed',
        'did:key identity and private key have been permanently wiped.\nRestart from Square One.'
      );
    } catch (e: any) {
      Alert.alert('Destroy failed', e?.message ?? String(e));
    }
  };

  const handleSign = async () => {
    try {
      const message = 'TRV presence proof ' + new Date().toISOString();
      const sig = await signWithDidKey(message);
      setSignature(sig);
      Alert.alert('Signed', `Message:\n${message}`);
    } catch (e: any) {
      Alert.alert('Sign failed', e?.message ?? String(e));
    }
  };

  const handleShowDidDoc = () => {
    if (!identity) return;
    const doc = buildDidDocument(identity);
    Alert.alert('DID Document', JSON.stringify(doc, null, 2));
  };

  /**
   * One-button smoke test:
   * 1. Create identity
   * 2. Confirm it exists
   * 3. Destroy it
   * 4. Confirm it is gone
   * Fails loudly if any step does not behave as expected.
   */
  const handleSmokeTest = async () => {
    setSmokeResult(null);
    try {
      // Start clean
      await destroyDidKey();

      // 1. Create
      const created = await createDidKey();
      if (!created?.did || !created?.publicKeyHex) {
        throw new Error('Create returned incomplete identity');
      }

      // 2. Confirm exists
      const afterCreate = await getCurrentDidKey();
      if (!afterCreate || afterCreate.did !== created.did) {
        throw new Error('Identity missing immediately after create');
      }

      // 3. Destroy
      await destroyDidKey();

      // 4. Confirm gone
      const afterDestroy = await getCurrentDidKey();
      if (afterDestroy !== null) {
        throw new Error('Identity still present after destroy — Destroy = Restart FAILED');
      }

      setIdentity(null);
      setSignature(null);
      setSmokeResult('PASS — Create → Destroy → empty');
      Alert.alert('Smoke Test PASS', 'Create → Destroy → Assert Empty succeeded.\nDestroy = Restart holds for this run.');
    } catch (e: any) {
      setSmokeResult('FAIL — ' + (e?.message ?? String(e)));
      Alert.alert('Smoke Test FAIL', e?.message ?? String(e));
      // Leave UI in a known state
      await refresh();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>did:key Identity</Text>

      {identity ? (
        <>
          <Text style={styles.active}>Identity Active</Text>
          <Text style={styles.label}>DID</Text>
          <Text selectable style={styles.did}>{identity.did}</Text>
          <Text style={styles.label}>Public Key (hex)</Text>
          <Text selectable style={styles.mono}>{identity.publicKeyHex}</Text>

          {signature && (
            <>
              <Text style={styles.label}>Signature (hex)</Text>
              <Text selectable style={styles.mono}>{signature}</Text>
            </>
          )}
        </>
      ) : (
        <Text style={styles.inactive}>No identity – Start from Square One</Text>
      )}

      {smokeResult && (
        <Text style={smokeResult.startsWith('PASS') ? styles.pass : styles.fail}>
          {smokeResult}
        </Text>
      )}

      <View style={styles.buttons}>
        {!identity ? (
          <Button title="Create did:key Identity" onPress={handleCreate} />
        ) : (
          <>
            <Button title="Sign Test Message" onPress={handleSign} />
            <View style={{ height: 12 }} />
            <Button title="Show DID Document" onPress={handleShowDidDoc} />
            <View style={{ height: 12 }} />
            <Button title="Destroy Identity" color="#c0392b" onPress={handleDestroy} />
          </>
        )}

        <View style={{ height: 24 }} />
        <Button title="Run Smoke Test (Create → Destroy → Empty)" onPress={handleSmokeTest} color="#2980b9" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0a0a0a',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 32,
  },
  active: {
    fontSize: 20,
    color: '#2ecc71',
    marginBottom: 20,
  },
  inactive: {
    fontSize: 20,
    color: '#e74c3c',
    marginBottom: 40,
  },
  label: {
    color: '#888',
    marginTop: 16,
    marginBottom: 4,
  },
  did: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  mono: {
    fontFamily: 'monospace',
    color: '#aaa',
    fontSize: 12,
    textAlign: 'center',
  },
  pass: {
    color: '#2ecc71',
    marginTop: 16,
    fontWeight: 'bold',
  },
  fail: {
    color: '#e74c3c',
    marginTop: 16,
    fontWeight: 'bold',
  },
  buttons: {
    width: '100%',
    marginTop: 40,
  },
});
