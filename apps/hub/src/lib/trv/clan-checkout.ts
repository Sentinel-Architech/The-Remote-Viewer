/**
 * Clan and node checkout on the native TRV ledger.
 *
 * Sentinel, Squad, Command, and Sovereign are priced from the published
 * SaaS catalog and charged in TRV (USD_TO_TRV). They are not card products.
 *
 * What this module actually does:
 * - Builds a canonical charge the on-device wallet and the on-device node both sign.
 * - Verifies those Ed25519 signatures. Private keys are not an input.
 * - Refuses a Phantom / Solana TRV transfer because this repository does not
 *   publish a TRV SPL mint. That refusal is not a payment.
 *
 * What this module does not do:
 * - It does not encrypt the charge with age or the optical air-gap pipeline.
 * - It does not move SOL, USDC, or a new token.
 * - It does not grant a plan. Settlement lives next to the ledger debit.
 */

import { planCredits } from "./citizen";
import {
  planById,
  planPriceUsd,
  usdToCredits,
  type BillingInterval,
  type SaasPlan,
} from "./saas";

export const CLAN_PLAN_IDS = ["sentinel", "squad", "command", "sovereign"] as const;
export type ClanPlanId = (typeof CLAN_PLAN_IDS)[number];

/** Charge messages start with this. Signers refuse anything else. */
export const CLAN_CHARGE_PREFIX = "TRV-CLAN|1|";

/** How long a quoted charge may be signed before it expires. */
export const CLAN_CHARGE_TTL_MS = 10 * 60 * 1000;

/**
 * Published TRV SPL mint.
 * Null on purpose: docs/TRV-MINT-NOTES.md says the mint is not a launch,
 * and no mint address is stored in this repository. Do not invent one.
 */
export const TRV_SPL_MINT = null;

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export type ClanChargeFields = {
  planId: ClanPlanId;
  interval: BillingInterval;
  trv: number;
  walletPubkey: string;
  nodePubkey: string;
  nonce: string;
  exp: string;
};

export type PhantomClanSettlement = {
  settled: false;
  mint: null;
  reason: string;
};

export function isClanPlan(id: string | null | undefined): id is ClanPlanId {
  return (CLAN_PLAN_IDS as readonly string[]).includes(id ?? "");
}

/** TRV due for a clan plan. Uses the published catalog and the existing citizen rate. */
export function clanChargeTrv(plan: SaasPlan, interval: BillingInterval, citizen: boolean): number {
  if (!isClanPlan(plan.id)) {
    throw new Error("That plan is not a clan or node TRV price");
  }
  if (plan.usdMonth <= 0) {
    throw new Error("Clan prices are the published paid catalog");
  }
  return planCredits(usdToCredits(plan.usdMonth, interval), citizen);
}

export function clanChargeUsdCents(plan: SaasPlan, interval: BillingInterval): number {
  return planPriceUsd(plan, interval) * 100;
}

export function b58encode(bytes: Uint8Array): string {
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros += 1;
  const digits = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let i = 0; i < digits.length; i++) {
      const x = digits[i]! * 256 + carry;
      digits[i] = x % 58;
      carry = Math.floor(x / 58);
    }
    while (carry) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  return "1".repeat(zeros) + digits.reverse().map((d) => B58[d]).join("");
}

export function b58decode(text: string): Uint8Array {
  if (!text || [...text].some((c) => B58.indexOf(c) < 0)) {
    throw new Error("Bad base58");
  }
  let zeros = 0;
  while (zeros < text.length && text[zeros] === "1") zeros += 1;
  let acc = 0n;
  for (const c of text) acc = acc * 58n + BigInt(B58.indexOf(c));
  const body: number[] = [];
  while (acc > 0n) {
    body.push(Number(acc & 0xffn));
    acc >>= 8n;
  }
  body.reverse();
  const out = new Uint8Array(zeros + body.length);
  out.set(body, zeros);
  return out;
}

function asBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

export function buildClanChargeMessage(fields: ClanChargeFields): string {
  const message = [
    "TRV-CLAN",
    "1",
    fields.planId,
    fields.interval,
    String(fields.trv),
    fields.walletPubkey,
    fields.nodePubkey,
    fields.nonce,
    fields.exp,
  ].join("|");
  if (!message.startsWith(CLAN_CHARGE_PREFIX)) {
    throw new Error("Clan charge prefix mismatch");
  }
  return message;
}

export function parseClanCharge(message: string): ClanChargeFields | null {
  if (!message.startsWith(CLAN_CHARGE_PREFIX) || message.length > 500) return null;
  const parts = message.split("|");
  if (parts.length !== 9) return null;
  const [, , planId, interval, trvText, walletPubkey, nodePubkey, nonce, exp] = parts;
  if (!planId || !isClanPlan(planId)) return null;
  if (interval !== "month" && interval !== "year") return null;
  if (!/^\d+$/.test(trvText ?? "")) return null;
  const trv = Number(trvText);
  if (!Number.isSafeInteger(trv) || trv <= 0) return null;
  if (!walletPubkey || !nodePubkey || walletPubkey === nodePubkey) return null;
  if (!isB58Key(walletPubkey) || !isB58Key(nodePubkey)) return null;
  if (!nonce || !/^[0-9a-f-]{16,80}$/i.test(nonce)) return null;
  if (!exp || Number.isNaN(Date.parse(exp))) return null;
  const fields: ClanChargeFields = {
    planId,
    interval,
    trv,
    walletPubkey,
    nodePubkey,
    nonce,
    exp,
  };
  if (buildClanChargeMessage(fields) !== message) return null;
  return fields;
}

function isB58Key(value: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
}

export function clanChargeFresh(expIso: string, now = Date.now()): boolean {
  const exp = Date.parse(expIso);
  if (!Number.isFinite(exp)) return false;
  const remaining = exp - now;
  return remaining >= 0 && remaining <= CLAN_CHARGE_TTL_MS + 30_000;
}

export function quotedClanCharge(input: {
  planId: ClanPlanId;
  interval: BillingInterval;
  walletPubkey: string;
  nodePubkey: string;
  nonce: string;
  exp: string;
  citizen: boolean;
}): ClanChargeFields {
  const plan = planById(input.planId);
  const trv = clanChargeTrv(plan, input.interval, input.citizen);
  return {
    planId: input.planId,
    interval: input.interval,
    trv,
    walletPubkey: input.walletPubkey,
    nodePubkey: input.nodePubkey,
    nonce: input.nonce,
    exp: input.exp,
  };
}

async function verifyOne(pubkeyB58: string, message: string, signatureB58: string): Promise<boolean> {
  let pub: Uint8Array;
  let sig: Uint8Array;
  try {
    pub = b58decode(pubkeyB58);
    sig = b58decode(signatureB58);
  } catch {
    return false;
  }
  if (pub.length !== 32 || sig.length !== 64) return false;
  try {
    const key = await crypto.subtle.importKey("raw", asBuffer(pub), { name: "Ed25519" }, false, ["verify"]);
    return crypto.subtle.verify(
      { name: "Ed25519" },
      key,
      asBuffer(sig),
      asBuffer(new TextEncoder().encode(message)),
    );
  } catch {
    return false;
  }
}

/** Both device signatures must verify. This does not decrypt anything. */
export async function clanChargeAuthentic(
  message: string,
  walletSignature: string,
  nodeSignature: string,
): Promise<boolean> {
  const fields = parseClanCharge(message);
  if (!fields) return false;
  if (walletSignature === nodeSignature) return false;
  const [walletOk, nodeOk] = await Promise.all([
    verifyOne(fields.walletPubkey, message, walletSignature),
    verifyOne(fields.nodePubkey, message, nodeSignature),
  ]);
  return walletOk && nodeOk;
}

/**
 * Phantom can link a Solana wallet. It cannot pay these prices in TRV:
 * no mint is published, so no transfer is built and nothing is granted.
 */
export function phantomClanSettlement(): PhantomClanSettlement {
  const mint = TRV_SPL_MINT;
  if (mint !== null) {
    const unexpected: never = mint;
    throw new Error(`Refusing to invent a TRV mint: ${String(unexpected)}`);
  }
  return {
    settled: false,
    mint: null,
    reason:
      "No TRV SPL mint is published in this repository. Phantom can link a Solana wallet, but it cannot move TRV, and this checkout will not mark the plan paid.",
  };
}
