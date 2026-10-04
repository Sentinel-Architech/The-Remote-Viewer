import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import {
  HUMAN_COMMS_PLAN_ID,
  HUMAN_COMMS_SKU,
  humanCommsCents,
  humanCommsCheckoutBody,
  humanCommsLookup,
  humanCommsPriceCreateBody,
  periodEndIso,
  publishedPriceMatches,
  resolveCheckoutOrigin,
  type HumanCommsGrant,
  type HumanInterval,
  type PublishedPrice,
} from "@/lib/trv/human-comms-checkout";

const STRIPE_API = "https://api.stripe.com";
const STRIPE_VERSION = "2026-07-29.dahlia";

type StripeError = Error & { param?: string };

function stripeError(message: string, param?: string): StripeError {
  const err = new Error(message) as StripeError;
  err.param = param;
  return err;
}

function secretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw stripeError("Stripe is not configured. Set STRIPE_SECRET_KEY on the server.");
  }
  return key;
}

function extraOrigin(): string | null {
  const raw = process.env.BETTER_AUTH_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol !== "https:" && !local) return null;
    return url.origin;
  } catch {
    return null;
  }
}

async function stripeSend(
  method: "GET" | "POST",
  path: string,
  key: string,
  body?: URLSearchParams,
  idempotencyKey?: string,
): Promise<unknown> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    "Stripe-Version": STRIPE_VERSION,
  };
  if (body) headers["Content-Type"] = "application/x-www-form-urlencoded";
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  const res = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers,
    body,
    signal: AbortSignal.timeout(15000),
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok) {
    const record = json && typeof json === "object" ? (json as { error?: { message?: string; param?: string } }) : {};
    throw stripeError(record.error?.message || "Stripe request failed", record.error?.param);
  }
  return json;
}

function asPrice(value: unknown): PublishedPrice | null {
  if (!value || typeof value !== "object") return null;
  const row = value as {
    id?: unknown;
    unit_amount?: unknown;
    currency?: unknown;
    recurring?: { interval?: unknown } | null;
  };
  return {
    id: typeof row.id === "string" ? row.id : undefined,
    unit_amount: typeof row.unit_amount === "number" ? row.unit_amount : null,
    currency: typeof row.currency === "string" ? row.currency : "",
    recurring: row.recurring ? { interval: typeof row.recurring.interval === "string" ? row.recurring.interval : null } : null,
  };
}

const priceCache: Partial<Record<HumanInterval, string>> = {};

async function priceByLookup(key: string, interval: HumanInterval): Promise<string | null> {
  const lookup = encodeURIComponent(humanCommsLookup(interval));
  const json = (await stripeSend("GET", `/v1/prices?lookup_keys[]=${lookup}&active=true&limit=1`, key)) as {
    data?: unknown[];
  };
  const price = asPrice(json.data?.[0]);
  if (!price?.id || !publishedPriceMatches(price, interval)) return null;
  return price.id;
}

async function priceById(key: string, priceId: string, interval: HumanInterval, envName: string): Promise<string> {
  const json = await stripeSend("GET", `/v1/prices/${encodeURIComponent(priceId)}`, key);
  const price = asPrice(json);
  if (!price || !publishedPriceMatches(price, interval)) {
    const label = interval === "year" ? "$50 USD per year" : "$10 USD per month";
    throw stripeError(`${envName} is not the published Verified price (${label}).`);
  }
  return priceId;
}

async function findOrCreateProduct(key: string): Promise<string> {
  const listed = (await stripeSend("GET", "/v1/products?active=true&limit=100", key)) as { data?: unknown[] };
  for (const entry of listed.data ?? []) {
    if (!entry || typeof entry !== "object") continue;
    const product = entry as { id?: unknown; metadata?: { sku?: unknown } };
    if (product.metadata?.sku === HUMAN_COMMS_SKU && typeof product.id === "string") return product.id;
  }
  const created = (await stripeSend(
    "POST",
    "/v1/products",
    key,
    new URLSearchParams({
      name: "Verified — unlimited human comms",
      description: "Unlimited human comms. $10 USD per month or $50 USD per year.",
      "metadata[sku]": HUMAN_COMMS_SKU,
      "metadata[plan]": HUMAN_COMMS_PLAN_ID,
    }),
    "trv-human-comms-product-v1",
  )) as { id?: string };
  if (!created.id) throw stripeError("Stripe did not return a product id.");
  return created.id;
}

async function resolvePriceId(key: string, interval: HumanInterval): Promise<string> {
  const cached = priceCache[interval];
  if (cached) return cached;
  const envName = interval === "year" ? "STRIPE_PRICE_HUMAN_YEAR" : "STRIPE_PRICE_HUMAN_MONTH";
  const fromEnv = process.env[envName]?.trim();
  const priceId = fromEnv
    ? await priceById(key, fromEnv, interval, envName)
    : (await priceByLookup(key, interval)) ?? (await createPrice(key, interval));
  priceCache[interval] = priceId;
  return priceId;
}

async function createPrice(key: string, interval: HumanInterval): Promise<string> {
  const productId = await findOrCreateProduct(key);
  try {
    const created = (await stripeSend(
      "POST",
      "/v1/prices",
      key,
      humanCommsPriceCreateBody(interval, productId),
      `trv-human-comms-price-${interval}-v1`,
    )) as { id?: string };
    if (created.id) return created.id;
  } catch (err) {
    const param = err instanceof Error && "param" in err ? String((err as StripeError).param) : "";
    if (param !== "lookup_key") throw err;
  }
  const found = await priceByLookup(key, interval);
  if (!found) throw stripeError("Stripe did not publish the human comms price.");
  return found;
}

type CheckoutSession = { id?: string; url?: string | null; status?: string };

async function openCheckoutSession(key: string, body: URLSearchParams, idempotencyKey: string): Promise<CheckoutSession> {
  try {
    return (await stripeSend("POST", "/v1/checkout/sessions", key, body, idempotencyKey)) as CheckoutSession;
  } catch (err) {
    const param = err instanceof Error && "param" in err ? String((err as StripeError).param) : "";
    if (param !== "billing_mode" && param !== "integration_identifier") throw err;
    return (await stripeSend(
      "POST",
      "/v1/checkout/sessions",
      key,
      stripFlexible(body),
      `${idempotencyKey}-plain`,
    )) as CheckoutSession;
  }
}

function stripFlexible(body: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(body);
  next.delete("subscription_data[billing_mode][type]");
  next.delete("integration_identifier");
  return next;
}

function isUniqueViolation(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = "code" in err ? String((err as { code?: unknown }).code) : "";
  if (code === "23505") return true;
  const message = err instanceof Error ? err.message : "";
  return /duplicate key|unique constraint/i.test(message);
}

export async function grantHumanComms(input: HumanCommsGrant): Promise<"granted" | "duplicate" | "missing-user"> {
  if (input.amountCents !== humanCommsCents(input.interval)) {
    throw stripeError("Refusing to grant Verified for an unpublished amount.");
  }
  if (!input.ref || input.ref.length > 80) throw stripeError("Missing Stripe reference.");
  const sql = await getSql();
  const users = await sql<{ user_id: string }>`
    select user_id from viewer_profiles where user_id = ${input.userId} limit 1
  `;
  if (!users[0]) return "missing-user";
  const dup = await sql<{ n: number }>`
    select count(*)::int as n from saas_invoices where kind = 'stripe-comms' and memo = ${input.ref}
  `;
  if ((dup[0]?.n ?? 0) > 0) return "duplicate";
  const periodEnd = periodEndIso(input.interval, input.periodEndUnix);
  await sql`
    update viewer_profiles
    set plan_id = 'verified', edition = 'people', billing_interval = ${input.interval}, plan_renews_at = ${periodEnd}
    where user_id = ${input.userId}
  `;
  try {
    await sql`
      insert into saas_invoices (user_id, plan_id, usd_cents, credits, kind, memo)
      values (${input.userId}, 'verified', ${input.amountCents}, 0, 'stripe-comms', ${input.ref})
    `;
  } catch (err) {
    if (isUniqueViolation(err)) return "duplicate";
    throw err;
  }
  return "granted";
}

export const startHumanCommsCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { interval?: string; origin?: string }) => ({
    interval: input.interval === "year" ? ("year" as const) : ("month" as const),
    origin: String(input.origin || "").slice(0, 200),
  }))
  .handler(async ({ context, data }) => {
    const { refuseCarryPaymentFromRequest } = await import("./carry-pay.server");
    refuseCarryPaymentFromRequest();
    const key = secretKey();
    const extra = extraOrigin();
    const origin = resolveCheckoutOrigin(data.origin, extra ? [extra] : []);
    const priceId = await resolvePriceId(key, data.interval);
    const day = new Date().toISOString().slice(0, 10);
    const body = humanCommsCheckoutBody({
      priceId,
      interval: data.interval,
      userId: context.userId,
      origin,
      flexible: true,
    });
    let session = await openCheckoutSession(key, body, `trv-hc-${context.userId}-${data.interval}-${day}`);
    if (!session.url && session.status === "complete") {
      throw stripeError("Stripe already completed this checkout. Verified turns on after the webhook.");
    }
    if (!session.url) {
      session = await openCheckoutSession(key, body, `trv-hc-${context.userId}-${data.interval}-${Date.now()}`);
    }
    if (!session.url) throw stripeError("Stripe did not return a checkout URL.");
    return { url: session.url };
  });
