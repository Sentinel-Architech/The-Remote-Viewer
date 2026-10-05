import assert from "node:assert/strict";
import test from "node:test";
import { passkeyRelyingParty, rejectPasskeySeedPhrase } from "../src/lib/auth/passkey.ts";

test("passkey relying party accepts localhost and rejects a raw IP", () => {
  const party = passkeyRelyingParty("http://localhost:8080");
  assert.equal(party.rpID, "localhost");
  assert.equal(party.origin, "http://localhost:8080");
  assert.equal(party.method, "passkey");
  assert.equal(party.google, false);
  assert.equal(party.seedPhraseAccepted, false);
  assert.equal(party.emailFallback, "/login");
  assert.throws(
    () => passkeyRelyingParty("http://127.0.0.1:8080"),
    /WebAuthn rejects an IP address/,
  );
});

test("a seed phrase is not a passkey", () => {
  assert.throws(() => rejectPasskeySeedPhrase("my seed phrase"), /not a sign-in/);
  assert.doesNotThrow(() => rejectPasskeySeedPhrase("Viewer"));
});
