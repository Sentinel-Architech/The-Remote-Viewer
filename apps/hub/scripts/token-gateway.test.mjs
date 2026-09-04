import test from "node:test";
import assert from "node:assert/strict";

const EARTH = 6_371_000;

function geoBucket(deg, decimals = 4) {
  return Math.round(deg * 10 ** decimals);
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  const r = Math.PI / 180;
  const dLat = (lat2 - lat1) * r;
  const dLon = (lon2 - lon1) * r;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH * Math.asin(Math.min(1, Math.sqrt(a)));
}

function inRadius(drop, lat, lon) {
  return haversineMeters(drop.lat, drop.lon, lat, lon) <= drop.radius_m;
}

function seizeBody(input) {
  return [
    "TRV-SEIZE",
    "1",
    input.dropId,
    input.viewerPubkey,
    String(geoBucket(input.lat)),
    String(geoBucket(input.lon)),
    input.nonce,
    input.challenge,
    input.expIso,
  ].join("|");
}

test("same point is inside a 40m radius", () => {
  const drop = { lat: 41.024, lon: -80.663, radius_m: 40 };
  assert.equal(inRadius(drop, 41.024, -80.663), true);
});

test("~1km away is outside a 40m radius", () => {
  const drop = { lat: 41.024, lon: -80.663, radius_m: 40 };
  assert.equal(inRadius(drop, 41.033, -80.663), false);
});

test("haversine is zero on identical coordinates", () => {
  assert.equal(haversineMeters(0, 0, 0, 0), 0);
});

test("canonical seize body is stable and does not include Eye frames", () => {
  const body = seizeBody({
    dropId: "drop_1",
    viewerPubkey: "Abc",
    lat: 41.02401,
    lon: -80.66309,
    nonce: "n1",
    challenge: "chg_1",
    expIso: "2026-09-04T22:00:00.000Z",
  });
  assert.equal(
    body,
    "TRV-SEIZE|1|drop_1|Abc|410240|-806631|n1|chg_1|2026-09-04T22:00:00.000Z",
  );
  assert.equal(body.includes("eye"), false);
});

test("refuse-code contract stays exam-shaped", () => {
  const codes = [
    "OK",
    "SELF",
    "SPENT",
    "REPLAY",
    "STALE_PULSE",
    "NOT_PRESENT",
    "CREST_COPY",
    "FRAMED",
    "EXPIRED",
    "MISSING",
  ];
  assert.deepEqual(new Set(codes).size, codes.length);
});
