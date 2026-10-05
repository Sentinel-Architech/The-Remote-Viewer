import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { INSTALL_TUTORIALS } from "../src/lib/trv/install-tutorial.ts";
import { measureShippedMiniMind } from "../src/lib/trv/minimind2-measure.ts";
import {
  SHIPPED_MODEL_LICENSE,
  SHIPPED_PARAMETER_COUNT,
  SHIPPED_WEIGHT_BYTES,
  SHIPPED_WEIGHT_SHA256,
} from "../src/lib/trv/minimind2-small.ts";

test("the shipped weight file is MiniMind2-Small and measuring it is not a run", () => {
  const measured = measureShippedMiniMind();
  assert.equal(measured.model, "MiniMind2-Small");
  assert.equal(measured.license, SHIPPED_MODEL_LICENSE);
  assert.equal(SHIPPED_MODEL_LICENSE, "Apache-2.0");
  assert.equal(measured.filesFound, 1);
  assert.equal(measured.filesRequired, 1);
  assert.equal(measured.fileBytes, SHIPPED_WEIGHT_BYTES);
  assert.equal(measured.fileBytes, 51_667_832);
  assert.equal(measured.parameterCount, SHIPPED_PARAMETER_COUNT);
  assert.equal(measured.parameterCount, 25_829_888);
  assert.equal(measured.sha256, SHIPPED_WEIGHT_SHA256);
  assert.equal(measured.inferenceRan, false);
  assert.equal(measured.fetched, false);
  assert.ok(measured.headerBytes != null && measured.headerBytes > 8);
  assert.ok(measured.headerBytes < measured.fileBytes!);
  assert.match(measured.reason, /was not executed/);
  assert.match(measured.reason, /not a run/);
  const license = readFileSync(new URL("../weights/minimind2-small/LICENSE", import.meta.url), "utf8");
  assert.match(license, /Apache License/);
  assert.match(license, /Version 2\.0/);
  const notice = readFileSync(new URL("../weights/minimind2-small/NOTICE", import.meta.url), "utf8");
  assert.match(notice, /jingyaogong\/MiniMind2-Small/);
  assert.equal(/gemini|google|alphabet/i.test(INSTALL_TUTORIALS.join("\n")), false);
  assert.match(INSTALL_TUTORIALS.join("\n"), /Pixel 7/);
  assert.match(INSTALL_TUTORIALS.join("\n"), /signing key is not available/);
});
