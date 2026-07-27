import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import {
  createDidKeyIdentity,
  getDidKeyIdentity,
  destroyDidKeyIdentity,
  DidKeyIdentity,
} from '../src/services/presence';

export default function PresenceScreen() {
  const [identity, setIdentity] = useState<DidKeyIdentity | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const current = await getDidKeyIdentity();
      setIdentity(current);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreate = async () => {
    setBusy(true);
    setError(null);
    try {
      const id = await createDidKeyIdentity();
      setIdentity(id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      Alert.alert('Create failed', msg);
      console.error('createDidKeyIdentity', e);
    } finally {
      setBusy(false);
    }
  };

  const handleDestroy = async () => {
    setBusy(true);
    try {
      await destroyDidKeyIdentity();
      setIdentity(null);
      Alert.alert(
        'Destroyed',
        'did:key identity and private key wiped. Restart from Square One.'
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      Alert.alert('Destroy failed', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>did:key Identity</Text>

      {busy && <ActivityIndicator color="#39ff14" style={{ marginBottom: 16 }} />}

      {identity ? (
        <>
          <Text style={styles.active}>Identity active</Text>
          <Text style={styles.mono} selectable>
            {identity.did}
          </Text>
          <Text style={styles.hint}>Pub: {identity.publicKeyHex.slice(0, 16)}…</Text>
        </>
      ) : (
        <Text style={styles.inactive}>No identity — Start from Square One</Text>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.buttons}>
        {!identity ? (
          <Button
            title="Create did:key Identity"
            onPress={handleCreate}
            disabled={busy}
          />
        ) : (
          <Button
            title="Destroy Identity (Square One)"
            color="#c0392b"
            onPress={handleDestroy}
            disabled={busy}
          />
        )}
      </View>

      <Text style={styles.footer}>
        Scaffold only. Keys on-device via SecureStore. No platform recovery.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0a0a0a',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 28,
  },
  active: {
    fontSize: 20,
    color: '#2ecc71',
    marginBottom: 12,
  },
  inactive: {
    fontSize: 18,
    color: '#e74c3c',
    marginBottom: 24,
    textAlign: 'center',
  },
  mono: {
    fontFamily: 'monospace',
    color: '#e8e8e8',
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  hint: {
    fontFamily: 'monospace',
    color: '#888',
    fontSize: 12,
    marginBottom: 24,
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
    marginTop: 8,
  },
  footer: {
    marginTop: 32,
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
  },
});
