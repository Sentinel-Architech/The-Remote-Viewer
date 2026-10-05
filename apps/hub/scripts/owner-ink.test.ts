import assert from "node:assert/strict";
import test from "node:test";
import { verifyWithOwnerInk, FEDERAL_POSTURE } from "../src/lib/trv/digital-id.ts";
import {
  COMMERCIAL_ASPECT_WARNING,
  corporateAspectSale,
  ownerInkSwitch,
} from "../src/lib/trv/owner-ink.ts";

test("photographing to verify raises the system-wide warning", () => {
  const quiet = verifyWithOwnerInk({ photographRequired: false, record: { purpose: "verify" } });
  assert.equal(quiet.role, "dead man's switch");
  assert.equal(quiet.tripped, false);
  assert.equal(quiet.warning, null);

  const sent = ownerInkSwitch({ photographRequired: true, record: { purpose: "verify" } });
  assert.equal(sent.tripped, true);
  assert.equal(sent.warning?.scope, "system-wide");
  assert.equal(sent.warning?.text, COMMERCIAL_ASPECT_WARNING);
  assert.equal(
    sent.warning?.text,
    "A commercial may be buying an aspect of The Remote Viewer for its own use.",
  );
  assert.equal(sent.warning?.imageStored, false);
  assert.equal(sent.warning?.imageUploaded, false);
  assert.equal(sent.warning?.sale.profits, "community pool");
  assert.equal(sent.warning?.sale.payout, null);
  assert.equal(sent.warning?.sale.buyer, null);
  assert.equal(JSON.stringify(sent).includes("data:image"), false);
  assert.equal(
    FEDERAL_POSTURE.implemented.some((line) => line.includes("system-wide warning")),
    true,
  );
});

test("no photo is stored or uploaded", () => {
  assert.throws(() => ownerInkSwitch({ photographRequired: true, record: { image: "absent" } }));
  assert.throws(() =>
    ownerInkSwitch({ photographRequired: false, record: { upload: "not-a-destination" } }),
  );
  assert.throws(() =>
    ownerInkSwitch({ photographRequired: true, record: { note: "data:image/png;base64,AAAA" } }),
  );
  assert.throws(() =>
    ownerInkSwitch({ photographRequired: true, record: { bytes: new Uint8Array([1, 2, 3]) } }),
  );
});

test("a corporate aspect sale sends profits to the community pool", () => {
  const sale = corporateAspectSale();
  assert.equal(sale.profits, "community pool");
  assert.equal(sale.payout, null);
  assert.equal(sale.buyer, null);
});
