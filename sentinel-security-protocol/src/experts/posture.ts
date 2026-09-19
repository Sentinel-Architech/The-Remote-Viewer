import type { Expert, ExpertInput, ExpertOutput } from "../types.js";

/**
 * PostureExpert
 * Evaluates node / citizen posture using native signals only.
 * Supports both individual and enhanced modes.
 */
export const postureExpert: Expert = {
  name: "posture",

  async evaluate(input: ExpertInput): Promise<ExpertOutput> {
    const reasons: string[] = [];
    let score = 0.7;

    // Presence of a stable node or handle improves posture
    if (input.nodeId || (input.handle && input.handle.length >= 2)) {
      score += 0.12;
      reasons.push("Stable identity/node signal present");
    } else {
      reasons.push("No stable node or handle – baseline posture");
    }

    // Optical status influences posture
    const optical = (input.opticalStatus || "").toLowerCase();
    if (optical === "verified" || optical === "secure") {
      score += 0.1;
      reasons.push("Optical air-gap contributes positively to posture");
    } else if (optical === "failed" || optical === "critical") {
      score -= 0.25;
      reasons.push("Optical failure degrades posture");
    }

    score = Math.max(0, Math.min(1, score));

    const level =
      score >= 0.85 ? "secure" : score >= 0.6 ? "elevated" : score >= 0.3 ? "critical" : "unknown";

    return {
      expert: "posture",
      score,
      level,
      reasons,
      evidence: {
        nodeId: input.nodeId ?? null,
        handle: input.handle ?? null,
        opticalStatus: input.opticalStatus ?? null,
      },
      timestamp: new Date().toISOString(),
    };
  },
};
