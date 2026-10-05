import assert from "node:assert/strict";
import test from "node:test";
import { verifyWithOwnerInk, FEDERAL_POSTURE } from "../src/lib/trv/digital-id.ts";
import {
  COMMERCIAL_ASPECT_OTA_NOTICE,
  ownerInkSwitch,
  routeCorporateAspectProfit,
} from "../src/lib/trv/owner-ink.ts";

test("photographing the owner's ink sends the system-wide OTA notice", () => {
  const quiet = verifyWithOwnerInk({ photographRequired: false, record: { purpose: "verify" } });
  assert.equal(quiet.role, "dead man's switch");
  assert.equal(quiet.tripped, false);
  assert.equal(quiet.notice, null);

  const sent = ownerInkSwitch({ photographRequired: true, record: { purpose: "verify" } });
  assert.equal(sent.tripped, true);
  assert.equal(sent.notice?.scope, "system-wide");
  assert.equal(sent.notice?.channel, "ota");
  assert.equal(sent.notice?.text, COMMERCIAL_ASPECT_OTA_NOTICE);
  assert.equal(sent.notice?.text, "A commercial may be buying an aspect for its own use.");
  assert.equal(sent.notice?.imageStored, false);
  assert.equal(sent.notice?.imageDescribed, false);
  assert.equal(sent.notice?.imageUploaded, false);
  assert.equal(sent.notice?.corporateAspectProfits, "community pool");
  assert.equal(JSON.stringify(sent).includes("data:image"), false);
  assert.equal(
    FEDERAL_POSTURE.implemented.some((line) => line.includes("dead man's switch")),
    true,
  );
});

test("the owner's ink is not stored, described, or uploaded", () => {
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

test("corporate-aspect profits go to the community pool", () => {
  const unset = routeCorporateAspectProfit(null);
  assert.equal(unset.destination, "community pool");
  assert.equal(unset.amount, null);
  assert.equal(unset.keptByCommercial, 0);

  const routed = routeCorporateAspectProfit(40);
  assert.equal(routed.destination, "community pool");
  assert.equal(routed.amount, 40);
  assert.equal(routed.keptByCommercial, 0);
});
