import assert from "node:assert/strict";
import test from "node:test";
import {
  accountRegistryGate,
  childProtectionRule,
  enforceHubDecision,
  evaluateHubSecurity,
} from "../src/lib/sentinel.ts";

test("hydra child protection and the unwired registry gate live in the native stack", async () => {
  const gate = accountRegistryGate();
  assert.equal(gate.place, "native-security-stack");
  assert.equal(gate.wired, false);
  assert.equal(gate.noticeSent, false);
  assert.equal(gate.accountRefused, false);

  const rule = childProtectionRule(false);
  assert.equal(rule.place, "native-security-stack");
  assert.equal(rule.name, "hydra-child-protection");
  assert.equal(rule.blocked, false);
  assert.equal(rule.search, false);
  assert.equal(rule.contact, false);
  assert.equal(rule.harm, false);
  assert.equal(rule.noticeSent, false);
  assert.equal(rule.descriptionStored, false);

  const open = await evaluateHubSecurity({ handle: "viewer", mode: "individual" });
  assert.equal(open.nativeStack, true);
  assert.deepEqual(open.registry, gate);
  assert.deepEqual(open.childProtection, rule);
  assert.equal(enforceHubDecision(open, "individual").allowed, true);

  const blocked = await evaluateHubSecurity({
    handle: "viewer",
    mode: "individual",
    childSexualExploitation: true,
  });
  assert.equal(blocked.recommendation, "isolate");
  assert.equal(blocked.overallScore, 0);
  assert.equal(blocked.childProtection.blocked, true);
  assert.equal(blocked.childProtection.noticeSent, false);
  assert.equal(blocked.childProtection.search, false);
  assert.equal(blocked.registry.noticeSent, false);
  assert.equal(blocked.registry.wired, false);
  const enforcement = enforceHubDecision(blocked, "individual");
  assert.equal(enforcement.allowed, false);
  assert.equal(enforcement.localOverrideAvailable, false);
});
