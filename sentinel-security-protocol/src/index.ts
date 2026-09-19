/**
 * Sentinel Security Protocol
 * Exclusive security backbone for The Remote Viewer.
 *
 * Dual-mode: individual sovereignty + enhanced/whole-network protection.
 * Continuous open-source advancement built in.
 * 100% native stack. Fully operational offline.
 */

import { runMoE } from "./router.js";
import { ALL_EXPERTS } from "./experts/index.js";
import type { ExpertInput, SecurityDecision } from "./types.js";

export type OperatingMode = "individual" | "enhanced" | "whole-network";

export interface EvaluateOptions extends ExpertInput {
  mode?: OperatingMode;
}

/**
 * Primary evaluation entry point.
 * Defaults to individual mode so a single citizen remains fully sovereign.
 */
export async function evaluateSecurity(
  input: EvaluateOptions = {}
): Promise<SecurityDecision> {
  const mode = input.mode ?? "individual";

  const decision = await runMoE(ALL_EXPERTS, {
    ...input,
    timestamp: input.timestamp ?? new Date().toISOString(),
  });

  return {
    ...decision,
    expertOutputs: decision.expertOutputs.map((o) => ({
      ...o,
      evidence: { ...o.evidence, operatingMode: mode },
    })),
  };
}

/**
 * Enforcement helper – local override capability is never removed.
 */
export function enforce(
  decision: SecurityDecision,
  mode: OperatingMode = "individual"
): { allowed: boolean; action: string; mode: OperatingMode } {
  switch (decision.recommendation) {
    case "allow":
      return { allowed: true, action: "proceed", mode };
    case "monitor":
      return { allowed: true, action: "proceed-with-monitoring", mode };
    case "restrict":
      return {
        allowed: mode === "individual",
        action: mode === "individual" ? "local-restrict" : "network-restrict",
        mode,
      };
    case "isolate":
    default:
      return {
        allowed: false,
        action: mode === "individual" ? "local-isolate" : "network-isolate",
        mode,
      };
  }
}

export * from "./types.js";
export { runMoE } from "./router.js";
export { ALL_EXPERTS } from "./experts/index.js";
export * from "./auto-update.js";
export { applyEnforcement, toPolicy } from "./enforcement.js";
