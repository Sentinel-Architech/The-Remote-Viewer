/**
 * Enforcement layer for Sentinel Security Protocol
 * Supports both individual sovereignty and enhanced/whole-network modes.
 * 100% native. No external dependencies.
 */

import type { SecurityDecision } from "./types.js";
import type { OperatingMode } from "./index.js";

export interface EnforcementResult {
  allowed: boolean;
  action: string;
  mode: OperatingMode;
  decision: SecurityDecision;
  localOverrideAvailable: boolean;
}

/**
 * Apply a security decision according to operating mode.
 * Individual mode always preserves local override capability.
 * Enhanced / whole-network mode may apply broader restrictions
 * while still documenting that local override remains possible.
 */
export function applyEnforcement(
  decision: SecurityDecision,
  mode: OperatingMode = "individual"
): EnforcementResult {
  const base = {
    decision,
    mode,
    localOverrideAvailable: true, // never removed – sovereignty preserved
  };

  switch (decision.recommendation) {
    case "allow":
      return {
        ...base,
        allowed: true,
        action: "proceed",
      };
    case "monitor":
      return {
        ...base,
        allowed: true,
        action: mode === "individual" ? "local-monitor" : "network-monitor",
      };
    case "restrict":
      return {
        ...base,
        allowed: mode === "individual", // individual retains more autonomy
        action: mode === "individual" ? "local-restrict" : "network-restrict",
      };
    case "isolate":
    default:
      return {
        ...base,
        allowed: false,
        action: mode === "individual" ? "local-isolate" : "network-isolate",
      };
  }
}

/**
 * Helper for Hub / Command Deck integration.
 * Returns a simple policy object that can be attached to requests or sessions.
 */
export function toPolicy(result: EnforcementResult) {
  return {
    allowed: result.allowed,
    action: result.action,
    mode: result.mode,
    score: result.decision.overallScore,
    level: result.decision.overallLevel,
    localOverrideAvailable: result.localOverrideAvailable,
    generatedAt: result.decision.generatedAt,
  };
}
