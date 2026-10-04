import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import {
  CLAN_CHARGE_PREFIX,
  CLAN_PLAN_IDS,
  TRV_SPL_MINT,
  b58decode,
  b58encode,
  buildClanChargeMessage,
  clanChargeAuthentic,
  clanChargeFresh,
  clanChargeTrv,
  clanChargeUsdCents,
  isClanPlan,
  parseClanCharge,
  phantomClanSettlement,
  quotedClanCharge,
} from "../src/lib/trv/clan-checkout.ts";
import { planById } from "../src/lib/trv/saas.ts";
import { b58 } from "../src/lib/trv/wallet-client.ts";

const PKCS8_HEAD = Uint8Array.from([
  0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20,
]);

function seedToPkcs8(seed: Uint8Array): Uint8Array {
  const out = new Uint8Array(48);
  out.set(PKCS8_HEAD);
  out.set(seed, 16);
  return out;
}

function asBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function keypair(seed: Uint8Array): Promise<{ pubkey: string; sign: (message: string) => Promise<string> }> {
  const priv = await crypto.subtle.importKey("pkcs8", asBuffer(seedToPkcs8(seed)), { name: "Ed25519" }, true, ["sign"]);
  const jwk = await crypto.subtle.exportKey("jwk", priv);
  if (!jwk.x) throw new Error("missing pub");
  const pad = jwk.x.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(pad + "=".repeat((4 - (pad.length % 4)) % 4));
  const raw = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) raw[i] = bin.charCodeAt(i);
  const pubkey = b58encode(raw);
  return {
    pubkey,
    sign: async (message: string) => {
      const sig = new Uint8Array(
        await crypto.subtle.sign({ name: "Ed25519" }, priv, asBuffer(new TextEncoder().encode(message))),
      );
      return b58encode(sig);
    },
  };
}

test("published clan prices denominate at 10 TRV per USD", () => {
  assert.deepEqual([...CLAN_PLAN_IDS], ["sentinel", "squad", "command", "sovereign"]);
  assert.equal(clanChargeTrv(planById("sentinel"), "month", false), 790);
  assert.equal(clanChargeTrv(planById("squad"), "month", false), 1490);
  assert.equal(clanChargeTrv(planById("command"), "month", false), 4900);
  assert.equal(clanChargeTrv(planById("sovereign"), "month", false), 24000);
  assert.equal(clanChargeTrv(planById("sentinel"), "year", false), 7900);
  assert.equal(clanChargeUsdCents(planById("sentinel"), "month"), 7900);
  assert.equal(clanChargeUsdCents(planById("sovereign"), "month"), 240000);
  assert.equal(clanChargeTrv(planById("sentinel"), "month", true), 711);
});

test("verified and free are not clan prices", () => {
  assert.equal(isClanPlan("verified"), false);
  assert.equal(isClanPlan("initiate"), false);
  assert.equal(isClanPlan("node"), false);
  assert.throws(() => clanChargeTrv(planById("verified"), "month", false), /not a clan/);
});

test("phantom does not settle and does not invent a mint", () => {
  assert.equal(TRV_SPL_MINT, null);
  const result = phantomClanSettlement();
  assert.equal(result.settled, false);
  assert.equal(result.mint, null);
  assert.match(result.reason, /No TRV SPL mint/);
});

test("base58 matches the on-device wallet alphabet", () => {
  const bytes = Uint8Array.from({ length: 32 }, (_, i) => i + 1);
  assert.equal(b58encode(bytes), b58(bytes));
  assert.deepEqual([...b58decode(b58encode(bytes))], [...bytes]);
});

test("a clan charge verifies only when wallet and node both sign", async () => {
  const wallet = await keypair(Uint8Array.from({ length: 32 }, (_, i) => i + 1));
  const node = await keypair(Uint8Array.from({ length: 32 }, (_, i) => 255 - i));
  const exp = new Date(Date.now() + 60_000).toISOString();
  const fields = quotedClanCharge({
    planId: "squad",
    interval: "month",
    walletPubkey: wallet.pubkey,
    nodePubkey: node.pubkey,
    nonce: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    exp,
    citizen: false,
  });
  const message = buildClanChargeMessage(fields);
  assert.ok(message.startsWith(CLAN_CHARGE_PREFIX));
  assert.equal(parseClanCharge(message)?.trv, 1490);
  assert.equal(clanChargeFresh(exp), true);
  const walletSig = await wallet.sign(message);
  const nodeSig = await node.sign(message);
  assert.equal(await clanChargeAuthentic(message, walletSig, nodeSig), true);
  assert.equal(await clanChargeAuthentic(`${message} `, walletSig, nodeSig), false);
  assert.equal(await clanChargeAuthentic(message, nodeSig, walletSig), false);
  assert.equal(await clanChargeAuthentic(message, walletSig, walletSig), false);
  const tampered = message.replace("|1490|", "|1491|");
  assert.equal(parseClanCharge(tampered)?.trv, 1491);
  assert.notEqual(parseClanCharge(tampered)?.trv, clanChargeTrv(planById("squad"), "month", false));
  assert.equal(await clanChargeAuthentic(tampered, walletSig, nodeSig), false);
});

test("expired clan charges are not fresh", () => {
  assert.equal(clanChargeFresh(new Date(Date.now() - 1000).toISOString()), false);
  assert.equal(clanChargeFresh(new Date(Date.now() + 60 * 60 * 1000).toISOString()), false);
});

test("the native ledger debits published TRV only when the balance covers it", async () => {
  const db = new PGlite();
  const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "migrations");
  const files = (await readdir(dir)).filter((name) => name.endsWith(".sql")).sort();
  for (const name of files) {
    await db.exec(await readFile(join(dir, name), "utf8"));
  }
  await db.query(
    `insert into viewer_profiles (user_id, handle, display_name, credits, wallet_pubkey)
     values ($1, $2, $3, $4, $5)`,
    ["user_clan", "clan", "Clan", 2000, "wallet-pub"],
  );
  const debit = async (trv: number, nonce: string) =>
    db.query(
      `with debit as (
         update viewer_profiles
         set credits = credits - $2,
             plan_id = 'squad',
             edition = 'company',
             billing_interval = 'month',
             plan_renews_at = $3,
             org_id = null
         where user_id = $1 and credits >= $2
         returning user_id
       ),
       receipt as (
         insert into clan_checkout_receipts (
           user_id, plan_id, nonce, credits, wallet_pubkey, node_pubkey, message, wallet_sig, node_sig
         )
         select $1, 'squad', $4, $2, 'wallet-pub', 'node-pub', $5, 'wallet-sig', 'node-sig'
         from debit
         returning id
       ),
       invoice as (
         insert into saas_invoices (user_id, org_id, plan_id, usd_cents, credits, kind, memo)
         select $1, null, 'squad', 14900, $2, 'clan-trv', $4
         from debit
         returning id
       )
       select user_id from debit`,
      ["user_clan", trv, new Date().toISOString(), nonce, `TRV-CLAN|1|squad|month|${trv}`],
    );

  const paid = await debit(1490, "nonce-paid");
  assert.equal(paid.rows.length, 1);
  const after = await db.query<{ credits: number; plan_id: string }>(
    "select credits, plan_id from viewer_profiles where user_id = $1",
    ["user_clan"],
  );
  assert.equal(Number(after.rows[0]?.credits), 510);
  assert.equal(after.rows[0]?.plan_id, "squad");
  const invoices = await db.query<{ kind: string; credits: number }>(
    "select kind, credits from saas_invoices where user_id = $1",
    ["user_clan"],
  );
  assert.equal(invoices.rows[0]?.kind, "clan-trv");
  assert.equal(Number(invoices.rows[0]?.credits), 1490);

  const short = await debit(1490, "nonce-short");
  assert.equal(short.rows.length, 0);
  const still = await db.query<{ credits: number }>("select credits from viewer_profiles where user_id = $1", [
    "user_clan",
  ]);
  assert.equal(Number(still.rows[0]?.credits), 510);

  await assert.rejects(debit(100, "nonce-paid"), /duplicate|unique/i);
  const replayed = await db.query<{ credits: number }>("select credits from viewer_profiles where user_id = $1", [
    "user_clan",
  ]);
  assert.equal(Number(replayed.rows[0]?.credits), 510);
  await db.close();
});
