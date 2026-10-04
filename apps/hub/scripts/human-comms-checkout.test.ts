import assert from "node:assert/strict";
import test from "node:test";
import {
  HUMAN_COMMS_MONTH_CENTS,
  HUMAN_COMMS_YEAR_CENTS,
  classifyStripeEvent,
  humanCommsCheckoutBody,
  humanCommsNeedsStripe,
  humanCommsPriceCreateBody,
  intervalForCents,
  publishedPriceMatches,
  resolveCheckoutOrigin,
  shouldExpireVerified,
} from "../src/lib/trv/human-comms-checkout.ts";

const USER = "user_123";

function paidSession(overrides: Record<string, unknown> = {}) {
  return {
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_verified",
        mode: "subscription",
        status: "complete",
        payment_status: "paid",
        currency: "usd",
        amount_total: HUMAN_COMMS_MONTH_CENTS,
        metadata: { sku: "human_comms", planId: "verified", userId: USER, interval: "month" },
        ...overrides,
      },
    },
  };
}

test("published cents are $10 and $50, never the retired yearly figure", () => {
  assert.equal(HUMAN_COMMS_MONTH_CENTS, 1000);
  assert.equal(HUMAN_COMMS_YEAR_CENTS, 5000);
  assert.equal(intervalForCents(1000), "month");
  assert.equal(intervalForCents(5000), "year");
  assert.equal(intervalForCents(9600), null);
  assert.equal(intervalForCents(0), null);
  assert.equal(intervalForCents(120000), null);
});

test("checkout body uses a price id and does not invent another amount", () => {
  const body = humanCommsCheckoutBody({
    priceId: "price_month",
    interval: "month",
    userId: USER,
    origin: "https://the-remote-viewer.grok.me/hub/billing",
    flexible: true,
  });
  const text = body.toString();
  assert.equal(body.get("mode"), "subscription");
  assert.equal(body.get("line_items[0][price]"), "price_month");
  assert.equal(body.get("line_items[0][quantity]"), "1");
  assert.equal(body.get("metadata[sku]"), "human_comms");
  assert.equal(body.get("metadata[planId]"), "verified");
  assert.equal(body.has("payment_method_types[0]"), false);
  assert.match(body.get("success_url") || "", /session_id=\{CHECKOUT_SESSION_ID\}/);
  assert.equal(text.includes("9600"), false);
  assert.equal(text.includes("120000"), false);
  assert.equal(text.includes("unit_amount"), false);
});

test("price create bodies are the two published amounts", () => {
  const month = humanCommsPriceCreateBody("month", "prod_verified");
  const year = humanCommsPriceCreateBody("year", "prod_verified");
  assert.equal(month.get("unit_amount"), "1000");
  assert.equal(month.get("recurring[interval]"), "month");
  assert.equal(month.get("lookup_key"), "trv_human_comms_month");
  assert.equal(year.get("unit_amount"), "5000");
  assert.equal(year.get("recurring[interval]"), "year");
  assert.equal(year.get("lookup_key"), "trv_human_comms_year");
  assert.equal(publishedPriceMatches({ unit_amount: 1000, currency: "usd", recurring: { interval: "month" } }, "month"), true);
  assert.equal(publishedPriceMatches({ unit_amount: 9600, currency: "usd", recurring: { interval: "year" } }, "year"), false);
  assert.equal(publishedPriceMatches({ unit_amount: 5000, currency: "usd", recurring: { interval: "month" } }, "year"), false);
});

test("only the verified human-comms plan needs Stripe", () => {
  assert.equal(humanCommsNeedsStripe("verified"), true);
  for (const plan of ["initiate", "node", "sentinel", "squad", "command", "sovereign"]) {
    assert.equal(humanCommsNeedsStripe(plan), false);
  }
});

test("a paid $10 session grants and a $96 session does not", () => {
  const month = classifyStripeEvent(paidSession());
  assert.equal(month.kind, "human-comms");
  if (month.kind !== "human-comms") return;
  assert.equal(month.amountCents, 1000);
  assert.equal(month.interval, "month");

  const year = classifyStripeEvent(paidSession({ amount_total: 5000, metadata: { sku: "human_comms", planId: "verified", userId: USER, interval: "year" } }));
  assert.equal(year.kind, "human-comms");

  const retired = classifyStripeEvent(paidSession({ amount_total: 9600, metadata: { sku: "human_comms", planId: "verified", userId: USER, interval: "year" } }));
  assert.equal(retired.kind, "ignore");

  const grant = classifyStripeEvent(paidSession({ amount_total: 120000 }));
  assert.equal(grant.kind, "ignore");
});

test("unpaid, free, and other plans do not grant", () => {
  assert.equal(classifyStripeEvent(paidSession({ payment_status: "unpaid" })).kind, "ignore");
  assert.equal(classifyStripeEvent(paidSession({ payment_status: "no_payment_required", amount_total: 0 })).kind, "ignore");
  assert.equal(
    classifyStripeEvent(paidSession({ metadata: { sku: "human_comms", planId: "sentinel", userId: USER, interval: "month" } })).kind,
    "ignore",
  );
  assert.equal(
    classifyStripeEvent(paidSession({ metadata: { sku: "human_comms", planId: "sovereign", userId: USER, interval: "month" } })).kind,
    "ignore",
  );
});

test("human-comms metadata never falls through to the credit on-ramp", () => {
  const decision = classifyStripeEvent(paidSession({ amount_total: 9600, payment_status: "paid" }));
  assert.equal(decision.kind, "ignore");
});

test("credit on-ramp sessions stay on the on-ramp path", () => {
  const decision = classifyStripeEvent({
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_onramp",
        payment_status: "paid",
        amount_total: 4000,
        metadata: { userId: USER, dest: "trv" },
      },
    },
  });
  assert.deepEqual(decision, { kind: "onramp", userId: USER, dest: "trv", usd: 40, sessionId: "cs_onramp" });
});

test("invoice.paid renews only at the published amount", () => {
  const paid = classifyStripeEvent({
    type: "invoice.paid",
    data: {
      object: {
        id: "in_renew",
        currency: "usd",
        amount_paid: 5000,
        billing_reason: "subscription_cycle",
        parent: { subscription_details: { metadata: { sku: "human_comms", planId: "verified", userId: USER, interval: "year" } } },
        lines: { data: [{ period: { end: 2_000_000_000 } }] },
      },
    },
  });
  assert.equal(paid.kind, "human-comms");
  if (paid.kind !== "human-comms") return;
  assert.equal(paid.ref, "in_renew");
  assert.equal(paid.periodEndUnix, 2_000_000_000);

  const wrong = classifyStripeEvent({
    type: "invoice.paid",
    data: {
      object: {
        id: "in_wrong",
        currency: "usd",
        amount_paid: 9600,
        billing_reason: "subscription_cycle",
        metadata: { sku: "human_comms", planId: "verified", userId: USER, interval: "year" },
      },
    },
  });
  assert.equal(wrong.kind, "ignore");
});

test("a failed invoice does not grant", () => {
  const decision = classifyStripeEvent({
    type: "invoice.payment_failed",
    data: { object: { amount_paid: 1000, metadata: { sku: "human_comms", userId: USER, interval: "month" } } },
  });
  assert.deepEqual(decision, { kind: "ignore", reason: "payment-failed-no-grant" });
});

test("checkout origin stays on the public site unless it is local", () => {
  assert.equal(resolveCheckoutOrigin("https://the-remote-viewer.grok.me/hub/billing"), "https://the-remote-viewer.grok.me");
  assert.equal(resolveCheckoutOrigin("https://evil.example/phish"), "https://the-remote-viewer.grok.me");
  assert.equal(resolveCheckoutOrigin("http://localhost:8080/hub/billing"), "http://localhost:8080");
  assert.equal(resolveCheckoutOrigin("not a url"), "https://the-remote-viewer.grok.me");
});

test("lapsed verified expires and an open period does not", () => {
  const now = Date.parse("2026-10-04T00:00:00.000Z");
  assert.equal(
    shouldExpireVerified({ planId: "verified", planRenewsAt: "2026-10-03T00:00:00.000Z", paidTrialUntil: null }, now),
    true,
  );
  assert.equal(
    shouldExpireVerified({ planId: "verified", planRenewsAt: "2027-10-04T00:00:00.000Z", paidTrialUntil: null }, now),
    false,
  );
  assert.equal(
    shouldExpireVerified({ planId: "sentinel", planRenewsAt: "2020-01-01T00:00:00.000Z", paidTrialUntil: null }, now),
    false,
  );
  assert.equal(
    shouldExpireVerified(
      { planId: "verified", planRenewsAt: "2026-10-03T00:00:00.000Z", paidTrialUntil: "2026-10-05T00:00:00.000Z" },
      now,
    ),
    false,
  );
});
