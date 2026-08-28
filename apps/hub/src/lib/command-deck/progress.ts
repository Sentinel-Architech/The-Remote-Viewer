import { create } from "zustand";

const STORAGE = "trv-deck-progress-v1";

export const RANKS = [
  { level: 1, xp: 0, title: "Initiate" },
  { level: 2, xp: 35, title: "Seer" },
  { level: 3, xp: 80, title: "Listener" },
  { level: 4, xp: 140, title: "Sentinel" },
  { level: 5, xp: 220, title: "Auditor" },
  { level: 6, xp: 320, title: "Custodian" },
  { level: 7, xp: 450, title: "Architect" },
  { level: 8, xp: 600, title: "Remote Viewer" },
] as const;

export type Rank = (typeof RANKS)[number];
export type TheaterId = "neural" | "orbit";
export type KindId = "sphere" | "box" | "cylinder";
export type SigKey = `${TheaterId}-${KindId}`;

export const LEARN_NEED = 3;

export const SIGNATURES = [
  { key: "neural-sphere", theater: "neural", kind: "sphere", label: "HSV", field: "Synapse" },
  { key: "neural-box", theater: "neural", kind: "box", label: "WNV", field: "Synapse" },
  { key: "neural-cylinder", theater: "neural", kind: "cylinder", label: "Rabies", field: "Synapse" },
  { key: "orbit-sphere", theater: "orbit", kind: "sphere", label: "Emission", field: "God's Eye" },
  { key: "orbit-box", theater: "orbit", kind: "box", label: "Runoff", field: "God's Eye" },
  { key: "orbit-cylinder", theater: "orbit", kind: "cylinder", label: "Worm", field: "God's Eye" },
] as const;

export type Signature = (typeof SIGNATURES)[number];

export type LearnResult = {
  ranked: Rank | null;
  newlyLearned: string | null;
  autonomous: boolean;
};

type Snapshot = {
  xp: number;
  healed: number;
  cleared: number;
  seizes: number;
  watches: number;
  learned: Record<string, number>;
};

type ProgressState = Snapshot & {
  hydrate: () => void;
  seize: (theater: TheaterId, kind: KindId) => LearnResult;
  onPurge: (theater: TheaterId, count: number) => Rank | null;
  onWatch: () => Rank | null;
  onOsStrike: (theater: TheaterId) => void;
};

export function sigKey(theater: TheaterId, kind: KindId): SigKey {
  return `${theater}-${kind}`;
}

export function rankFor(xp: number): Rank {
  return RANKS.reduce((cur, row) => (xp >= row.xp ? row : cur));
}

export function nextRank(xp: number): Rank | null {
  const now = rankFor(xp);
  const i = RANKS.findIndex((r) => r.level === now.level);
  return RANKS[i + 1] ?? null;
}

export function healTier(healed: number) {
  if (healed >= 36) return 2;
  if (healed >= 12) return 1;
  return 0;
}

export function sightTier(cleared: number, level: number) {
  if (level >= 6 || cleared >= 36) return 2;
  if (level >= 3 || cleared >= 12) return 1;
  return 0;
}

export function samplesOf(learned: Record<string, number>, key: string) {
  return Math.max(0, Number(learned[key]) || 0);
}

export function isLearned(learned: Record<string, number>, key: string) {
  return samplesOf(learned, key) >= LEARN_NEED;
}

export function learnedCount(learned: Record<string, number>) {
  return SIGNATURES.filter((s) => isLearned(learned, s.key)).length;
}

export function theaterArmed(learned: Record<string, number>, theater: TheaterId) {
  return SIGNATURES.filter((s) => s.theater === theater).every((s) => isLearned(learned, s.key));
}

export function osTitle(learned: Record<string, number>) {
  const n = learnedCount(learned);
  if (n >= 6) return "Autonomous";
  if (theaterArmed(learned, "neural") || theaterArmed(learned, "orbit")) return "Armed";
  if (n > 0) return "Learning";
  return "Cataloging";
}

function readLearned(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, number> = {};
  for (const row of SIGNATURES) {
    const n = Number((raw as Record<string, unknown>)[row.key]);
    if (n > 0) out[row.key] = n;
  }
  return out;
}

function read(): Snapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<Snapshot>;
    return {
      xp: Number(p.xp) || 0,
      healed: Number(p.healed) || 0,
      cleared: Number(p.cleared) || 0,
      seizes: Number(p.seizes) || 0,
      watches: Number(p.watches) || 0,
      learned: readLearned(p.learned),
    };
  } catch {
    return null;
  }
}

function write(s: Snapshot) {
  try {
    localStorage.setItem(
      STORAGE,
      JSON.stringify({
        xp: s.xp,
        healed: s.healed,
        cleared: s.cleared,
        seizes: s.seizes,
        watches: s.watches,
        learned: s.learned,
      }),
    );
  } catch {
    /* private mode */
  }
}

function bump(prev: Snapshot, patch: Partial<Snapshot>): { next: Snapshot; ranked: Rank | null } {
  const next: Snapshot = {
    xp: prev.xp + (patch.xp ?? 0),
    healed: prev.healed + (patch.healed ?? 0),
    cleared: prev.cleared + (patch.cleared ?? 0),
    seizes: prev.seizes + (patch.seizes ?? 0),
    watches: prev.watches + (patch.watches ?? 0),
    learned: patch.learned ?? prev.learned,
  };
  const before = rankFor(prev.xp).level;
  const after = rankFor(next.xp);
  write(next);
  return { next, ranked: after.level > before ? after : null };
}

export const useProgress = create<ProgressState>((set, get) => ({
  xp: 0,
  healed: 0,
  cleared: 0,
  seizes: 0,
  watches: 0,
  learned: {},
  hydrate: () => {
    if (typeof window === "undefined") return;
    const rec = read();
    if (rec) set(rec);
  },
  seize: (theater, kind) => {
    const prev = get();
    const key = sigKey(theater, kind);
    const before = samplesOf(prev.learned, key);
    const learned = { ...prev.learned, [key]: before + 1 };
    const row = SIGNATURES.find((s) => s.key === key);
    const newlyLearned = before + 1 === LEARN_NEED ? (row?.label ?? null) : null;
    const autonomous = learnedCount(learned) >= 6 && learnedCount(prev.learned) < 6;
    let xp = 2;
    if (newlyLearned) xp += 10;
    if (autonomous) xp += 24;
    const { next, ranked } = bump(prev, { xp, seizes: 1, learned });
    set(next);
    return { ranked, newlyLearned, autonomous };
  },
  onPurge: (theater, count) => {
    if (count <= 0) return null;
    const patch: Partial<Snapshot> = { xp: count * 4 };
    if (theater === "neural") patch.healed = count;
    else patch.cleared = count;
    const { next, ranked } = bump(get(), patch);
    set(next);
    return ranked;
  },
  onWatch: () => {
    const { next, ranked } = bump(get(), { xp: 18, healed: 1, watches: 1 });
    set(next);
    return ranked;
  },
  onOsStrike: (theater) => {
    const patch: Partial<Snapshot> = { xp: 1 };
    if (theater === "neural") patch.healed = 1;
    else patch.cleared = 1;
    const { next } = bump(get(), patch);
    set(next);
  },
}));
