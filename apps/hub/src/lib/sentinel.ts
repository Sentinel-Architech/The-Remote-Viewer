/**
 * Hub ↔ Sentinel Security Protocol bridge
 * 100% native. Dual-mode. No external services required.
 */

export type OperatingMode = "individual" | "enhanced" | "whole-network";

export interface SecurityDecision {
  overallScore: number;
  overallLevel: "secure" | "elevated" | "critical" | "unknown";
  recommendation: "allow" | "monitor" | "restrict" | "isolate";
  systemwide: true;
  nativeStack: true;
  generatedAt: string;
  expertSummary?: string[];
}

export interface EnforcementResult {
  allowed: boolean;
  action: string;
  mode: OperatingMode;
  localOverrideAvailable: boolean;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function levelFromScore(score: number): SecurityDecision["overallLevel"] {
  if (score >= 0.85) return "secure";
  if (score >= 0.6) return "elevated";
  if (score >= 0.3) return "critical";
  return "unknown";
}

function recommendationFromLevel(
  level: SecurityDecision["overallLevel"]
): SecurityDecision["recommendation"] {
  switch (level) {
    case "secure":
      return "allow";
    case "elevated":
      return "monitor";
    case "critical":
      return "restrict";
    default:
      return "isolate";
  }
}

/**
 * Evaluate security using the same signals the MoE experts consume.
 */
export async function evaluateHubSecurity(params: {
  handle?: string | null;
  opticalStatus?: string | null;
  mode?: OperatingMode;
  localEventCount?: number;
}): Promise<SecurityDecision> {
  const mode = params.mode ?? "individual";
  const handle = (params.handle ?? "").trim();
  const optical = (params.opticalStatus || "").toLowerCase();
  const eventCount = Math.max(0, params.localEventCount ?? 0);

  let integrity = 0.65;
  if (optical === "verified" || optical === "secure" || optical === "passed") {
    integrity = 0.96;
  } else if (
    optical === "failed" ||
    optical === "critical" ||
    optical === "compromised"
  ) {
    integrity = 0.12;
  }

  const identity = handle.length >= 2 ? 0.91 : 0.3;

  let posture = 0.7;
  if (handle.length >= 2) posture += 0.12;
  if (optical === "verified" || optical === "secure") posture += 0.1;
  if (optical === "failed" || optical === "critical") posture -= 0.25;
  posture = clamp(posture);

  let network = 0.78;
  if (eventCount > 20) network = 0.38;
  else if (eventCount > 5) network = 0.62;
  else if (eventCount === 0) network = 0.82;

  let threat = 0.84;
  if (optical === "failed" || optical === "critical") threat -= 0.35;
  if (handle.length < 2) threat -= 0.12;
  if (eventCount > 25) threat -= 0.15;
  threat = clamp(threat);

  const weights = {
    integrity: 0.25,
    identity: 0.25,
    posture: 0.2,
    network: 0.15,
    threat: 0.15,
  };

  const overallScore = clamp(
    integrity * weights.integrity +
      identity * weights.identity +
      posture * weights.posture +
      network * weights.network +
      threat * weights.threat
  );

  const overallLevel = levelFromScore(overallScore);

  return {
    overallScore,
    overallLevel,
    recommendation: recommendationFromLevel(overallLevel),
    systemwide: true,
    nativeStack: true,
    generatedAt: new Date().toISOString(),
    expertSummary: [
      `integrity=${integrity.toFixed(2)}`,
      `identity=${identity.toFixed(2)}`,
      `posture=${posture.toFixed(2)}`,
      `network=${network.toFixed(2)}`,
      `threat=${threat.toFixed(2)}`,
      `mode=${mode}`,
    ],
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
