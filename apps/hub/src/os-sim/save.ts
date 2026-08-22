import type { KnowledgeEntry, ThreatTypeId } from "./types";
import { THREAT_TYPES } from "./catalog";

const KEY = "sentinel-os-v1";
const SAVE_VERSION = 1;

export type Settings = {
  muted: boolean;
  master: number;
  sensitivity: number;
  shake: boolean;
};

export type SaveData = {
  version: number;
  knowledge: Record<ThreatTypeId, KnowledgeEntry>;
  missionsCleared: number;
  bestAutonomy: number;
  settings: Settings;
};

const defaultKnowledge = (): Record<ThreatTypeId, KnowledgeEntry> => {
  const k = {} as Record<ThreatTypeId, KnowledgeEntry>;
  for (const t of THREAT_TYPES) {
    k[t.id] = {
      typeId: t.id,
      identified: false,
      encounters: 0,
      neutralized: 0,
      autoHeal: false,
    };
  }
  return k;
};

export const defaultSettings = (): Settings => ({
  muted: false,
  master: 0.7,
  sensitivity: 1,
  shake: true,
});

export const defaultSave = (): SaveData => ({
  version: SAVE_VERSION,
  knowledge: defaultKnowledge(),
  missionsCleared: 0,
  bestAutonomy: 0,
  settings: defaultSettings(),
});

export function loadSave(): SaveData {
  const base = defaultSave();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const knowledge = defaultKnowledge();
    if (parsed.knowledge) {
      for (const t of THREAT_TYPES) {
        const src = parsed.knowledge[t.id];
        if (src) knowledge[t.id] = { ...knowledge[t.id], ...src };
      }
    }
    return {
      version: SAVE_VERSION,
      knowledge,
      missionsCleared: parsed.missionsCleared ?? 0,
      bestAutonomy: parsed.bestAutonomy ?? 0,
      settings: { ...defaultSettings(), ...parsed.settings },
    };
  } catch {
    return base;
  }
}

export function writeSave(data: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...data, version: SAVE_VERSION }));
  } catch {
    /* private mode / quota */
  }
}

export function catalogedCount(k: Record<ThreatTypeId, KnowledgeEntry>): number {
  return THREAT_TYPES.filter((t) => k[t.id]?.identified).length;
}

export function autoHealCount(k: Record<ThreatTypeId, KnowledgeEntry>): number {
  return THREAT_TYPES.filter((t) => k[t.id]?.autoHeal).length;
}
