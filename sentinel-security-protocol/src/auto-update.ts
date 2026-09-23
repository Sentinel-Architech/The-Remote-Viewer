/**
 * Sentinel Auto-Update Module
 *
 * The Sentinel keeps GitHub and The Remote Viewer continuously updated
 * in open source so the system stays ahead.
 *
 * - No closed-source update servers
 * - Updates are open, auditable, and reversible
 * - Individual nodes may always pin and refuse
 * - Enhanced / whole-network may coordinate signals only
 */

export type UpdateChannel = "stable" | "enhanced" | "edge";

export interface UpdatePolicy {
  autoUpdateEnabled: boolean;
  channel: UpdateChannel;
  individualOverrideAllowed: true;
  openSourceOnly: true;
  includeSecurityProtocol: true;
}

export const DEFAULT_UPDATE_POLICY: UpdatePolicy = {
  autoUpdateEnabled: true,
  channel: "stable",
  individualOverrideAllowed: true,
  openSourceOnly: true,
  includeSecurityProtocol: true,
};

/** Simple semver-ish compare: returns positive if a > b */
export function compareVersions(a: string, b: string): number {
  const pa = a.replace(/^v/, "").split(".").map((x) => parseInt(x, 10) || 0);
  const pb = b.replace(/^v/, "").split(".").map((x) => parseInt(x, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da - db;
  }
  return 0;
}

export function shouldApplyUpdate(params: {
  policy: UpdatePolicy;
  mode: "individual" | "enhanced" | "whole-network";
  currentVersion: string;
  candidateVersion: string;
  securityDecisionLevel: "secure" | "elevated" | "critical" | "unknown";
}): { apply: boolean; reason: string } {
  const { policy, mode, securityDecisionLevel, currentVersion, candidateVersion } =
    params;

  if (!policy.autoUpdateEnabled) {
    return { apply: false, reason: "Auto-update disabled by policy" };
  }

  if (securityDecisionLevel === "critical") {
    return {
      apply: false,
      reason: "Security level critical – updates paused until posture improves",
    };
  }

  if (compareVersions(candidateVersion, currentVersion) <= 0) {
    return { apply: false, reason: "Candidate is not newer than current" };
  }

  if (mode === "individual") {
    return {
      apply: true,
      reason: "Update available – individual may accept or pin",
    };
  }

  return {
    apply: true,
    reason:
      "Update recommended for enhanced/whole-network posture – local override remains available",
  };
}

export function getContinuityStatement(): string {
  return (
    "The Sentinel is designed to auto-update GitHub and The Remote Viewer " +
    "in open source at all times so the system stays ahead. " +
    "All updates remain auditable, reversible, and subject to individual override."
  );
}
