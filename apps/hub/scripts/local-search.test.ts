import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildProgress } from "../src/lib/trv/build-progress.ts";
import { DECLASSIFIED_TITLES } from "../src/lib/trv/declassified-titles.ts";
import { ELECTION_CATALOG, ELECTION_INDEX_POSTURE } from "../src/lib/trv/election-index.ts";
import { EPSTEIN_INDEX, EPSTEIN_INDEX_POSTURE } from "../src/lib/trv/epstein-index.ts";
import { GATEWAY_DOCS } from "../src/lib/trv/gateway.ts";
import { localDeclassifiedSearch } from "../src/lib/trv/local-search.ts";
import { tierTokenExtra, quoteConverter } from "../src/lib/trv/rail-convert.ts";
import { carryModelPlan, SHIPPED_WEIGHT_BYTES, WEARABLE_SAFE_BYTES } from "../src/lib/trv/carry-model.ts";
import { fullWeightLowerBoundBytes } from "../src/lib/trv/mimo-capacity.ts";
import { qualifyFingerprint, qualifyNfc, qualifySelfie, FEDERAL_POSTURE } from "../src/lib/trv/digital-id.ts";
import { viewerSeatFromUserAgent } from "../src/lib/trv/viewer-seat.ts";

function listedUrls(source: string): URL[] {
  const urls: URL[] = [];
  for (const match of source.matchAll(/https?:\/\/[^\s"'`<>)]+/g)) {
    try {
      urls.push(new URL(match[0]));
    } catch {
      continue;
    }
  }
  return urls;
}

function sourceListsUrl(source: string, expected: string): boolean {
  const want = new URL(expected);
  return listedUrls(source).some(
    (url) => url.origin === want.origin && url.pathname === want.pathname,
  );
}

test("local search stays on the device and uses only existing gateway titles", () => {
  const result = localDeclassifiedSearch({ query: "Hemi-Sync", verified: false });
  assert.equal(result.sentOffDevice, false);
  assert.equal(result.networkRequests, 0);
  assert.equal(result.archiveOpened, false);
  assert.equal(result.pdfEngine, "not-included");
  assert.ok(result.hits.some((hit) => hit.title === "Hemi-Sync — what the document claims"));
  const titles = new Set([
    ...GATEWAY_DOCS.map((doc) => doc.title),
    ...DECLASSIFIED_TITLES.map((doc) => doc.title),
  ]);
  for (const hit of result.hits) {
    if (hit.kind !== "local-file") assert.equal(titles.has(hit.title), true);
  }
  assert.match(result.reason, /not sent off this device/);
});

test("a sealed method body is not opened and an unknown title is not invented", () => {
  const result = localDeclassifiedSearch({ query: "Focus 10 entry", verified: false });
  const method = result.hits.find((hit) => hit.id === "method-focus-10");
  assert.ok(method);
  assert.equal(method?.locked, true);
  assert.match(method?.excerpt ?? "", /not opened/);
  assert.equal(result.hits.some((hit) => hit.title === "Project Sun Streak"), false);
});

test("an empty local pdf is not given a title and is not parsed", () => {
  const result = localDeclassifiedSearch({
    query: "archive",
    verified: true,
    localFiles: [
      { name: "", text: "archive" },
      { name: "notes.txt", text: "local archive note" },
      { name: "scan.pdf", text: "" },
    ],
  });
  assert.deepEqual(result.unparsed, ["scan.pdf"]);
  assert.ok(result.hits.some((hit) => hit.title === "notes.txt"));
  assert.equal(result.hits.some((hit) => hit.title === "scan.pdf"), false);
  assert.match(result.reason, /were not read/);
});

test("named programs are titles only and stay on the device", () => {
  assert.equal(DECLASSIFIED_TITLES.length, 30);
  const mk = localDeclassifiedSearch({ query: "MKUltra", verified: false });
  const hit = mk.hits.find((item) => item.kind === "title");
  assert.equal(hit?.title, "MKUltra (MKDELTA, MKNAOMI, CHATTER, BLUEBIRD, ARTICHOKE)");
  assert.equal(hit?.agency, "CIA");
  assert.equal(hit?.years, "1953–1973");
  assert.equal(hit?.excerpt, "");
  const kh9 = localDeclassifiedSearch({ query: "KH-9", verified: false });
  assert.deepEqual(
    kh9.hits.filter((item) => item.kind === "title").map((item) => item.title),
    ["HEXAGON (KH-9, Big Bird)"],
  );
  const source = readFileSync(new URL("../src/lib/trv/declassified-titles.ts", import.meta.url), "utf8");
  assert.equal(/body:|summary:|fetch\(|https?:/i.test(source), false);
  assert.equal(source.includes("The program"), false);
});

test("the Epstein index is third-party titles and stays on the device", () => {
  assert.equal(EPSTEIN_INDEX.length, 17);
  assert.equal(EPSTEIN_INDEX_POSTURE.thirdPartyIndex, true);
  assert.equal(EPSTEIN_INDEX_POSTURE.verifiedGovernmentText, false);
  assert.equal(EPSTEIN_INDEX_POSTURE.documentBodyStored, false);
  const flight = localDeclassifiedSearch({ query: "EFTA-DS03", verified: false });
  const titles = flight.hits.filter((item) => item.kind === "index");
  assert.deepEqual(titles.map((item) => item.title), ["EFTA-DS03 flight logs"]);
  assert.equal(titles[0]?.excerpt, "");
  assert.equal(titles[0]?.indexMark, "third-party");
  assert.equal(flight.networkRequests, 0);
  assert.equal(flight.sentOffDevice, false);
  const source = readFileSync(new URL("../src/lib/trv/epstein-index.ts", import.meta.url), "utf8");
  assert.equal(/body:|summary:|fetch\(|\d+\s+pages|\d+\s+photos/i.test(source), false);
  assert.equal(sourceListsUrl(source, "https://www.justice.gov/epstein"), true);
  assert.equal(sourceListsUrl(source, "https://oversight.house.gov"), true);
});

test("the election catalog stores the named text and stays on the device", () => {
  assert.equal(ELECTION_CATALOG.entries.length, 9);
  assert.equal(ELECTION_INDEX_POSTURE.verified, false);
  assert.equal(ELECTION_INDEX_POSTURE.governmentRecord, false);
  assert.equal(ELECTION_INDEX_POSTURE.declassifiedBadgeVerified, false);
  assert.equal(ELECTION_INDEX_POSTURE.source, "unverified third-party text");
  const fubar = localDeclassifiedSearch({ query: "Project FUBAR", verified: false });
  const hit = fubar.hits.find((item) => item.kind === "index");
  assert.equal(hit?.title, "Project FUBAR / Italian Election Covert Action");
  assert.equal(hit?.years, "1948");
  assert.equal(hit?.agency, "CIA");
  assert.equal(
    hit?.excerpt,
    "Declassified CIA records detailing the agency's first major covert electoral intervention. Included million-dollar funding allocations to anti-communist parties, forged letters, and media propaganda to sway Italy's general election away from the PCI coalition.",
  );
  assert.equal(hit?.indexMark, "unverified-catalog");
  assert.equal(fubar.networkRequests, 0);
  assert.equal(fubar.sentOffDevice, false);
  const fubarEntry = ELECTION_CATALOG.entries[0];
  assert.equal(fubarEntry?.label, "Project FUBAR / Italian election 1948");
  assert.equal(fubarEntry?.officialName, "NSC 1/3");
  assert.equal(fubarEntry?.href, "https://history.state.gov/historicaldocuments/frus1948v03/d475");
  const track = ELECTION_CATALOG.entries[3];
  assert.equal(track?.label, "Operation TRACK III");
  assert.equal(track?.officialName, "Track Two");
  assert.equal(track?.href, "https://history.state.gov/historicaldocuments/frus1969-76v21/d107");
  assert.equal(ELECTION_CATALOG.entries[8]?.href, undefined);
  const cisa = localDeclassifiedSearch({ query: "https://www.cisa.gov/topics/election-security", verified: false });
  assert.equal(
    cisa.hits.find((item) => item.kind === "index")?.title,
    "CISA Cyber Vulnerability Advisories & Supply Chain Reports",
  );
  const door = localDeclassifiedSearch({ query: "https://www.nass.org/can-i-vote", verified: false });
  assert.deepEqual(
    door.hits.filter((item) => item.kind === "index").map((item) => item.title),
    ["https://www.nass.org/can-i-vote"],
  );
  assert.equal(door.networkRequests, 0);
  const source = readFileSync(new URL("../src/lib/trv/election-index.ts", import.meta.url), "utf8");
  assert.equal(/fetch\(/i.test(source), false);
  assert.equal(source.toLowerCase().split("gemini").length, 1);
  assert.equal(source.toLowerCase().split("google").length, 1);
  assert.equal(sourceListsUrl(source, "https://www.nass.org/can-i-vote"), true);
  assert.equal(sourceListsUrl(source, "https://vault.fbi.gov/cointel-pro"), true);
  assert.equal(source.includes("PAGE 1 OF 2"), true);
  assert.equal(source.includes("PAGE 2 OF 2"), true);
});

test("the search module does not call the network", () => {
  const source = readFileSync(new URL("../src/lib/trv/local-search.ts", import.meta.url), "utf8");
  assert.equal(/fetch\(|https?:|cia\.gov|xmlhttprequest/i.test(source), false);
});

test("build progress counts only measured work", () => {
  const waiting = buildProgress({
    fitChecked: false,
    fits: null,
    filesFound: null,
    filesRequired: null,
    headerBytes: null,
    fileBytes: null,
  });
  assert.equal(waiting.every((step) => step.state === "waiting" && step.completed == null), true);
  const checked = buildProgress({
    fitChecked: true,
    fits: false,
    filesFound: 0,
    filesRequired: 2,
    headerBytes: null,
    fileBytes: null,
  });
  const fit = checked.find((step) => step.id === "fit");
  const files = checked.find((step) => step.id === "weight-files");
  const copy = checked.find((step) => step.id === "weight-copy");
  const network = checked.find((step) => step.id === "network");
  assert.equal(fit?.completed, 1);
  assert.equal(fit?.total, 1);
  assert.equal(files?.completed, 0);
  assert.equal(files?.total, 2);
  assert.equal(copy?.state, "waiting");
  assert.equal(copy?.completed, null);
  assert.equal(network?.state, "waiting");
  assert.match(network?.note ?? "", /not executed/);
});

test("carry seats do not run the full weights and a wearable does not fit MiniMind", () => {
  assert.equal(viewerSeatFromUserAgent("Mozilla/5.0 (iPad)"), "tablet");
  assert.equal(viewerSeatFromUserAgent("foldable"), "foldable");
  assert.equal(viewerSeatFromUserAgent("Wear OS watch"), "wearable");
  assert.equal(viewerSeatFromUserAgent("Android Auto"), "android-auto");
  assert.equal(viewerSeatFromUserAgent("Mozilla/5.0 (X11; Linux)"), "stationary");
  const wearable = carryModelPlan("wearable", null);
  assert.equal(wearable.fits, false);
  assert.equal(wearable.inferenceRan, false);
  assert.ok(SHIPPED_WEIGHT_BYTES > WEARABLE_SAFE_BYTES);
  const phone = carryModelPlan("phone", null);
  assert.equal(phone.model, "MiniMind2-Small");
  const desk = carryModelPlan("stationary", null);
  assert.equal(desk.model, "MiniMind2-Small");
  assert.equal(desk.inferenceRan, false);
  assert.match(desk.reason, /did not run/);
  assert.equal(phone.fits, true);
  assert.equal(phone.inferenceRan, false);
  assert.match(phone.reason, /did not run/);
  const huge = carryModelPlan("tablet", fullWeightLowerBoundBytes());
  assert.equal(huge.inferenceRan, false);
  assert.match(huge.reason, /not loaded/);
});

test("converter caps and published tier extras do not move money", () => {
  assert.equal(tierTokenExtra("verified", null).amount, 1200);
  assert.equal(tierTokenExtra("sentinel", null).amount, 2000);
  assert.equal(tierTokenExtra("squad", null).amount, null);
  assert.equal(tierTokenExtra("command", null).amount, null);
  assert.equal(tierTokenExtra("sovereign", null).amount, null);
  assert.equal(tierTokenExtra("sovereign", null).openToBankBalance, true);
  const quote = quoteConverter({
    seat: "stationary",
    planId: "verified",
    direction: "card-to-crypto",
    units: 10,
    bulk: false,
    spentThisMonthUsd: 0,
    newViewerQrShares: 0,
    bulkDiscountsUsed: 0,
  });
  assert.equal(quote.moneyMoved, false);
  assert.equal(quote.rate, 1);
  assert.equal(quote.shopCredit, 10);
  assert.equal(quote.tierExtra, 1200);
  assert.equal(quote.cardRail, "stripe");
  assert.equal(quote.cryptoRail, "phantom");
  assert.throws(
    () =>
      quoteConverter({
        seat: "stationary",
        planId: "initiate",
        direction: "crypto-to-card",
        units: 1001,
        bulk: false,
        spentThisMonthUsd: 0,
        newViewerQrShares: 0,
        bulkDiscountsUsed: 0,
      }),
    /1000/,
  );
  const bulk = quoteConverter({
    seat: "stationary",
    planId: "initiate",
    direction: "card-to-crypto",
    units: 10,
    bulk: true,
    spentThisMonthUsd: 0,
    newViewerQrShares: 1,
    bulkDiscountsUsed: 0,
  });
  assert.equal(bulk.completed, false);
  assert.equal(bulk.bulkQuantity, null);
  assert.equal(bulk.bulkDiscount, 0.1);
  assert.equal(bulk.moneyMoved, false);
  assert.throws(
    () =>
      quoteConverter({
        seat: "phone",
        planId: "verified",
        direction: "card-to-crypto",
        units: 1,
        bulk: false,
        spentThisMonthUsd: 0,
        newViewerQrShares: 0,
        bulkDiscountsUsed: 0,
      }),
    /does not pay/,
  );
});

test("digital id capture rules stay native and uncertified", () => {
  assert.equal(FEDERAL_POSTURE.certified, false);
  assert.equal(FEDERAL_POSTURE.federalGuarantee, false);
  assert.equal(qualifyFingerprint({ liveSensor: false, storedPhoto: true }).counts, false);
  assert.equal(qualifyFingerprint({ liveSensor: true, storedPhoto: false }).counts, true);
  assert.equal(qualifySelfie({ source: "file", seconds: 20 }).counts, false);
  assert.equal(qualifySelfie({ source: "live-camera", seconds: 20 }).counts, true);
  assert.equal(qualifySelfie({ source: "live-camera", seconds: 10 }).counts, false);
  assert.equal(qualifyNfc({ adapterPresent: false, tagRead: true }).read, false);
  assert.equal(qualifyNfc({ adapterPresent: false, tagRead: true }).capable, false);
});
