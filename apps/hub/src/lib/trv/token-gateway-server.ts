import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { dbSource } from "@/lib/db";
import {
  ackReceipt,
  GATEWAY_SIM,
  issueChallenge,
  newId,
  reserveDrop,
  seedSimDrop,
  seizeDrop,
  sweepGateway,
  type GatewayCode,
} from "./token-gateway";

/** Fixed SIM drop for the teaching drill. Not a public geocache. */
export const SIM_DROP_ID = "sim_boardman_eye";
export const SIM_DROP = {
  dropId: SIM_DROP_ID,
  lat: 41.024,
  lon: -80.663,
  radius_m: 40,
  amount: 7,
  region: "sim",
  ttlMs: 7 * 24 * 60 * 60 * 1000,
};

export const gatewayStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const sql = await getSql();
    await sweepGateway(sql);
    const applied = await sql<{ name: string }>`
      select name from _migrations where name = '0018_gateway.sql'
    `;
    const dropRows = await sql`
      select drop_id, status, amount, lat, lon, radius_m, exp, spent_by
        from gateway_drops where drop_id = ${SIM_DROP_ID}
    `;
    return {
      sim: GATEWAY_SIM,
      db: dbSource,
      migration: Boolean(applied[0]),
      drop: dropRows[0] ?? null,
    };
  });

export const seedSimTokenDrop = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async () => {
    const sql = await getSql();
    const drop = await seedSimDrop(sql, SIM_DROP);
    return { sim: GATEWAY_SIM, db: dbSource, drop };
  });

export const beginGatewaySeize = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await seedSimDrop(sql, SIM_DROP);
    await sweepGateway(sql);
    const reserved = await reserveDrop(sql, context.userId, SIM_DROP_ID);
    const ch = await issueChallenge(sql, context.userId, SIM_DROP_ID);
    return {
      sim: GATEWAY_SIM,
      db: dbSource,
      reserved,
      challenge: ch.challenge ?? null,
      challengeExp: ch.exp ?? null,
      drop: SIM_DROP,
      code: ch.code as GatewayCode,
    };
  });

export const commitGatewaySeize = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { challenge?: string; lat?: number; lon?: number; simOverlay?: boolean }) => ({
    challenge: String(input.challenge || "").slice(0, 80),
    lat: Number(input.lat),
    lon: Number(input.lon),
    simOverlay: Boolean(input.simOverlay),
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const lat = data.simOverlay || !Number.isFinite(data.lat) ? SIM_DROP.lat : data.lat;
    const lon = data.simOverlay || !Number.isFinite(data.lon) ? SIM_DROP.lon : data.lon;
    const result = await seizeDrop(sql, {
      userId: context.userId,
      dropId: SIM_DROP_ID,
      nonce: newId("n"),
      challenge: data.challenge,
      lat,
      lon,
    });
    if (result.ok && result.code === "OK") {
      await ackReceipt(sql, SIM_DROP_ID);
    }
    return { ...result, db: dbSource, simOverlay: data.simOverlay };
  });
