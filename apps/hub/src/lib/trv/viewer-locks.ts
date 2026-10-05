/**
 * Viewer locks that are decided in this repo.
 * Amounts that are not published stay unset. No mint. No Wi-Fi password. No seed.
 */

export const CLAN_TRV = {
  sentinel: 790,
  squad: 1490,
  command: 4900,
  sovereign: 24000,
} as const;

export type ClanId = keyof typeof CLAN_TRV;

export const SHARE_CODE_MS = 15 * 60 * 1000;
export const GRAND_VIEW_MS = 15 * 24 * 60 * 60 * 1000;

export const SEED_OFF_PHONE =
  "Keep the passphrase and the seed off this phone. This phone unlocks with the device lock. It does not hold a seed or a passphrase. There is no backup location in this product.";

export const FREE_SECURITY =
  "Free: this device's own lock (screen lock, biometric, or keystore) plus the bare TRV layer. That does not require a purchase.";

export const PAID_SECURITY =
  "Paid, existing tiers only: Verified human comms is $10/month or $50/year on the Stripe card. Clan tiers settle on signed native TRV: Sentinel 790, Squad 1490, Command 4900, Sovereign 24000. The on-device wallet and the on-device node both sign. No new price.";

/** In-app simulation reward. Not money, not crypto, not cash, not an SPL mint, not on Solana. */
export const IN_APP_TOKEN_NAME = "TRV Token🍃";

export const DUST_UNSET =
  `${IN_APP_TOKEN_NAME} is a simulation only. It buys exclusive in-app customizations only. It is not money, not crypto, and not redeemable for cash. It is not on Solana. The amount is not set. A monthly subscriber is marked for a bit more ${IN_APP_TOKEN_NAME} than the free tier. That amount is not set either. This does not create an SPL mint and does not move chain tokens.`;

export const SUBSCRIBED_REWARD_UNSET =
  "A larger reward is reserved for a subscribed Remote Viewer. The amount is not set. The published watch credit is unchanged.";

export const BROADCAST_COPY =
  "Broadcast this code so several people can join it during the same 15 minutes. It is still this Viewer's handle. It is not a Wi-Fi network and it has no Wi-Fi password.";

export type RecoveryForms = 1 | 2;
export type QrStyle = "plain" | "holographic";
export type BillingInterval = "month" | "year";

const PAID_PLAN_IDS = new Set(["verified", "sentinel", "squad", "command", "sovereign"]);
const HOLO_PLAN_IDS = PAID_PLAN_IDS;

export function clanTrvAmount(planId: string): number | null {
  if (planId === "sentinel" || planId === "squad" || planId === "command" || planId === "sovereign") {
    return CLAN_TRV[planId];
  }
  return null;
}

export function isExistingPaidPlan(planId: string): boolean {
  return PAID_PLAN_IDS.has(planId);
}

/** Verified at $10/month. Yearly and clan tiers are not a monthly subscription. */
export function isMonthlySubscriber(planId: string, interval: BillingInterval = "month"): boolean {
  return planId === "verified" && interval === "month";
}

export function qrStyleForPlan(planId: string): QrStyle {
  return HOLO_PLAN_IDS.has(planId) ? "holographic" : "plain";
}

export function isMobileUserAgent(ua: string): boolean {
  return /android|iphone|ipad|ipod|mobile/i.test(ua);
}

export function assertMobileWillNotStoreSecret(kind: "seed" | "passphrase" | "wifi-password", mobile: boolean): void {
  if (!mobile) return;
  if (kind === "wifi-password") {
    throw new Error("This phone does not store a Wi-Fi password.");
  }
  throw new Error(SEED_OFF_PHONE);
}

export function roughInterests(parts: { craft?: string | null; statusLine?: string | null; bio?: string | null }): string[] {
  const chunks = [parts.craft, parts.statusLine, parts.bio].flatMap((value) =>
    (value ?? "")
      .split(/[,·|/]/)
      .map((part) => part.trim())
      .filter((part) => part.length >= 2 && part.length <= 42),
  );
  return chunks.slice(0, 3);
}

export function assertOwnHandleSignature(signature: string, handle: string): void {
  const own = handle.trim().toLowerCase();
  if (own.length < 2) {
    throw new Error("This account has no TRV handle.");
  }
  if (signature.trim().toLowerCase() !== own) {
    throw new Error("The signature must be this Viewer's own handle.");
  }
}

export function signatureLine(handle: string): string {
  assertOwnHandleSignature(handle, handle);
  return `@${handle.trim().toLowerCase()}`;
}

const FOREIGN_STACK = /google|gstatic|googleapis|alphabet|firebase|facebook|meta\.com/i;

/** Outside purchase rails that stay. They are not the native stack and they are not replaced. */
export const OUTSIDE_PURCHASE_RAILS = {
  stripe: "card",
  "x-money": "x-money",
  phantom: "phantom",
} as const;

export type OutsidePurchaseRail = keyof typeof OUTSIDE_PURCHASE_RAILS;

export function outsidePurchaseRail(rail: string): OutsidePurchaseRail | null {
  if (rail === "stripe" || rail === "stripe-card") return "stripe";
  if (rail === "x-money" || rail === "x money") return "x-money";
  if (rail === "phantom") return "phantom";
  return null;
}

/** TRV credits leave an account only on this hub, signed by the Viewer's own handle. */
export function assertNativeTrvDebit(input: { signature: string; handle: string; rail: string }): void {
  assertOwnHandleSignature(input.signature, input.handle);
  if (outsidePurchaseRail(input.rail) || input.rail !== "trv-native" || FOREIGN_STACK.test(input.rail)) {
    throw new Error(
      "TRV credits are debited on this hub. Stripe stays the card rail. X Money and Phantom stay the other purchase rails. None of those replace this debit.",
    );
  }
}

export function acceptanceCopy(forms: RecoveryForms): string {
  const formsLine =
    forms === 1
      ? "You are accepting one form: this device's own lock (screen lock, biometric, or keystore). That is free."
      : "You are accepting two forms: this device's own lock, and the bare free TRV check on this device. That is also free.";
  return [
    "You wrote this code down. This phone does not keep it, and it does not keep a passphrase or a seed.",
    "Getting this same code again asks for the security you accept here.",
    formsLine,
    PAID_SECURITY,
    "This step does not charge you and it does not invent a price.",
  ].join(" ");
}

export function canMintAnotherShareCode(alreadyMinted: number): boolean {
  return Number.isFinite(alreadyMinted) && alreadyMinted >= 0;
}

export function shareStillOpen(expiresAtMs: number, now: number, joinCount: number): boolean {
  if (joinCount < 0) return false;
  return now < expiresAtMs;
}

export type JoinDecision = "grant" | "expired" | "own-code" | "already-granted" | "no-handle";

export function joinDecision(input: {
  now: number;
  expiresAt: number;
  ownerHandle: string;
  joinerHandle: string;
  joinerAlreadyGranted: boolean;
}): JoinDecision {
  const owner = input.ownerHandle.trim().toLowerCase();
  const joiner = input.joinerHandle.trim().toLowerCase();
  if (owner.length < 2 || joiner.length < 2) return "no-handle";
  if (owner === joiner) return "own-code";
  if (!(input.now < input.expiresAt)) return "expired";
  if (input.joinerAlreadyGranted) return "already-granted";
  return "grant";
}

export function grandViewUntilIso(from = Date.now()): string {
  return new Date(from + GRAND_VIEW_MS).toISOString();
}

export function grandViewActive(untilIso: string | null | undefined, now = Date.now()): boolean {
  if (!untilIso) return false;
  const at = Date.parse(untilIso);
  return Number.isFinite(at) && at > now;
}

export function broadcastUrl(origin: string, code: string): string {
  const url = new URL("/login", origin);
  url.searchParams.set("share", code);
  if (url.searchParams.has("password") || url.searchParams.has("seed") || url.searchParams.has("passphrase")) {
    throw new Error("Broadcast URL must not carry a password or a seed.");
  }
  if (url.protocol === "wifi:") {
    throw new Error("Broadcast is not a Wi-Fi network.");
  }
  return url.toString();
}

export type DustReward = {
  name: typeof IN_APP_TOKEN_NAME;
  kind: "in-app-dust";
  notCrypto: true;
  notOnSolana: true;
  onChain: false;
  amount: null;
  moreThanFree: boolean;
  note: string;
};

export function dustRewardForScan(planId: string, interval: BillingInterval = "month"): DustReward {
  const moreThanFree = isMonthlySubscriber(planId, interval);
  return {
    name: IN_APP_TOKEN_NAME,
    kind: "in-app-dust",
    notCrypto: true,
    notOnSolana: true,
    onChain: false,
    amount: null,
    moreThanFree,
    note: DUST_UNSET,
  };
}

export type SubscribedReward = {
  eligible: boolean;
  amount: null;
  note: string;
};

export function subscribedReward(planId: string): SubscribedReward {
  const eligible = isExistingPaidPlan(planId);
  return {
    eligible,
    amount: null,
    note: eligible
      ? SUBSCRIBED_REWARD_UNSET
      : "Free tier keeps the published watch credit. The larger subscribed reward is not this tier, and its amount is not set.",
  };
}

export function publicPriceLine(planId: string, usdMonth: number): string {
  if (planId === "verified") return "$10/month or $50/year";
  const clan = clanTrvAmount(planId);
  if (clan != null) return `${clan} TRV · signed native`;
  if (usdMonth === 0) return "Free";
  return "Free";
}
