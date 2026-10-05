/**
 * Smoke test for Sentinel Security Protocol (native MoE).
 * Run: npm run smoke   (from sentinel-security-protocol/)
 *   or: npx tsx src/__tests__/moe.smoke.ts
 */

import { accountRegistryGate, evaluateSecurity, enforce } from "../index.js";

async function main() {
  console.log("=== Sentinel Security Protocol – Smoke Test ===\n");

  const individual = await evaluateSecurity({
    mode: "individual",
    handle: "test-citizen",
    opticalStatus: "verified",
  });
  console.log("Individual mode:");
  console.log("  score:", individual.overallScore.toFixed(3));
  console.log("  level:", individual.overallLevel);
  console.log("  recommendation:", individual.recommendation);
  console.log("  enforce:", enforce(individual, "individual"));
  console.log("");

  const enhanced = await evaluateSecurity({
    mode: "enhanced",
    handle: "test-citizen",
    opticalStatus: "unknown",
  });
  console.log("Enhanced mode:");
  console.log("  score:", enhanced.overallScore.toFixed(3));
  console.log("  level:", enhanced.overallLevel);
  console.log("  recommendation:", enhanced.recommendation);
  console.log("  enforce:", enforce(enhanced, "enhanced"));
  console.log("");

  if (individual.nativeStack !== true || enhanced.systemwide !== true) {
    throw new Error("Protocol invariants violated");
  }

  const gate = accountRegistryGate();
  const identity = individual.expertOutputs.find((output) => output.expert === "identity");
  const recorded = identity?.evidence?.registry as ReturnType<typeof accountRegistryGate> | undefined;
  if (
    gate.wired !== false ||
    gate.queried !== false ||
    gate.source !== null ||
    gate.match !== null ||
    gate.notice !== null ||
    gate.noticeSent !== false ||
    gate.accountRefused !== false ||
    recorded?.wired !== false ||
    recorded?.notice !== null ||
    recorded?.noticeSent !== false
  ) {
    throw new Error("Registry check must stay unwired inside the identity expert");
  }

  console.log("Smoke test passed. Native MoE operational.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
