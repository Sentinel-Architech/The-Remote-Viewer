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
import { t, Locale } from '../src/i18n/strings';

export default function SensesScreen({ locale = 'en' }: { locale?: Locale }) {
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
        Alert.alert('Camera', 'Permission denied.');
        return;
      }
    }
    setCameraOn(true);
    speak(locale === 'es' ? 'Cámara activada.' : 'Camera on. Capture is local only.');
  };

  const disableCamera = () => {
    setCameraOn(false);
    speak(locale === 'es' ? 'Cámara apagada.' : 'Camera off.');
  };

  const capture = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.7,
        skipProcessing: false,
      });
      if (photo?.uri) {
        setLastPhotoUri(photo.uri);
        speak(locale === 'es' ? 'Fotograma capturado.' : 'Frame captured on device.');
      }
    } catch (e) {
      Alert.alert('Capture failed', e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const toggleListen = async () => {
    if (listening) {
      await stopDictation();
      setListening(false);
      speak(locale === 'es' ? 'Escucha detenida.' : 'Listening stopped.');
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
        (locale === 'es'
          ? 'Sin respuesta instantánea. Abra resultados web completos.'
          : 'No instant answer. Open full web results for more.');
      speak(summary.slice(0, 400));
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setSearchBusy(false);
    }
  };

  const openFullWeb = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    const url = webSearchUrl(q);
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>LOCAL · OPT-IN · NO TRV CLOUD</Text>
      <Text style={styles.title}>{t(locale, 'senses')}</Text>
      <Text style={styles.subtitle}>
        {locale === 'es'
          ? 'Vista · Oído · Búsqueda — usted los inicia y los detiene'
          : 'Sight · Hearing · Live search — you start them; you stop them'}
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t(locale, 'sight')}</Text>
        <Text style={styles.hint}>
          {locale === 'es'
            ? 'La captura permanece en este dispositivo. No se sube a TRV.'
            : 'Preview and capture stay on this device. Not uploaded to TRV.'}
        </Text>
        {!cameraOn ? (
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={enableCamera}>
            <Text style={styles.btnText}>{t(locale, 'enableCamera')}</Text>
          </Pressable>
        ) : (
          <>
            <View style={styles.cameraWrap}>
              <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
            </View>
            <View style={styles.row}>
              <Pressable style={[styles.btn, styles.btnSecondary, styles.flex]} onPress={capture}>
                <Text style={styles.btnText}>
                  {locale === 'es' ? 'Capturar' : 'Capture frame'}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnSecondary, styles.flex]}
                onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
              >
                <Text style={styles.btnText}>{locale === 'es' ? 'Voltear' : 'Flip'}</Text>
              </Pressable>
            </View>
            <Pressable style={[styles.btn, styles.btnDanger, { marginTop: 8 }]} onPress={disableCamera}>
              <Text style={styles.btnText}>{t(locale, 'turnCameraOff')}</Text>
            </Pressable>
          </>
        )}
        {lastPhotoUri && (
          <View style={{ marginTop: 12 }}>
            <Image source={{ uri: lastPhotoUri }} style={styles.thumb} />
          </View>
        )}
        <VoiceField
          value={sightNote}
          onChangeText={setSightNote}
          multiline
          style={{ minHeight: 48 }}
          placeholder={locale === 'es' ? 'Notas de vista…' : 'Sight notes…'}
          placeholderTextColor="#555"
          appendDictation
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t(locale, 'hearing')}</Text>
        <Pressable
          style={[styles.btn, listening ? styles.btnDanger : styles.btnPrimary]}
          onPress={toggleListen}
        >
          <Text style={styles.btnText}>
            {listening ? t(locale, 'stopListening') : t(locale, 'startListening')}
          </Text>
        </Pressable>
        <VoiceField
          value={hearingNotes}
          onChangeText={setHearingNotes}
          multiline
          style={{ minHeight: 72 }}
          placeholder={locale === 'es' ? 'Notas de oído…' : 'Hearing notes…'}
          placeholderTextColor="#555"
          appendDictation
        />
        <Pressable
          style={[styles.btn, styles.btnSecondary]}
          onPress={() => hearingNotes && speak(hearingNotes)}
        >
          <Text style={styles.btnText}>{t(locale, 'speak')}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t(locale, 'liveSearch')}</Text>
        <VoiceField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={locale === 'es' ? 'Consulta' : 'Search query'}
          placeholderTextColor="#555"
          appendDictation
        />
        <Pressable style={[styles.btn, styles.btnPrimary]} onPress={runSearch} disabled={searchBusy}>
          <Text style={styles.btnText}>
            {searchBusy
              ? locale === 'es'
                ? 'Buscando…'
                : 'Searching…'
              : t(locale, 'search')}
          </Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnSecondary, { marginTop: 8 }]} onPress={openFullWeb}>
          <Text style={styles.btnText}>{t(locale, 'openFullWeb')}</Text>
        </Pressable>
        {searchError && <Text style={styles.error}>{searchError}</Text>}
        {searchResult && (
          <View style={styles.resultBox}>
            {!!searchResult.heading && (
              <Text style={styles.resultText}>{searchResult.heading}</Text>
            )}
            {!!searchResult.answer && (
              <Text style={styles.resultText}>{searchResult.answer}</Text>
            )}
            {!!searchResult.abstract && (
              <Text style={styles.resultText}>{searchResult.abstract}</Text>
            )}
            {!!searchResult.definition && (
              <Text style={styles.resultText}>{searchResult.definition}</Text>
            )}
            <Text style={styles.attr}>{t(locale, 'resultsFromDdg')}</Text>
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
  resultText: { color: '#ccc', fontSize: 13, lineHeight: 20, marginBottom: 6 },
  attr: { color: '#555', fontSize: 11, marginTop: 8 },
  error: { color: '#e74c3c', marginTop: 10, fontSize: 13 },
});
