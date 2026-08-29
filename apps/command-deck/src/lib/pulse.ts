import { useEffect, useState } from "react";
import { create } from "zustand";

export const PULSE_MS = 40_000;
export const SNAP_MS = 12_000;
export const SNAP_HOT_MS = 4_000;
export const REPAIR_SNAP_MS = 8_000;
export const GAP_SNAP = 5;
export const SNAP_XP = { watch: 2, pulse: 5, snap: 8 } as const;
const GHOST_KEY = "trv-pulse-ghost-v1";

export type PulsePhase = "open" | "snap";
export type SnapSeverity = "watch" | "pulse" | "snap";
export type SnapReason = "open" | "window" | "hot" | "race" | "repair";
export type BoardScope = "local" | "national" | "globe";

export type PulseClock = {
  id: number;
  left: number;
  elapsed: number;
  phase: PulsePhase;
  snapIn: number;
  hotIn: number;
  clockSeverity: SnapSeverity;
};

export type RaceView = {
  posted: boolean;
  place: number;
  mineScore: number;
  leadScore: number;
  secondScore: number;
  rivals: number;
  gap: number;
};

export type SnapPressure = {
  severity: SnapSeverity;
  clock: SnapSeverity;
  contested: boolean;
  lock: boolean;
  xp: number;
  reason: SnapReason;
  gap: number;
  hotIn: number;
};

export type Region = {
  local: string;
  national: string;
};

let forceUntil = 0;
let forcePhase: PulsePhase | null = null;
let forceReason: SnapReason | null = null;

export function forceSnap(ms = SNAP_MS, reason: SnapReason = "window") {
  forceUntil = Date.now() + Math.max(1_000, ms);
  forcePhase = "snap";
  forceReason = reason === "open" ? "window" : reason;
  const clock = readPulse();
  const hot = clock.clockSeverity === "snap" || forceReason === "repair" || forceReason === "hot";
  usePulse.setState({
    lastPhase: "snap",
    lastSeverity: hot ? "snap" : "pulse",
    pulseId: clock.id,
    missed: false,
    repairForced: forceReason === "repair",
  });
  return clock;
}

export function forceHotSnap(ms = SNAP_HOT_MS) {
  return forceSnap(ms, "hot");
}

export function clearForcePulse() {
  forceUntil = 0;
  forcePhase = null;
  forceReason = null;
  usePulse.setState({ repairForced: false });
}

export function isRepairLock(now = Date.now()) {
  return forceReason === "repair" && forcePhase === "snap" && now < forceUntil;
}

function clockSeverityOf(phase: PulsePhase, left: number): SnapSeverity {
  if (phase !== "snap") return "watch";
  if (forcePhase && (forceReason === "hot" || forceReason === "repair")) return "snap";
  if (left <= SNAP_HOT_MS) return "snap";
  return "pulse";
}

export function readPulse(now = Date.now()): PulseClock {
  if (forcePhase && now < forceUntil) {
    const left = forceUntil - now;
    const id = Math.floor(now / PULSE_MS);
    const phase = forcePhase;
    const clockSeverity = clockSeverityOf(phase, left);
    return {
      id,
      left,
      elapsed: PULSE_MS - left,
      phase,
      snapIn: 0,
      hotIn: clockSeverity === "snap" ? 0 : Math.max(0, left - SNAP_HOT_MS),
      clockSeverity,
    };
  }
  if (forcePhase && now >= forceUntil) {
    forcePhase = null;
    forceUntil = 0;
    forceReason = null;
  }
  const id = Math.floor(now / PULSE_MS);
  const elapsed = now - id * PULSE_MS;
  const left = PULSE_MS - elapsed;
  const phase: PulsePhase = left <= SNAP_MS ? "snap" : "open";
  const snapIn = phase === "snap" ? 0 : Math.max(0, left - SNAP_MS);
  const clockSeverity = clockSeverityOf(phase, left);
  return {
    id,
    left,
    elapsed,
    phase,
    snapIn,
    hotIn: clockSeverity === "snap" ? 0 : Math.max(0, left - SNAP_HOT_MS),
    clockSeverity,
  };
}

export function emptyRace(): RaceView {
  return { posted: false, place: 0, mineScore: 0, leadScore: 0, secondScore: 0, rivals: 0, gap: 0 };
}

export function raceFromRows(
  rows: Array<{ pubkey: string; pulseScore: number; place: number }>,
  pubkey: string,
): RaceView {
  if (!pubkey || rows.length === 0) return emptyRace();
  const lead = rows[0];
  const second = rows[1];
  const mine = rows.find((r) => r.pubkey === pubkey);
  const leadScore = lead?.pulseScore ?? 0;
  const secondScore = second?.pulseScore ?? 0;
  const mineScore = mine?.pulseScore ?? 0;
  const posted = Boolean(mine);
  const place = mine?.place ?? 0;
  const rivals = rows.filter((r) => r.pubkey !== pubkey).length;
  let gap = 0;
  if (!posted) gap = leadScore;
  else if (place > 1) gap = Math.max(0, leadScore - mineScore);
  else gap = Math.max(0, mineScore - secondScore);
  return { posted, place, mineScore, leadScore, secondScore, rivals, gap };
}

export function readSeverity(
  clock: PulseClock,
  race?: RaceView | null,
  repairSnap = false,
): SnapPressure {
  const clockSev = clock.clockSeverity;
  const raceView = race ?? emptyRace();
  const close = raceView.rivals > 0 && raceView.gap <= GAP_SNAP;
  const contested =
    clock.phase === "snap" &&
    raceView.rivals > 0 &&
    (!raceView.posted || close);
  const repair = repairSnap && clock.phase === "snap";
  const hot = clockSev === "snap";
  const lock = hot || contested || repair;
  const severity: SnapSeverity = lock ? "snap" : clockSev;
  const reason: SnapReason = repair
    ? "repair"
    : hot
      ? "hot"
      : contested
        ? "race"
        : clockSev === "pulse"
          ? "window"
          : "open";
  return {
    severity,
    clock: clockSev,
    contested,
    lock,
    xp: SNAP_XP[severity],
    reason,
    gap: raceView.gap,
    hotIn: clock.hotIn,
  };
}

const TZ_NATION: Record<string, string> = {
  New_York: "US",
  Chicago: "US",
  Denver: "US",
  Los_Angeles: "US",
  Phoenix: "US",
  Anchorage: "US",
  Honolulu: "US",
  Toronto: "CA",
  Vancouver: "CA",
  London: "GB",
  Dublin: "IE",
  Paris: "FR",
  Berlin: "DE",
  Rome: "IT",
  Madrid: "ES",
  Amsterdam: "NL",
  Stockholm: "SE",
  Warsaw: "PL",
  Moscow: "RU",
  Tokyo: "JP",
  Seoul: "KR",
  Shanghai: "CN",
  Hong_Kong: "HK",
  Singapore: "SG",
  Sydney: "AU",
  Melbourne: "AU",
  Auckland: "NZ",
  Sao_Paulo: "BR",
  Mexico_City: "MX",
  Johannesburg: "ZA",
  Dubai: "AE",
  Kolkata: "IN",
  Mumbai: "IN",
};

export function readRegion(): Region {
  if (typeof window === "undefined") return { local: "UTC", national: "UN" };
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const city = tz.split("/").pop() ?? "";
  const fromTz = TZ_NATION[city];
  const parts = (navigator.language || "en").split("-");
  const fromLang = (parts[1] || "").toUpperCase();
  const national = fromTz || (fromLang.length === 2 ? fromLang : "UN");
  return { local: tz, national };
}

export function regionFor(scope: BoardScope, region: Region) {
  if (scope === "local") return region.local;
  if (scope === "national") return region.national;
  return "globe";
}

function readGhost(): { pulseId: number; score: number } {
  try {
    const raw = localStorage.getItem(GHOST_KEY);
    if (!raw) return { pulseId: -1, score: 0 };
    const p = JSON.parse(raw) as { pulseId?: number; score?: number };
    return { pulseId: Number(p.pulseId) || -1, score: Number(p.score) || 0 };
  } catch {
    return { pulseId: -1, score: 0 };
  }
}

type PulseState = {
  pulseId: number;
  seizes: number;
  snapSeizes: number;
  hotSeizes: number;
  score: number;
  ghost: number;
  lastPhase: PulsePhase;
  lastSeverity: SnapSeverity;
  missed: boolean;
  upgraded: boolean;
  repairForced: boolean;
  contested: boolean;
  hydrate: () => void;
  tick: () => PulseClock;
  onSeize: (race?: RaceView | null) => SnapPressure;
};

export const usePulse = create<PulseState>((set, get) => ({
  pulseId: 0,
  seizes: 0,
  snapSeizes: 0,
  hotSeizes: 0,
  score: 0,
  ghost: 0,
  lastPhase: "open",
  lastSeverity: "watch",
  missed: false,
  upgraded: false,
  repairForced: false,
  contested: false,
  hydrate: () => {
    const clock = readPulse();
    const ghost = readGhost();
    set({
      pulseId: clock.id,
      seizes: 0,
      snapSeizes: 0,
      hotSeizes: 0,
      score: 0,
      ghost: ghost.score,
      lastPhase: clock.phase,
      lastSeverity: clock.clockSeverity,
      missed: false,
      upgraded: false,
      repairForced: isRepairLock(),
      contested: false,
    });
  },
  tick: () => {
    const clock = readPulse();
    const cur = get();
    if (clock.id !== cur.pulseId && !forcePhase) {
      try {
        localStorage.setItem(
          GHOST_KEY,
          JSON.stringify({ pulseId: cur.pulseId, score: cur.score }),
        );
      } catch {
        /* private mode */
      }
      const locked = cur.hotSeizes > 0;
      const missed = cur.hotSeizes === 0 && cur.seizes > 0;
      if (locked) {
        void import("@/lib/progress").then(({ useProgress }) => {
          useProgress.getState().onPulseUpgrade(cur.score);
        });
      }
      set({
        pulseId: clock.id,
        seizes: 0,
        snapSeizes: 0,
        hotSeizes: 0,
        score: 0,
        ghost: cur.score,
        lastPhase: clock.phase,
        lastSeverity: clock.clockSeverity,
        missed,
        upgraded: locked,
        repairForced: false,
        contested: false,
      });
    } else if (clock.phase !== cur.lastPhase || clock.clockSeverity !== cur.lastSeverity) {
      set({
        lastPhase: clock.phase,
        lastSeverity: clock.clockSeverity,
        upgraded: false,
        repairForced: isRepairLock(),
      });
    }
    void import("@/lib/wire").then(({ tickRepairSnap }) => tickRepairSnap());
    return clock;
  },
  onSeize: (race) => {
    const clock = get().tick();
    const pressure = readSeverity(clock, race, get().repairForced || forceReason === "repair");
    set((s) => ({
      seizes: s.seizes + 1,
      snapSeizes: s.snapSeizes + (clock.phase === "snap" ? 1 : 0),
      hotSeizes: s.hotSeizes + (pressure.lock ? 1 : 0),
      score: s.score + pressure.xp,
      missed: false,
      upgraded: false,
      lastSeverity: pressure.severity,
      contested: pressure.contested,
    }));
    if (pressure.lock) {
      void import("@/lib/progress").then(({ useProgress }) => {
        useProgress.getState().onSnapBonus();
      });
    }
    return pressure;
  },
}));

export function usePulseClock() {
  const [clock, setClock] = useState<PulseClock>(() => readPulse(0));
  useEffect(() => {
    setClock(usePulse.getState().tick());
    const id = window.setInterval(() => {
      setClock(usePulse.getState().tick());
    }, 250);
    return () => window.clearInterval(id);
  }, []);
  return clock;
}
