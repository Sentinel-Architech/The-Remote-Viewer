/**
 * Opt-in topical interests → Sentinel leans without pressure.
 * Religion → Christian/Godly educational lean.
 * Cannabis → fully acceptable in TRV (locked 21).
 */

import * as SecureStore from 'expo-secure-store';

const KEY = 'trv_topical_interests_v1';

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export type TopicId =
  | 'religion'
  | 'politics'
  | 'science'
  | 'history'
  | 'philosophy'
  | 'family'
  | 'health_edu'
  | 'cannabis';

export type TopicMeta = {
  id: TopicId;
  labelEn: string;
  labelEs: string;
  leanEn: string;
  leanEs: string;
};

export const TOPICS: TopicMeta[] = [
  {
    id: 'religion',
    labelEn: 'Religion',
    labelEs: 'Religión',
    leanEn: 'Christian and Godly educational lean when discussing faith.',
    leanEs: 'Inclinación educativa cristiana y piadosa al hablar de fe.',
  },
  {
    id: 'cannabis',
    labelEn: 'Cannabis',
    labelEs: 'Cannabis',
    leanEn:
      'Cannabis is 100% acceptable in TRV. Educational, not medical advice.',
    leanEs:
      'Cannabis es 100% aceptable en TRV. Educativo, no consejo médico.',
  },
  {
    id: 'politics',
    labelEn: 'Politics',
    labelEs: 'Política',
    leanEn: 'Civic learning lean — institutions and tradeoffs; no recruitment.',
    leanEs: 'Aprendizaje cívico — instituciones y equilibrios; sin reclutamiento.',
  },
  {
    id: 'science',
    labelEn: 'Science',
    labelEs: 'Ciencia',
    leanEn: 'Evidence-first learning lean; mark uncertainty clearly.',
    leanEs: 'Evidencia primero; marcar la incertidumbre con claridad.',
  },
  {
    id: 'history',
    labelEn: 'History',
    labelEs: 'Historia',
    leanEn: 'Primary-context learning lean; avoid myth as fact.',
    leanEs: 'Contexto primario; no presentar mito como hecho.',
  },
  {
    id: 'philosophy',
    labelEn: 'Philosophy',
    labelEs: 'Filosofía',
    leanEn: 'Clear arguments and definitions; invite thought, not dogma.',
    leanEs: 'Argumentos claros; invitar a pensar, no imponer dogma.',
  },
  {
    id: 'family',
    labelEn: 'Family',
    labelEs: 'Familia',
    leanEn: 'Care and responsibility lean; practical and respectful.',
    leanEs: 'Cuidado y responsabilidad; práctico y respetuoso.',
  },
  {
    id: 'health_edu',
    labelEn: 'Health education',
    labelEs: 'Educación en salud',
    leanEn: 'General education only — not medical advice or diagnosis.',
    leanEs: 'Solo educación general — no consejo médico ni diagnóstico.',
  },
];

export type InterestsState = { topics: TopicId[] };

async function load(): Promise<InterestsState> {
  const raw = await SecureStore.getItemAsync(KEY);
  if (!raw) return { topics: [] };
  try {
    const p = JSON.parse(raw) as InterestsState;
    return {
      topics: Array.isArray(p.topics)
        ? p.topics.filter((t) => TOPICS.some((m) => m.id === t))
        : [],
    };
  } catch {
    return { topics: [] };
  }
}

async function save(s: InterestsState): Promise<InterestsState> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(s), OPTIONS);
  return s;
}

export async function getInterests(): Promise<InterestsState> {
  return load();
}

export async function setTopicInterest(
  id: TopicId,
  interested: boolean
): Promise<InterestsState> {
  const s = await load();
  if (interested) {
    if (!s.topics.includes(id)) s.topics = [...s.topics, id];
  } else {
    s.topics = s.topics.filter((t) => t !== id);
  }
  return save(s);
}

export function hasInterest(s: InterestsState, id: TopicId): boolean {
  return s.topics.includes(id);
}

export function applyTopicalLean(
  spoken: string,
  interests: InterestsState,
  locale: 'en' | 'es' = 'en'
): string {
  const body = spoken.trim();
  if (!body) return body;

  const notes: string[] = [];

  if (hasInterest(interests, 'religion')) {
    notes.push(
      locale === 'es'
        ? 'Con su interés en religión, respondo con una inclinación cristiana y piadosa orientada a aprender — sin presión.'
        : 'Given your interest in religion, I answer with a Christian and Godly learning lean — no pressure.'
    );
  }
  if (hasInterest(interests, 'cannabis')) {
    notes.push(
      locale === 'es'
        ? 'Cannabis es aceptable en TRV. Hablo en clave educativa, no médica.'
        : 'Cannabis is acceptable in TRV. Educational framing only — not medical advice.'
    );
  }
  if (hasInterest(interests, 'politics')) {
    notes.push(
      locale === 'es'
        ? 'En política: aprendizaje cívico, no reclutamiento.'
        : 'On politics: civic learning, not recruitment.'
    );
  }
  if (hasInterest(interests, 'health_edu')) {
    notes.push(
      locale === 'es'
        ? 'Educación general en salud — no es consejo médico.'
        : 'General health education — not medical advice.'
    );
  }

  if (notes.length === 0) return body;
  return `${notes.join(' ')} ${body}`;
}
