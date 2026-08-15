export type AccessPath = "free" | "yearly" | "node";

export type EntitlementView = {
  path: AccessPath;
  unlimitedComms: boolean;
  expiresAt: number | null; // unix seconds; null if node-based
  signalPolicy: "weak" | "full";
  source: "chain" | "unknown";
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
    };
  }
  if (opts.hasActiveNode) {
    return {
      path: "node",
      unlimitedComms: true,
      expiresAt: null,
      signalPolicy: "full",
      source: "chain",
    };
  }
  if (opts.hasActiveSub) {
    return {
      path: "yearly",
      unlimitedComms: true,
      expiresAt: opts.subExpiresAt,
      signalPolicy: "full",
      source: "chain",
    };
  }
  return {
    path: "free",
    unlimitedComms: false,
    expiresAt: null,
    signalPolicy: "weak",
    source: "chain",
  };
}
