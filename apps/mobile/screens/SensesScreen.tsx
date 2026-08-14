/**
 * Senses: camera (sight), microphone listen (hearing), live web search.
 * All user-initiated. No always-on surveillance. No TRV cloud upload.
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { VoiceField } from '../src/components/VoiceField';
import { speak, startDictation, stopDictation } from '../src/services/voice';
import { instantSearch, webSearchUrl, SearchResult } from '../src/services/search';

export default function SensesScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [lastPhotoUri, setLastPhotoUri] = useState<string | null>(null);
  const [sightNote, setSightNote] = useState('');

  const [listening, setListening] = useState(false);
  const [hearingNotes, setHearingNotes] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const enableCamera = async () => {
    if (!permission?.granted) {
      const r = await requestPermission();
      if (!r.granted) {
        Alert.alert(
          'Camera',
          'Permission denied. Sight stays off. You can still use text and search.'
        );
        return;
      }
    }
    setCameraOn(true);
    speak('Camera on. Capture is local only.');
  };

  const disableCamera = () => {
    setCameraOn(false);
    speak('Camera off.');
  };

  const capture = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.7,
        skipProcessing: false,
      });
      if (photo?.uri) {
        setLastPhotoUri(photo.uri);
        speak('Frame captured on device.');
      }
    } catch (e) {
      Alert.alert(
        'Capture failed',
        e instanceof Error ? e.message : 'Unknown error'
      );
    }
  };

  const toggleListen = async () => {
    if (listening) {
      await stopDictation();
      setListening(false);
      speak('Listening stopped.');
      return;
    }
    setListening(true);
    const ok = await startDictation({
      onResult: (text) => {
        setHearingNotes((prev) =>
          prev ? `${prev.trim()} ${text}`.replace(/\s+/g, ' ').trim() : text
        );
      },
      onError: (message) => {
        setListening(false);
        Alert.alert('Hearing', message);
      },
      onEnd: () => setListening(false),
    });
    if (!ok) setListening(false);
    else speak('Listening. Speak when ready.');
  };

  const runSearch = async () => {
    const q = searchQuery.trim();
    if (!q) {
      Alert.alert('Search', 'Enter or dictate a query.');
      return;
    }
    setSearchBusy(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const result = await instantSearch(q);
      setSearchResult(result);
      const summary =
        result.answer ||
        result.abstract ||
        result.definition ||
        result.heading ||
        'No instant answer. Open full web results for more.';
      speak(summary.slice(0, 400));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Search failed';
      setSearchError(msg);
      speak('Search failed.');
    } finally {
      setSearchBusy(false);
    }
  };

  const openFullWeb = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    const url = webSearchUrl(q);
    const can = await Linking.canOpenURL(url);
    if (can) await Linking.openURL(url);
    else Alert.alert('Open failed', url);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>LOCAL · OPT-IN · NO TRV CLOUD</Text>
      <Text style={styles.title}>Senses</Text>
      <Text style={styles.subtitle}>
        Sight · Hearing · Live search — you start them; you stop them
      </Text>

      {/* SIGHT */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Sight (camera)</Text>
        <Text style={styles.hint}>
          Preview and capture stay on this device. Not uploaded to The Remote
          Viewer. No always-on camera.
        </Text>
        {!cameraOn ? (
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={enableCamera}>
            <Text style={styles.btnText}>Enable camera</Text>
          </Pressable>
        ) : (
          <>
            <View style={styles.cameraWrap}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
              />
            </View>
            <View style={styles.row}>
              <Pressable style={[styles.btn, styles.btnSecondary, styles.flex]} onPress={capture}>
                <Text style={styles.btnText}>Capture frame</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnSecondary, styles.flex]}
                onPress={() =>
                  setFacing((f) => (f === 'back' ? 'front' : 'back'))
                }
              >
                <Text style={styles.btnText}>Flip</Text>
              </Pressable>
            </View>
            <Pressable
              style={[styles.btn, styles.btnDanger, { marginTop: 8 }]}
              onPress={disableCamera}
            >
              <Text style={styles.btnText}>Turn camera off</Text>
            </Pressable>
          </>
        )}
        {lastPhotoUri && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.label}>Last capture (local)</Text>
            <Image source={{ uri: lastPhotoUri }} style={styles.thumb} />
          </View>
        )}
        <Text style={styles.label}>Sight notes (optional)</Text>
        <VoiceField
          value={sightNote}
          onChangeText={setSightNote}
          multiline
          style={{ minHeight: 48 }}
          placeholder="Describe what you see…"
          placeholderTextColor="#555"
          appendDictation
        />
      </View>

      {/* HEARING */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Hearing (microphone)</Text>
        <Text style={styles.hint}>
          Explicit listen sessions only. Uses OS speech recognition when
          available. Notes stay on device.
        </Text>
        <Pressable
          style={[styles.btn, listening ? styles.btnDanger : styles.btnPrimary]}
          onPress={toggleListen}
        >
          <Text style={styles.btnText}>
            {listening ? 'Stop listening' : 'Start listening'}
          </Text>
        </Pressable>
        <Text style={styles.label}>Hearing notes</Text>
        <VoiceField
          value={hearingNotes}
          onChangeText={setHearingNotes}
          multiline
          style={{ minHeight: 72 }}
          placeholder="Transcribed or typed notes…"
          placeholderTextColor="#555"
          appendDictation
        />
        <Pressable
          style={[styles.btn, styles.btnSecondary]}
          onPress={() => hearingNotes && speak(hearingNotes)}
        >
          <Text style={styles.btnText}>Speak notes</Text>
        </Pressable>
      </View>

      {/* LIVE SEARCH */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Live internet search</Text>
        <Text style={styles.hint}>
          DuckDuckGo Instant Answer (no API key). User-initiated network call.
          Attribution: results from DuckDuckGo. Full SERP opens in browser.
        </Text>
        <VoiceField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search query"
          placeholderTextColor="#555"
          appendDictation
        />
        <Pressable
          style={[styles.btn, styles.btnPrimary]}
          onPress={runSearch}
          disabled={searchBusy}
        >
          <Text style={styles.btnText}>
            {searchBusy ? 'Searching…' : 'Search (instant answer)'}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.btnSecondary, { marginTop: 8 }]}
          onPress={openFullWeb}
        >
          <Text style={styles.btnText}>Open full web results</Text>
        </Pressable>
        {searchError && (
          <Text style={styles.error}>{searchError}</Text>
        )}
        {searchResult && (
          <View style={styles.resultBox}>
            <Text style={styles.label}>Query</Text>
            <Text style={styles.resultText}>{searchResult.query}</Text>
            {searchResult.heading ? (
              <>
                <Text style={styles.label}>Heading</Text>
                <Text style={styles.resultText}>{searchResult.heading}</Text>
              </>
            ) : null}
            {searchResult.answer ? (
              <>
                <Text style={styles.label}>Answer</Text>
                <Text style={styles.resultText}>{searchResult.answer}</Text>
              </>
            ) : null}
            {searchResult.abstract ? (
              <>
                <Text style={styles.label}>Abstract</Text>
                <Text style={styles.resultText}>{searchResult.abstract}</Text>
              </>
            ) : null}
            {searchResult.definition ? (
              <>
                <Text style={styles.label}>Definition</Text>
                <Text style={styles.resultText}>{searchResult.definition}</Text>
              </>
            ) : null}
            {searchResult.related.length > 0 && (
              <>
                <Text style={styles.label}>Related</Text>
                {searchResult.related.map((r, i) => (
                  <Text key={i} style={styles.related}>
                    • {r.text}
                  </Text>
                ))}
              </>
            )}
            <Text style={styles.attr}>Results from DuckDuckGo</Text>
            <Pressable
              style={[styles.btn, styles.btnSecondary, { marginTop: 8 }]}
              onPress={() =>
                speak(
                  [
                    searchResult.heading,
                    searchResult.answer,
                    searchResult.abstract,
                    searchResult.definition,
                  ]
                    .filter(Boolean)
                    .join('. ')
                    .slice(0, 500) || 'No spoken summary.'
                )
              }
            >
              <Text style={styles.btnText}>Speak result</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#0a0a0a' },
  kicker: { color: '#666', fontSize: 11, letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  subtitle: { color: '#888', marginBottom: 20 },
  card: {
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 24,
  },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  hint: { color: '#888', lineHeight: 20, fontSize: 13, marginBottom: 12 },
  label: { color: '#666', fontSize: 12, marginTop: 10, marginBottom: 4 },
  cameraWrap: {
    height: 240,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#000',
  },
  camera: { flex: 1 },
  thumb: { width: '100%', height: 160, borderRadius: 8, marginTop: 6 },
  row: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  btn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#1a7f4b' },
  btnSecondary: { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' },
  btnDanger: { backgroundColor: '#5c1a1a' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  resultBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  resultText: { color: '#ccc', fontSize: 13, lineHeight: 20 },
  related: { color: '#9ab', fontSize: 12, lineHeight: 18, marginTop: 4 },
  attr: { color: '#555', fontSize: 11, marginTop: 12 },
  error: { color: '#e74c3c', marginTop: 10, fontSize: 13 },
});
