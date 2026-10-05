import assert from "node:assert/strict";
import test from "node:test";
import { answerWakePhrase } from "../src/lib/trv/sentinel-voice.ts";

test("hey sentinel plus a question stays unwired and invents nothing", () => {
  const fact = answerWakePhrase("hey sentinel does a dapp like the remote viewer exist");
  assert.equal(fact.wake, true);
  if (!fact.wake) return;
  assert.equal(fact.source, "unwired");
  assert.equal(fact.answer, null);
  assert.equal(fact.text, "No fact source is wired. This answer was not invented.");
  assert.equal(fact.question, "does a dapp like the remote viewer exist");
});

test("a sentence without the wake phrase is not a fact lookup", () => {
  const fact = answerWakePhrase("what is the weather");
  assert.equal(fact.wake, false);
  assert.equal(fact.answer, null);
  assert.equal(fact.source, null);
});
