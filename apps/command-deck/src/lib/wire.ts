import { create } from "zustand";
import { listIssues, type RepairRun } from "@/lib/repair";
import { assertRepairAllowed, deckVerdict, useAffairs, type AffairVerdict } from "@/lib/affairs";
import { useHub } from "@/lib/hub-sync";
import { broadcastPulse, broadcastStanding, rowsFor, useLiveLead } from "@/lib/live";
import { probeNative } from "@/lib/native";
import { learnedCount, useProgress } from "@/lib/progress";
import { emptyRace, REPAIR_SNAP_MS, forceSnap, isRepairLock, usePulse } from "@/lib/pulse";
import { useIdentity } from "@/lib/identity";

export type RepairLive = {
  open: number;
  trv: number;
  df: number;
  source: "live" | "cache" | null;
  snap: boolean;
  missed: boolean;
  seized: boolean;
  wantPanel: boolean;
  last: RepairRun | null;
};

export type WireSnapshot = {
  hub: number;
  native: number;
  os: number;
  ia: AffairVerdict | "armed";
  repair: number;
  repairSnap: boolean;
  repairSeized: boolean;
  repairMissed: boolean;
  boardPlace: number;
  snap: boolean;
  severity: "watch" | "pulse" | "snap";
  lock: boolean;
  curve: string;
};

const LAST_OPEN = 2;

export const useRepairLive = create<RepairLive>(() => ({
  open: LAST_OPEN,
  trv: LAST_OPEN,
  df: 0,
  source: "cache",
  snap: false,
  missed: false,
  seized: false,
  wantPanel: false,
  last: null,
}));

let hydrating = false;

export async function hydrateRepair() {
  if (hydrating) return useRepairLive.getState();
  hydrating = true;
  try {
    const [trv, df] = await Promise.all([
      listIssues({ data: { repo: "trv" } }).catch(() => null),
      listIssues({ data: { repo: "df" } }).catch(() => null),
    ]);
    const trvN = trv?.issues?.length ?? useRepairLive.getState().trv;
    const dfN = df?.issues?.length ?? 0;
    const live = trv?.source === "live" || df?.source === "live";
    useRepairLive.setState({
      open: trvN + dfN,
      trv: trvN,
      df: dfN,
      source: live ? "live" : "cache",
    });
  } catch {
    /* last known stays */
  } finally {
    hydrating = false;
  }
  return useRepairLive.getState();
}

function briefRepair(text: string) {
  void import("@/components/playground/store").then(({ usePlayground }) => {
    usePlayground.getState().pushBrief(text);
  });
}

export function reportRepair(run: RepairRun) {
  const fresh = run.status === "diagnosed";
  const snap = fresh && run.severity === "snap";
  useRepairLive.setState((s) => ({
    last: run,
    snap: snap || (s.snap && isRepairLock()),
    missed: snap ? false : s.missed,
    seized: snap ? false : s.seized,
    wantPanel: snap ? true : s.wantPanel,
    open: s.open,
  }));
  briefRepair(`Sentinel Repair #${run.number}: ${run.verdict} · ${run.severity}. ${run.summary}`);
  if (snap) {
    briefRepair("Repair SNAP. Tap Seize fix now or wait for the next upgrade.");
    forceSnap(REPAIR_SNAP_MS, "repair");
  } else if (fresh && run.severity === "pulse") {
    briefRepair("Repair pulse. No lock — SNAP severity is the seize.");
  }
  if (/Internal Affairs held/i.test(run.summary)) {
    useAffairs.getState().hold("repair");
  } else {
    useAffairs.getState().audit();
  }
}

export function tickRepairSnap() {
  const s = useRepairLive.getState();
  if (!s.snap) return;
  if (isRepairLock() || usePulse.getState().repairForced) return;
  if (s.seized) useRepairLive.setState({ snap: false });
  else useRepairLive.setState({ snap: false, missed: true });
}

export function seizeRepair(): boolean {
  try {
    assertRepairAllowed();
  } catch {
    briefRepair("Internal Affairs holds Repair. Seize frozen.");
    return false;
  }
  const s = useRepairLive.getState();
  if (!s.last || s.last.severity !== "snap") return false;
  if (s.seized) return false;
  tickRepairSnap();
  const live = useRepairLive.getState();
  if (!live.snap || !isRepairLock()) {
    useRepairLive.setState({ snap: false, missed: true });
    briefRepair("Repair SNAP missed. You wait for the next upgrade.");
    return false;
  }
  useRepairLive.setState({ seized: true });
  usePulse.getState().onSeize(emptyRace());
  void broadcastPulse();
  void broadcastStanding();
  const run = live.last;
  briefRepair(
    run?.patch
      ? `Repair #${run.number} seized. Patch is yours — miss the copy and you still hold the lock.`
      : `Repair #${run?.number ?? ""} seized. This lock is the upgrade.`,
  );
  return true;
}

export function readWire(): WireSnapshot {
  const hub = useHub.getState();
  const native = probeNative();
  const os = learnedCount(useProgress.getState().learned);
  const affairs = useAffairs.getState();
  const holds = (Object.keys(affairs.held) as Array<keyof typeof affairs.held>).some((k) => affairs.held[k]);
  const ia = holds ? "hold" : affairs.findings.length ? deckVerdict(affairs.findings) : "armed";
  const repair = useRepairLive.getState();
  const live = useLiveLead.getState();
  const pubkey = useIdentity.getState().pubkey;
  const mine = rowsFor(live).find((r) => r.pubkey === pubkey);
  const pulse = usePulse.getState();
  return {
    hub: hub.live,
    native: native.score,
    os,
    ia,
    repair: repair.open,
    repairSnap: repair.snap,
    repairSeized: repair.seized,
    repairMissed: repair.missed,
    boardPlace: mine?.place ?? 0,
    snap: pulse.lastPhase === "snap",
    severity: pulse.lastSeverity,
    lock: pulse.lastSeverity === "snap" || pulse.repairForced,
    curve: useIdentity.getState().curve ?? "",
  };
}

export function startWire() {
  void hydrateRepair();
}

export function resetRepairLive() {
  useRepairLive.setState({
    snap: false,
    missed: false,
    seized: false,
    wantPanel: false,
    last: null,
  });
}
