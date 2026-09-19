/**
 * Sentinel Security Protocol
 * Exclusive security backbone for The Remote Viewer.
 *
 * Dual-mode by design:
 *   - Individual: fully sovereign, local MoE evaluation, ultimate local protection.
 *   - Enhanced / Whole-Network: same native experts run systemwide for collective strength.
 *
 * 100% native stack. Fully operational offline in both modes.
 */

import { runMoE } from "./router.js";
import { integrityExpert } from "./experts/integrity.js";
import { identityExpert } from "./experts/identity.js";
import { postureExpert } from "./experts/posture.js";
import { networkExpert } from "./experts/network.js";
import { threatExpert } from "./experts/threat.js";
import type { ExpertInput, SecurityDecision } from "./types.js";

const EXPERTS = [
  integrityExpert,
  identityExpert,
  postureExpert,
  networkExpert,
  threatExpert,
];

export type OperatingMode = "individual" | "enhanced" | "whole-network";

export interface EvaluateOptions extends ExpertInput {
  mode?: OperatingMode;
}

/**
 * Primary entry point.
 *
 * - mode = "individual" (default): local evaluation only. Full sovereignty.
 * - mode = "enhanced" | "whole-network": same experts, intended for multi-node signal aggregation.
 *
 * In all modes the MoE backbone remains native and the individual node retains local override capability.
 */
export async function evaluateSecurity(
  input: EvaluateOptions = {}
): Promise<SecurityDecision> {
  const mode = input.mode ?? "individual";

  const decision = await runMoE(EXPERTS, {
    ...input,
    timestamp: input.timestamp ?? new Date().toISOString(),
  });

  // Annotate decision with operating mode for downstream enforcement
  return {
    ...decision,
    // systemwide flag remains true as the protocol itself is the exclusive backbone;
    // mode indicates the scale at which it is currently being applied.
    expertOutputs: decision.expertOutputs.map((o) => ({
      ...o,
      evidence: { ...o.evidence, operatingMode: mode },
    })),
  };
}

/**
 * Enforcement helper.
 * Individual mode prioritizes local autonomy; enhanced mode may apply broader restrictions
 * while still allowing local override where policy permits.
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
