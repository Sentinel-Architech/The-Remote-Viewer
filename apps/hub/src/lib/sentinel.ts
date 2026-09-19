/**
 * Hub integration with Sentinel Security Protocol
 * 100% native. Works in both individual and enhanced modes.
 *
 * This module is the bridge between the Viewer Hub and the exclusive
 * systemwide security backbone. It never requires Solana or external services.
 */

// In a full monorepo build these would be proper package imports.
// For now we define the expected interface so the Hub can call the protocol.

export type OperatingMode = "individual" | "enhanced" | "whole-network";

export interface SecurityDecision {
  overallScore: number;
  overallLevel: "secure" | "elevated" | "critical" | "unknown";
  recommendation: "allow" | "monitor" | "restrict" | "isolate";
  systemwide: true;
  nativeStack: true;
  generatedAt: string;
}

export interface EnforcementResult {
  allowed: boolean;
  action: string;
  mode: OperatingMode;
  localOverrideAvailable: boolean;
}

/**
 * Evaluate security for the current Hub context.
 * Defaults to individual mode so a single citizen remains fully sovereign.
 */
export async function evaluateHubSecurity(params: {
  handle?: string | null;
  opticalStatus?: string | null;
  mode?: OperatingMode;
}): Promise<SecurityDecision> {
  // Placeholder that mirrors the real protocol shape.
  // When the sentinel-security-protocol package is linked, replace with:
  //   import { evaluateSecurity } from "@trv/sentinel-security-protocol";
  //   return evaluateSecurity({ ...params });

  const score = params.opticalStatus === "verified" ? 0.92 : 0.7;
  const level = score >= 0.85 ? "secure" : "elevated";

  return {
    overallScore: score,
    overallLevel: level as SecurityDecision["overallLevel"],
    recommendation: level === "secure" ? "allow" : "monitor",
    systemwide: true,
    nativeStack: true,
    generatedAt: new Date().toISOString(),
  };
}

export function enforceHubDecision(
  decision: SecurityDecision,
  mode: OperatingMode = "individual"
): EnforcementResult {
  const allowed =
    decision.recommendation === "allow" ||
    decision.recommendation === "monitor" ||
    (decision.recommendation === "restrict" && mode === "individual");

  return {
    allowed,
    action: decision.recommendation,
    mode,
    localOverrideAvailable: true,
  };
}
