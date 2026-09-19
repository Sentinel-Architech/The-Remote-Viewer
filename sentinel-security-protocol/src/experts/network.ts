import type { Expert, ExpertInput, ExpertOutput } from "../types.js";

export const networkExpert: Expert = {
  name: "network",

  async evaluate(input: ExpertInput): Promise<ExpertOutput> {
    const reasons: string[] = [];
    let score = 0.75;

    if (input.localEvents && Array.isArray(input.localEvents) && input.localEvents.length > 10) {
      score = 0.55;
      reasons.push("Elevated local event volume detected");
    } else {
      reasons.push("Network event volume within normal bounds");
    }

    return {
      expert: "network",
      score,
      level: score >= 0.85 ? "secure" : score >= 0.6 ? "elevated" : "critical",
      reasons,
      evidence: { eventCount: input.localEvents?.length ?? 0 },
      timestamp: new Date().toISOString(),
    };
  },
};
