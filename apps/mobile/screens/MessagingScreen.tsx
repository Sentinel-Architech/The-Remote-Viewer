import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {
  createBasicMessage,
  storeMessage,
  getInbox,
  verifyBasicMessage,
  clearInbox,
  DidCommBasicMessage,
} from '../services/didcomm';
import { getCurrentDidKey } from '../services/presence';

export default function MessagingScreen() {
  const [content, setContent] = useState('');
  const [toDid, setToDid] = useState('');
  const [inbox, setInbox] = useState<DidCommBasicMessage[]>(getInbox());

  const refresh = useCallback(() => {
    setInbox(getInbox());
  }, []);

  const handleSend = async () => {
    if (!content.trim()) {
      Alert.alert('Empty', 'Write a message first.');
      return;
    }

    const identity = await getCurrentDidKey();
    if (!identity) {
      Alert.alert('No Identity', 'Create a did:key first.');
      return;
    }

    const msg = await createBasicMessage(
      content.trim(),
      toDid.trim() || undefined
    );

    if (!msg) {
      Alert.alert('Failed', 'Could not create message.');
      return;
    }

    storeMessage(msg);
    setContent('');
    refresh();
    Alert.alert('Sent (local)', `Message ID:\n${msg.id}`);
  };

  const handleVerify = async (msg: DidCommBasicMessage) => {
    const ok = await verifyBasicMessage(msg);
    Alert.alert(
      ok ? 'Valid' : 'Invalid',
      ok ? 'Signature verified.' : 'Signature check failed.'
    );
  };

  const handleClear = () => {
    clearInbox();
    refresh();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>DIDComm Messages</Text>
      <Text style={styles.subtitle}>Basic Message 2.0 (local scaffold)</Text>

      <Text style={styles.label}>To DID (optional)</Text>
      <TextInput
        style={styles.input}
        value={toDid}
        onChangeText={setToDid}
        placeholder="did:key:z6Mk..."
        placeholderTextColor="#555"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Message</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={content}
        onChangeText={setContent}
        placeholder="Type a presence message..."
        placeholderTextColor="#555"
        multiline
      />

      <Button title="Send (local)" onPress={handleSend} />

      <View style={{ height: 24 }} />
      <Text style={styles.section}>Inbox ({inbox.length})</Text>

      {inbox.length === 0 ? (
        <Text style={styles.empty}>No messages yet</Text>
      ) : (
        inbox.map((msg) => (
          <View key={msg.id} style={styles.card}>
            <Text style={styles.meta}>From: {msg.from || 'unknown'}</Text>
            <Text style={styles.meta}>ID: {msg.id.slice(0, 8)}...</Text>
            <Text style={styles.body}>{msg.body.content}</Text>
            <Button title="Verify Signature" onPress={() => handleVerify(msg)} />
          </View>
        ))
      )}

      {inbox.length > 0 && (
        <>
          <View style={{ height: 16 }} />
          <Button title="Clear Inbox" color="#c0392b" onPress={handleClear} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#0a0a0a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    color: '#888',
    marginBottom: 24,
  },
  label: {
    color: '#888',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  section: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  empty: {
    color: '#666',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  meta: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  body: {
    color: '#fff',
    marginVertical: 8,
  },
});
