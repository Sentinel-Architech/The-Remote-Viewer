import assert from "node:assert/strict";
import test from "node:test";
import { MIMO_REPO_DIR, runMimoOnBox } from "../src/lib/trv/mimo-local.ts";

test("missing repo weights are not fetched and the model does not run", () => {
  const result = runMimoOnBox({ ...process.env, TRV_MIMO_WEIGHTS: "" });
  assert.equal(result.weightsDir, MIMO_REPO_DIR);
  assert.equal(result.status, "missing-weights");
  assert.equal(result.loaded, false);
  assert.equal(result.processRan, false);
  assert.equal(result.inferenceRan, false);
  assert.equal(result.fetched, false);
  assert.equal(result.filesRequired, 2);
  assert.equal(result.filesFound, 0);
  assert.equal(result.headerBytes, null);
  assert.equal(result.remote, false);
  assert.equal(result.xiaomiPaid, false);
  assert.equal(result.sendsViewerData, false);
  assert.match(result.reason, /did not load and did not run/);
});

test("a remote weight URL is refused before any load", () => {
  assert.throws(
    () => runMimoOnBox({ ...process.env, TRV_MIMO_WEIGHTS: "https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL" }),
    /TRV-owned copy/,
  );
});

test("a weight path outside this repo does not run", () => {
  assert.throws(
    () => runMimoOnBox({ ...process.env, TRV_MIMO_WEIGHTS: "/tmp/trv-mimo-not-in-repo" }),
    /weights directory in this repo/,
  );
});
