import type { Expert, ExpertInput, ExpertOutput } from "../types.js";

/**
 * IntegrityExpert
 * Scores a caller-supplied optical status string.
 * This function does not open an optical channel, call integrity-pulse, or create an air gap.
 */
export const integrityExpert: Expert = {
  name: "integrity",

  async evaluate(input: ExpertInput): Promise<ExpertOutput> {
    const reasons: string[] = [];
    let score = 0.65; // baseline when no signal

    const status = (input.opticalStatus || "").toLowerCase();

    if (status === "verified" || status === "secure" || status === "passed") {
      score = 0.96;
      reasons.push("Caller supplied a passing optical status. This expert did not open an air gap.");
    } else if (status === "failed" || status === "critical" || status === "compromised") {
      score = 0.12;
      reasons.push("Caller supplied a failed optical status. This expert did not open an air gap.");
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
        airGap: false,
      },
      timestamp: new Date().toISOString(),
    };
  },
};
