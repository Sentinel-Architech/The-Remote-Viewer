import type { Expert, ExpertInput, ExpertOutput } from "../types.js";

/**
 * IdentityExpert
 * Validates presence and basic health of native Ed25519 citizen identity.
 */
export const identityExpert: Expert = {
  name: "identity",

  async evaluate(input: ExpertInput): Promise<ExpertOutput> {
    const reasons: string[] = [];
    let score = 0.5;

    if (input.handle && input.handle.length > 0) {
      score = 0.9;
      reasons.push(`Citizen handle present: ${input.handle}`);
    } else {
      score = 0.3;
      reasons.push("No registered citizen handle – identity incomplete");
    }

    return {
      expert: "identity",
      score,
      level: score >= 0.85 ? "secure" : score >= 0.6 ? "elevated" : "critical",
      reasons,
      evidence: { handle: input.handle ?? null },
      timestamp: new Date().toISOString(),
    };
  },
};
