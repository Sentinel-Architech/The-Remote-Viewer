import type { ViewerProfile, WatchStatus } from "./types";
import { isPaidTrialActive, isPaidTrialExpired, msUntil, shouldNagConvert } from "./trial";
import { SKILL_PAR, auditIsStale } from "./skill-audit";

export type RetentionTask = {
  id: string;
  title: string;
  body: string;
  to: string;
  urgency: "now" | "soon" | "later";
};

export function retentionTasks(profile: ViewerProfile | null, watch: WatchStatus | null): RetentionTask[] {
  if (!profile) return [];
  const out: RetentionTask[] = [];

  if (watch && !watch.claimed) {
    out.push({
      id: "watch",
      title: watch.defended ? "Claim today's watch" : "Stand daily watch",
      body: watch.defended
        ? `Duty ready — claim ${watch.nextCredits} TRV before UTC rolls.`
        : "Intercept on the neuron field, then claim. Missed days damage The Sentinel.",
      to: "/hub/neuron",
      urgency: "now",
    });
  }

  if (shouldNagConvert(profile)) {
    out.push({
      id: "convert",
      title: "Keep Verified before the clock hits zero",
      body: "Outside trial is 48 hours, one shot. Subscribe from Billing with native TRV — no ticket.",
      to: "/hub/billing",
      urgency: "now",
    });
  } else if (isPaidTrialExpired(profile)) {
    out.push({
      id: "expired",
      title: "Verified trial ended",
      body: "The node is back on Initiate. Methods stay behind handshake. Subscribe when you are ready — still self-serve.",
      to: "/hub/billing",
      urgency: "soon",
    });
  } else if (isPaidTrialActive(profile) && msUntil(profile.paidTrialUntil) > 12 * 60 * 60 * 1000) {
    out.push({
      id: "trial-use",
      title: "Use Verified while it is open",
      body: "Handshake the Gateway, set a portrait, and stand watch. The trial is the product, not a coupon.",
      to: "/hub/gateway",
      urgency: "soon",
    });
  }

  if (!profile.walletPubkey && !profile.phantomPubkey) {
    out.push({
      id: "wallet",
      title: "Seal a native wallet",
      body: "Ed25519 PIN on this device. Phantom optional. Self-serve DApp — nobody else holds the seed.",
      to: "/hub/billing",
      urgency: "soon",
    });
  }

  if (auditIsStale(profile.lastSkillAuditAt) || (profile.lastSkillAuditScore != null && profile.lastSkillAuditScore < SKILL_PAR)) {
    out.push({
      id: "audit",
      title:
        profile.lastSkillAuditScore != null && profile.lastSkillAuditScore < SKILL_PAR
          ? `Skill audit short · ${profile.lastSkillAuditScore}`
          : "Audit AI skills",
      body: "Doctrine, edge vitals, and live helm probes. Par is 70. Below par is a wound — run the battery on Audit.",
      to: "/hub/audit",
      urgency: profile.lastSkillAuditScore != null && profile.lastSkillAuditScore < SKILL_PAR ? "now" : "soon",
    });
  }

  if (!profile.verifiedAt) {
    out.push({
      id: "handshake",
      title: "Robot handshake",
      body: "Documents are free. Methods unseal only after the four-node flash. Paying never skips it.",
      to: "/hub/gateway",
      urgency: "soon",
    });
  }

  if (!profile.avatarData) {
    out.push({
      id: "portrait",
      title: "Add a Viewer portrait",
      body: "Public cards, the mesh, and live badges read better with a face you chose.",
      to: "/hub/profile",
      urgency: "later",
    });
  }

  if (!profile.bio.trim() && !profile.statusLine.trim()) {
    out.push({
      id: "bio",
      title: "Write the public line",
      body: "Organic visitors land on /v/handle. A status line is how they decide to follow.",
      to: "/hub/profile",
      urgency: "later",
    });
  }

  if (profile.watchStreak && profile.watchStreak >= 3 && watch?.claimed) {
    out.push({
      id: "streak",
      title: `${profile.watchStreak}-day streak is live`,
      body: "Come back tomorrow. The Sentinel heals on claimed watches and decays on missed ones.",
      to: "/hub/neuron",
      urgency: "later",
    });
  }

  return out.slice(0, 5);
}
