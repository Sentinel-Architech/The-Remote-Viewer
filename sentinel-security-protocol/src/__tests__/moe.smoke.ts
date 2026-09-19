/**
 * Smoke test for Sentinel Security Protocol (native MoE).
 * Run with: npx tsx src/__tests__/moe.smoke.ts
 */

import { evaluateSecurity, enforce } from "../index.js";

async function main() {
  console.log("=== Sentinel Security Protocol – Smoke Test ===\n");

  // Individual mode
  const individual = await evaluateSecurity({
    mode: "individual",
    handle: "test-citizen",
    opticalStatus: "verified",
  });
  console.log("Individual mode decision:");
  console.log(JSON.stringify(individual, null, 2));
  console.log("Enforcement:", enforce(individual, "individual"));
  console.log("");

  // Enhanced mode
  const enhanced = await evaluateSecurity({
    mode: "enhanced",
    handle: "test-citizen",
    opticalStatus: "unknown",
  });
  console.log("Enhanced mode decision:");
  console.log(JSON.stringify(enhanced, null, 2));
  console.log("Enforcement:", enforce(enhanced, "enhanced"));
  console.log("");

  console.log("Smoke test complete. Native MoE operational.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
