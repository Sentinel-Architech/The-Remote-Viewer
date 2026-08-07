/**
 * Recursive expert loop — optical event hooks + feedback controller.
 * Policy/state stay Vault-local; wiped on Destroy = Restart.
 *
 * Phase 3: ONE measurable adaptive control loop (not a full policy engine).
 * Hysteresis bands + sample debounce. Portable to all open-stack hosts.
 */

export type ExpertId = "security" | "protocol" | "privacy" | "coordinator";

export interface OpticalMetrics {
  symbolsIngested: number;
  symbolsUnique: number;
  recoverRatio: number; // 0..1
  crcFailures: number;
  gateRejections: number;
  /** Scan/gate attempts — used for gateRejectRate. */
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
 * Hysteresis + debounce state for the optical control loop.
 * Vault-local only; never commit; Destroy = Restart wipes it.
 */
export interface OpticalControlState {
  /** Committed action (sticky until exit band + debounce). */
  active: ActionKind;
  /** Candidate not yet committed. */
  pending: ActionKind;
  /** Consecutive samples agreeing on pending. */
  pendingCount: number;
  suggestFps?: number;
  updatedAt: number;
}

/** Samples that must agree before a state change commits (~3 × 250ms scan). */
export const DEBOUNCE_SAMPLES = 3;

export function initialControlState(ts = Date.now()): OpticalControlState {
  return {
    active: "none",
    pending: "none",
    pendingCount: 0,
    updatedAt: ts,
  };
}

/** Enter / exit bands — rates unless noted. */
export const BANDS = {
  crcEnter: 0.05,
  crcExit: 0.02,
  gateEnter: 0.4,
  gateExit: 0.15,
  peelEnter: 0.3,
  peelExit: 0.5,
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
  return m.crcFailures / Math.max(m.symbolsIngested, 1);
}

function gateRejectRate(m: OpticalMetrics): number {
  return m.gateRejections / Math.max(m.scanAttempts ?? m.gateRejections, 1);
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
 * Desired action from metrics + hysteresis bands (no debounce yet).
 * Priority: complete > CRC > gate > peel > none.
 */
function candidateAction(
  m: OpticalMetrics,
  active: ActionKind
): ActionKind {
  if (m.complete) return "complete";

  const crc = crcRate(m);
  const gate = gateRejectRate(m);
  const crcHot = crc > BANDS.crcEnter;
  const gateHot = gate > BANDS.gateEnter;
  const peelHot =
    m.symbolsIngested >= BANDS.peelMinSymbols &&
    m.recoverRatio > 0 &&
    m.recoverRatio < BANDS.peelEnter;
  const crcClear = crc < BANDS.crcExit;
  const gateClear = gate < BANDS.gateExit;
  const peelClear = m.recoverRatio >= BANDS.peelExit;

  if (crcHot) return "lower_fps";
  if (gateHot && active !== "lower_fps") return "check_optics";
  if (peelHot && active === "none") return "send_more";

  switch (active) {
    case "lower_fps":
      if (crcClear) return gateHot ? "check_optics" : peelHot ? "send_more" : "none";
      return "lower_fps";
    case "check_optics":
      if (gateClear) return peelHot ? "send_more" : "none";
      return "check_optics";
    case "send_more":
      if (peelClear) return "none";
      return "send_more";
    case "complete":
      return "none";
    default:
      return "none";
  }
}

/**
 * Closed-loop optical controller: hysteresis + sample debounce.
 *
 * A new action commits only after DEBOUNCE_SAMPLES consecutive
 * samples agree on the candidate. `complete` commits immediately.
 */
export function decideOpticalAction(
  m: OpticalMetrics,
  state: OpticalControlState = initialControlState(m.ts)
): { action: AdaptiveAction; state: OpticalControlState } {
  const ts = m.ts || Date.now();
  const desired = candidateAction(m, state.active);

  // Terminal success: no debounce.
  if (desired === "complete") {
    const action = actionFromKind("complete", m, state);
    return {
      action,
      state: {
        active: "complete",
        pending: "complete",
        pendingCount: 0,
        updatedAt: ts,
        suggestFps: state.suggestFps,
      },
    };
  }

  let active = state.active;
  let pending = state.pending;
  let pendingCount = state.pendingCount;

  if (desired === active) {
    // Stable on committed action — clear pending.
    pending = active;
    pendingCount = 0;
  } else if (desired === pending) {
    pendingCount += 1;
    if (pendingCount >= DEBOUNCE_SAMPLES) {
      active = pending;
      pendingCount = 0;
    }
  } else {
    // New candidate — restart debounce counter.
    pending = desired;
    pendingCount = 1;
    if (DEBOUNCE_SAMPLES <= 1) {
      active = pending;
      pendingCount = 0;
    }
  }

  const action = actionFromKind(active, m, state);
  const newState: OpticalControlState = {
    active,
    pending,
    pendingCount,
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
