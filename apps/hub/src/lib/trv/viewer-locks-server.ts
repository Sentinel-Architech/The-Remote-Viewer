import { createCipheriv, createDecipheriv, createHash, randomBytes, randomInt } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  assertOwnHandleSignature,
  dustRewardForScan,
  grandViewUntilIso,
  IN_APP_TOKEN_NAME,
  qrStyleForPlan,
  roughInterests,
  SHARE_CODE_MS,
  type BillingInterval,
  type RecoveryForms,
} from "@/lib/trv/viewer-locks";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function codeKey(): Buffer {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  if (secret) return createHash("sha256").update(secret).digest();
  const g = globalThis as { __trvCodeKey?: Buffer };
  g.__trvCodeKey ??= randomBytes(32);
  return g.__trvCodeKey;
}

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function seal(code: string): { iv: string; cipher: string } {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", codeKey(), iv);
  const body = Buffer.concat([cipher.update(code, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv: iv.toString("base64url"), cipher: Buffer.concat([body, tag]).toString("base64url") };
}

function openSeal(iv: string, packed: string): string {
  const raw = Buffer.from(packed, "base64url");
  const tag = raw.subarray(raw.length - 16);
  const body = raw.subarray(0, raw.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", codeKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
}

function mintCode(): string {
  let out = "";
  for (let i = 0; i < 8; i++) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return out;
}

function intervalOf(value: unknown): BillingInterval {
  return value === "year" ? "year" : "month";
}

async function accountEmail(userId: string): Promise<string> {
  const sql = await getSql();
  const rows = await sql<{ email: string }>`select "email" from "user" where "id" = ${userId} limit 1`;
  return (rows[0]?.email ?? "").trim().toLowerCase();
}

export const issueSignupCode = createServerFn({ method: "POST" })
  .validator((input: { email?: string; delivery?: string }) => ({
    email: (input.email ?? "").trim().toLowerCase().slice(0, 180),
    delivery: input.delivery === "email" ? "email" : "qr",
  }))
  .handler(async ({ data }) => {
    if (!data.email.includes("@")) throw new Error("Email is required.");
    if (data.delivery === "email") {
      return {
        ok: false as const,
        delivered: false,
        reason: "Mail transport is not configured. The code was not emailed. Use the QR.",
      };
    }
    const code = mintCode();
    const sealed = seal(code);
    const sql = await getSql();
    await sql`
      insert into trv_signup_pending (email, code_hash, code_iv, code_cipher, delivery, confirmed)
      values (${data.email}, ${hashCode(code)}, ${sealed.iv}, ${sealed.cipher}, ${data.delivery}, false)
      on conflict (email) do update set
        code_hash = excluded.code_hash,
        code_iv = excluded.code_iv,
        code_cipher = excluded.code_cipher,
        delivery = excluded.delivery,
        confirmed = false,
        created_at = now()
    `;
    return { ok: true as const, delivery: "qr" as const, code };
  });

export const confirmSignupCode = createServerFn({ method: "POST" })
  .validator((input: { email?: string; code?: string }) => ({
    email: (input.email ?? "").trim().toLowerCase().slice(0, 180),
    code: (input.code ?? "").trim().toUpperCase().slice(0, 16),
  }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{ code_hash: string }>`
      select code_hash from trv_signup_pending where email = ${data.email} limit 1
    `;
    if (!rows[0] || rows[0].code_hash !== hashCode(data.code)) {
      throw new Error("That code does not match.");
    }
    await sql`update trv_signup_pending set confirmed = true where email = ${data.email}`;
    return { ok: true as const };
  });

export const claimSignupHold = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const email = await accountEmail(context.userId);
    const pending = await sql<{
      code_hash: string;
      code_iv: string;
      code_cipher: string;
      delivery: string;
      confirmed: boolean;
    }>`
      select code_hash, code_iv, code_cipher, delivery, confirmed
      from trv_signup_pending where email = ${email} limit 1
    `;
    if (!pending[0]?.confirmed) throw new Error("Confirm the one-time code before this account is signed.");
    const profile = await sql<{ handle: string }>`
      select handle from viewer_profiles where user_id = ${context.userId} limit 1
    `;
    const handle = profile[0]?.handle ?? "";
    assertOwnHandleSignature(handle, handle);
    const row = pending[0];
    await sql`
      insert into trv_signup_holds (
        user_id, email, code_hash, code_iv, code_cipher, delivery, signature_handle
      ) values (
        ${context.userId}, ${email}, ${row.code_hash}, ${row.code_iv}, ${row.code_cipher},
        ${row.delivery}, ${handle.trim().toLowerCase()}
      )
      on conflict (user_id) do nothing
    `;
    return { ok: true as const, handle: handle.trim().toLowerCase() };
  });

export const signupHoldStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      signature_handle: string;
      delivery: string;
      written_down: boolean;
      forms: number | null;
      accepted_at: string | null;
    }>`
      select signature_handle, delivery, written_down, forms, accepted_at
      from trv_signup_holds where user_id = ${context.userId} limit 1
    `;
    const row = rows[0];
    if (!row) return { hasHold: false as const };
    return {
      hasHold: true as const,
      handle: row.signature_handle,
      delivery: row.delivery === "email" ? "email" : "qr",
      writtenDown: Boolean(row.written_down),
      forms: row.forms === 1 || row.forms === 2 ? row.forms : null,
      accepted: Boolean(row.accepted_at),
    };
  });

export const acceptRecoveryForms = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { forms?: number; writtenDown?: boolean }) => ({
    forms: input.forms === 2 ? 2 : input.forms === 1 ? 1 : 0,
    writtenDown: Boolean(input.writtenDown),
  }))
  .handler(async ({ context, data }) => {
    if (data.forms !== 1 && data.forms !== 2) throw new Error("Choose 1 or 2 forms.");
    if (!data.writtenDown) throw new Error("Write the code down before accepting.");
    const forms: RecoveryForms = data.forms;
    const sql = await getSql();
    const holds = await sql<{ signature_handle: string }>`
      select signature_handle from trv_signup_holds where user_id = ${context.userId} limit 1
    `;
    if (!holds[0]) throw new Error("No one-time code is waiting on this account.");
    assertOwnHandleSignature(holds[0].signature_handle, holds[0].signature_handle);
    await sql`
      update trv_signup_holds
      set written_down = true, forms = ${forms}, accepted_at = now()
      where user_id = ${context.userId}
    `;
    return { ok: true as const, forms };
  });

export const reissueSignupCode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { deviceLock?: boolean; secondForm?: boolean }) => ({
    deviceLock: Boolean(input.deviceLock),
    secondForm: Boolean(input.secondForm),
  }))
  .handler(async ({ context, data }) => {
    if (!data.deviceLock) throw new Error("The device lock has not accepted this request.");
    const sql = await getSql();
    const rows = await sql<{
      code_iv: string;
      code_cipher: string;
      forms: number | null;
      accepted_at: string | null;
      signature_handle: string;
    }>`
      select code_iv, code_cipher, forms, accepted_at, signature_handle
      from trv_signup_holds where user_id = ${context.userId} limit 1
    `;
    const row = rows[0];
    if (!row?.accepted_at || (row.forms !== 1 && row.forms !== 2)) {
      throw new Error("Accept 1 or 2 forms before asking for this code again.");
    }
    if (row.forms === 2 && !data.secondForm) {
      throw new Error("This account accepted two forms. The second form has not been met.");
    }
    assertOwnHandleSignature(row.signature_handle, row.signature_handle);
    return {
      code: openSeal(row.code_iv, row.code_cipher),
      handle: row.signature_handle,
    };
  });

export const issueShareCode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { broadcast?: boolean }) => ({ broadcast: Boolean(input.broadcast) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{
      handle: string;
      plan_id: string;
      craft: string | null;
      status_line: string | null;
      bio: string | null;
    }>`
      select handle, plan_id, craft, status_line, bio
      from viewer_profiles where user_id = ${context.userId} limit 1
    `;
    const profile = rows[0];
    if (!profile) throw new Error("This account has no TRV handle.");
    assertOwnHandleSignature(profile.handle, profile.handle);
    const handle = profile.handle.trim().toLowerCase();
    const code = mintCode();
    const interests = roughInterests(profile);
    const style = qrStyleForPlan(profile.plan_id || "initiate");
    const expiresAt = new Date(Date.now() + SHARE_CODE_MS).toISOString();
    await sql`
      insert into trv_share_codes (code, owner_id, signature_handle, interests, qr_style, broadcast, expires_at)
      values (
        ${code}, ${context.userId}, ${handle}, ${interests.join(" · ")}, ${style}, ${data.broadcast}, ${expiresAt}
      )
    `;
    return {
      code,
      handle,
      interests,
      style,
      broadcast: data.broadcast,
      expiresAt,
      path: `/login?share=${code}`,
    };
  });

export const redeemShareCode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { code?: string }) => ({
    code: (input.code ?? "").trim().toUpperCase().replace(/[^A-Z2-9]/g, "").slice(0, 16),
  }))
  .handler(async ({ context, data }) => {
    if (data.code.length < 8) throw new Error("That code is not valid.");
    const sql = await getSql();
    const codes = await sql<{
      owner_id: string;
      signature_handle: string;
      expires_at: string;
    }>`
      select owner_id, signature_handle, expires_at
      from trv_share_codes where code = ${data.code} limit 1
    `;
    const share = codes[0];
    if (!share) throw new Error("That code does not exist.");
    if (share.owner_id === context.userId) throw new Error("You cannot join your own code.");
    if (Date.parse(String(share.expires_at)) <= Date.now()) throw new Error("That code has died.");
    const joiner = await sql<{ handle: string; plan_id: string; billing_interval: string | null }>`
      select handle, plan_id, billing_interval from viewer_profiles where user_id = ${context.userId} limit 1
    `;
    const handle = joiner[0]?.handle ?? "";
    assertOwnHandleSignature(handle, handle);
    const prior = await sql<{ user_id: string }>`
      select user_id from trv_share_joins where user_id = ${context.userId} limit 1
    `;
    if (prior[0]) throw new Error("This account already accepted a share code.");
    await sql`
      insert into trv_share_joins (code, user_id) values (${data.code}, ${context.userId})
    `;
    const until = grandViewUntilIso();
    await sql`
      update viewer_profiles set grand_view_until = ${until} where user_id = ${context.userId}
    `;
    const dust = dustRewardForScan(joiner[0]?.plan_id || "initiate", intervalOf(joiner[0]?.billing_interval));
    await sql`
      insert into trv_dust_notes (id, user_id, code, more_than_free, amount_set, on_chain)
      values (${randomBytes(16).toString("hex")}, ${context.userId}, ${data.code}, ${dust.moreThanFree}, false, false)
    `;
    return {
      ok: true as const,
      signedBy: share.signature_handle,
      grandViewUntil: until,
      dust,
      tokenName: IN_APP_TOKEN_NAME,
    };
  });
