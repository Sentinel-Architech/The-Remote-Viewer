export const FEED_WATCH_SEC = 90;
export const FEED_AD_SEC = 30;
export const REFERRAL_TRIAL_DAYS = 7;
export const REFERRAL_NEW_CREDITS = 250;
export const REFERRAL_BONUS_CREDITS = 150;

export function isAdFree(profile: { verifiedAt: string | null; trialUntil: string | null } | null): boolean {
  if (!profile) return false;
  if (profile.verifiedAt) return true;
  if (profile.trialUntil && Date.parse(profile.trialUntil) > Date.now()) return true;
  return false;
}

export function trialRemaining(trialUntil: string | null): string | null {
  if (!trialUntil) return null;
  const ms = Date.parse(trialUntil) - Date.now();
  if (ms <= 0) return null;
  const d = Math.ceil(ms / 86_400_000);
  return `${d} day${d === 1 ? "" : "s"}`;
}
