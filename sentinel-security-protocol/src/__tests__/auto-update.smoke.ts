/**
 * Smoke test for auto-update policy.
 * Run: npx tsx src/__tests__/auto-update.smoke.ts
 */

import {
  DEFAULT_UPDATE_POLICY,
  shouldApplyUpdate,
  compareVersions,
  getContinuityStatement,
} from "../auto-update.js";
import { ownerInkSwitch, routeCorporateAspectProfit } from "../owner-ink.js";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function main() {
  console.log("=== Auto-Update Policy Smoke ===\n");

  assert(compareVersions("1.2.0", "1.1.9") > 0, "1.2.0 should be newer");
  assert(compareVersions("1.0.0", "1.0.0") === 0, "equal versions");
  assert(compareVersions("0.9.0", "1.0.0") < 0, "0.9.0 should be older");

  const newer = shouldApplyUpdate({
    policy: DEFAULT_UPDATE_POLICY,
    mode: "individual",
    currentVersion: "0.1.0",
    candidateVersion: "0.2.0",
    securityDecisionLevel: "secure",
  });
  assert(newer.apply === true, "newer secure update should apply");

  const critical = shouldApplyUpdate({
    policy: DEFAULT_UPDATE_POLICY,
    mode: "enhanced",
    currentVersion: "0.1.0",
    candidateVersion: "0.2.0",
    securityDecisionLevel: "critical",
  });
  assert(critical.apply === false, "critical posture must pause updates");

  const older = shouldApplyUpdate({
    policy: DEFAULT_UPDATE_POLICY,
    mode: "individual",
    currentVersion: "0.3.0",
    candidateVersion: "0.2.0",
    securityDecisionLevel: "secure",
  });
  assert(older.apply === false, "older candidate must not apply");

  const stmt = getContinuityStatement();
  assert(stmt.includes("open source"), "continuity statement present");

  const quiet = ownerInkSwitch({ photographRequired: false, record: {} });
  assert(quiet.tripped === false, "ink switch stays quiet when no photograph is required");
  assert(quiet.notice === null, "no OTA notice without a photograph");
  const sent = ownerInkSwitch({ photographRequired: true, record: { purpose: "verify" } });
  assert(sent.tripped === true, "photographing the ink trips the switch");
  assert(
    sent.notice?.text === "A commercial may be buying an aspect for its own use.",
    "system-wide OTA notice",
  );
  assert(sent.notice?.imageStored === false, "no image stored");
  assert(sent.notice?.corporateAspectProfits === "community pool", "profits stay with the pool");
  const profit = routeCorporateAspectProfit(null);
  assert(profit.destination === "community pool" && profit.keptByCommercial === 0, "commercial keeps nothing");

  console.log("Auto-update smoke passed.");
  console.log(stmt);
}

main();
