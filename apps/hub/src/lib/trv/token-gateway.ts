/**
 * Token Gateway v0 — SIM teaching ledger.
 * Not LIVE until REALITY.md says so. Not mainnet. Not 2PC.
 *
 * Pivot is one Postgres statement (CTE). Hub `Sql` has no BEGIN helper;
 * do not split spend + credit across two queries.
 */
import type { Sql } from "@/lib/db";

export const GATEWAY_SIM = "SIM" as const;
export const RESERVE_MS = 30_000;
export const CHALLENGE_MS = 45_000;
export const EARTH_RADIUS_M = 6_371_000;

export type GatewayCode =
  | "OK"
  | "SELF"
  | "SPENT"
  | "REPLAY"
  | "STALE_PULSE"
  | "NOT_PRESENT"
  | "CREST_COPY"
  | "FRAMED"
  | "EXPIRED"
  | "MISSING";

export type DropRow = {
  drop_id: string;
  region: string;
  lat: number;
  lon: number;
  radius_m: number;
  amount: number;
  exp: string;
  status: "open" | "reserved" | "spent" | "expired";
  reserved_by: string | null;
  reserved_exp: string | null;
  spent_by: string | null;
};

export type SeizeResult = {
  ok: boolean;
  code: GatewayCode;
  sim: typeof GATEWAY_SIM;
  dropId: string;
  amount?: number;
  credits?: number;
};

export function geoBucket(deg: number, decimals = 4): number {
  return Math.round(deg * 10 ** decimals);
}

export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const r = Math.PI / 180;
  const dLat = (lat2 - lat1) * r;
  const dLon = (lon2 - lon1) * r;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function inRadius(
  drop: { lat: number; lon: number; radius_m: number },
  lat: number,
  lon: number,
): boolean {
  return haversineMeters(drop.lat, drop.lon, lat, lon) <= drop.radius_m;
}

/** Canonical seize body. Sign this; never sign the Eye frames. */
export function seizeBody(input: {
  dropId: string;
  viewerPubkey: string;
  lat: number;
  lon: number;
  nonce: string;
  challenge: string;
  expIso: string;
}): string {
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

export function newId(prefix: string): string {
  const raw =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  return `${prefix}_${raw}`;
}

function asDrop(row: Record<string, unknown> | undefined): DropRow | null {
  if (!row) return null;
  return {
    drop_id: String(row.drop_id),
    region: String(row.region ?? "sim"),
    lat: Number(row.lat),
    lon: Number(row.lon),
    radius_m: Number(row.radius_m),
    amount: Number(row.amount),
    exp: String(row.exp),
    status: row.status as DropRow["status"],
    reserved_by: row.reserved_by == null ? null : String(row.reserved_by),
    reserved_exp: row.reserved_exp == null ? null : String(row.reserved_exp),
    spent_by: row.spent_by == null ? null : String(row.spent_by),
  };
}

export async function getDrop(sql: Sql, dropId: string): Promise<DropRow | null> {
  const rows = await sql`select * from gateway_drops where drop_id = ${dropId}`;
  return asDrop(rows[0]);
}

export async function seedSimDrop(
  sql: Sql,
  input: {
    dropId?: string;
    lat: number;
    lon: number;
    radius_m?: number;
    amount?: number;
    ttlMs?: number;
    region?: string;
  },
): Promise<DropRow> {
  const dropId = input.dropId ?? newId("drop");
  const ttl = input.ttlMs ?? 60 * 60 * 1000;
  const exp = new Date(Date.now() + ttl).toISOString();
  await sql`
    insert into gateway_drops (drop_id, region, lat, lon, radius_m, amount, exp, status)
    values (
      ${dropId},
      ${input.region ?? "sim"},
      ${input.lat},
      ${input.lon},
      ${input.radius_m ?? 40},
      ${input.amount ?? 1},
      ${exp},
      'open'
    )
    on conflict (drop_id) do nothing
  `;
  const row = await getDrop(sql, dropId);
  if (!row) throw new Error("seedSimDrop failed");
  return row;
}

export async function issueChallenge(
  sql: Sql,
  userId: string,
  dropId: string,
): Promise<{ ok: boolean; code: GatewayCode; challenge?: string; exp?: string }> {
  const drop = await getDrop(sql, dropId);
  if (!drop) return { ok: false, code: "MISSING" };
  if (drop.status === "spent") return { ok: false, code: "SPENT" };
  if (drop.status === "expired" || Date.parse(drop.exp) <= Date.now()) {
    return { ok: false, code: "STALE_PULSE" };
  }
  const id = newId("chg");
  const exp = new Date(Date.now() + CHALLENGE_MS).toISOString();
  await sql`
    insert into gateway_challenges (id, user_id, drop_id, exp)
    values (${id}, ${userId}, ${dropId}, ${exp})
  `;
  return { ok: true, code: "OK", challenge: id, exp };
}

export async function reserveDrop(
  sql: Sql,
  userId: string,
  dropId: string,
): Promise<{ ok: boolean; code: GatewayCode }> {
  const exp = new Date(Date.now() + RESERVE_MS).toISOString();
  const rows = await sql`
    update gateway_drops
       set status = 'reserved',
           reserved_by = ${userId},
           reserved_exp = ${exp}
     where drop_id = ${dropId}
       and (
         status = 'open'
         or (status = 'reserved' and reserved_by = ${userId})
       )
       and exp > now()
    returning drop_id
  `;
  if (rows.length === 1) return { ok: true, code: "OK" };
  const drop = await getDrop(sql, dropId);
  if (!drop) return { ok: false, code: "MISSING" };
  if (drop.status === "spent") return { ok: false, code: "SPENT" };
  if (drop.status === "expired") return { ok: false, code: "EXPIRED" };
  if (drop.status === "reserved") return { ok: false, code: "FRAMED" };
  return { ok: false, code: "STALE_PULSE" };
}

export async function sweepGateway(sql: Sql): Promise<{ released: number; expired: number }> {
  const released = await sql`
    update gateway_drops
       set status = 'open',
           reserved_by = null,
           reserved_exp = null
     where status = 'reserved'
       and (reserved_exp is null or reserved_exp < now())
    returning drop_id
  `;
  const expired = await sql`
    update gateway_drops
       set status = 'expired'
     where status in ('open', 'reserved')
       and exp < now()
    returning drop_id
  `;
  return { released: released.length, expired: expired.length };
}

async function resolveConflict(
  sql: Sql,
  userId: string,
  dropId: string,
  nonce: string,
): Promise<SeizeResult> {
  const rows = await sql`
    select drop_id, user_id, nonce from gateway_seizes
     where drop_id = ${dropId} or nonce = ${nonce}
  `;
  const hit = rows[0] as { drop_id?: string; user_id?: string } | undefined;
  if (hit && String(hit.user_id) === userId) {
    return { ok: true, code: "SELF", sim: GATEWAY_SIM, dropId };
  }
  return { ok: false, code: "REPLAY", sim: GATEWAY_SIM, dropId };
}

/**
 * Pivot. One statement: spend + seize + ledger + outbox + credit.
 * Pre-checks are cheap rejects and do not hold the drop if they fail.
 */
export async function seizeDrop(
  sql: Sql,
  input: {
    userId: string;
    dropId: string;
    nonce: string;
    challenge: string;
    lat: number;
    lon: number;
    sig?: string;
  },
): Promise<SeizeResult> {
  const { userId, dropId, nonce, challenge, lat, lon } = input;
  const sig = input.sig ?? "";

  const chRows = await sql`
    select id, user_id, drop_id, exp, consumed_at
      from gateway_challenges
     where id = ${challenge}
  `;
  const ch = chRows[0] as
    | {
        id: string;
        user_id: string;
        drop_id: string;
        exp: string;
        consumed_at: string | null;
      }
    | undefined;
  if (!ch || ch.user_id !== userId || ch.drop_id !== dropId) {
    return { ok: false, code: "CREST_COPY", sim: GATEWAY_SIM, dropId };
  }
  if (ch.consumed_at) {
    return resolveConflict(sql, userId, dropId, nonce);
  }
  if (Date.parse(String(ch.exp)) <= Date.now()) {
    return { ok: false, code: "STALE_PULSE", sim: GATEWAY_SIM, dropId };
  }

  const drop = await getDrop(sql, dropId);
  if (!drop) return { ok: false, code: "MISSING", sim: GATEWAY_SIM, dropId };
  if (drop.status === "spent") {
    return resolveConflict(sql, userId, dropId, nonce);
  }
  if (drop.status === "expired" || Date.parse(drop.exp) <= Date.now()) {
    return { ok: false, code: "STALE_PULSE", sim: GATEWAY_SIM, dropId };
  }
  if (drop.status === "reserved" && drop.reserved_by && drop.reserved_by !== userId) {
    if (drop.reserved_exp && Date.parse(drop.reserved_exp) > Date.now()) {
      return { ok: false, code: "FRAMED", sim: GATEWAY_SIM, dropId };
    }
  }
  if (!inRadius(drop, lat, lon)) {
    return { ok: false, code: "NOT_PRESENT", sim: GATEWAY_SIM, dropId };
  }

  const latB = geoBucket(lat);
  const lonB = geoBucket(lon);
  const payload = JSON.stringify({
    sim: GATEWAY_SIM,
    dropId,
    userId,
    amount: drop.amount,
    nonce,
  });

  try {
    const rows = await sql`
      with consume as (
        update gateway_challenges
           set consumed_at = now()
         where id = ${challenge}
           and user_id = ${userId}
           and drop_id = ${dropId}
           and consumed_at is null
           and exp > now()
        returning id
      ),
      spend as (
        update gateway_drops d
           set status = 'spent',
               spent_by = ${userId},
               spent_at = now(),
               reserved_by = null,
               reserved_exp = null
         where d.drop_id = ${dropId}
           and exists (select 1 from consume)
           and d.exp > now()
           and d.status in ('open', 'reserved')
           and (
             d.status = 'open'
             or d.reserved_by = ${userId}
             or d.reserved_exp is null
             or d.reserved_exp < now()
           )
        returning d.drop_id, d.amount
      ),
      ins_seize as (
        insert into gateway_seizes
          (drop_id, user_id, nonce, challenge, lat_bucket, lon_bucket, sig)
        select ${dropId}, ${userId}, ${nonce}, ${challenge}, ${latB}, ${lonB}, ${sig}
          from spend
        returning drop_id
      ),
      ins_ledger as (
        insert into gateway_ledger (user_id, drop_id, delta, reason)
        select ${userId}, spend.drop_id, spend.amount, 'gateway_seize'
          from spend
        returning drop_id, delta
      ),
      ins_outbox as (
        insert into gateway_outbox (topic, drop_id, user_id, payload)
        select 'vault.receipt', spend.drop_id, ${userId}, ${payload}
          from spend
        returning drop_id
      ),
      paid as (
        update viewer_profiles p
           set credits = p.credits + spend.amount
          from spend
         where p.user_id = ${userId}
        returning p.credits, spend.amount, spend.drop_id
      )
      select drop_id, amount, credits from paid
    `;

    const paid = rows[0] as
      | { drop_id: string; amount: number; credits: number }
      | undefined;
    if (!paid) {
      const again = await resolveConflict(sql, userId, dropId, nonce);
      if (again.code === "SELF" || again.code === "REPLAY") return again;
      const latest = await getDrop(sql, dropId);
      if (latest?.status === "spent") {
        return { ok: false, code: "SPENT", sim: GATEWAY_SIM, dropId };
      }
      return { ok: false, code: "SPENT", sim: GATEWAY_SIM, dropId };
    }
    return {
      ok: true,
      code: "OK",
      sim: GATEWAY_SIM,
      dropId: String(paid.drop_id),
      amount: Number(paid.amount),
      credits: Number(paid.credits),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/unique|duplicate|23505/i.test(msg)) {
      return resolveConflict(sql, userId, dropId, nonce);
    }
    throw err;
  }
}

export async function ackReceipt(
  sql: Sql,
  dropId: string,
): Promise<{ ok: boolean; code: GatewayCode }> {
  const rows = await sql`
    update gateway_outbox
       set status = 'sent',
           sent_at = now(),
           attempts = attempts + 1
     where drop_id = ${dropId}
       and status = 'pending'
    returning drop_id
  `;
  if (rows.length === 1) return { ok: true, code: "OK" };
  const existing = await sql`
    select status from gateway_outbox where drop_id = ${dropId}
  `;
  if (existing[0]) return { ok: true, code: "SELF" };
  return { ok: false, code: "MISSING" };
}
