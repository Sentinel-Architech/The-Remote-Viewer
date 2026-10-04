import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runMimoOnBox } from "../src/lib/trv/mimo-local.ts";

test("missing weights are not fetched and the model does not run", () => {
  const result = runMimoOnBox({
    ...process.env,
    TRV_MIMO_WEIGHTS: join(tmpdir(), `trv-mimo-absent-${Date.now()}`),
  });
  assert.equal(result.status, "missing-weights");
  assert.equal(result.loaded, false);
  assert.equal(result.processRan, false);
  assert.equal(result.inferenceRan, false);
  assert.equal(result.fetched, false);
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

test("a local weight directory is read and the network is not executed", async () => {
  const dir = await mkdtemp(join(tmpdir(), "trv-mimo-"));
  const bytes = Buffer.from("trv-local-weights");
  await writeFile(
    join(dir, "config.json"),
    JSON.stringify({ model: "MiMo-V2.6-Pro", owner: "trv", remote: false, license: "MIT" }),
  );
  await writeFile(join(dir, "model.safetensors"), bytes);
  try {
    const result = runMimoOnBox({ ...process.env, TRV_MIMO_WEIGHTS: dir });
    assert.equal(result.status, "loaded");
    assert.equal(result.loaded, true);
    assert.equal(result.processRan, true);
    assert.equal(result.inferenceRan, false);
    assert.equal(result.fetched, false);
    assert.equal(result.bytes, bytes.length);
    assert.match(result.reason, /was not executed/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("a remote host named in the weight config is refused", async () => {
  const dir = await mkdtemp(join(tmpdir(), "trv-mimo-remote-"));
  await writeFile(
    join(dir, "config.json"),
    JSON.stringify({
      model: "MiMo-V2.6-Pro",
      owner: "trv",
      remote: false,
      endpoint: "https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL",
    }),
  );
  await writeFile(join(dir, "model.safetensors"), Buffer.from("x"));
  try {
    const result = runMimoOnBox({ ...process.env, TRV_MIMO_WEIGHTS: dir });
    assert.equal(result.status, "refused");
    assert.equal(result.loaded, false);
    assert.equal(result.inferenceRan, false);
    assert.equal(result.fetched, false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
