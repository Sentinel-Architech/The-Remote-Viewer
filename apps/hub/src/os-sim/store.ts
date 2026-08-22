import { create } from "zustand";
import type { CommsLine, HudSnapshot, KnowledgeEntry, Phase, ThreatTypeId } from "./types";
import {
  autoHealCount,
  catalogedCount,
  defaultSave,
  loadSave,
  type SaveData,
  type Settings,
  writeSave,
} from "./save";
import { CATALOG_TOTAL } from "./catalog";

const emptyHud = (): HudSnapshot => ({
  region: "Ventricle",
  integrity: 72,
  autonomy: 0,
  scanProgress: 0,
  viewerSync: 0,
  sentinelSync: 0,
  scanning: false,
  targetName: null,
  targetKnown: false,
  inScanRange: false,
  waypointDist: 0,
  threatsLeft: 0,
  pulseReady: true,
  cataloged: 0,
  catalogTotal: CATALOG_TOTAL,
  waypoint: { x: 0.5, y: 0.5, behind: false, visible: false },
});

let lineSeq = 0;

export type GameStore = {
  phase: Phase;
  hud: HudSnapshot;
  comms: CommsLine[];
  knowledge: Record<ThreatTypeId, KnowledgeEntry>;
  settings: Settings;
  missionsCleared: number;
  bestAutonomy: number;
  knowledgeOpen: boolean;
  isCoarse: boolean;
  engineReady: boolean;
  setPhase: (p: Phase) => void;
  setHud: (h: Partial<HudSnapshot>) => void;
  pushComms: (from: CommsLine["from"], text: string) => void;
  clearComms: () => void;
  setKnowledge: (k: Record<ThreatTypeId, KnowledgeEntry>) => void;
  patchKnowledge: (id: ThreatTypeId, patch: Partial<KnowledgeEntry>) => void;
  setSettings: (s: Partial<Settings>) => void;
  setKnowledgeOpen: (v: boolean) => void;
  setCoarse: (v: boolean) => void;
  setEngineReady: (v: boolean) => void;
  persist: () => void;
  hydrate: () => void;
  recordClear: (autonomy: number) => void;
  resetMemory: () => void;
};

function snapshot(): SaveData {
  const s = useGameStore.getState();
  return {
    version: 1,
    knowledge: s.knowledge,
    missionsCleared: s.missionsCleared,
    bestAutonomy: s.bestAutonomy,
    settings: s.settings,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: "briefing",
  hud: emptyHud(),
  comms: [],
  knowledge: loadSave().knowledge,
  settings: loadSave().settings,
  missionsCleared: loadSave().missionsCleared,
  bestAutonomy: loadSave().bestAutonomy,
  knowledgeOpen: false,
  isCoarse: false,
  engineReady: false,

  setPhase: (phase) => set({ phase }),
  setHud: (h) => set((s) => ({ hud: { ...s.hud, ...h } })),
  pushComms: (from, text) => {
    const line: CommsLine = { id: `c${++lineSeq}`, from, text, at: Date.now() };
    set((s) => ({ comms: [...s.comms.slice(-18), line] }));
  },
  clearComms: () => set({ comms: [] }),
  setKnowledge: (knowledge) => set({ knowledge }),
  patchKnowledge: (id, patch) =>
    set((s) => ({
      knowledge: { ...s.knowledge, [id]: { ...s.knowledge[id], ...patch } },
    })),
  setSettings: (partial) => {
    set((s) => ({ settings: { ...s.settings, ...partial } }));
    writeSave(snapshot());
  },
  setKnowledgeOpen: (knowledgeOpen) => set({ knowledgeOpen }),
  setCoarse: (isCoarse) => set({ isCoarse }),
  setEngineReady: (engineReady) => set({ engineReady }),
  persist: () => writeSave(snapshot()),
  hydrate: () => {
    const saved = loadSave();
    set({
      knowledge: saved.knowledge,
      settings: saved.settings,
      missionsCleared: saved.missionsCleared,
      bestAutonomy: saved.bestAutonomy,
      hud: {
        ...emptyHud(),
        cataloged: catalogedCount(saved.knowledge),
        autonomy: Math.round((autoHealCount(saved.knowledge) / CATALOG_TOTAL) * 100),
      },
    });
  },
  recordClear: (autonomy) => {
    set((s) => ({
      missionsCleared: s.missionsCleared + 1,
      bestAutonomy: Math.max(s.bestAutonomy, autonomy),
    }));
    writeSave(snapshot());
  },
  resetMemory: () => {
    const d = defaultSave();
    const s = get();
    set({
      knowledge: d.knowledge,
      bestAutonomy: 0,
      hud: { ...s.hud, cataloged: 0, autonomy: 0 },
    });
    writeSave({
      version: 1,
      knowledge: d.knowledge,
      missionsCleared: get().missionsCleared,
      bestAutonomy: 0,
      settings: get().settings,
    });
  },
}));
