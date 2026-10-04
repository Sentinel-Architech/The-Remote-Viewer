import assert from "node:assert/strict";
import test from "node:test";
import {
  CLAN_TRV,
  acceptanceCopy,
  assertMobileWillNotStoreSecret,
  assertNativeTrvDebit,
  assertOwnHandleSignature,
  outsidePurchaseRail,
  broadcastUrl,
  canMintAnotherShareCode,
  dustRewardForScan,
  grandViewActive,
  grandViewUntilIso,
  IN_APP_TOKEN_NAME,
  isMonthlySubscriber,
  joinDecision,
  publicPriceLine,
  qrStyleForPlan,
  roughInterests,
  shareStillOpen,
  SHARE_CODE_MS,
  GRAND_VIEW_MS,
  subscribedReward,
} from "../src/lib/trv/viewer-locks.ts";

test("clan TRV amounts stay the published figures", () => {
  assert.deepEqual(CLAN_TRV, { sentinel: 790, squad: 1490, command: 4900, sovereign: 24000 });
  assert.equal(publicPriceLine("verified", 10), "$10/month or $50/year");
  assert.equal(publicPriceLine("sentinel", 79), "790 TRV · in person");
  assert.equal(publicPriceLine("sovereign", 2400), "24000 TRV · in person");
  assert.equal(publicPriceLine("initiate", 0), "Free");
});

test("holographic QR is only the existing paid tiers", () => {
  assert.equal(qrStyleForPlan("initiate"), "plain");
  assert.equal(qrStyleForPlan("node"), "plain");
  assert.equal(qrStyleForPlan("verified"), "holographic");
  assert.equal(qrStyleForPlan("sentinel"), "holographic");
  assert.equal(qrStyleForPlan("squad"), "holographic");
  assert.equal(qrStyleForPlan("command"), "holographic");
  assert.equal(qrStyleForPlan("sovereign"), "holographic");
});

test("share codes are unlimited, live 15 minutes, and grant 15 days", () => {
  assert.equal(canMintAnotherShareCode(0), true);
  assert.equal(canMintAnotherShareCode(1000), true);
  const now = Date.parse("2026-10-04T22:00:00.000Z");
  assert.equal(shareStillOpen(now + SHARE_CODE_MS, now, 40), true);
  assert.equal(shareStillOpen(now + SHARE_CODE_MS, now + SHARE_CODE_MS, 0), false);
  const until = grandViewUntilIso(now);
  assert.equal(Date.parse(until) - now, GRAND_VIEW_MS);
  assert.equal(grandViewActive(until, now + GRAND_VIEW_MS - 1), true);
  assert.equal(grandViewActive(until, now + GRAND_VIEW_MS), false);
});

test("one code can be joined by several new people inside the window", () => {
  const now = 1_000;
  const expiresAt = now + SHARE_CODE_MS;
  assert.equal(
    joinDecision({ now, expiresAt, ownerHandle: "ada", joinerHandle: "bea", joinerAlreadyGranted: false }),
    "grant",
  );
  assert.equal(
    joinDecision({ now, expiresAt, ownerHandle: "ada", joinerHandle: "cy", joinerAlreadyGranted: false }),
    "grant",
  );
  assert.equal(
    joinDecision({ now: expiresAt, expiresAt, ownerHandle: "ada", joinerHandle: "bea", joinerAlreadyGranted: false }),
    "expired",
  );
  assert.equal(
    joinDecision({ now, expiresAt, ownerHandle: "ada", joinerHandle: "ada", joinerAlreadyGranted: false }),
    "own-code",
  );
  assert.equal(
    joinDecision({ now, expiresAt, ownerHandle: "ada", joinerHandle: "bea", joinerAlreadyGranted: true }),
    "already-granted",
  );
  assert.equal(
    joinDecision({ now, expiresAt, ownerHandle: "ada", joinerHandle: "", joinerAlreadyGranted: false }),
    "no-handle",
  );
});

test("signature is the viewer's own handle", () => {
  assert.doesNotThrow(() => assertOwnHandleSignature("ada", "Ada"));
  assert.throws(() => assertOwnHandleSignature("company", "ada"), /own handle/);
  assert.throws(() => assertOwnHandleSignature("ada", "  "), /no TRV handle/);
});

test("broadcast URL is not a Wi-Fi password or a seed", () => {
  const url = broadcastUrl("https://the-remote-viewer.grok.me", "AB23CD45");
  assert.equal(url, "https://the-remote-viewer.grok.me/login?share=AB23CD45");
  assert.equal(url.includes("WIFI"), false);
  assert.equal(url.includes("password"), false);
  assert.equal(url.includes("seed"), false);
  assert.throws(() => assertMobileWillNotStoreSecret("seed", true), /off this phone/);
  assert.throws(() => assertMobileWillNotStoreSecret("wifi-password", true), /Wi-Fi password/);
  assert.doesNotThrow(() => assertMobileWillNotStoreSecret("seed", false));
});

test("dust and the larger subscribed reward have no invented amount", () => {
  const free = dustRewardForScan("initiate");
  const paid = dustRewardForScan("verified", "month");
  const year = dustRewardForScan("verified", "year");
  const clan = dustRewardForScan("sentinel");
  assert.equal(IN_APP_TOKEN_NAME, "TRV Token🍃");
  assert.equal(free.name, "TRV Token🍃");
  assert.equal(paid.name, IN_APP_TOKEN_NAME);
  assert.match(free.note, /TRV Token🍃/);
  assert.match(free.note, /simulation only/);
  assert.match(free.note, /exclusive in-app customizations only/);
  assert.equal(/pok[eé]mon/i.test(free.note), false);
  assert.match(free.note, /not money/);
  assert.match(free.note, /not redeemable for cash/);
  assert.match(free.note, /not crypto/);
  assert.equal(free.kind, "in-app-dust");
  assert.equal(free.notCrypto, true);
  assert.equal(free.notOnSolana, true);
  assert.equal(free.amount, null);
  assert.equal(free.moreThanFree, false);
  assert.equal(free.onChain, false);
  assert.match(free.note, /not on Solana/);
  assert.equal(paid.amount, null);
  assert.equal(paid.moreThanFree, true);
  assert.equal(year.moreThanFree, false);
  assert.equal(year.amount, null);
  assert.equal(clan.moreThanFree, false);
  assert.equal(clan.amount, null);
  assert.equal(isMonthlySubscriber("verified", "month"), true);
  assert.equal(isMonthlySubscriber("verified", "year"), false);
  assert.equal(isMonthlySubscriber("node", "month"), false);
  assert.equal(subscribedReward("initiate").amount, null);
  assert.equal(subscribedReward("initiate").eligible, false);
  assert.equal(subscribedReward("verified").eligible, true);
  assert.equal(subscribedReward("verified").amount, null);
  assert.match(acceptanceCopy(1), /one form/);
  assert.match(acceptanceCopy(2), /two forms/);
  assert.match(acceptanceCopy(2), /does not charge/);
});

test("outside purchase rails stay, and TRV debits stay on the hub", () => {
  assert.equal(outsidePurchaseRail("stripe"), "stripe");
  assert.equal(outsidePurchaseRail("x-money"), "x-money");
  assert.equal(outsidePurchaseRail("phantom"), "phantom");
  assert.equal(outsidePurchaseRail("trv-native"), null);
  assert.doesNotThrow(() => assertNativeTrvDebit({ signature: "ada", handle: "ada", rail: "trv-native" }));
  assert.throws(() => assertNativeTrvDebit({ signature: "ada", handle: "ada", rail: "stripe" }));
  assert.throws(() => assertNativeTrvDebit({ signature: "ada", handle: "ada", rail: "phantom" }));
  assert.throws(() => assertNativeTrvDebit({ signature: "ada", handle: "ada", rail: "x-money" }));
  assert.throws(() => assertNativeTrvDebit({ signature: "ada", handle: "ada", rail: "google" }));
});

test("rough interests come from what the viewer already wrote", () => {
  assert.deepEqual(roughInterests({ craft: "maps, tides", statusLine: "", bio: "" }), ["maps", "tides"]);
  assert.deepEqual(roughInterests({ craft: "", statusLine: "", bio: "" }), []);
});
