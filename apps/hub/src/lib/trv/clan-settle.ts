import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import {
  CLAN_CHARGE_TTL_MS,
  clanChargeAuthentic,
  clanChargeFresh,
  clanChargeUsdCents,
  isClanPlan,
  parseClanCharge,
  quotedClanCharge,
  buildClanChargeMessage,
  type ClanPlanId,
} from "./clan-checkout";
import { isCompanyPlan, planById, type BillingInterval } from "./saas";
import { loadProfile } from "./server";

function slugify(input: string) {
  const s = input.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 18);
  return s || `viewer${Math.random().toString(36).slice(2, 8)}`;
}

function renewIso(interval: BillingInterval): string {
  const renew = new Date();
  if (interval === "year") renew.setUTCFullYear(renew.getUTCFullYear() + 1);
  else renew.setUTCMonth(renew.getUTCMonth() + 1);
  return renew.toISOString();
}

function pgCode(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) return String((err as { code: unknown }).code);
  return "";
}

export const quoteClanCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { planId: string; interval: string; nodePubkey: string }) => {
    if (!isClanPlan(input.planId)) {
      throw new Error("That plan is not a clan or node TRV price");
    }
    const interval: BillingInterval | null =
      input.interval === "year" ? "year" : input.interval === "month" ? "month" : null;
    if (!interval) throw new Error("Interval must be month or year");
    const nodePubkey = input.nodePubkey.trim();
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(nodePubkey)) {
      throw new Error("Node public key must be the on-device base58 address");
    }
    return { planId: input.planId, interval, nodePubkey };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const me = await loadProfile(sql, context.userId);
    if (!me) throw new Error("Node missing");
    if (!me.walletPubkey || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(me.walletPubkey)) {
      throw new Error("Bind the on-device Ed25519 wallet before paying in TRV. Linking Phantom does not hold this key.");
    }
    if (me.walletPubkey === data.nodePubkey) {
      throw new Error("The node key and the wallet key are different. Both must sign.");
    }
    const exp = new Date(Date.now() + CLAN_CHARGE_TTL_MS).toISOString();
    const fields = quotedClanCharge({
      planId: data.planId,
      interval: data.interval,
      walletPubkey: me.walletPubkey,
      nodePubkey: data.nodePubkey,
      nonce: crypto.randomUUID(),
      exp,
      citizen: Boolean(me.citizenAt),
    });
    return {
      message: buildClanChargeMessage(fields),
      trv: fields.trv,
      usdCents: clanChargeUsdCents(planById(data.planId), data.interval),
      planId: data.planId satisfies ClanPlanId,
      interval: data.interval,
    };
  });

export const settleClanCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      message: string;
      walletPubkey: string;
      walletSignature: string;
      nodePubkey: string;
      nodeSignature: string;
      orgName?: string;
    }) => ({
      message: input.message.slice(0, 500),
      walletPubkey: input.walletPubkey.trim().slice(0, 64),
      walletSignature: input.walletSignature.trim().slice(0, 128),
      nodePubkey: input.nodePubkey.trim().slice(0, 64),
      nodeSignature: input.nodeSignature.trim().slice(0, 128),
      orgName: (input.orgName ?? "").trim().slice(0, 48),
    }),
  )
  .handler(async ({ context, data }) => {
    const fields = parseClanCharge(data.message);
    if (!fields || buildClanChargeMessage(fields) !== data.message) {
      throw new Error("Charge is not a native TRV clan quote");
    }
    if (!clanChargeFresh(fields.exp)) throw new Error("Charge expired. Quote again.");
    if (data.walletPubkey !== fields.walletPubkey || data.nodePubkey !== fields.nodePubkey) {
      throw new Error("Signature keys do not match the charge");
    }
    const authentic = await clanChargeAuthentic(data.message, data.walletSignature, data.nodeSignature);
    if (!authentic) {
      throw new Error("Signature rejected. The hub only checks the public signatures.");
    }

    const sql = await getSql();
    const me = await loadProfile(sql, context.userId);
    if (!me) throw new Error("Node missing");
    if (!me.walletPubkey || me.walletPubkey !== fields.walletPubkey) {
      throw new Error("Bind the on-device wallet that signed this charge");
    }
    const plan = planById(fields.planId);
    const expected = quotedClanCharge({
      planId: fields.planId,
      interval: fields.interval,
      walletPubkey: fields.walletPubkey,
      nodePubkey: fields.nodePubkey,
      nonce: fields.nonce,
      exp: fields.exp,
      citizen: Boolean(me.citizenAt),
    });
    if (expected.trv !== fields.trv) throw new Error("Charge does not match the published TRV price");

    let orgId = me.orgId;
    let createdOrgId: number | null = null;
    if (isCompanyPlan(plan.id) && !orgId) {
      if (!data.orgName) throw new Error("Name the clan before paying.");
      const slug = slugify(data.orgName);
      try {
        const created = await sql<{ id: number }>`
          insert into trv_orgs (name, slug, owner_id, plan_id, seats)
          values (${data.orgName}, ${slug}, ${context.userId}, ${plan.id}, ${plan.seats})
          returning id
        `;
        createdOrgId = Number(created[0]?.id);
        orgId = createdOrgId;
        await sql`
          insert into org_members (org_id, user_id, role)
          values (${orgId}, ${context.userId}, 'owner')
          on conflict do nothing
        `;
      } catch (err) {
        if (createdOrgId) await sql`delete from trv_orgs where id = ${createdOrgId}`;
        if (pgCode(err) === "23505") throw new Error("That clan name is already taken.");
        throw err;
      }
    }

    const usdCents = clanChargeUsdCents(plan, fields.interval);
    const renew = renewIso(fields.interval);
    let paid = false;
    try {
      const rows = await sql<{ user_id: string }>`
        with debit as (
          update viewer_profiles
          set credits = credits - ${fields.trv},
              plan_id = ${plan.id},
              edition = ${plan.edition},
              billing_interval = ${fields.interval},
              plan_renews_at = ${renew},
              org_id = ${orgId}
          where user_id = ${context.userId} and credits >= ${fields.trv}
          returning user_id
        ),
        receipt as (
          insert into clan_checkout_receipts (
            user_id, plan_id, nonce, credits, wallet_pubkey, node_pubkey, message, wallet_sig, node_sig
          )
          select ${context.userId}, ${plan.id}, ${fields.nonce}, ${fields.trv},
                 ${fields.walletPubkey}, ${fields.nodePubkey}, ${data.message},
                 ${data.walletSignature}, ${data.nodeSignature}
          from debit
          returning id
        ),
        invoice as (
          insert into saas_invoices (user_id, org_id, plan_id, usd_cents, credits, kind, memo)
          select ${context.userId}, ${orgId}, ${plan.id}, ${usdCents}, ${fields.trv}, 'clan-trv', ${fields.nonce}
          from debit
          returning id
        )
        select user_id from debit
      `;
      if (!rows[0]) throw new Error("Insufficient TRV credits for this clan price");
      paid = true;
      if (isCompanyPlan(plan.id) && orgId) {
        await sql`update trv_orgs set plan_id = ${plan.id}, seats = ${plan.seats} where id = ${orgId}`;
      }
    } catch (err) {
      if (!paid && createdOrgId) {
        await sql`delete from trv_orgs where id = ${createdOrgId}`;
      }
      if (pgCode(err) === "23505") throw new Error("This charge was already used. Quote again.");
      throw err;
    }

    return { charged: fields.trv, profile: await loadProfile(sql, context.userId) };
  });
