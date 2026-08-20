import { planById } from "./saas";
import type { ViewerProfile } from "./types";

/** Outside Viewership: 48 hours of Verified, no card, one shot per node. */
export const PAID_TRIAL_HOURS = 48;
export const PAID_TRIAL_MS = PAID_TRIAL_HOURS * 60 * 60 * 1000;
export const PAID_TRIAL_PLAN = "verified";
export const PAID_TRIAL_CREDITS = 80;
export const PAID_TRIAL_NAG_MS = 12 * 60 * 60 * 1000;

export function paidTrialUntilIso(from = Date.now()): string {
  return new Date(from + PAID_TRIAL_MS).toISOString();
}

export function msUntil(iso: string | null | undefined): number {
  if (!iso) return 0;
  const ms = Date.parse(iso) - Date.now();
  return Number.isFinite(ms) ? Math.max(0, ms) : 0;
}

export function isPaidTrialActive(profile: Pick<ViewerProfile, "paidTrialUntil" | "planId"> | null): boolean {
  if (!profile?.paidTrialUntil) return false;
  if (msUntil(profile.paidTrialUntil) <= 0) return false;
  const plan = planById(profile.planId);
  return plan.id === PAID_TRIAL_PLAN || plan.usdMonth > 0;
}

export function isPaidTrialExpired(profile: ViewerProfile | null): boolean {
  if (!profile?.paidTrialUsed || !profile.paidTrialUntil) return false;
  if (msUntil(profile.paidTrialUntil) > 0) return false;
  return planById(profile.planId).usdMonth === 0;
}

export function formatTrialClock(ms: number): string {
  if (ms <= 0) return "ended";
  const totalMin = Math.ceil(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const rh = h % 24;
    return rh ? `${d}d ${rh}h` : `${d}d`;
  }
  if (h > 0) return `${h}h ${m}m`;
  return `${Math.max(1, m)}m`;
}

export function shouldNagConvert(profile: ViewerProfile | null): boolean {
  if (!isPaidTrialActive(profile)) return false;
  return msUntil(profile?.paidTrialUntil) <= PAID_TRIAL_NAG_MS;
}
