import type { Expert, ExpertInput, ExpertOutput } from "../types.js";

/**
 * IntegrityExpert
 * Evaluates optical air-gap status and local integrity signals.
 * Fully native – no external calls required.
 */
export const integrityExpert: Expert = {
  name: "integrity",

  async evaluate(input: ExpertInput): Promise<ExpertOutput> {
    const reasons: string[] = [];
    let score = 0.7; // baseline when no data

    if (input.opticalStatus === "verified" || input.opticalStatus === "secure") {
      score = 0.95;
      reasons.push("Optical air-gap verification passed");
    } else if (input.opticalStatus === "failed" || input.opticalStatus === "critical") {
      score = 0.15;
      reasons.push("Optical air-gap verification failed");
    } else {
      reasons.push("Optical status unknown – default elevated posture");
    }

    return {
      expert: "integrity",
      score,
      level: score >= 0.85 ? "secure" : score >= 0.6 ? "elevated" : "critical",
      reasons,
      evidence: { opticalStatus: input.opticalStatus ?? null },
      timestamp: new Date().toISOString(),
    };
  },
};
