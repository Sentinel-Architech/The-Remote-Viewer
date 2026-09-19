/**
 * Sentinel Security Protocol
 * Exclusive systemwide security layer for The Remote Viewer network.
 * Backbone: native Mixture of Experts (MoE).
 * 100% native stack – fully operational offline.
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

/**
 * Evaluate security posture systemwide.
 * This is the single entry point used by Hub, Command Deck, and nodes.
 */
export async function evaluateSecurity(
  input: ExpertInput = {}
): Promise<SecurityDecision> {
  return runMoE(EXPERTS, {
    ...input,
    timestamp: input.timestamp ?? new Date().toISOString(),
  });
}

/**
 * Convenience: enforce decision (example policy application).
 * Real enforcement hooks into Hub routes, Command Deck, and mesh later.
 */
export function enforce(decision: SecurityDecision): {
  allowed: boolean;
  action: string;
} {
  switch (decision.recommendation) {
    case "allow":
      return { allowed: true, action: "proceed" };
    case "monitor":
      return { allowed: true, action: "proceed-with-monitoring" };
    case "restrict":
      return { allowed: false, action: "restrict-privileges" };
    case "isolate":
    default:
      return { allowed: false, action: "isolate-node" };
  }
}

export * from "./types.js";
export { runMoE } from "./router.js";
