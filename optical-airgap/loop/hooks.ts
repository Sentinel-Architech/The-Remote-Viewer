/**
 * Recursive expert loop — optical event hooks (schema → typed events).
 * Policy updates stay Vault-local; wiped on Destroy = Restart.
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

/** Example coordinator policy stub — replace with on-device IA-of-IA. */
export function defaultCoordinatorNote(m: OpticalMetrics): string {
  if (m.complete) return "optical transfer complete; prefer Destroy residual buffers";
  if (m.crcFailures > 10) return "high CRC loss; lower FPS or improve lighting";
  if (m.gateRejections > 50) return "quality gate strict; check focus/contrast";
  if (m.recoverRatio > 0 && m.recoverRatio < 0.3) return "peel slow; send more symbols";
  return "optical path nominal";
}
