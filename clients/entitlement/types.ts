export type AccessPath = "free" | "yearly" | "node";

export type EntitlementView = {
  path: AccessPath;
  unlimitedComms: boolean;
  expiresAt: number | null;
  signalPolicy: "weak" | "full";
  source: "chain" | "unknown";
  /** Human line for UI — never claim chain if source unknown */
  summary: string;
};

export function viewFromFlags(opts: {
  hasActiveSub: boolean;
  subExpiresAt: number | null;
  hasActiveNode: boolean;
  chainReadable: boolean;
}): EntitlementView {
  if (!opts.chainReadable) {
    return {
      path: "free",
      unlimitedComms: false,
      expiresAt: null,
      signalPolicy: "weak",
      source: "unknown",
      summary: "Chain not connected — policy paths only",
    };
  }
  if (opts.hasActiveNode) {
    return {
      path: "node",
      unlimitedComms: true,
      expiresAt: null,
      signalPolicy: "full",
      source: "chain",
      summary: "Permanent node active — unlimited human comms",
    };
  }
  if (opts.hasActiveSub) {
    return {
      path: "yearly",
      unlimitedComms: true,
      expiresAt: opts.subExpiresAt,
      signalPolicy: "full",
      source: "chain",
      summary: "Yearly network active — unlimited human comms",
    };
  }
  return {
    path: "free",
    unlimitedComms: false,
    expiresAt: null,
    signalPolicy: "weak",
    source: "chain",
    summary: "Free path — weaker signal",
  };
}
