import assert from "node:assert/strict";
import test from "node:test";
import { accountRegistryGate, evaluateHubSecurity } from "../src/lib/sentinel.ts";

test("account creation registry gate stays inside the native stack and unwired", async () => {
  const gate = accountRegistryGate();
  assert.equal(gate.place, "native-security-stack");
  assert.equal(gate.wired, false);
  assert.equal(gate.queried, false);
  assert.equal(gate.source, null);
  assert.equal(gate.match, null);
  assert.equal(gate.notice, null);
  assert.equal(gate.noticeSent, false);
  assert.equal(gate.accountRefused, false);
  assert.match(gate.reason, /did not run/);
  assert.equal(gate.reason.includes("http"), false);

  const decision = await evaluateHubSecurity({ handle: "viewer", mode: "individual" });
  assert.equal(decision.nativeStack, true);
  assert.deepEqual(decision.registry, gate);
});
