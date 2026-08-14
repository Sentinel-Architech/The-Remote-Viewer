/**
 * Text field with Speak (TTS) and Dictate (STT) controls.
 * Viewers can use text, voice, or both.
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  StyleSheet,
  TextInputProps,
  Alert,
} from 'react-native';
import { speak, startDictation, stopDictation } from '../services/voice';

type Props = TextInputProps & {
  value: string;
  onChangeText: (t: string) => void;
  /** If true, dictate appends; otherwise replaces */
  appendDictation?: boolean;
};

export function VoiceField({
  value,
  onChangeText,
  appendDictation = false,
  style,
  ...rest
}: Props) {
  const [listening, setListening] = useState(false);

  const onSpeak = () => {
    if (!value?.trim()) {
      Alert.alert('Speak', 'Nothing to read yet.');
      return;
    }
    speak(value);
  };

  const onDictate = async () => {
    if (listening) {
      await stopDictation();
      setListening(false);
      return;
    }
    setListening(true);
    const ok = await startDictation({
      onResult: (text) => {
        if (appendDictation && value) {
          onChangeText(`${value.trim()} ${text}`.
            replace(/\s+/g, ' ')
            .trim());
        } else {
          onChangeText(text);
        }
      },
      onError: (message) => {
        setListening(false);
        Alert.alert('Voice input', message);
      },
      onEnd: () => setListening(false),
    });
    if (!ok) setListening(false);
  };

  return (
    <View>
      <TextInput
        {...rest}
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, style]}
      />
      <View style={styles.row}>
        <Pressable style={styles.chip} onPress={onSpeak}>
          <Text style={styles.chipText}>Speak</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, listening && styles.chipActive]}
          onPress={onDictate}
        >
          <Text style={styles.chipText}>
            {listening ? 'Listening…' : 'Dictate'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
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
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    backgroundColor: '#1a2a3a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2a4a5a',
  },
  chipActive: {
    backgroundColor: '#3a1a1a',
    borderColor: '#e74c3c',
  },
  chipText: {
    color: '#9cf',
    fontSize: 12,
    fontWeight: '600',
  },
});
