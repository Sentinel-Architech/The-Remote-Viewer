import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import {
  createPresenceProof,
  getCurrentProof,
  destroyPresence,
  PresenceProof,
} from '../services/presence';

export default function PresenceScreen() {
  const [proof, setProof] = useState<PresenceProof | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const refresh = async () => {
    const current = await getCurrentProof();
    setProof(current);
    if (current) {
      setSecondsLeft(Math.max(0, Math.floor((current.expiresAt - Date.now()) / 1000)));
    } else {
      setSecondsLeft(0);
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async () => {
    await createPresenceProof(60);
    await refresh();
  };

  const handleDestroy = async () => {
    await destroyPresence();
    await refresh();
    Alert.alert('Destroyed', 'Presence proof and keys have been wiped. Restart from square one.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Presence Proof</Text>

      {proof ? (
        <>
          <Text style={styles.active}>Presence Active</Text>
          <Text style={styles.timer}>{secondsLeft}s remaining</Text>
          <Text style={styles.mono}>Pub: {proof.publicKey.slice(0, 16)}...</Text>
        </>
      ) : (
        <Text style={styles.inactive}>No valid presence</Text>
      )}

      <View style={styles.buttons}>
        <Button title="Generate Presence (60s)" onPress={handleCreate} />
        <View style={{ height: 16 }} />
        <Button title="Destroy Presence" color="#c0392b" onPress={handleDestroy} />
      </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 32,
  },
  active: {
    fontSize: 22,
    color: '#2ecc71',
    marginBottom: 8,
  },
  inactive: {
    fontSize: 22,
    color: '#e74c3c',
    marginBottom: 8,
  },
  timer: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 12,
  },
  mono: {
    fontFamily: 'monospace',
    color: '#aaa',
    marginBottom: 40,
  },
  buttons: {
    width: '100%',
  },
});
