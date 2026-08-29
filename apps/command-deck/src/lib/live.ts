import { create } from "zustand";
import { useEffect } from "react";
import { listPulse, postPulse, type PulseRow } from "@/lib/board";
import { useIdentity } from "@/lib/identity";
import {
  raceFromRows,
  readPulse,
  readRegion,
  readSeverity,
  regionFor,
  usePulse,
  usePulseClock,
  type BoardScope,
  type Region,
  type SnapPressure,
} from "@/lib/pulse";

const SCOPES: BoardScope[] = ["local", "national", "globe"];

type LiveState = {
  scope: BoardScope;
  region: Region;
  pulseId: number;
  local: PulseRow[];
  national: PulseRow[];
  globe: PulseRow[];
  error: string | null;
  setScope: (scope: BoardScope) => void;
  apply: (scope: BoardScope, rows: PulseRow[]) => void;
  refresh: () => Promise<void>;
};

function emptyRegion(): Region {
  return { local: "UTC", national: "UN" };
}

export function regionLabel(scope: BoardScope, region: Region) {
  if (scope === "local") {
    const tz = region.local || "UTC";
    return tz.split("/").pop()?.replace(/_/g, " ") ?? tz;
  }
  if (scope === "national") return region.national || "UN";
  return "Globe";
}

export const useLiveLead = create<LiveState>((set) => ({
  scope: "local",
  region: emptyRegion(),
  pulseId: 0,
  local: [],
  national: [],
  globe: [],
  error: null,
  setScope: (scope) => set({ scope }),
  apply: (scope, rows) => set({ [scope]: rows } as Pick<LiveState, BoardScope>),
  refresh: async () => {
    const region = readRegion();
    const pulseId = readPulse().id;
    try {
      const [local, national, globe] = await Promise.all(
        SCOPES.map((scope) =>
          listPulse({
            data: { scope, region: regionFor(scope, region), pulseId },
          }),
        ),
      );
      set({
        region,
        pulseId,
        local: local ?? [],
        national: national ?? [],
        globe: globe ?? [],
        error: null,
      });
    } catch (err) {
      set({
        region,
        pulseId,
        error: err instanceof Error ? err.message : "Board unreachable",
      });
    }
  },
}));

export function rowsFor(state: LiveState, scope: BoardScope = state.scope) {
  return state[scope];
}

async function pushPulse() {
  const pulse = usePulse.getState();
  let id = useIdentity.getState();
  if (!id.pubkey) {
    await id.init();
    id = useIdentity.getState();
  }
  if (!id.pubkey) return;
  const region = readRegion();
  const base = {
    pubkey: id.pubkey,
    pulseId: pulse.pulseId,
    pulseScore: pulse.score,
    seizes: pulse.seizes,
  };
  const results = await Promise.all(
    SCOPES.map(async (scope) => {
      const rows = await postPulse({
        data: { ...base, scope, region: regionFor(scope, region) },
      });
      return { scope, rows };
    }),
  );
  for (const row of results) useLiveLead.getState().apply(row.scope, row.rows);
}

let chain: Promise<void> = Promise.resolve();
let dirty = false;

export function broadcastPulse() {
  dirty = true;
  chain = chain
    .then(async () => {
      if (!dirty) return;
      dirty = false;
      try {
        await pushPulse();
        if (dirty) {
          dirty = false;
          await pushPulse();
        }
      } catch (err) {
        useLiveLead.setState({
          error: err instanceof Error ? err.message : "Pulse post failed",
        });
      }
    })
    .catch(() => undefined);
  return chain;
}

export async function broadcastStanding() {
  const { assertMeshAllowed } = await import("@/lib/affairs");
  if (!assertMeshAllowed()) return;
  const { postStanding } = await import("@/lib/board");
  const { learnedCount, useProgress } = await import("@/lib/progress");
  let id = useIdentity.getState();
  if (!id.pubkey) {
    await id.init();
    id = useIdentity.getState();
  }
  if (!id.pubkey) return;
  const p = useProgress.getState();
  await postStanding({
    data: {
      pubkey: id.pubkey,
      xp: p.xp,
      seizes: p.seizes,
      healed: p.healed,
      cleared: p.cleared,
      watches: p.watches,
      learned: learnedCount(p.learned),
    },
  });
}

export function useLivePulseFeed() {
  const pulseId = usePulse((s) => s.pulseId);
  useEffect(() => {
    useLiveLead.setState({ local: [], national: [], globe: [], pulseId, error: null });
    void useLiveLead.getState().refresh();
    const id = window.setInterval(() => void useLiveLead.getState().refresh(), 2000);
    return () => window.clearInterval(id);
  }, [pulseId]);
}

export function useSnapPressure(): SnapPressure {
  const clock = usePulseClock();
  const repairForced = usePulse((s) => s.repairForced);
  const rows = useLiveLead((s) => rowsFor(s));
  const pubkey = useIdentity((s) => s.pubkey) ?? "";
  return readSeverity(clock, raceFromRows(rows, pubkey), repairForced);
}
