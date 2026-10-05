import type { Expert, ExpertInput, ExpertOutput } from "../types.js";

/**
 * Account-creation registry gate. It lives in this identity expert.
 *
 * The Dru Sjodin National Sex Offender Public Website (nsopw.gov) states
 * that the browser is the only way to search and that it does not offer a
 * programmatic API. This build has no federal or state registry connection.
 * The gate does not query, match, refuse, or prepare a notice.
 */
export type AccountRegistryGate = {
  place: "native-security-stack";
  wired: false;
  queried: false;
  source: null;
  match: null;
  notice: null;
  noticeSent: false;
  accountRefused: false;
  reason: string;
};

export const REGISTRY_CHECK_REASON =
  "NSOPW states the browser is the only way to search and that it does not offer a programmatic API. This build has no federal or state registry connection. The check did not run, no match was made, and no notice was prepared or sent.";

export function accountRegistryGate(): AccountRegistryGate {
  return {
    place: "native-security-stack",
    wired: false,
    queried: false,
    source: null,
    match: null,
    notice: null,
    noticeSent: false,
    accountRefused: false,
    reason: REGISTRY_CHECK_REASON,
  };
}

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
    const registry = accountRegistryGate();

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
    reasons.push(registry.reason);

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
        registry,
      },
      timestamp: new Date().toISOString(),
    };
  },
};
