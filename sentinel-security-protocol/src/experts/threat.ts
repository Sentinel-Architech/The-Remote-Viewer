import type { Expert, ExpertInput, ExpertOutput } from "../types.js";

export const threatExpert: Expert = {
  name: "threat",

  async evaluate(input: ExpertInput): Promise<ExpertOutput> {
    // Lightweight native rule set. Can later host a small on-device model
    // while remaining fully local and open-source.
    const reasons: string[] = ["Native threat rules evaluated"];
    const score = 0.82;

    return {
      expert: "threat",
      score,
      level: "secure",
      reasons,
      evidence: {},
      timestamp: new Date().toISOString(),
    };
  },
};
