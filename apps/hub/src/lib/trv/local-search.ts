import { DECLASSIFIED_TITLES } from "./declassified-titles";
import { docsForTier, type GatewayDoc } from "./gateway";

/**
 * On-device search over texts this install already holds.
 * Spec 05 names MuPDF, Poppler, Tesseract, and FTS5. They are not in this search.
 * Spec 02 names a multi-terabyte archive. It is searched only when its text is already here.
 * A query is never sent off the device.
 */
export type LocalFile = {
  name: string;
  text: string;
};

export type LocalHit = {
  id: string;
  title: string;
  kind: GatewayDoc["kind"] | "local-file" | "title";
  excerpt: string;
  locked: boolean;
  agency?: string;
  years?: string;
};

export type LocalSearchResult = {
  query: string;
  sentOffDevice: false;
  networkRequests: 0;
  pdfEngine: "not-included";
  archiveOpened: false;
  hits: LocalHit[];
  unparsed: string[];
  reason: string;
};

function terms(query: string): { phrase: string | null; words: string[] } {
  const phrase = query.match(/"([^"]+)"/)?.[1]?.trim().toLowerCase() || null;
  const words = query
    .replace(/"[^"]*"/g, " ")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1);
  return { phrase, words };
}

function matches(haystack: string, phrase: string | null, words: string[], raw: string): boolean {
  const text = haystack.toLowerCase();
  const query = raw.toLowerCase().replace(/\s+/g, " ").trim();
  if (phrase) return text.includes(phrase) && words.every((word) => text.includes(word));
  if (/[\d-]/.test(query) && query.length > 2) return text.includes(query);
  if (words.length === 0) return false;
  return words.every((word) => text.includes(word));
}

function excerpt(body: string, phrase: string | null, words: string[]): string {
  const needle = (phrase || words[0] || "").toLowerCase();
  const at = body.toLowerCase().indexOf(needle);
  const start = at < 0 ? 0 : Math.max(0, at - 40);
  return body.slice(start, start + 180);
}

export function localDeclassifiedSearch(input: {
  query: string;
  verified: boolean;
  localFiles?: LocalFile[];
  archiveBytes?: number | null;
}): LocalSearchResult {
  const query = input.query.trim().slice(0, 200);
  const { phrase, words } = terms(query);
  const unparsed: string[] = [];
  const hits: LocalHit[] = [];
  const archiveOpened = typeof input.archiveBytes === "number" && input.archiveBytes > 0;

  if (!query || (!phrase && words.length === 0)) {
    return {
      query,
      sentOffDevice: false,
      networkRequests: 0,
      pdfEngine: "not-included",
      archiveOpened: false,
      hits: [],
      unparsed,
      reason: "Nothing was searched. The query stayed on this device.",
    };
  }

  for (const doc of docsForTier(input.verified)) {
    const locked = doc.kind === "method" && !input.verified;
    const haystack = locked ? `${doc.title}\n${doc.summary}` : `${doc.title}\n${doc.summary}\n${doc.body}`;
    if (!matches(haystack, phrase, words, query)) continue;
    hits.push({
      id: doc.id,
      title: doc.title,
      kind: doc.kind,
      excerpt: locked ? "This method stays sealed. The steps were not opened." : excerpt(doc.body, phrase, words),
      locked,
    });
  }

  for (const named of DECLASSIFIED_TITLES) {
    const line = `${named.agency} ${named.title} ${named.years}`;
    if (!matches(line, phrase, words, query)) continue;
    hits.push({
      id: `${named.agency}:${named.title}`,
      title: named.title,
      kind: "title",
      excerpt: "",
      locked: false,
      agency: named.agency,
      years: named.years,
    });
  }

  for (const file of input.localFiles ?? []) {
    const name = file.name.trim();
    if (!name) continue;
    if (/\.pdf$/i.test(name) && file.text.trim().length === 0) {
      unparsed.push(name);
      continue;
    }
    if (!file.text.trim()) continue;
    if (!matches(`${name}\n${file.text}`, phrase, words, query)) continue;
    hits.push({
      id: name,
      title: name,
      kind: "local-file",
      excerpt: excerpt(file.text, phrase, words),
      locked: false,
    });
  }

  const archiveLine = archiveOpened
    ? "Local archive bytes were named. Only the text already passed in was searched."
    : "The multi-terabyte archive is not on this device, so it was not searched.";
  const pdfLine =
    unparsed.length > 0
      ? "MuPDF, Poppler, and Tesseract are not in this build, so those PDFs were not read."
      : "No unread PDF was added.";

  return {
    query,
    sentOffDevice: false,
    networkRequests: 0,
    pdfEngine: "not-included",
    archiveOpened,
    hits,
    unparsed,
    reason: `${hits.length} local match${hits.length === 1 ? "" : "es"}. ${archiveLine} ${pdfLine} The query was not sent off this device.`,
  };
}
