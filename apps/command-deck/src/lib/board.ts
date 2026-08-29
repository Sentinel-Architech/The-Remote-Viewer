import { createServerFn } from "@tanstack/react-start";
import { RANKS, rankFor } from "@/lib/progress";
import { type BoardScope } from "@/lib/pulse";

export type BoardRow = {
  place: number;
  pubkey: string;
  short: string;
  rankLevel: number;
  rankTitle: string;
  osTitle: string;
  learned: number;
  xp: number;
  seizes: number;
  healed: number;
  cleared: number;
  watches: number;
  score: number;
};

export type PulseRow = {
  place: number;
  pubkey: string;
  short: string;
  pulseScore: number;
  seizes: number;
};

export type BoardPost = {
  pubkey: string;
  xp: number;
  seizes: number;
  healed: number;
  cleared: number;
  watches: number;
  learned: number;
};

export type PulsePost = {
  pubkey: string;
  scope: BoardScope;
  region: string;
  pulseId: number;
  pulseScore: number;
  seizes: number;
};

type BoardSqlRow = {
  pubkey: string;
  short: string;
  rank_level: number;
  rank_title: string;
  os_title: string;
  learned: number;
  xp: number;
  seizes: number;
  healed: number;
  cleared: number;
  watches: number;
  score: number;
};

type PulseSqlRow = {
  pubkey: string;
  short: string;
  pulse_score: number;
  seizes: number;
};

const OS_TITLES = ["Cataloging", "Learning", "Armed", "Autonomous"] as const;
const RANK_TITLES = RANKS.map((r) => r.title);
const SCOPES: BoardScope[] = ["local", "national", "globe"];

function clampInt(n: unknown, min: number, max: number) {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v)) return min;
  return Math.min(max, Math.max(min, v));
}

function shorten(pubkey: string) {
  if (pubkey.length <= 12) return pubkey;
  return `${pubkey.slice(0, 6)}…${pubkey.slice(-4)}`;
}

function osFromLearned(n: number) {
  if (n >= 6) return "Autonomous";
  if (n >= 3) return "Armed";
  if (n > 0) return "Learning";
  return "Cataloging";
}

function parseKey(raw: unknown) {
  const pubkey = String(raw ?? "").trim();
  if (!/^[0-9A-Za-z]{12,80}$/.test(pubkey)) throw new Error("Viewer key rejected");
  return pubkey;
}

function parsePost(input: unknown): BoardPost {
  const raw = (input ?? {}) as Partial<BoardPost>;
  return {
    pubkey: parseKey(raw.pubkey),
    xp: clampInt(raw.xp, 0, 100000),
    seizes: clampInt(raw.seizes, 0, 20000),
    healed: clampInt(raw.healed, 0, 20000),
    cleared: clampInt(raw.cleared, 0, 20000),
    watches: clampInt(raw.watches, 0, 5000),
    learned: clampInt(raw.learned, 0, 6),
  };
}

function parsePulse(input: unknown): PulsePost {
  const raw = (input ?? {}) as Partial<PulsePost>;
  const scope = SCOPES.includes(raw.scope as BoardScope) ? (raw.scope as BoardScope) : "globe";
  const region = String(raw.region ?? "globe")
    .trim()
    .slice(0, 64)
    .replace(/[^\w+\-/:]/g, "") || "globe";
  return {
    pubkey: parseKey(raw.pubkey),
    scope,
    region: scope === "globe" ? "globe" : region,
    pulseId: clampInt(raw.pulseId, 0, 4_000_000_000),
    pulseScore: clampInt(raw.pulseScore, 0, 50000),
    seizes: clampInt(raw.seizes, 0, 20000),
  };
}

function toRows(rows: BoardSqlRow[]): BoardRow[] {
  return rows.map((r, i) => ({
    place: i + 1,
    pubkey: r.pubkey,
    short: r.short,
    rankLevel: r.rank_level,
    rankTitle: RANK_TITLES.includes(r.rank_title as (typeof RANK_TITLES)[number])
      ? r.rank_title
      : rankFor(r.xp).title,
    osTitle: OS_TITLES.includes(r.os_title as (typeof OS_TITLES)[number]) ? r.os_title : osFromLearned(r.learned),
    learned: r.learned,
    xp: r.xp,
    seizes: r.seizes,
    healed: r.healed,
    cleared: r.cleared,
    watches: r.watches,
    score: r.score,
  }));
}

async function fetchStandings() {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<BoardSqlRow>`
    select pubkey, short, rank_level, rank_title, os_title, learned, xp, seizes, healed, cleared, watches, score
    from mesh_board
    order by score desc, seizes desc, posted_at asc
    limit 40
  `;
  return toRows(rows);
}

async function fetchPulse(scope: BoardScope, region: string, pulseId: number) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<PulseSqlRow>`
    select pubkey, short, pulse_score, seizes
    from mesh_pulse
    where scope = ${scope}
      and pulse_id = ${pulseId}
      and (${scope} = 'globe' or region = ${region})
    order by pulse_score desc, seizes desc, posted_at asc
    limit 24
  `;
  return rows.map((r, i) => ({
    place: i + 1,
    pubkey: r.pubkey,
    short: r.short,
    pulseScore: r.pulse_score,
    seizes: r.seizes,
  }));
}

export const listBoard = createServerFn({ method: "GET" }).handler(async () => {
  return fetchStandings();
});

export const listPulse = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = (input ?? {}) as { scope?: string; region?: string; pulseId?: number };
    const scope = SCOPES.includes(raw.scope as BoardScope) ? (raw.scope as BoardScope) : "globe";
    return {
      scope,
      region: String(raw.region ?? "globe").slice(0, 64),
      pulseId: clampInt(raw.pulseId, 0, 4_000_000_000),
    };
  })
  .handler(async ({ data }) => {
    return fetchPulse(data.scope, data.region, data.pulseId);
  });

export const postStanding = createServerFn({ method: "POST" })
  .validator((input: unknown) => parsePost(input))
  .handler(async ({ data }) => {
    const rank = rankFor(data.xp);
    const osTitle = osFromLearned(data.learned);
    const short = shorten(data.pubkey);
    const score = data.xp + data.learned * 8 + data.seizes;
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into mesh_board (
        pubkey, short, rank_level, rank_title, os_title, learned, xp, seizes, healed, cleared, watches, score, posted_at
      ) values (
        ${data.pubkey}, ${short}, ${rank.level}, ${rank.title}, ${osTitle},
        ${data.learned}, ${data.xp}, ${data.seizes}, ${data.healed}, ${data.cleared}, ${data.watches}, ${score}, now()
      )
      on conflict (pubkey) do update set
        short = excluded.short,
        rank_level = excluded.rank_level,
        rank_title = excluded.rank_title,
        os_title = excluded.os_title,
        learned = excluded.learned,
        xp = excluded.xp,
        seizes = excluded.seizes,
        healed = excluded.healed,
        cleared = excluded.cleared,
        watches = excluded.watches,
        score = excluded.score,
        posted_at = now()
      where excluded.score >= mesh_board.score
    `;
    const rows = await fetchStandings();
    const mine = rows.find((r) => r.pubkey === data.pubkey) ?? null;
    return { rows, mine };
  });

export const postPulse = createServerFn({ method: "POST" })
  .validator((input: unknown) => parsePulse(input))
  .handler(async ({ data }) => {
    const short = shorten(data.pubkey);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into mesh_pulse (pubkey, short, scope, region, pulse_id, pulse_score, seizes, posted_at)
      values (
        ${data.pubkey}, ${short}, ${data.scope}, ${data.region}, ${data.pulseId}, ${data.pulseScore}, ${data.seizes}, now()
      )
      on conflict (pubkey, scope, pulse_id) do update set
        short = excluded.short,
        region = excluded.region,
        pulse_score = excluded.pulse_score,
        seizes = excluded.seizes,
        posted_at = now()
      where excluded.pulse_score >= mesh_pulse.pulse_score
    `;
    return fetchPulse(data.scope, data.region, data.pulseId);
  });
