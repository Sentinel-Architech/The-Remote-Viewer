import type { Expert, ExpertInput, ExpertOutput } from "../types.js";

/**
 * IntegrityExpert
 * Evaluates optical air-gap status and local integrity signals.
 * Highest-trust path remains the native optical air-gap.
 * Fully offline-capable.
 */
export const integrityExpert: Expert = {
  name: "integrity",

  async evaluate(input: ExpertInput): Promise<ExpertOutput> {
    const reasons: string[] = [];
    let score = 0.65; // baseline when no signal

    const status = (input.opticalStatus || "").toLowerCase();

    if (status === "verified" || status === "secure" || status === "passed") {
      score = 0.96;
      reasons.push("Optical air-gap verification passed – highest trust path");
    } else if (status === "failed" || status === "critical" || status === "compromised") {
      score = 0.12;
      reasons.push("Optical air-gap verification failed – integrity critical");
    } else if (status === "pending" || status === "running") {
      score = 0.55;
      reasons.push("Optical verification in progress");
    } else {
      reasons.push("Optical status unknown – default elevated posture applied");
    }

    const level =
      score >= 0.85 ? "secure" : score >= 0.6 ? "elevated" : score >= 0.3 ? "critical" : "unknown";

    return {
      expert: "integrity",
      score,
      level,
      reasons,
      evidence: {
        opticalStatus: input.opticalStatus ?? null,
        trustPath: "native-optical-airgap",
      },
      timestamp: new Date().toISOString(),
    };
  },
};
