import assert from "node:assert/strict";
import test from "node:test";
import {
  INTENT_LINE,
  assertWithinHardLimits,
  intentLink,
  parseIntent,
  passkeySignInRequest,
  prepareIntent,
  rejectSeedPhrase,
} from "../src/lib/trv/intent-bar.ts";

const SAMPLE =
  "send 10 USDC to 0x0000000000000000000000000000000000000001 slippage 50 bps";

test("the intent bar parses a sentence and writes a receipt before signing", () => {
  const prepared = prepareIntent(SAMPLE);
  assert.equal(prepared.parsed, true);
  if (!prepared.parsed) return;
  assert.equal(prepared.line, INTENT_LINE);
  assert.equal(prepared.walletConnected, false);
  assert.equal(prepared.signed, false);
  assert.equal(prepared.signature, null);
  assert.equal(prepared.receipt.beforeSigning, true);
  assert.equal(prepared.receipt.signed, false);
  assert.equal(prepared.receipt.signature, null);
  assert.equal(prepared.onChainSettled, false);
  assert.equal(prepared.submitted, false);
  assert.equal(prepared.gas.paidInMovedToken, true);
  assert.equal(prepared.gas.asset, "USDC");
  assert.equal(prepared.gas.quotedAmount, null);
  assert.equal(prepared.gas.personMustBuyEth, false);
  assert.equal(prepared.gas.personMustBuyMatic, false);
  assert.equal(prepared.gas.personMustBuySol, false);
  assert.equal(prepared.gas.auction, null);
  assert.equal(prepared.gas.feeSplit, null);
  assert.equal(prepared.gas.partner, null);
  assert.equal(prepared.typedDigestHex.length, 64);
  assert.equal(prepared.sharePath, intentLink(SAMPLE));
  assert.equal(decodeURIComponent(prepared.sharePath.slice("/hub/intent?want=".length)), SAMPLE);
});

test("a shareable link fills the same prompt", () => {
  const link = intentLink(SAMPLE);
  const want = decodeURIComponent(link.slice(link.indexOf("=") + 1));
  const again = prepareIntent(want);
  assert.equal(again.parsed, true);
  if (!again.parsed) return;
  assert.equal(again.intent.sourceText, SAMPLE);
});

test("hard limits refuse extra spend and extra slippage", () => {
  const intent = parseIntent(SAMPLE);
  assert.equal(intent.parsed, true);
  if (!intent.parsed) return;
  assert.throws(() => assertWithinHardLimits(intent, { amount: "11", slippageBps: 50 }), /spend/);
  assert.throws(() => assertWithinHardLimits(intent, { amount: "10", slippageBps: 51 }), /slippage/);
  assert.doesNotThrow(() => assertWithinHardLimits(intent, { amount: "10", slippageBps: 50 }));
});

test("passkey sign-in does not accept a seed phrase or Google", () => {
  assert.throws(() => rejectSeedPhrase("my seed phrase is here"), /seed phrase/);
  const request = passkeySignInRequest("localhost", new Uint8Array(32).fill(7));
  assert.equal(request.method, "passkey");
  assert.equal(request.seedPhraseAccepted, false);
  assert.equal(request.google, false);
  assert.equal(request.userVerification, "required");
  assert.equal(request.challengeHex, "07".repeat(32));
});

test("an unmatched sentence is not guessed", () => {
  const parsed = parseIntent("buy me something nice");
  assert.equal(parsed.parsed, false);
});
