/**
 * Recursive expert loop — optical event hooks + feedback controller.
 * Policy/state stay Vault-local; wiped on Destroy = Restart.
 *
 * Phase 3: ONE measurable adaptive control loop (not a full policy engine).
 * Runs anywhere Node/TS runs — not GrapheneOS-only.
 */

export type ExpertId = "security" | "protocol" | "privacy" | "coordinator";

export interface OpticalMetrics {
  symbolsIngested: number;
  symbolsUnique: number;
  recoverRatio: number; // 0..1
  crcFailures: number;
  gateRejections: number;
  /** Scan/gate attempts — used for gateRejectRate. Defaults handled in controller. */
  scanAttempts?: number;
  framesPerSecond?: number;
  complete: boolean;
  ts: number;
}

export interface LoopEvent {
  type: "optical.metrics" | "optical.complete" | "optical.failure";
  metrics: OpticalMetrics;
  note?: string;
}

/** Structured reaction from the adaptive controller. */
export type AdaptiveAction =
  | { kind: "none"; note: string }
  | { kind: "lower_fps"; note: string; suggestFps: number }
  | { kind: "check_optics"; note: string }
  | { kind: "send_more"; note: string }
  | { kind: "complete"; note: string };

export type ActionKind = AdaptiveAction["kind"];

/**
 * Hysteresis / hold state for the optical control loop.
 * Keep in Vault-local memory only; never commit; Destroy = Restart wipes it.
 */
export interface OpticalControlState {
  /** Action currently held (sticky until exit band). */
  active: ActionKind;
  /** Last suggestFps when active === lower_fps */
  suggestFps?: number;
  updatedAt: number;
}

export function initialControlState(ts = Date.now()): OpticalControlState {
  return { active: "none", updatedAt: ts };
}

/** Enter / exit bands — rates unless noted. */
export const BANDS = {
  /** CRC failures / max(ingested, 1) */
  crcEnter: 0.05,
  crcExit: 0.02,
  /** Gate rejects / max(scanAttempts, 1) */
  gateEnter: 0.4,
  gateExit: 0.15,
  /** recoverRatio (absolute, not rate) */
  peelEnter: 0.3,
  peelExit: 0.5,
  /** Minimum ingested before peel rule may fire */
  peelMinSymbols: 1,
} as const;

export type LoopListener = (ev: LoopEvent, expert: ExpertId) => void;

const listeners: LoopListener[] = [];

export function subscribeLoop(fn: LoopListener): () => void {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}

export function emitOpticalEvent(ev: LoopEvent): void {
  const experts: ExpertId[] = ["security", "protocol", "privacy", "coordinator"];
  for (const ex of experts) {
    for (const fn of listeners) {
      try {
        fn(ev, ex);
      } catch {
        /* expert faults must not break the path */
      }
    }
  }
}

function crcRate(m: OpticalMetrics): number {
  const den = Math.max(m.symbolsIngested, 1);
  return m.crcFailures / den;
}

function gateRejectRate(m: OpticalMetrics): number {
  const den = Math.max(m.scanAttempts ?? m.gateRejections, 1);
  return m.gateRejections / den;
}

function actionFromKind(
  kind: ActionKind,
  m: OpticalMetrics,
  prev?: OpticalControlState
): AdaptiveAction {
  switch (kind) {
    case "complete":
      return {
        kind: "complete",
        note: "optical transfer complete; prefer Destroy residual buffers",
      };
    case "lower_fps": {
      const current = m.framesPerSecond ?? prev?.suggestFps ?? 4;
      const suggestFps = Math.max(1, Math.floor(current / 2));
      return {
        kind: "lower_fps",
        note: `high CRC rate (${(crcRate(m) * 100).toFixed(1)}%); lower FPS or improve lighting`,
        suggestFps,
      };
    }
    case "check_optics":
      return {
        kind: "check_optics",
        note: `high gate reject rate (${(gateRejectRate(m) * 100).toFixed(0)}%); check focus/contrast/distance`,
      };
    case "send_more":
      return {
        kind: "send_more",
        note: `peel slow (recover=${m.recoverRatio.toFixed(2)}); send more symbols`,
      };
    default:
      return { kind: "none", note: "optical path nominal" };
  }
}

/**
 * Closed-loop optical controller with hysteresis.
 *
 * Priority when selecting a NEW action:
 *   complete > CRC > gate > slow peel > none
 *
 * While an action is active, it STAYS until its exit band clears
 * (or a higher-priority condition forces a change).
 */
export function decideOpticalAction(
  m: OpticalMetrics,
  state: OpticalControlState = initialControlState(m.ts)
): { action: AdaptiveAction; state: OpticalControlState } {
  const ts = m.ts || Date.now();
  const crc = crcRate(m);
  const gate = gateRejectRate(m);

  // Terminal success always wins.
  if (m.complete) {
    const action = actionFromKind("complete", m, state);
    return { action, state: { active: "complete", updatedAt: ts } };
  }

  // Higher-priority raw conditions (enter bands).
  const crcHot = crc > BANDS.crcEnter;
  const gateHot = gate > BANDS.gateEnter;
  const peelHot =
    m.symbolsIngested >= BANDS.peelMinSymbols &&
    m.recoverRatio > 0 &&
    m.recoverRatio < BANDS.peelEnter;

  // Exit bands (clear sticky action).
  const crcClear = crc < BANDS.crcExit;
  const gateClear = gate < BANDS.gateExit;
  const peelClear = m.recoverRatio >= BANDS.peelExit;

  let next: ActionKind = state.active;

  // Priority upgrade: hotter higher-priority condition can preempt.
  if (crcHot) {
    next = "lower_fps";
  } else if (gateHot && state.active !== "lower_fps") {
    next = "check_optics";
  } else if (peelHot && state.active === "none") {
    next = "send_more";
  } else {
    // Hysteresis hold / clear
    switch (state.active) {
      case "lower_fps":
        if (crcClear) next = gateHot ? "check_optics" : peelHot ? "send_more" : "none";
        break;
      case "check_optics":
        if (gateClear) next = peelHot ? "send_more" : "none";
        break;
      case "send_more":
        if (peelClear) next = "none";
        break;
      case "complete":
        next = "none";
        break;
      default:
        next = "none";
    }
  }

  const action = actionFromKind(next, m, state);
  const newState: OpticalControlState = {
    active: next,
    updatedAt: ts,
    suggestFps: action.kind === "lower_fps" ? action.suggestFps : state.suggestFps,
  };
  return { action, state: newState };
}

/** Back-compat note string for UIs that only show text. */
export function defaultCoordinatorNote(
  m: OpticalMetrics,
  state?: OpticalControlState
): string {
  return decideOpticalAction(m, state).action.note;
}
