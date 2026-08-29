import { createServerFn } from "@tanstack/react-start";
import { canonDossier, parseSnapshot, type Snapshot } from "@/lib/progress";
import { verifyEd25519 } from "@/lib/identity";

export type HubDossier = Snapshot & { pubkey: string };

const PIN_RE = /^\d{6}$/;
const WRAP_MAX = 4096;
const PAIR_TTL_MS = 90_000;

function clampInt(n: unknown, min: number, max: number) {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v)) return min;
  return Math.min(max, Math.max(min, v));
}

function parseKey(raw: unknown) {
  const pubkey = String(raw ?? "").trim();
  if (!/^[0-9A-Za-z]{12,80}$/.test(pubkey)) throw new Error("Viewer key rejected");
  return pubkey;
}

function parsePin(raw: unknown) {
  const pin = String(raw ?? "").trim();
  if (!PIN_RE.test(pin)) throw new Error("Pair code rejected");
  return pin;
}

function parseWrap(raw: unknown) {
  const wrap = String(raw ?? "").trim();
  if (wrap.length < 16 || wrap.length > WRAP_MAX) throw new Error("Pair wrap rejected");
  return wrap;
}

function parseDossier(input: unknown): { snap: Snapshot; pubkey: string; sig: string } {
  const raw = (input ?? {}) as Record<string, unknown>;
  const pubkey = parseKey(raw.pubkey);
  const snap = parseSnapshot(raw);
  if (!snap) throw new Error("Dossier rejected");
  snap.seq = clampInt(raw.seq, 0, Number.MAX_SAFE_INTEGER);
  const sig = String(raw.sig ?? "").trim();
  if (sig.length < 40 || sig.length > 256) throw new Error("Signature rejected");
  return { snap, pubkey, sig };
}

export const putDossier = createServerFn({ method: "POST" })
  .validator((input: unknown) => parseDossier(input))
  .handler(async ({ data }) => {
    const { snap, pubkey, sig } = data;
    const canon = canonDossier(pubkey, snap);
    const ok = await verifyEd25519(pubkey, canon, sig);
    if (!ok) throw new Error("HUB signature rejected");
    const learned = JSON.stringify(snap.learned);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const existing = await sql<{
      seq: number;
      xp: number;
      seizes: number;
      healed: number;
      cleared: number;
      watches: number;
      learned: string;
    }>`select seq, xp, seizes, healed, cleared, watches, learned from hub_dossier where pubkey = ${pubkey}`;
    const prev = existing[0];
    let xp = snap.xp;
    let seizes = snap.seizes;
    let healed = snap.healed;
    let cleared = snap.cleared;
    let watches = snap.watches;
    let seq = snap.seq;
    let learnedJson = learned;
    if (prev) {
      xp = Math.max(prev.xp, snap.xp);
      seizes = Math.max(prev.seizes, snap.seizes);
      healed = Math.max(prev.healed, snap.healed);
      cleared = Math.max(prev.cleared, snap.cleared);
      watches = Math.max(prev.watches, snap.watches);
      seq = Math.max(Number(prev.seq) || 0, snap.seq);
      let prevLearned: Record<string, number> = {};
      try {
        prevLearned = JSON.parse(prev.learned) as Record<string, number>;
      } catch {
        prevLearned = {};
      }
      const merged = { ...prevLearned };
      for (const [k, v] of Object.entries(snap.learned)) merged[k] = Math.max(merged[k] ?? 0, v);
      learnedJson = JSON.stringify(merged);
    }
    await sql`
      insert into hub_dossier (pubkey, seq, xp, seizes, healed, cleared, watches, learned, sig, updated_at)
      values (${pubkey}, ${seq}, ${xp}, ${seizes}, ${healed}, ${cleared}, ${watches}, ${learnedJson}, ${sig}, now())
      on conflict (pubkey) do update set
        seq = excluded.seq,
        xp = excluded.xp,
        seizes = excluded.seizes,
        healed = excluded.healed,
        cleared = excluded.cleared,
        watches = excluded.watches,
        learned = excluded.learned,
        sig = excluded.sig,
        updated_at = now()
    `;
    return { ok: true as const, seq };
  });

export const getDossier = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ pubkey: parseKey((input as { pubkey?: unknown })?.pubkey) }))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{
      pubkey: string;
      seq: number;
      xp: number;
      seizes: number;
      healed: number;
      cleared: number;
      watches: number;
      learned: string;
    }>`
      select pubkey, seq, xp, seizes, healed, cleared, watches, learned
      from hub_dossier
      where pubkey = ${data.pubkey}
    `;
    const row = rows[0];
    if (!row) return null;
    let learned: Record<string, number> = {};
    try {
      learned = JSON.parse(row.learned) as Record<string, number>;
    } catch {
      learned = {};
    }
    const snap = parseSnapshot({
      xp: row.xp,
      seizes: row.seizes,
      healed: row.healed,
      cleared: row.cleared,
      watches: row.watches,
      learned,
      seq: Number(row.seq) || 0,
    });
    if (!snap) return null;
    return { pubkey: row.pubkey, ...snap } satisfies HubDossier;
  });

export const putPair = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = (input ?? {}) as { pin?: unknown; wrap?: unknown; pubkey?: unknown };
    return { pin: parsePin(raw.pin), wrap: parseWrap(raw.wrap), pubkey: parseKey(raw.pubkey) };
  })
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`delete from hub_pair where expires_at < now()`;
    await sql`
      insert into hub_pair (pin, wrap, pubkey, expires_at)
      values (${data.pin}, ${data.wrap}, ${data.pubkey}, now() + interval '90 seconds')
      on conflict (pin) do update set
        wrap = excluded.wrap,
        pubkey = excluded.pubkey,
        expires_at = excluded.expires_at
    `;
    return { ok: true as const, ttlMs: PAIR_TTL_MS };
  });

export const takePair = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ pin: parsePin((input as { pin?: unknown })?.pin) }))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ wrap: string; pubkey: string }>`
      delete from hub_pair
      where pin = ${data.pin} and expires_at > now()
      returning wrap, pubkey
    `;
    const row = rows[0];
    if (!row) return null;
    return { wrap: row.wrap, pubkey: row.pubkey };
  });
