/**
 * Verified human-comms checkout decisions.
 * Published prices only: $10 USD / month and $50 USD / year.
 * Free is not a checkout. Sentinel, Squad, Command, Sovereign, and the
 * company grant are not this SKU.
 */

export const HUMAN_COMMS_PLAN_ID = "verified";
export const HUMAN_COMMS_SKU = "human_comms";
export const HUMAN_COMMS_MONTH_CENTS = 1000;
export const HUMAN_COMMS_YEAR_CENTS = 5000;
export const HUMAN_COMMS_LOOKUP_MONTH = "trv_human_comms_month";
export const HUMAN_COMMS_LOOKUP_YEAR = "trv_human_comms_year";
export const HUMAN_COMMS_PUBLIC_ORIGIN = "https://the-remote-viewer.grok.me";
export const HUMAN_COMMS_INTEGRATION_ID = "trv_human_comms_hvqkwmzp";

/** Plans that must not open card checkout on this change. */
export const NOT_HUMAN_COMMS_PLANS = ["sentinel", "squad", "command", "sovereign", "initiate", "node"] as const;

export type HumanInterval = "month" | "year";

export type HumanCommsGrant = {
  kind: "human-comms";
  userId: string;
  interval: HumanInterval;
  amountCents: number;
  ref: string;
  periodEndUnix: number | null;
};

export type OnrampGrant = {
  kind: "onramp";
  userId: string;
  dest: "sol" | "trv";
  usd: number;
  sessionId: string;
};

export type StripeDecision = HumanCommsGrant | OnrampGrant | { kind: "ignore"; reason: string };

type StripeObject = Record<string, unknown>;

export function humanCommsCents(interval: HumanInterval): number {
  switch (interval) {
    case "month":
      return HUMAN_COMMS_MONTH_CENTS;
    case "year":
      return HUMAN_COMMS_YEAR_CENTS;
    default: {
      const _never: never = interval;
      return _never;
    }
  }
}

export function humanCommsLookup(interval: HumanInterval): string {
  switch (interval) {
    case "month":
      return HUMAN_COMMS_LOOKUP_MONTH;
    case "year":
      return HUMAN_COMMS_LOOKUP_YEAR;
    default: {
      const _never: never = interval;
      return _never;
    }
  }
}

/** The TRV credit ledger must not grant this paid SKU. */
export function humanCommsNeedsStripe(planId: string): boolean {
  return planId === HUMAN_COMMS_PLAN_ID;
}

export function intervalForCents(cents: number): HumanInterval | null {
  if (cents === HUMAN_COMMS_MONTH_CENTS) return "month";
  if (cents === HUMAN_COMMS_YEAR_CENTS) return "year";
  return null;
}

export type PublishedPrice = {
  id?: string;
  unit_amount: number | null;
  currency: string;
  recurring: { interval?: string | null } | null;
};

export function publishedPriceMatches(price: PublishedPrice, interval: HumanInterval): boolean {
  return (
    price.currency === "usd" &&
    price.unit_amount === humanCommsCents(interval) &&
    price.recurring?.interval === interval
  );
}

export function resolveCheckoutOrigin(requested: string, extraAllowed: string[] = []): string {
  const allowed = new Set<string>([
    HUMAN_COMMS_PUBLIC_ORIGIN,
    "http://localhost:8080",
    "http://127.0.0.1:8080",
  ]);
  for (const extra of extraAllowed) {
    if (extra.startsWith("https://") || extra.startsWith("http://localhost") || extra.startsWith("http://127.0.0.1")) {
      allowed.add(extra);
    }
  }
  try {
    const origin = new URL(requested).origin;
    if (allowed.has(origin)) return origin;
  } catch {
    /* untrusted or empty */
  }
  return HUMAN_COMMS_PUBLIC_ORIGIN;
}

export function humanCommsCheckoutBody(input: {
  priceId: string;
  interval: HumanInterval;
  userId: string;
  origin: string;
  flexible: boolean;
}): URLSearchParams {
  const origin = resolveCheckoutOrigin(input.origin);
  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("client_reference_id", input.userId);
  params.set(
    "success_url",
    `${origin}/hub/billing?checkout=pending&session_id={CHECKOUT_SESSION_ID}`,
  );
  params.set("cancel_url", `${origin}/hub/billing?checkout=cancel`);
  params.set("line_items[0][price]", input.priceId);
  params.set("line_items[0][quantity]", "1");
  params.set("metadata[sku]", HUMAN_COMMS_SKU);
  params.set("metadata[planId]", HUMAN_COMMS_PLAN_ID);
  params.set("metadata[userId]", input.userId);
  params.set("metadata[interval]", input.interval);
  params.set("subscription_data[metadata][sku]", HUMAN_COMMS_SKU);
  params.set("subscription_data[metadata][planId]", HUMAN_COMMS_PLAN_ID);
  params.set("subscription_data[metadata][userId]", input.userId);
  params.set("subscription_data[metadata][interval]", input.interval);
  if (input.flexible) {
    params.set("subscription_data[billing_mode][type]", "flexible");
    params.set("integration_identifier", HUMAN_COMMS_INTEGRATION_ID);
  }
  return params;
}

export function humanCommsPriceCreateBody(interval: HumanInterval, productId: string): URLSearchParams {
  const params = new URLSearchParams();
  params.set("currency", "usd");
  params.set("unit_amount", String(humanCommsCents(interval)));
  params.set("product", productId);
  params.set("lookup_key", humanCommsLookup(interval));
  params.set("nickname", interval === "year" ? "Verified yearly" : "Verified monthly");
  params.set("recurring[interval]", interval);
  params.set("metadata[sku]", HUMAN_COMMS_SKU);
  params.set("metadata[plan]", HUMAN_COMMS_PLAN_ID);
  params.set("metadata[interval]", interval);
  return params;
}

export function periodEndIso(interval: HumanInterval, periodEndUnix: number | null, now = Date.now()): string {
  if (periodEndUnix && Number.isFinite(periodEndUnix) && periodEndUnix * 1000 > now) {
    return new Date(periodEndUnix * 1000).toISOString();
  }
  const days = interval === "year" ? 365 : 31;
  return new Date(now + days * 24 * 60 * 60 * 1000).toISOString();
}

export function shouldExpireVerified(
  profile: { planId: string; planRenewsAt: string | null; paidTrialUntil: string | null },
  now = Date.now(),
): boolean {
  if (profile.planId !== HUMAN_COMMS_PLAN_ID) return false;
  if (!profile.planRenewsAt) return false;
  const end = Date.parse(profile.planRenewsAt);
  if (!Number.isFinite(end) || end > now) return false;
  if (profile.paidTrialUntil) {
    const trialEnd = Date.parse(profile.paidTrialUntil);
    if (Number.isFinite(trialEnd) && trialEnd > now) return false;
  }
  return true;
}

type HandledEvent = "checkout.session.completed" | "invoice.paid" | "invoice.payment_failed" | "other";

function handledEvent(type: string | undefined): HandledEvent {
  if (type === "checkout.session.completed" || type === "invoice.paid" || type === "invoice.payment_failed") {
    return type;
  }
  return "other";
}

function asObject(value: unknown): StripeObject | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as StripeObject;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function metadataOf(value: unknown): Record<string, string> {
  const obj = asObject(value);
  if (!obj) return {};
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(obj)) {
    if (typeof entry === "string") out[key] = entry;
  }
  return out;
}

function userIdOk(userId: string): boolean {
  return userId.length > 0 && userId.length <= 128 && !userId.includes("\0");
}

function blockedPlan(planId: string): boolean {
  return (NOT_HUMAN_COMMS_PLANS as readonly string[]).includes(planId);
}

export function classifyStripeEvent(event: { type?: string; data?: { object?: unknown } }): StripeDecision {
  const obj = asObject(event.data?.object) ?? {};
  const type = handledEvent(event.type);
  switch (type) {
    case "checkout.session.completed":
      return classifyCheckoutSession(obj);
    case "invoice.paid":
      return classifyInvoicePaid(obj);
    case "invoice.payment_failed":
      return { kind: "ignore", reason: "payment-failed-no-grant" };
    case "other":
      return { kind: "ignore", reason: "unhandled-event" };
    default: {
      const _never: never = type;
      return _never;
    }
  }
}

function classifyCheckoutSession(obj: StripeObject): StripeDecision {
  const meta = metadataOf(obj.metadata);
  const sessionId = str(obj.id);
  if (meta.sku === HUMAN_COMMS_SKU) {
    return classifyHumanCheckout(obj, meta, sessionId);
  }
  const paymentStatus = str(obj.payment_status);
  if (paymentStatus && paymentStatus !== "paid" && paymentStatus !== "no_payment_required") {
    return { kind: "ignore", reason: "onramp-unpaid" };
  }
  const userId = str(meta.userId);
  const amountTotal = Number(obj.amount_total);
  const usd = Number.isFinite(amountTotal) && amountTotal > 0 ? amountTotal / 100 : 0;
  if (!userIdOk(userId) || usd <= 0 || !sessionId) {
    return { kind: "ignore", reason: "onramp-incomplete" };
  }
  return {
    kind: "onramp",
    userId,
    dest: meta.dest === "sol" ? "sol" : "trv",
    usd,
    sessionId,
  };
}

function classifyHumanCheckout(obj: StripeObject, meta: Record<string, string>, sessionId: string): StripeDecision {
  if (blockedPlan(meta.planId) || (meta.planId && meta.planId !== HUMAN_COMMS_PLAN_ID)) {
    return { kind: "ignore", reason: "not-human-comms-plan" };
  }
  if (str(obj.mode) !== "subscription") return { kind: "ignore", reason: "not-subscription" };
  const status = str(obj.status);
  if (status && status !== "complete") return { kind: "ignore", reason: "session-open" };
  if (str(obj.payment_status) !== "paid") return { kind: "ignore", reason: "unpaid" };
  if (str(obj.currency) !== "usd") return { kind: "ignore", reason: "currency" };
  const amount = Number(obj.amount_total);
  const interval = intervalForCents(amount);
  if (!interval || meta.interval !== interval) return { kind: "ignore", reason: "amount" };
  if (!userIdOk(str(meta.userId)) || !sessionId.startsWith("cs_")) {
    return { kind: "ignore", reason: "identity" };
  }
  return {
    kind: "human-comms",
    userId: meta.userId,
    interval,
    amountCents: amount,
    ref: sessionId,
    periodEndUnix: null,
  };
}

function invoiceMetadata(obj: StripeObject): Record<string, string> {
  const parent = asObject(obj.parent);
  const parentSub = asObject(parent?.subscription_details);
  const legacy = asObject(obj.subscription_details);
  const lines = asObject(obj.lines);
  const data = Array.isArray(lines?.data) ? lines.data : [];
  const line = asObject(data[0]);
  return {
    ...metadataOf(line?.metadata),
    ...metadataOf(legacy?.metadata),
    ...metadataOf(parentSub?.metadata),
    ...metadataOf(obj.metadata),
  };
}

function invoicePeriodEnd(obj: StripeObject): number | null {
  const lines = asObject(obj.lines);
  const data = Array.isArray(lines?.data) ? lines.data : [];
  for (const entry of data) {
    const line = asObject(entry);
    const period = asObject(line?.period);
    const end = Number(period?.end);
    if (Number.isFinite(end) && end > 0) return end;
  }
  return null;
}

function classifyInvoicePaid(obj: StripeObject): StripeDecision {
  const reason = str(obj.billing_reason);
  if (reason !== "subscription_create" && reason !== "subscription_cycle") {
    return { kind: "ignore", reason: "invoice-reason" };
  }
  const meta = invoiceMetadata(obj);
  if (meta.sku !== HUMAN_COMMS_SKU) return { kind: "ignore", reason: "not-human-comms" };
  if (blockedPlan(meta.planId) || (meta.planId && meta.planId !== HUMAN_COMMS_PLAN_ID)) {
    return { kind: "ignore", reason: "not-human-comms-plan" };
  }
  if (str(obj.currency) !== "usd") return { kind: "ignore", reason: "currency" };
  const amount = Number(obj.amount_paid);
  const interval = intervalForCents(amount);
  if (!interval || (meta.interval && meta.interval !== interval)) {
    return { kind: "ignore", reason: "amount" };
  }
  const invoiceId = str(obj.id);
  if (!userIdOk(str(meta.userId)) || !invoiceId.startsWith("in_")) {
    return { kind: "ignore", reason: "identity" };
  }
  return {
    kind: "human-comms",
    userId: meta.userId,
    interval,
    amountCents: amount,
    ref: invoiceId,
    periodEndUnix: invoicePeriodEnd(obj),
  };
}
