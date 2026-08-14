/**
 * Voice modality for The Remote Viewer.
 * TTS: expo-speech (system voices, works in Expo Go).
 * STT: expo-speech-recognition when native module present (dev/production build).
 *
 * No TRV cloud. Speech stays on-device / OS speech services.
 * SCAFFOLD — no production security claims.
 */

import * as Speech from 'expo-speech';

export type SttStatus = 'idle' | 'listening' | 'unavailable' | 'error';

let sttModule: typeof import('expo-speech-recognition') | null = null;
let sttLoadAttempted = false;

async function loadStt(): Promise<typeof import('expo-speech-recognition') | null> {
  if (sttLoadAttempted) return sttModule;
  sttLoadAttempted = true;
  try {
    sttModule = await import('expo-speech-recognition');
    return sttModule;
  } catch {
    sttModule = null;
    return null;
  }
}

/** Speak text with system TTS. Safe to call anytime. */
export function speak(text: string, options?: { rate?: number; language?: string }): void {
  const trimmed = text?.trim();
  if (!trimmed) return;
  Speech.stop();
  Speech.speak(trimmed, {
    language: options?.language || 'en-US',
    rate: options?.rate ?? 0.95,
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}

export async function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}

/**
 * Request STT permissions and start a one-shot recognition session.
 * Calls onResult with final transcript. Returns false if unavailable.
 */
export async function startDictation(handlers: {
  onResult: (text: string) => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
  language?: string;
}): Promise<boolean> {
  const mod = await loadStt();
  if (!mod?.ExpoSpeechRecognitionModule) {
    handlers.onError?.(
      'Speech-to-text needs a development or release build (not available in Expo Go). Text input still works.'
    );
    return false;
  }

  const { ExpoSpeechRecognitionModule } = mod;

  try {
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      handlers.onError?.('Microphone / speech recognition permission denied.');
      return false;
    }
  } catch (e) {
    handlers.onError?.(
      e instanceof Error ? e.message : 'Permission request failed'
    );
    return false;
  }

  // Wire one-shot listeners via the module event API if present
  const resultSub = ExpoSpeechRecognitionModule.addListener?.('result', (event: {
    results?: { transcript?: string }[];
    isFinal?: boolean;
  }) => {
    const t = event?.results?.[0]?.transcript;
    if (t && (event.isFinal !== false)) {
      handlers.onResult(t);
    }
  });

  const endSub = ExpoSpeechRecognitionModule.addListener?.('end', () => {
    resultSub?.remove?.();
    endSub?.remove?.();
    errorSub?.remove?.();
    handlers.onEnd?.();
  });

  const errorSub = ExpoSpeechRecognitionModule.addListener?.('error', (event: {
    message?: string;
    error?: string;
  }) => {
    handlers.onError?.(event?.message || event?.error || 'Recognition error');
    resultSub?.remove?.();
    endSub?.remove?.();
    errorSub?.remove?.();
    handlers.onEnd?.();
  });

  try {
    ExpoSpeechRecognitionModule.start({
      lang: handlers.language || 'en-US',
      interimResults: true,
      continuous: false,
    });
    return true;
  } catch (e) {
    handlers.onError?.(
      e instanceof Error ? e.message : 'Failed to start recognition'
    );
    return false;
  }
}

export async function stopDictation(): Promise<void> {
  const mod = await loadStt();
  try {
    mod?.ExpoSpeechRecognitionModule?.stop?.();
  } catch {
    // ignore
  }
}

export async function isSttAvailable(): Promise<boolean> {
  const mod = await loadStt();
  return !!mod?.ExpoSpeechRecognitionModule;
}
