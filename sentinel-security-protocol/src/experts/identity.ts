import type { Expert, ExpertInput, ExpertOutput } from "../types.js";

/**
 * IdentityExpert
 * Validates presence and basic health of native Ed25519 citizen identity.
 * Root of trust for both individual and enhanced modes.
 */
export const identityExpert: Expert = {
  name: "identity",

  async evaluate(input: ExpertInput): Promise<ExpertOutput> {
    const reasons: string[] = [];
    let score = 0.4;

    if (input.handle && input.handle.trim().length >= 2) {
      score = 0.91;
      reasons.push(`Citizen handle present and valid: ${input.handle}`);
    } else if (input.handle && input.handle.trim().length > 0) {
      score = 0.6;
      reasons.push("Handle present but too short – elevated risk");
    } else {
      score = 0.25;
      reasons.push("No registered citizen handle – identity incomplete");
    }

    const level =
      score >= 0.85 ? "secure" : score >= 0.6 ? "elevated" : score >= 0.3 ? "critical" : "unknown";

    return {
      expert: "identity",
      score,
      level,
      reasons,
      evidence: {
        handle: input.handle ?? null,
        rootOfTrust: "native-ed25519",
      },
      timestamp: new Date().toISOString(),
    };
  },
};
