/**
 * Recursive expert loop — optical event hooks (schema → typed events).
 * Policy updates stay Vault-local; wiped on Destroy = Restart.
 *
 * Phase 3: ONE measurable adaptive rule (not a full policy engine).
 * Runs anywhere Node/TS runs — not GrapheneOS-only.
 */

export type ExpertId = "security" | "protocol" | "privacy" | "coordinator";

export interface OpticalMetrics {
  symbolsIngested: number;
  symbolsUnique: number;
  recoverRatio: number; // 0..1
  crcFailures: number;
  gateRejections: number;
  framesPerSecond?: number;
  complete: boolean;
  ts: number;
}

export interface LoopEvent {
  type: "optical.metrics" | "optical.complete" | "optical.failure";
  metrics: OpticalMetrics;
  note?: string;
}

/** Structured reaction from the single adaptive rule. */
export type AdaptiveAction =
  | { kind: "none"; note: string }
  | { kind: "lower_fps"; note: string; suggestFps: number }
  | { kind: "check_optics"; note: string }
  | { kind: "send_more"; note: string }
  | { kind: "complete"; note: string };

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

/**
 * Phase 3 — ONE adaptive rule (IA-of-IA minimal).
 *
 * Priority:
 * 1. complete → destroy residual buffers
 * 2. high CRC → lower FPS suggestion
 * 3. high gate rejects → optics check
 * 4. slow peel → send more symbols
 * 5. else nominal
 *
 * Portable: pure function, no OS assumptions.
 */
export function decideOpticalAction(m: OpticalMetrics): AdaptiveAction {
  if (m.complete) {
    return {
      kind: "complete",
      note: "optical transfer complete; prefer Destroy residual buffers",
    };
  }
  if (m.crcFailures > 10) {
    const current = m.framesPerSecond ?? 4;
    const suggestFps = Math.max(1, Math.floor(current / 2));
    return {
      kind: "lower_fps",
      note: `high CRC loss (${m.crcFailures}); lower FPS or improve lighting`,
      suggestFps,
    };
  }
  if (m.gateRejections > 50) {
    return {
      kind: "check_optics",
      note: `quality gate strict (${m.gateRejections} rejects); check focus/contrast/distance`,
    };
  }
  if (m.recoverRatio > 0 && m.recoverRatio < 0.3) {
    return {
      kind: "send_more",
      note: `peel slow (recover=${m.recoverRatio.toFixed(2)}); send more symbols`,
    };
  }
  return { kind: "none", note: "optical path nominal" };
}

/** Back-compat note string for UIs that only show text. */
export function defaultCoordinatorNote(m: OpticalMetrics): string {
  return decideOpticalAction(m).note;
}
