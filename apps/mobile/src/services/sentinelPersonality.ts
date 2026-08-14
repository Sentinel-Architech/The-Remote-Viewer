/**
 * Viewer-owned on-device Sentinel tone / personality.
 * Local preference only — not a cloud profile.
 */

import * as SecureStore from 'expo-secure-store';

export type SentinelTone =
  | 'steady'
  | 'friendly'
  | 'concise'
  | 'formal'
  | 'guardian';

export type PersonalityConfig = {
  tone: SentinelTone;
  /** Optional short label the Viewer gives their Sentinel */
  name: string;
};

const KEY = 'trv_sentinel_personality_v1';

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const TONE_META: Record<
  SentinelTone,
  { labelEn: string; labelEs: string; hintEn: string; hintEs: string }
> = {
  steady: {
    labelEn: 'Steady',
    labelEs: 'Sereno',
    hintEn: 'Calm, clear, neutral.',
    hintEs: 'Calmado, claro, neutral.',
  },
  friendly: {
    labelEn: 'Friendly',
    labelEs: 'Amable',
    hintEn: 'Warm and approachable.',
    hintEs: 'Cálido y cercano.',
  },
  concise: {
    labelEn: 'Concise',
    labelEs: 'Conciso',
    hintEn: 'Short answers first.',
    hintEs: 'Respuestas cortas primero.',
  },
  formal: {
    labelEn: 'Formal',
    labelEs: 'Formal',
    hintEn: 'Precise and measured.',
    hintEs: 'Preciso y mesurado.',
  },
  guardian: {
    labelEn: 'Guardian',
    labelEs: 'Guardián',
    hintEn: 'Protective, vigilant tone.',
    hintEs: 'Tono protector y vigilante.',
  },
};

const DEFAULT: PersonalityConfig = {
  tone: 'steady',
  name: 'Sentinel',
};

export async function getPersonality(): Promise<PersonalityConfig> {
  const raw = await SecureStore.getItemAsync(KEY);
  if (!raw) return { ...DEFAULT };
  try {
    const parsed = JSON.parse(raw) as PersonalityConfig;
    if (!TONE_META[parsed.tone]) parsed.tone = 'steady';
    if (typeof parsed.name !== 'string' || !parsed.name.trim()) {
      parsed.name = 'Sentinel';
    }
    return parsed;
  } catch {
    return { ...DEFAULT };
  }
}

export async function setPersonality(
  config: PersonalityConfig
): Promise<PersonalityConfig> {
  const next: PersonalityConfig = {
    tone: TONE_META[config.tone] ? config.tone : 'steady',
    name: (config.name || 'Sentinel').trim().slice(0, 32) || 'Sentinel',
  };
  await SecureStore.setItemAsync(KEY, JSON.stringify(next), OPTIONS);
  return next;
}

/** Shape the spoken reply with local personality — no cloud. */
export function applyTone(
  spoken: string,
  config: PersonalityConfig,
  locale: 'en' | 'es' = 'en'
): string {
  const body = spoken.trim();
  const name = config.name || 'Sentinel';

  switch (config.tone) {
    case 'friendly':
      return locale === 'es'
        ? `${name} aquí. ${body}`
        : `${name} here. ${body}`;
    case 'concise': {
      const first = body.split(/(?<=[.!?])\s+/)[0] || body;
      return first.length > 220 ? first.slice(0, 217) + '…' : first;
    }
    case 'formal':
      return locale === 'es'
        ? `Informe de ${name}. ${body}`
        : `${name} report. ${body}`;
    case 'guardian':
      return locale === 'es'
        ? `${name} en vigilancia. ${body}`
        : `${name} on watch. ${body}`;
    case 'steady':
    default:
      return body;
  }
}
