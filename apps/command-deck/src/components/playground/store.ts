import { create } from "zustand";
import { isLearned, learnedCount as countLearned, osTitle as titleOfOs, rankFor, sigKey, useProgress } from "@/lib/progress";
import { useIdentity } from "@/lib/identity";
import { clearForcePulse, forceHotSnap, forceMiss, forceSnap, isRepairLock, raceFromRows, readPulse, readSeverity, usePulse } from "@/lib/pulse";
import { broadcastPulse, broadcastStanding, rowsFor, useLiveLead } from "@/lib/live";
import { assertMeshAllowed, assertOsAllowed, assertRepairAllowed, assertSeizeAllowed, assertSpawnAllowed, assertTheaterAllowed, boundRepairText, deckVerdict, isTopicHeld, useAffairs } from "@/lib/affairs";
import { probeNative, sanitizeIceServers } from "@/lib/native";
import { readFieldQuality } from "@/lib/platform";
import { physicsLine, physicsProfile } from "@/lib/physics";
import { armRepair, dispatchRepair, listIssues } from "@/lib/repair";
import { hydrateRepair, readWire, reportRepair, resetRepairLive, seizeRepair, useRepairLive } from "@/lib/wire";

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
  text: "Tap a strain to seize it. Toggle a type, then tap Drop — or tap the field.",
};

type PlaygroundState = {
  theater: Theater;
  bodies: SpawnedBody[];
  selected: ShapeKind;
  gravity: number;
  restitution: number;
  grabbing: boolean;
  lookMode: boolean;
  briefing: BriefingLine[];
  watchDay: string | null;
  discovered: boolean;
  outcome: Outcome;
  spawn: (kind?: ShapeKind) => number | undefined;
  seizeNow: () => boolean;
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
  pushBrief: (text: string) => void;
  setSelected: (kind: ShapeKind) => void;
  setGravity: (n: number) => void;
  setRestitution: (n: number) => void;
  setGrabbing: (v: boolean) => void;
  setLookMode: (v: boolean) => void;
  toggleLook: () => void;
};

export function isTheaterNow() {
  const clock = readPulse();
  const pulse = usePulse.getState();
  const live = useLiveLead.getState();
  const pubkey = useIdentity.getState().pubkey ?? "";
  return readSeverity(clock, raceFromRows(rowsFor(live), pubkey), pulse.repairForced).lock;
}

export function isTheaterWait() {
  if (isTheaterNow()) return false;
  const p = usePulse.getState();
  if (p.lastPhase === "snap") return false;
  return p.missed;
}

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
  lookMode: true,
  briefing: [OPENING],
  watchDay: null,
  discovered: false,
  outcome: null,
  spawn: (kind) => {
    const k = kind ?? get().selected;
    const theater = get().theater;
    if (!assertSpawnAllowed(theater)) {
      set({ briefing: note("Internal Affairs holds this theater. Spawn frozen.", get().briefing) });
      return undefined;
    }
    const created = makeBody(k, theater);
    const bodies = cap([...get().bodies, created]);
    const briefing = note(`${KIND_LABEL[theater][k]} inbound.`, get().briefing);
    const next = applyOverwhelm(theater, get().discovered, bodies.length, get().outcome, briefing);
    set({ bodies, selected: k, briefing: next.briefing, outcome: next.outcome });
    return created.id;
  },
  scatter: () => {
    const theater = get().theater;
    if (!assertSpawnAllowed(theater)) {
      set({ briefing: note("Internal Affairs holds this theater. Outbreak frozen.", get().briefing) });
      return;
    }
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
    if (!assertTheaterAllowed(theater)) {
      set({ briefing: note("Internal Affairs holds this theater. Clear frozen.", get().briefing) });
      return;
    }
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
    if (!assertTheaterAllowed(theater)) {
      set({
        briefing: note(
          theater === "orbit"
            ? "Internal Affairs holds God's Eye. Mesh stays closed."
            : "Internal Affairs holds Neural Link. CSF stays closed.",
          get().briefing,
        ),
      });
      return;
    }
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
    if (!assertTheaterAllowed(get().theater)) {
      set({ briefing: note("Internal Affairs holds this theater. Watch frozen.", get().briefing) });
      return false;
    }
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
  pushBrief: (text) => set((s) => ({ briefing: note(text, s.briefing) })),
  markSeize: (id) => {
    const theater = get().theater;
    const bodies = get().bodies;
    const b = bodies.find((row) => row.id === id);
    if (!b || b.role !== "threat" || b.sampled) return;
    if (!assertSeizeAllowed(theater)) {
      set({ briefing: note("Internal Affairs holds this theater. Seize frozen.", get().briefing) });
      return;
    }
    if (!get().discovered) get().discover();
    const result = useProgress.getState().seize(theater, b.kind);
    const live = useLiveLead.getState();
    const pubkey = useIdentity.getState().pubkey ?? "";
    const race = raceFromRows(rowsFor(live), pubkey);
    const pressure = usePulse.getState().onSeize(race);
    let briefing = get().briefing;
    if (pressure.lock) {
      const why =
        pressure.reason === "repair"
          ? "Repair SNAP."
          : pressure.reason === "race"
            ? "Race SNAP."
            : "NOW.";
      briefing = note(`${why} This lock is the upgrade. Miss it and you wait.`, briefing);
    } else if (pressure.severity === "pulse") {
      const hot = Math.max(0, Math.ceil(pressure.hotIn / 1000));
      briefing = note(`SNAP window. Score now — the lock is in ${hot}s, or a close race.`, briefing);
    } else {
      briefing = note("Pulse marked. SNAP is the lock — seize then, or wait for the next upgrade.", briefing);
    }
    if (result.newlyLearned) {
      briefing = note(
        `Sentinel OS learned ${result.newlyLearned}. It will now defend that signature.`,
        briefing,
      );
    }
    if (result.autonomous) {
      briefing = note("Sentinel OS autonomous. Self-defense live in Neural Link and God's Eye.", briefing);
    }
    if (result.ranked) briefing = note(`Rank up — ${result.ranked.title}. Combined dossier advanced.`, briefing);
    briefing = note(`Seized ${KIND_LABEL[theater][b.kind]}.`, briefing);
    set({
      bodies: bodies.filter((row) => row.id !== id),
      briefing,
    });
    void broadcastPulse();
    if (pressure.lock) void broadcastStanding();
  },
  seizeNow: () => {
    if (!isTheaterNow()) {
      get().spawn();
      return false;
    }
    const target = get().bodies.find((b) => b.role === "threat" && !b.sampled);
    if (target) {
      get().markSeize(target.id);
      return get().bodies.every((b) => b.id !== target.id);
    }
    const id = get().spawn();
    if (id == null) return false;
    get().markSeize(id);
    return get().bodies.every((b) => b.id !== id);
  },
  osStrike: () => {
    const { theater, bodies, grabbing } = get();
    if (grabbing) return false;
    if (!assertOsAllowed(theater)) {
      if (isTopicHeld("os") || isTopicHeld("affairs") || isTopicHeld(theater === "orbit" ? "orbit" : "synapse")) {
        set({ briefing: note("Internal Affairs holds Sentinel OS. Strike frozen.", get().briefing) });
      }
      return false;
    }
    const learned = useProgress.getState().learned;
    const target = bodies.find(
      (b) => b.role === "threat" && isLearned(learned, sigKey(theater, b.kind)),
    );
    if (!target) return false;
    useProgress.getState().onOsStrike(theater);
    const lock = isTheaterNow();
    if (lock) {
      const live = useLiveLead.getState();
      const pubkey = useIdentity.getState().pubkey ?? "";
      usePulse.getState().onSeize(raceFromRows(rowsFor(live), pubkey));
      void broadcastPulse();
      void broadcastStanding();
    }
    set({
      bodies: bodies.filter((b) => b.id !== target.id),
      briefing: note(
        lock
          ? `Sentinel OS seized ${KIND_LABEL[theater][target.kind]} in the NOW lock.`
          : `Sentinel OS neutralized ${KIND_LABEL[theater][target.kind]}. Self-defense live.`,
        get().briefing,
      ),
    });
    return true;
  },
  setSelected: (kind) => set({ selected: kind }),
  setGravity: (gravity) => set({ gravity }),
  setRestitution: (restitution) => set({ restitution }),
  setGrabbing: (grabbing) => set({ grabbing }),
  setLookMode: (lookMode) => set({ lookMode }),
  toggleLook: () => set((s) => ({ lookMode: !s.lookMode })),
}));

export function bindPlaygroundTest() {
  if (typeof window === "undefined") return;
  const api = {
    spawn: (kind?: ShapeKind) => usePlayground.getState().spawn(kind),
    seizeNow: () => usePlayground.getState().seizeNow(),
    scatter: () => usePlayground.getState().scatter(),
    clear: () => usePlayground.getState().clear(),
    seed: () => usePlayground.getState().seed(),
    count: () => usePlayground.getState().bodies.length,
    ids: () => usePlayground.getState().bodies.map((b) => b.id),
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
    lookMode: () => usePlayground.getState().lookMode,
    setLookMode: (v: boolean) => usePlayground.getState().setLookMode(v),
    toggleLook: () => usePlayground.getState().toggleLook(),
    pulse: () => {
      const p = usePulse.getState();
      const live = useLiveLead.getState();
      const pubkey = useIdentity.getState().pubkey ?? "";
      const clock = readPulse();
      const pressure = readSeverity(clock, raceFromRows(rowsFor(live), pubkey), p.repairForced);
      return {
        id: p.pulseId,
        score: p.score,
        seizes: p.seizes,
        snapSeizes: p.snapSeizes,
        hotSeizes: p.hotSeizes,
        phase: p.lastPhase,
        severity: pressure.severity,
        clock: pressure.clock,
        lock: pressure.lock,
        contested: pressure.contested,
        reason: pressure.reason,
        xp: pressure.xp,
        gap: pressure.gap,
        hotIn: pressure.hotIn,
        repairForced: p.repairForced,
        missed: p.missed,
        upgraded: p.upgraded,
      };
    },
    forceSnap: (ms?: number) => forceSnap(ms),
    forceHotSnap: (ms?: number) => forceHotSnap(ms),
    forceMiss: (ms?: number) => forceMiss(ms),
    clearForcePulse: () => {
      clearForcePulse();
      usePulse.setState({ missed: false, upgraded: false });
    },
    readSeverity: (rows?: Array<{ pubkey: string; pulseScore: number; place: number }>, pubkey?: string) => {
      const live = useLiveLead.getState();
      const key = pubkey ?? useIdentity.getState().pubkey ?? "";
      return readSeverity(
        readPulse(),
        raceFromRows(rows ?? rowsFor(live), key),
        usePulse.getState().repairForced,
      );
    },
    liveLead: () => {
      const live = useLiveLead.getState();
      return {
        scope: live.scope,
        local: live.local,
        national: live.national,
        globe: live.globe,
      };
    },
    broadcastPulse: () => broadcastPulse(),
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
      useProgress.setState({ xp: 0, healed: 0, cleared: 0, seizes: 0, watches: 0, learned: {}, seq: 0 });
      usePlayground.setState({ discovered: false, outcome: null });
    },
  };
  (window as Window & { __playground?: typeof api }).__playground = api;
  void import("@/lib/board").then(({ listBoard, listPulse, postStanding }) => {
    const current = (window as Window & { __playground?: typeof api & Record<string, unknown> }).__playground;
    if (!current) return;
    current.listBoard = listBoard;
    current.listPulse = listPulse;
    current.postStanding = () => {
      if (!assertMeshAllowed()) throw new Error("Internal Affairs holds the Mesh Board.");
      const id = useIdentity.getState();
      const p = useProgress.getState();
      return postStanding({
        data: {
          pubkey: id.pubkey,
          xp: p.xp,
          seizes: p.seizes,
          healed: p.healed,
          cleared: p.cleared,
          watches: p.watches,
          learned: countLearned(p.learned),
        },
      });
    };
  });
  void import("@/lib/hub-sync").then((hub) => {
    const current = (window as Window & { __playground?: typeof api & Record<string, unknown> }).__playground;
    if (!current) return;
    current.hub = () => {
      const s = hub.useHub.getState();
      return {
        mode: s.mode,
        pin: s.pin,
        joinInput: s.joinInput,
        live: s.live,
        devices: s.devices,
        error: s.error,
      };
    };
    current.startLink = () => {
      void import("@/lib/affairs").then(({ assertHubAllowed }) => {
        if (!assertHubAllowed()) {
          hub.useHub.setState({ error: "Internal Affairs holds the HUB." });
          return;
        }
        hub.startLink();
      });
    };
    current.startJoin = () => {
      void import("@/lib/affairs").then(({ assertHubAllowed }) => {
        if (!assertHubAllowed()) {
          hub.useHub.setState({ error: "Internal Affairs holds the HUB." });
          return;
        }
        hub.startJoin();
      });
    };
    current.tapDigit = hub.tapDigit;
    current.submitJoin = hub.submitJoin;
    current.ingestDossier = hub.ingestDossier;
    current.pushHub = hub.pushHubNow;
    current.pullHub = hub.pullHubNow;
  });
  const current = (window as Window & { __playground?: typeof api & Record<string, unknown> }).__playground;
  if (current) {
    current.native = () => probeNative();
    current.physics = () => {
      const p = physicsProfile(readFieldQuality());
      return { band: p.band, solver: p.solver, pgs: p.pgs, ccdNeural: p.ccdNeural, ccdOrbit: p.ccdOrbit, forceEvery: p.forceEvery, line: physicsLine(p) };
    };
    current.sanitizeIce = sanitizeIceServers;
    current.boundRepair = (...parts: string[]) => boundRepairText(...parts);
    current.auditAffairs = () => useAffairs.getState().audit();
    current.affairs = () => {
      const s = useAffairs.getState();
      return {
        held: s.held,
        findings: s.findings,
        intercepts: s.intercepts,
        lastAudit: s.lastAudit,
        selected: s.selected,
        deck: deckVerdict(s.findings),
      };
    };
    current.holdTopic = (id: string) => {
      const hold = useAffairs.getState().hold;
      hold(id as Parameters<typeof hold>[0]);
    };
    current.releaseTopic = (id: string) => {
      const release = useAffairs.getState().release;
      return release(id as Parameters<typeof release>[0]);
    };
    current.listIssues = (repo: "trv" | "df" = "trv") => listIssues({ data: { repo } });
    current.dispatchRepair = (number: number, repo: "trv" | "df" = "trv") => {
      assertRepairAllowed();
      return dispatchRepair({ data: { repo, number } }).then((run) => {
        if (run?.status === "diagnosed") reportRepair(run);
        return run;
      });
    };
    current.armRepair = (repo: "trv" | "df" = "trv") => {
      assertRepairAllowed();
      return armRepair({ data: { repo } }).then((result) => {
        for (const run of result?.runs ?? []) {
          if (run.status === "diagnosed") reportRepair(run);
        }
        return result;
      });
    };
    current.hydrateRepair = hydrateRepair;
    current.seizeRepair = seizeRepair;
    current.resetRepairLive = resetRepairLive;
    current.isRepairLock = isRepairLock;
    current.repairLive = () => useRepairLive.getState();
    current.forceRepairSnap = (number = 55) => {
      reportRepair({
        repo: "trv",
        number,
        title: "Repair SNAP",
        url: "https://github.com/Sentinel-Architech/The-Remote-Viewer/issues/55",
        verdict: "bug",
        severity: "snap",
        summary: "Test SNAP diagnosis. Seize the fix or wait.",
        plan: ["Tap Seize fix."],
        patch: "--- a/src/lib/pulse.ts\n+++ b/src/lib/pulse.ts\n",
        files: ["src/lib/pulse.ts"],
        status: "diagnosed",
      });
      return useRepairLive.getState();
    };
    current.wire = () => readWire();
  }
}

if (typeof window !== "undefined") bindPlaygroundTest();
