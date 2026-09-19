/**
 * Native Mixture-of-Experts Router
 * Aggregates expert outputs into a single systemwide SecurityDecision.
 * Fully local, deterministic, no external inference required.
 */

import type { Expert, ExpertInput, ExpertOutput, SecurityDecision, SecurityLevel } from "./types.js";

function levelFromScore(score: number): SecurityLevel {
  if (score >= 0.85) return "secure";
  if (score >= 0.6) return "elevated";
  if (score >= 0.3) return "critical";
  return "unknown";
}

function recommendationFromLevel(level: SecurityLevel): SecurityDecision["recommendation"] {
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

/** Default weights – integrity & identity carry highest trust */
const DEFAULT_WEIGHTS: Record<string, number> = {
  integrity: 0.25,
  identity: 0.25,
  posture: 0.2,
  network: 0.15,
  threat: 0.15,
};

export async function runMoE(
  experts: Expert[],
  input: ExpertInput,
  weights: Record<string, number> = DEFAULT_WEIGHTS
): Promise<SecurityDecision> {
  const outputs: ExpertOutput[] = await Promise.all(
    experts.map((e) => e.evaluate(input))
  );

  let weightedSum = 0;
  let totalWeight = 0;

  for (const out of outputs) {
    const w = weights[out.expert] ?? 0.1;
    weightedSum += out.score * w;
    totalWeight += w;
  }

  const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const overallLevel = levelFromScore(overallScore);

  return {
    overallScore,
    overallLevel,
    expertOutputs: outputs,
    recommendation: recommendationFromLevel(overallLevel),
    systemwide: true,
    nativeStack: true,
    generatedAt: new Date().toISOString(),
  };
}
