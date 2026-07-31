import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
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
  const [inbox, setInbox] = useState<DidCommBasicMessage[]>([]);

  const refresh = useCallback(async () => {
    const items = await Promise.resolve(getInbox());
    setInbox(items);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSend = async () => {
    if (!content.trim()) {
      Alert.alert('Empty', 'Write a message first.');
      return;
    }

    const identity = await getCurrentDidKey();
    if (!identity) {
      Alert.alert('No identity', 'Create a did:key on the Identity tab first.');
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

    await Promise.resolve(storeMessage(msg));
    setContent('');
    refresh();
    Alert.alert('Stored locally', msg.id.slice(0, 8) + '…');
  };

  const handleVerify = async (msg: DidCommBasicMessage) => {
    const ok = await verifyBasicMessage(msg);
    Alert.alert(ok ? 'Valid signature' : 'Invalid', ok ? 'Verified.' : 'Check failed.');
  };

  const handleClear = () => {
    Alert.alert('Clear inbox?', 'Local messages only.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await Promise.resolve(clearInbox());
          refresh();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>LOCAL · DIDCOMM BASIC</Text>
      <Text style={styles.title}>Messages</Text>
      <Text style={styles.subtitle}>Signed on device · not encrypted yet</Text>

      <Text style={styles.label}>To DID (optional)</Text>
      <TextInput
        style={styles.input}
        value={toDid}
        onChangeText={setToDid}
        placeholder="did:key:z6Mk…"
        placeholderTextColor="#555"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Message</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={content}
        onChangeText={setContent}
        placeholder="Presence note…"
        placeholderTextColor="#555"
        multiline
      />

      <Pressable style={[styles.btn, styles.btnPrimary]} onPress={handleSend}>
        <Text style={styles.btnText}>Send (local)</Text>
      </Pressable>

      <View style={styles.row}>
        <Text style={styles.section}>Inbox ({inbox.length})</Text>
        {inbox.length > 0 && (
          <Pressable onPress={handleClear}>
            <Text style={styles.clearLink}>Clear</Text>
          </Pressable>
        )}
      </View>

      {inbox.length === 0 ? (
        <Text style={styles.empty}>No messages yet</Text>
      ) : (
        inbox.map((msg) => (
          <View key={msg.id} style={styles.card}>
            <Text style={styles.meta} numberOfLines={1}>
              {msg.from || 'unknown'}
            </Text>
            <Text style={styles.body}>{msg.body.content}</Text>
            <Pressable
              style={[styles.btn, styles.btnSmall]}
              onPress={() => handleVerify(msg)}
            >
              <Text style={styles.btnTextSmall}>Verify</Text>
            </Pressable>
          </View>
        ))
      )}
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
  label: {
    color: '#666',
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#141414',
    color: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#222',
  },
  textarea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  btn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  btnPrimary: { backgroundColor: '#1a7f4b' },
  btnSmall: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 0,
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  btnTextSmall: { color: '#ccc', fontSize: 13 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  section: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearLink: { color: '#e74c3c', fontSize: 14 },
  empty: { color: '#555' },
  card: {
    backgroundColor: '#141414',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  meta: { color: '#666', fontSize: 11, marginBottom: 6 },
  body: { color: '#fff', lineHeight: 20 },
});
