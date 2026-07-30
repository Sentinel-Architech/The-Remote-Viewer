import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import {
  export async function createDidKey(): Promise<DidKeyIdentity> {
  // 100% local secure random
  const privateKey = new Uint8Array(32);
  crypto.getRandomValues(privateKey);

  const publicKey = await ed.getPublicKeyAsync(privateKey);
  getCurrentDidKey,
  destroyDidKey,
  DidKeyIdentity,
} from '../services/presence'; // or correct path

export default function PresenceScreen() {
  const [identity, setIdentity] = useState<DidKeyIdentity | null>(null);

  const refresh = async () => {
    const current = await getCurrentDidKey();
    setIdentity(current);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async () => {
    const newIdentity = await createDidKey();
    setIdentity(newIdentity);
  };

  const handleDestroy = async () => {
    await destroyDidKey();
    setIdentity(null);
    Alert.alert(
      'Destroyed',
      'did:key identity and private key have been permanently wiped.\nRestart from Square One.'
    );
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
        </>
      ) : (
        <Text style={styles.inactive}>No identity – Start from Square One</Text>
      )}

      <View style={styles.buttons}>
        {!identity ? (
          <Button title="Create did:key Identity" onPress={handleCreate} />
        ) : (
          <Button title="Destroy Identity" color="#c0392b" onPress={handleDestroy} />
        )}
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
  buttons: {
    width: '100%',
    marginTop: 40,
  },
});
