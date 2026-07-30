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
    setSignature(null);
  };

  const handleDestroy = async () => {
    await destroyDidKey();
    setIdentity(null);
    setSignature(null);
    Alert.alert(
      'Destroyed',
      'did:key identity and private key have been permanently wiped.\nRestart from Square One.'
    );
  };

  const handleSign = async () => {
    const message = 'TRV presence proof ' + new Date().toISOString();
    const sig = await signWithDidKey(message);
    setSignature(sig);
    Alert.alert('Signed', `Message:\n${message}`);
  };

  const handleShowDidDoc = () => {
    if (!identity) return;
    const doc = buildDidDocument(identity);
    Alert.alert('DID Document', JSON.stringify(doc, null, 2));
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
