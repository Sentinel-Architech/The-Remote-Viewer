/**
 * Sentinel Auto-Update Module
 *
 * Design intent: The Sentinel keeps GitHub and The Remote Viewer
 * continuously updated in open source so the system stays ahead.
 *
 * 100% native principles:
 * - No closed-source update servers
 * - Updates are open, auditable, and reversible
 * - Individual nodes retain the right to stay on a pinned version
 * - Enhanced / whole-network mode can coordinate update signals
 *
 * This module defines the policy and hooks. Actual GitHub Actions /
 * release automation lives in .github/workflows and can call into these rules.
 */

export type UpdateChannel = "stable" | "enhanced" | "edge";

export interface UpdatePolicy {
  /** Whether automatic open-source updates are enabled */
  autoUpdateEnabled: boolean;
  /** Preferred channel */
  channel: UpdateChannel;
  /** Individual nodes may always pin and refuse automatic application */
  individualOverrideAllowed: true;
  /** Updates must remain fully open source and auditable */
  openSourceOnly: true;
  /** Sentinel Security Protocol itself is included in the update surface */
  includeSecurityProtocol: true;
}

export const DEFAULT_UPDATE_POLICY: UpdatePolicy = {
  autoUpdateEnabled: true,
  channel: "stable",
  individualOverrideAllowed: true,
  openSourceOnly: true,
  includeSecurityProtocol: true,
};

/**
 * Evaluate whether an update should be applied under the current mode.
 * Individual mode prioritizes local sovereignty; enhanced mode may
 * surface stronger recommendations while still respecting local override.
 */
export function shouldApplyUpdate(params: {
  policy: UpdatePolicy;
  mode: "individual" | "enhanced" | "whole-network";
  currentVersion: string;
  candidateVersion: string;
  securityDecisionLevel: "secure" | "elevated" | "critical" | "unknown";
}): { apply: boolean; reason: string } {
  const { policy, mode, securityDecisionLevel } = params;

  if (!policy.autoUpdateEnabled) {
    return { apply: false, reason: "Auto-update disabled by policy" };
  }

  if (securityDecisionLevel === "critical") {
    return {
      apply: false,
      reason: "Security level critical – updates paused until posture improves",
    };
  }

  // Individual mode always allows the citizen to refuse
  if (mode === "individual") {
    return {
      apply: true,
      reason: "Update available – individual may accept or pin",
    };
  }

  // Enhanced / whole-network: stronger recommendation but still non-coercive
  return {
    apply: true,
    reason: "Update recommended for enhanced/whole-network posture – local override remains available",
  };
}

/**
 * Describe the open-source continuity guarantee.
 */
export function getContinuityStatement(): string {
  return (
    "The Sentinel is designed to auto-update GitHub and The Remote Viewer " +
    "in open source at all times so the system stays ahead. " +
    "All updates remain auditable, reversible, and subject to individual override."
  );
}
