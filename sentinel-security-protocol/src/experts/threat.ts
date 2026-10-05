import type { Expert, ExpertInput, ExpertOutput } from "../types.js";

/**
 * Hydra child-protection rule. It lives in this threat expert.
 * Defense only: block the signaled case. No search, contact, or harm method.
 * No description is stored. No notice is sent.
 */
export type ChildProtectionRule = {
  place: "native-security-stack";
  name: "hydra-child-protection";
  blocked: boolean;
  search: false;
  contact: false;
  harm: false;
  noticeSent: false;
  descriptionStored: false;
};

export function childProtectionRule(signaled: boolean | undefined): ChildProtectionRule {
  return {
    place: "native-security-stack",
    name: "hydra-child-protection",
    blocked: signaled === true,
    search: false,
    contact: false,
    harm: false,
    noticeSent: false,
    descriptionStored: false,
  };
}

/**
 * ThreatExpert
 * Lightweight native behavioral and contextual rules.
 * Can later host an on-device model while remaining fully local.
 */
export const threatExpert: Expert = {
  name: "threat",

  async evaluate(input: ExpertInput): Promise<ExpertOutput> {
    const reasons: string[] = [];
    const childProtection = childProtectionRule(input.childSexualExploitation);
    if (childProtection.blocked) {
      return {
        expert: "threat",
        score: 0,
        level: "unknown",
        reasons: ["Child sexual exploitation is blocked. No notice was sent."],
        evidence: {
          opticalStatus: input.opticalStatus ?? null,
          handlePresent: Boolean(input.handle && input.handle.length >= 2),
          eventCount: Array.isArray(input.localEvents) ? input.localEvents.length : 0,
          childProtection,
        },
        timestamp: new Date().toISOString(),
      };
    }

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
        childProtection,
      },
      timestamp: new Date().toISOString(),
    };
  },
};
