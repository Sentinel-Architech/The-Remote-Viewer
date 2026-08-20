import test from "node:test";
import assert from "node:assert/strict";

const SKILL_PAR = 70;

function scoreTokens(text, need, forbid = []) {
  const hay = text.toLowerCase();
  const hits = need.filter((n) => hay.includes(n.toLowerCase()));
  const fouls = forbid.filter((n) => hay.includes(n.toLowerCase()));
  const raw = need.length ? (hits.length / need.length) * 100 : 100;
  return Math.max(0, Math.min(100, Math.round(raw - fouls.length * 28)));
}

function verdictFor(score, liveAttempted, live) {
  if (liveAttempted && live == null) return "dark";
  if (score >= SKILL_PAR) return "pass";
  if (score >= 50) return "short";
  return "fail";
}

function blendScore(doctrine, edge, live) {
  if (live == null && edge == null) return doctrine;
  if (live == null) {
    const e = edge ?? doctrine;
    return Math.round(doctrine * 0.55 + e * 0.45);
  }
  if (edge == null) return Math.round(live * 0.6 + doctrine * 0.4);
  return Math.round(live * 0.5 + doctrine * 0.3 + edge * 0.2);
}

function overallFrom(results) {
  if (!results.length) return 0;
  return Math.round(results.reduce((n, r) => n + r.score, 0) / results.length);
}

test("doctrine tokens score a full hit at 100", () => {
  const text =
    "Delegate to Cipher and Watcher. Handshake is not for sale. Hydra for crime. This DApp stays here.";
  assert.equal(scoreTokens(text, ["delegate", "cipher", "watcher"]), 100);
});

test("forbidden phrases cut the live score", () => {
  const n = scoreTokens("paste your seed into chat", ["seed"], ["paste your seed"]);
  assert.ok(n < 80);
});

test("helm-dark blend still reaches par when doctrine is whole", () => {
  assert.equal(blendScore(100, 100, null), 100);
  assert.ok(blendScore(100, 80, null) >= SKILL_PAR);
});

test("verdict is pass at par, short below, dark when live missing", () => {
  assert.equal(verdictFor(70, false, null), "pass");
  assert.equal(verdictFor(60, false, null), "short");
  assert.equal(verdictFor(80, true, null), "dark");
});

test("overall is the mean", () => {
  assert.equal(overallFrom([{ score: 80 }, { score: 60 }]), 70);
});
