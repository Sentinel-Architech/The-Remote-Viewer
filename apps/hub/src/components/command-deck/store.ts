import { create } from "zustand";
import { isLearned, learnedCount as countLearned, osTitle as titleOfOs, rankFor, sigKey, useProgress } from "@/lib/command-deck/progress";

export type ShapeKind = "sphere" | "box" | "cylinder";
export type Theater = "neural" | "orbit";
export type BodyRole = "threat" | "sentinel";
export type Outcome = "win" | "lose" | null;

export type SpawnedBody = {
  id: number;
  kind: ShapeKind;
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  scale: number;
  role: BodyRole;
  sampled: boolean;
};

export type BriefingLine = {
  t: number;
  text: string;
};

export const KIND_LABEL: Record<Theater, Record<ShapeKind, string>> = {
  neural: { sphere: "HSV", box: "WNV", cylinder: "Rabies" },
  orbit: { sphere: "Emission", box: "Runoff", cylinder: "Worm" },
};

export const MAX_BODIES = 72;
export const TABLE_TOP = 2.05;
export const BOX_SIZE = 0.4;
export const SPHERE_RADIUS = 0.24;
export const CYL_RADIUS = 0.18;
export const CYL_HEIGHT = 0.58;
export const EARTH_RADIUS = 2.62;
export const OVERWHELM = 24;

const WATCH_KEY = "trv-watch-day";
const DISCOVERY_KEY = "trv-deck-discovered-v1";
const BRIEF_CAP = 14;

const NEURAL_PALETTE: Record<ShapeKind, string[]> = {
  sphere: ["#c45c4a", "#d47868", "#a84a3c", "#e09a7a"],
  box: ["#d4b85a", "#c8a04a", "#e0c878", "#b89a48"],
  cylinder: ["#7d9a7e", "#6a8a72", "#a8b8a4", "#5a7a62"],
};

const ORBIT_PALETTE: Record<ShapeKind, string[]> = {
  sphere: ["#c45c4a", "#e07a68", "#a84a3c"],
  box: ["#c5cfc8", "#8a8d88", "#ecece8"],
  cylinder: ["#7d9a7e", "#d4b85a", "#6a8a5a"],
};

const SENTINEL = "#7d9a7e";

let nextId = 1;

export function todayKey() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function colorFor(kind: ShapeKind, id: number, theater: Theater, role: BodyRole) {
  if (role === "sentinel") return SENTINEL;
  const pal = theater === "neural" ? NEURAL_PALETTE[kind] : ORBIT_PALETTE[kind];
  return pal[id % pal.length] ?? pal[0] ?? SENTINEL;
}

function orbitPoint(radius: number, i: number, n: number): [number, number, number] {
  const a = (i / n) * Math.PI * 2 + 0.18;
  const e = ((i % 3) - 1) * 0.42;
  const r = radius;
  const ce = Math.cos(e);
  return [Math.cos(a) * ce * r, Math.sin(e) * r, Math.sin(a) * ce * r];
}

export function makeBody(
  kind: ShapeKind,
  theater: Theater,
  position?: [number, number, number],
  rotation?: [number, number, number],
  scale = 1,
  role: BodyRole = "threat",
): SpawnedBody {
  const id = nextId++;
  const pos =
    position ??
    (theater === "orbit"
      ? orbitPoint(rand(3.9, 5.3), id, 9)
      : [rand(-1.4, 1.4), rand(4.4, 7.4), rand(-1.4, 1.4)]);
  return {
    id,
    kind,
    position: pos,
    rotation: rotation ?? [rand(-0.4, 0.4), rand(0, Math.PI), rand(-0.4, 0.4)],
    color: colorFor(kind, id, theater, role),
    scale,
    role,
    sampled: false,
  };
}

function seedNeural(): SpawnedBody[] {
  const t: Theater = "neural";
  return [
    makeBody("sphere", t, [-1.15, 3.7, 0.45]),
    makeBody("sphere", t, [1.35, 4.3, -0.55]),
    makeBody("sphere", t, [0.15, 5.05, 1.05]),
    makeBody("box", t, [-0.85, 3.35, -1.05]),
    makeBody("box", t, [1.05, 3.85, 0.85]),
    makeBody("box", t, [-1.55, 4.7, 0.15]),
    makeBody("cylinder", t, [0.45, 4.55, -0.35], [0.55, 0.9, 0.12]),
    makeBody("cylinder", t, [-0.25, 3.55, 1.45], [1.1, 0.25, 0.35]),
    makeBody("sphere", t, [0.55, 5.35, 0.05]),
  ];
}

function seedOrbit(): SpawnedBody[] {
  const t: Theater = "orbit";
  const kinds: ShapeKind[] = ["sphere", "box", "cylinder"];
  return Array.from({ length: 9 }, (_, i) =>
    makeBody(kinds[i % 3] ?? "box", t, orbitPoint(4.35 + (i % 2) * 0.25, i, 9)),
  );
}

function seedFor(theater: Theater) {
  return theater === "neural" ? seedNeural() : seedOrbit();
}

const OPENING: BriefingLine = {
  t: 0,
  text: "Sentinel OS catalogs every strain you seize. HSV, West Nile, and rabies in the CSF. Teach it to defend.",
};

type PlaygroundState = {
  theater: Theater;
  bodies: SpawnedBody[];
  selected: ShapeKind;
  gravity: number;
  restitution: number;
  grabbing: boolean;
  briefing: BriefingLine[];
  watchDay: string | null;
  discovered: boolean;
  outcome: Outcome;
  spawn: (kind?: ShapeKind) => void;
  scatter: () => void;
  seed: () => void;
  clear: () => void;
  setTheater: (theater: Theater) => void;
  claimWatch: () => boolean;
  hydrate: () => void;
  discover: () => void;
  dismissLegend: () => void;
  markSeize: (id: number) => void;
  osStrike: () => boolean;
  setSelected: (kind: ShapeKind) => void;
  setGravity: (n: number) => void;
  setRestitution: (n: number) => void;
  setGrabbing: (v: boolean) => void;
};

function cap(bodies: SpawnedBody[]) {
  return bodies.length > MAX_BODIES ? bodies.slice(bodies.length - MAX_BODIES) : bodies;
}

function capBrief(lines: BriefingLine[]) {
  return lines.slice(0, BRIEF_CAP);
}

function persistDiscovery() {
  try {
    localStorage.setItem(DISCOVERY_KEY, "1");
  } catch {
    /* private mode */
  }
}

function note(text: string, lines: BriefingLine[]): BriefingLine[] {
  return capBrief([{ t: Date.now(), text }, ...lines]);
}

function applyOverwhelm(
  theater: Theater,
  discovered: boolean,
  count: number,
  outcome: Outcome,
  briefing: BriefingLine[],
): { outcome: Outcome; briefing: BriefingLine[] } {
  if (!discovered || count < OVERWHELM || outcome === "lose") {
    return { outcome, briefing };
  }
  return {
    outcome: "lose",
    briefing: note(
      theater === "orbit"
        ? "Mesh overwhelmed. Field physics revealed."
        : "Tissue overwhelmed. Field physics revealed.",
      briefing,
    ),
  };
}

export const usePlayground = create<PlaygroundState>((set, get) => ({
  theater: "neural",
  bodies: seedNeural(),
  selected: "sphere",
  gravity: 3.2,
  restitution: 0.14,
  grabbing: false,
  briefing: [OPENING],
  watchDay: null,
  discovered: false,
  outcome: null,
  spawn: (kind) => {
    const k = kind ?? get().selected;
    const theater = get().theater;
    const bodies = cap([...get().bodies, makeBody(k, theater)]);
    const briefing = note(`${KIND_LABEL[theater][k]} inbound.`, get().briefing);
    const next = applyOverwhelm(theater, get().discovered, bodies.length, get().outcome, briefing);
    set({ bodies, selected: k, briefing: next.briefing, outcome: next.outcome });
  },
  scatter: () => {
    const theater = get().theater;
    const kinds: ShapeKind[] = ["sphere", "box", "cylinder"];
    const extra: SpawnedBody[] = Array.from({ length: 8 }, (_, i) =>
      makeBody(
        kinds[i % 3] ?? "box",
        theater,
        theater === "orbit"
          ? orbitPoint(4.6 + i * 0.08, i + 3, 11)
          : [rand(-1.8, 1.8), 4.2 + i * 0.22, rand(-1.8, 1.8)],
      ),
    );
    const bodies = cap([...get().bodies, ...extra]);
    const briefing = note(
      theater === "orbit" ? "Sweep — eight byproducts on the mesh." : "Outbreak — eight neurotropic virions in the CSF.",
      get().briefing,
    );
    const next = applyOverwhelm(theater, get().discovered, bodies.length, get().outcome, briefing);
    set({ bodies, briefing: next.briefing, outcome: next.outcome });
  },
  seed: () => {
    nextId = 1;
    const theater = get().theater;
    set({
      bodies: seedFor(theater),
      grabbing: false,
      outcome: null,
      briefing: [
        {
          t: Date.now(),
          text: theater === "orbit" ? "God's Eye restored. Exhaust only — never bodies." : "CSF restored. Virions suspended in the bath.",
        },
      ],
    });
  },
  clear: () => {
    const theater = get().theater;
    const n = get().bodies.filter((b) => b.role === "threat").length;
    const ranked = useProgress.getState().onPurge(theater, n);
    let briefing = note(
      theater === "orbit"
        ? n
          ? `Byproducts purged. Mesh clearance up.`
          : "Mesh already clear."
        : n
          ? `Virions purged from the CSF. Tissue heal up.`
          : "Tissue already clear.",
      get().briefing,
    );
    if (ranked) briefing = note(`Rank up — ${ranked.title}. Combined dossier advanced.`, briefing);
    const discovered = get().discovered;
    const outcome: Outcome = discovered && n > 0 ? "win" : get().outcome;
    if (discovered && n > 0) {
      briefing = note(
        theater === "orbit" ? "Mesh clear. Field physics revealed." : "Tissue clear. Field physics revealed.",
        briefing,
      );
    }
    set({ bodies: [], grabbing: false, briefing, outcome });
  },
  setTheater: (theater) => {
    if (theater === get().theater) return;
    nextId = 1;
    set({
      theater,
      bodies: seedFor(theater),
      grabbing: false,
      gravity: theater === "neural" ? 3.2 : 6.4,
      outcome: null,
      briefing: note(
        theater === "orbit"
          ? "God's Eye online. Byproducts of human systems — never bodies."
          : "Entered the cranial vault. Neurotropic virions in the cerebrospinal fluid.",
        get().briefing,
      ),
    });
  },
  claimWatch: () => {
    const today = todayKey();
    if (get().watchDay === today) return false;
    try {
      localStorage.setItem(WATCH_KEY, today);
    } catch {
      /* private mode — still claim in-session */
    }
    const theater = get().theater;
    const ranked = useProgress.getState().onWatch();
    let briefing = note(
      theater === "orbit"
        ? "Daily watch claimed. Sentinel on the mesh. Profile healed."
        : "Daily watch claimed. Sentinel lymphocyte in the CSF. Profile healed.",
      get().briefing,
    );
    if (ranked) briefing = note(`Rank up — ${ranked.title}. Combined dossier advanced.`, briefing);
    const bodies = cap([...get().bodies, makeBody("sphere", theater, undefined, undefined, 1, "sentinel")]);
    const next = applyOverwhelm(theater, get().discovered, bodies.length, get().outcome, briefing);
    set({
      watchDay: today,
      bodies,
      selected: "sphere",
      briefing: next.briefing,
      outcome: next.outcome,
    });
    return true;
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const day = localStorage.getItem(WATCH_KEY);
      const found = localStorage.getItem(DISCOVERY_KEY) === "1";
      set({
        ...(day ? { watchDay: day } : {}),
        discovered: found,
      });
    } catch {
      /* ignore */
    }
  },
  discover: () => {
    if (get().discovered) return;
    persistDiscovery();
    set({
      discovered: true,
      briefing: note("Contact logged. A win or loss will reveal field physics.", get().briefing),
    });
  },
  dismissLegend: () => set({ outcome: null }),
  markSeize: (id) => {
    const theater = get().theater;
    const bodies = get().bodies;
    const b = bodies.find((row) => row.id === id);
    if (!b || b.role !== "threat" || b.sampled) return;
    const result = useProgress.getState().seize(theater, b.kind);
    let briefing = get().briefing;
    if (result.newlyLearned) {
      briefing = note(
        `Sentinel OS learned ${result.newlyLearned}. It will now defend that signature.`,
        briefing,
      );
    }
    if (result.autonomous) {
      briefing = note("Sentinel OS autonomous. Self-defense live in Synapse and God's Eye.", briefing);
    }
    if (result.ranked) briefing = note(`Rank up — ${result.ranked.title}. Combined dossier advanced.`, briefing);
    set({
      bodies: bodies.map((row) => (row.id === id ? { ...row, sampled: true } : row)),
      briefing,
    });
  },
  osStrike: () => {
    const { theater, bodies, grabbing } = get();
    if (grabbing) return false;
    const learned = useProgress.getState().learned;
    const target = bodies.find(
      (b) => b.role === "threat" && isLearned(learned, sigKey(theater, b.kind)),
    );
    if (!target) return false;
    useProgress.getState().onOsStrike(theater);
    set({
      bodies: bodies.filter((b) => b.id !== target.id),
      briefing: note(
        `Sentinel OS neutralized ${KIND_LABEL[theater][target.kind]}. Self-defense live.`,
        get().briefing,
      ),
    });
    return true;
  },
  setSelected: (kind) => set({ selected: kind }),
  setGravity: (gravity) => set({ gravity }),
  setRestitution: (restitution) => set({ restitution }),
  setGrabbing: (grabbing) => set({ grabbing }),
}));

export function bindPlaygroundTest() {
  if (typeof window === "undefined") return;
  const api = {
    spawn: (kind?: ShapeKind) => usePlayground.getState().spawn(kind),
    scatter: () => usePlayground.getState().scatter(),
    clear: () => usePlayground.getState().clear(),
    seed: () => usePlayground.getState().seed(),
    count: () => usePlayground.getState().bodies.length,
    gravity: () => usePlayground.getState().gravity,
    restitution: () => usePlayground.getState().restitution,
    setGravity: (n: number) => usePlayground.getState().setGravity(n),
    setRestitution: (n: number) => usePlayground.getState().setRestitution(n),
    claimWatch: () => usePlayground.getState().claimWatch(),
    watchDay: () => usePlayground.getState().watchDay,
    setTheater: (theater: Theater) => usePlayground.getState().setTheater(theater),
    theater: () => usePlayground.getState().theater,
    discover: () => usePlayground.getState().discover(),
    dismissLegend: () => usePlayground.getState().dismissLegend(),
    discovered: () => usePlayground.getState().discovered,
    outcome: () => usePlayground.getState().outcome,
    learned: () => useProgress.getState().learned,
    learnedCount: () => countLearned(useProgress.getState().learned),
    osTitle: () => titleOfOs(useProgress.getState().learned),
    osStrike: () => usePlayground.getState().osStrike(),
    markSeize: (id: number) => usePlayground.getState().markSeize(id),
    teach: (kind: ShapeKind, n = 3) => {
      const theater = usePlayground.getState().theater;
      for (let i = 0; i < n; i++) useProgress.getState().seize(theater, kind);
    },
    xp: () => useProgress.getState().xp,
    rank: () => rankFor(useProgress.getState().xp).title,
    healed: () => useProgress.getState().healed,
    cleared: () => useProgress.getState().cleared,
    resetProgress: () => {
      try {
        localStorage.removeItem("trv-deck-progress-v1");
        localStorage.removeItem(DISCOVERY_KEY);
      } catch {
        /* ignore */
      }
      useProgress.setState({ xp: 0, healed: 0, cleared: 0, seizes: 0, watches: 0, learned: {} });
      usePlayground.setState({ discovered: false, outcome: null });
    },
  };
  (window as Window & { __playground?: typeof api }).__playground = api;
}
