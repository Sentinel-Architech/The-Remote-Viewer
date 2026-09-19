import type { Expert, ExpertInput, ExpertOutput } from "../types.js";

/**
 * ThreatExpert
 * Lightweight native behavioral and contextual rules.
 * Can later host an on-device model while remaining fully local.
 */
export const threatExpert: Expert = {
  name: "threat",

  async evaluate(input: ExpertInput): Promise<ExpertOutput> {
    const reasons: string[] = [];
    let score = 0.84;

    const optical = (input.opticalStatus || "").toLowerCase();
    if (optical === "failed" || optical === "critical" || optical === "compromised") {
      score -= 0.35;
      reasons.push("Optical integrity failure raises threat posture");
    } else if (optical === "verified" || optical === "secure") {
      score += 0.06;
      reasons.push("Verified optical path lowers threat estimate");
    }

    if (!input.handle || input.handle.trim().length < 2) {
      score -= 0.12;
      reasons.push("Missing or weak identity increases residual risk");
    } else {
      reasons.push("Identity present – residual risk reduced");
    }

    const events = Array.isArray(input.localEvents) ? input.localEvents : [];
    if (events.length > 25) {
      score -= 0.15;
      reasons.push("Elevated local event volume contributes to threat score");
    }

    score = Math.max(0, Math.min(1, score));

    const level =
      score >= 0.85 ? "secure" : score >= 0.6 ? "elevated" : score >= 0.3 ? "critical" : "unknown";

    return {
      expert: "threat",
      score,
      level,
      reasons,
      evidence: {
        opticalStatus: input.opticalStatus ?? null,
        handlePresent: Boolean(input.handle && input.handle.length >= 2),
        eventCount: events.length,
      },
      timestamp: new Date().toISOString(),
    };
  },
};
