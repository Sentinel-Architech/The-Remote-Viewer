import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { stageFromXp, tierFromProgress } from "./tiers";
import {
  effectiveFeeRate,
  isCompanyPlan,
  planById,
  planPriceUsd,
  usdToCredits,
  USD_TO_TRV,
  type BillingInterval,
} from "./saas";
import { planCredits } from "./citizen";
import { REFERRAL_BONUS_CREDITS, REFERRAL_NEW_CREDITS, REFERRAL_TRIAL_DAYS } from "./ads";
import { usdToSolMicro, type OnrampDest } from "./onramp";
import { classifyLure, lessonFor } from "./honeypot";
import { assertImageData, parseLinks, sanitizeHttps } from "./profile";
import { shopById } from "./shop";
import { PAID_TRIAL_CREDITS, PAID_TRIAL_PLAN, paidTrialUntilIso } from "./trial";
import type {
  ForumPost,
  InvoiceRow,
  MigrationRow,
  NftRow,
  OrgSnapshot,
  PublicViewer,
  PublicViewerCard,
  SaleRow,
  ShopPurchase,
  ViewerDoc,
  ViewerProfile,
  WatchStatus,
} from "./types";

type ProfileRow = Record<string, unknown>;

function num(v: unknown, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

function str(v: unknown) {
  return v == null ? "" : String(v);
}

export function mapProfile(r: ProfileRow): ViewerProfile {
  return {
    userId: str(r.user_id),
    handle: str(r.handle),
    displayName: str(r.display_name),
    bio: str(r.bio),
    manifesto: str(r.manifesto),
    tier: str(r.tier) || "initiate",
    nativeSecurity: Boolean(r.native_security),
    verifiedAt: r.verified_at ? String(r.verified_at) : null,
    neuronStage: num(r.neuron_stage),
    xp: num(r.xp),
    sentinelHealth: num(r.sentinel_health, 100),
    sentinelAutonomy: num(r.sentinel_autonomy),
    pulseRadius: num(r.pulse_radius, 1),
    autoIntercept: num(r.auto_intercept),
    extraNeurons: num(r.extra_neurons),
    credits: num(r.credits),
    referralHandle: r.referral_handle ? String(r.referral_handle) : null,
    createdAt: str(r.created_at),
    edition: r.edition === "company" ? "company" : "people",
    planId: str(r.plan_id) || "initiate",
    planRenewsAt: r.plan_renews_at ? String(r.plan_renews_at) : null,
    orgId: r.org_id == null ? null : num(r.org_id),
    billingInterval: r.billing_interval === "year" ? "year" : "month",
    walletPubkey: r.wallet_pubkey ? String(r.wallet_pubkey) : null,
    phantomPubkey: r.phantom_pubkey ? String(r.phantom_pubkey) : null,
    solMicro: num(r.sol_micro),
    trialUntil: r.trial_until ? String(r.trial_until) : null,
    paidTrialUntil: r.paid_trial_until ? String(r.paid_trial_until) : null,
    paidTrialPlan: r.paid_trial_plan ? String(r.paid_trial_plan) : null,
    paidTrialUsed: Boolean(r.paid_trial_used),
    orgName: r.org_name ? String(r.org_name) : null,
    orgSeats: num(r.org_seats),
    isPublic: r.is_public !== false,
    radiusOptIn: Boolean(r.radius_opt_in),
    watchRadiusMi: num(r.watch_radius_mi, 100),
    shopFrame: r.shop_frame ? String(r.shop_frame) : null,
    shopTitle: r.shop_title ? String(r.shop_title) : null,
    shopChrome: r.shop_chrome ? String(r.shop_chrome) : null,
    hydraAddress: r.hydra_address ? String(r.hydra_address) : null,
    federatedOptIn: Boolean(r.federated_opt_in),
    citizenAt: r.citizen_at ? String(r.citizen_at) : null,
    idType: r.id_type ? String(r.id_type) : null,
    idState: r.id_state ? String(r.id_state) : null,
    ageOk: Boolean(r.age_ok),
    ofacOk: Boolean(r.ofac_ok),
    tutorialAt: r.tutorial_at ? String(r.tutorial_at) : null,
    lastSkillAuditAt: r.last_skill_audit_at
      ? r.last_skill_audit_at instanceof Date
        ? r.last_skill_audit_at.toISOString()
        : String(r.last_skill_audit_at)
      : null,
    lastSkillAuditScore: r.last_skill_audit_score == null ? null : num(r.last_skill_audit_score),
    uiTheme: r.ui_theme ? String(r.ui_theme) : null,
    honeypotArmed: Boolean(r.honeypot_armed),
    lastWatchOn: r.last_watch_on ? String(r.last_watch_on).slice(0, 10) : null,
    watchStreak: num(r.watch_streak),
    avatarData: r.avatar_data ? String(r.avatar_data) : null,
    coverData: r.cover_data ? String(r.cover_data) : null,
    locationLabel: str(r.location_label),
    craft: str(r.craft),
    website: str(r.website),
    statusLine: str(r.status_line),
    links: parseLinks(r.links_json),
    liveNow: Boolean(r.live_now),
    liveTitle: r.live_title ? String(r.live_title) : null,
  };
}

function slugify(input: string) {
  const s = input.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 18);
  return s || `viewer${Math.random().toString(36).slice(2, 8)}`;
}

export async function loadProfile(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const rows = await sql<ProfileRow>`
    select p.*, o.name as org_name, o.seats as org_seats,
      exists(
        select 1 from live_sessions l
        where l.user_id = p.user_id and l.active = true and l.ends_at > now()
      ) as live_now,
      (
        select l.title from live_sessions l
        where l.user_id = p.user_id and l.active = true and l.ends_at > now()
        order by l.id desc limit 1
      ) as live_title
    from viewer_profiles p
    left join trv_orgs o on o.id = p.org_id
    where p.user_id = ${userId}
    limit 1
  `;
  if (!rows[0]) return null;
  return expirePaidTrial(sql, mapProfile(rows[0]));
}

async function expirePaidTrial(
  sql: Awaited<ReturnType<typeof getSql>>,
  profile: ViewerProfile,
): Promise<ViewerProfile> {
  if (!profile.paidTrialUntil) return profile;
  const end = Date.parse(profile.paidTrialUntil);
  if (!Number.isFinite(end) || end > Date.now()) return profile;
  const trialPlan = profile.paidTrialPlan || PAID_TRIAL_PLAN;
  const renew = profile.planRenewsAt ? Date.parse(profile.planRenewsAt) : 0;
  const stillOnTrial =
    profile.planId === trialPlan && Number.isFinite(renew) && renew > 0 && renew <= end + 120_000;
  if (!stillOnTrial) return profile;
  await sql`
    update viewer_profiles
    set plan_id = 'initiate', plan_renews_at = null
    where user_id = ${profile.userId}
  `;
  return { ...profile, planId: "initiate", planRenewsAt: null };
}

async function grantOutsideTrial(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  existing: ViewerProfile,
) {
  if (existing.paidTrialUsed) throw new Error("This node already used the 2-day Verified trial.");
  const current = planById(existing.planId);
  if (current.usdMonth > 0) throw new Error("Already on a paid plan.");
  const until = paidTrialUntilIso();
  await sql`
    update viewer_profiles
    set plan_id = ${PAID_TRIAL_PLAN},
        plan_renews_at = ${until},
        paid_trial_until = ${until},
        paid_trial_plan = ${PAID_TRIAL_PLAN},
        paid_trial_used = true,
        credits = credits + ${PAID_TRIAL_CREDITS}
    where user_id = ${userId}
  `;
  await sql`
    insert into saas_invoices (user_id, plan_id, usd_cents, credits, kind, memo)
    values (${userId}, ${PAID_TRIAL_PLAN}, 0, ${PAID_TRIAL_CREDITS}, 'trial', 'outside-2d-verified')
  `;
  const next = await loadProfile(sql, userId);
  if (!next) throw new Error("Trial failed to bind");
  return next;
}

export const ensureProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { displayName?: string; native?: boolean; referral?: string; edition?: string; paidTrial?: boolean }) => ({
    displayName: (input.displayName || "Remote Viewer").slice(0, 48),
    native: Boolean(input.native),
    referral: input.referral?.trim().slice(0, 24).toLowerCase() || null,
    edition: input.edition === "company" ? "company" : "people",
    paidTrial: Boolean(input.paidTrial),
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await loadProfile(sql, context.userId);
    if (existing) {
      if (data.paidTrial && !existing.paidTrialUsed && planById(existing.planId).usdMonth === 0) {
        try {
          return await grantOutsideTrial(sql, context.userId, existing);
        } catch {
          return existing;
        }
      }
      return existing;
    }
    let handle = slugify(data.displayName);
    for (let i = 0; i < 8; i++) {
      const clash = await sql<{ n: number }>`select count(*)::int as n from viewer_profiles where handle = ${handle}`;
      if ((clash[0]?.n ?? 0) === 0) break;
      handle = `${slugify(data.displayName)}${i + 2}`;
    }
    let credits = 500;
    let trial: string | null = null;
    if (data.referral) {
      const ref = await sql<{ user_id: string }>`select user_id from viewer_profiles where handle = ${data.referral} limit 1`;
      if (ref[0] && ref[0].user_id !== context.userId) {
        credits += REFERRAL_NEW_CREDITS;
        const until = new Date();
        until.setUTCDate(until.getUTCDate() + REFERRAL_TRIAL_DAYS);
        trial = until.toISOString();
        await sql`update viewer_profiles set credits = credits + ${REFERRAL_BONUS_CREDITS} where user_id = ${ref[0].user_id}`;
      }
    }
    const paidUntil = data.paidTrial ? paidTrialUntilIso() : null;
    if (paidUntil) credits += PAID_TRIAL_CREDITS;
    await sql`
      insert into viewer_profiles (
        user_id, handle, display_name, native_security, edition, referral_handle, credits, trial_until,
        plan_id, plan_renews_at, paid_trial_until, paid_trial_plan, paid_trial_used
      )
      values (
        ${context.userId}, ${handle}, ${data.displayName}, ${data.native}, ${data.edition}, ${data.referral}, ${credits}, ${trial},
        ${paidUntil ? PAID_TRIAL_PLAN : "initiate"}, ${paidUntil}, ${paidUntil}, ${paidUntil ? PAID_TRIAL_PLAN : null}, ${Boolean(paidUntil)}
      )
    `;
    if (paidUntil) {
      await sql`
        insert into saas_invoices (user_id, plan_id, usd_cents, credits, kind, memo)
        values (${context.userId}, ${PAID_TRIAL_PLAN}, 0, ${PAID_TRIAL_CREDITS}, 'trial', 'outside-2d-verified')
      `;
    }
    const made = await loadProfile(sql, context.userId);
    if (!made) throw new Error("Node failed to bind");
    return made;
  });

export const markNativeSecurity = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`update viewer_profiles set native_security = true where user_id = ${context.userId}`;
    return loadProfile(sql, context.userId);
  });

export const attestBaseline = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { age18: boolean; ofac: boolean }) => input)
  .handler(async ({ context, data }) => {
    if (!data.age18) throw new Error("The Remote Viewer is 18 or older.");
    if (!data.ofac) throw new Error("OFAC attestation required.");
    const sql = await getSql();
    await sql`update viewer_profiles set age_ok = true, ofac_ok = true where user_id = ${context.userId}`;
    return loadProfile(sql, context.userId);
  });

export const completeTutorial = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`
      update viewer_profiles
      set tutorial_at = coalesce(tutorial_at, now())
      where user_id = ${context.userId}
    `;
    return loadProfile(sql, context.userId);
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    displayName: string;
    handle: string;
    bio: string;
    manifesto: string;
    locationLabel?: string;
    craft?: string;
    website?: string;
    statusLine?: string;
    links?: { label: string; url: string }[];
    isPublic?: boolean;
  }) => ({
    displayName: input.displayName.trim().slice(0, 48),
    handle: slugify(input.handle),
    bio: input.bio.trim().slice(0, 400),
    manifesto: input.manifesto.trim().slice(0, 800),
    locationLabel: (input.locationLabel ?? "").trim().slice(0, 64),
    craft: (input.craft ?? "").trim().slice(0, 64),
    website: sanitizeHttps(input.website ?? ""),
    statusLine: (input.statusLine ?? "").trim().slice(0, 80),
    links: parseLinks(input.links ?? []),
    isPublic: input.isPublic !== false,
  }))
  .handler(async ({ context, data }) => {
    if (!data.displayName) throw new Error("Name required");
    if (!data.handle) throw new Error("Handle required");
    const sql = await getSql();
    const clash = await sql<{ user_id: string }>`
      select user_id from viewer_profiles where handle = ${data.handle} and user_id <> ${context.userId} limit 1
    `;
    if (clash[0]) throw new Error("Handle taken");
    const linksJson = JSON.stringify(data.links);
    await sql`
      update viewer_profiles
      set display_name = ${data.displayName}, handle = ${data.handle}, bio = ${data.bio}, manifesto = ${data.manifesto},
          location_label = ${data.locationLabel}, craft = ${data.craft}, website = ${data.website},
          status_line = ${data.statusLine}, links_json = ${linksJson}, is_public = ${data.isPublic}
      where user_id = ${context.userId}
    `;
    return loadProfile(sql, context.userId);
  });

export const updatePortrait = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { avatarData?: string | null; coverData?: string | null }) => ({
    avatarData: input.avatarData === undefined ? undefined : assertImageData(input.avatarData, 220_000),
    coverData: input.coverData === undefined ? undefined : assertImageData(input.coverData, 360_000),
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (data.avatarData !== undefined) {
      await sql`update viewer_profiles set avatar_data = ${data.avatarData} where user_id = ${context.userId}`;
    }
    if (data.coverData !== undefined) {
      await sql`update viewer_profiles set cover_data = ${data.coverData} where user_id = ${context.userId}`;
    }
    return loadProfile(sql, context.userId);
  });

export const myLiveStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`update live_sessions set active = false where active = true and ends_at < now()`;
    const rows = await sql<{ title: string }>`
      select title from live_sessions
      where user_id = ${context.userId} and active = true and ends_at > now()
      order by id desc limit 1
    `;
    return rows[0] ? { live: true as const, title: rows[0].title } : { live: false as const, title: null };
  });

function mapDoc(r: { id: number; title: string; kind: string; mime: string; body: string; bytes: number; created_at: string }): ViewerDoc {
  return {
    id: num(r.id),
    title: r.title,
    kind: r.kind,
    mime: r.mime,
    body: r.body,
    bytes: num(r.bytes),
    createdAt: r.created_at,
  };
}

export const listMyDocs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ id: number; title: string; kind: string; mime: string; body: string; bytes: number; created_at: string }>`
      select id, title, kind, mime, body, bytes, created_at
      from viewer_docs where user_id = ${context.userId}
      order by id desc limit 40
    `;
    return rows.map(mapDoc);
  });

export const putViewerDoc = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title: string; kind: string; mime?: string; body: string }) => {
    const kind = ["note", "receipt", "contract", "image", "other"].includes(input.kind) ? input.kind : "note";
    const title = input.title.trim().slice(0, 80) || "Untitled";
    const body = input.body.slice(0, 420_000);
    const mime = (input.mime || (kind === "image" ? "image/jpeg" : "text/plain")).slice(0, 80);
    if (!body) throw new Error("Document is empty");
    if (kind === "image" && !body.startsWith("data:image/")) throw new Error("Image documents must be images.");
    return { title, kind, mime, body, bytes: body.length };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const count = await sql<{ n: number }>`select count(*)::int as n from viewer_docs where user_id = ${context.userId}`;
    if ((count[0]?.n ?? 0) >= 40) throw new Error("Vault is full (40). Remove one first.");
    await sql`
      insert into viewer_docs (user_id, title, kind, mime, body, bytes)
      values (${context.userId}, ${data.title}, ${data.kind}, ${data.mime}, ${data.body}, ${data.bytes})
    `;
    const rows = await sql<{ id: number; title: string; kind: string; mime: string; body: string; bytes: number; created_at: string }>`
      select id, title, kind, mime, body, bytes, created_at
      from viewer_docs where user_id = ${context.userId}
      order by id desc limit 40
    `;
    return rows.map(mapDoc);
  });

export const deleteViewerDoc = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: number) => Math.round(id))
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`delete from viewer_docs where id = ${id} and user_id = ${context.userId}`;
    const rows = await sql<{ id: number; title: string; kind: string; mime: string; body: string; bytes: number; created_at: string }>`
      select id, title, kind, mime, body, bytes, created_at
      from viewer_docs where user_id = ${context.userId}
      order by id desc limit 40
    `;
    return rows.map(mapDoc);
  });

export const getProfileLedger = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const invoices = await sql<{ id: number; plan_id: string; usd_cents: number; credits: number; kind: string; memo: string; created_at: string }>`
      select id, plan_id, usd_cents, credits, kind, memo, created_at from saas_invoices
      where user_id = ${context.userId} order by id desc limit 20
    `;
    const sales = await sql<{ id: number; nft_id: number; amount: number; fee: number; created_at: string; title: string }>`
      select s.id, s.nft_id, s.amount, s.fee, s.created_at, n.title
      from nft_sales s join trv_nfts n on n.id = s.nft_id
      where s.seller_id = ${context.userId} order by s.id desc limit 20
    `;
    const totals = await sql<{ gross: number; fees: number; count: number }>`
      select coalesce(sum(amount),0)::int as gross, coalesce(sum(fee),0)::int as fees, count(*)::int as count
      from nft_sales where seller_id = ${context.userId}
    `;
    const shop = await sql<{ item_id: string; credits_paid: number; created_at: string }>`
      select item_id, credits_paid, created_at from shop_purchases
      where user_id = ${context.userId} order by created_at desc limit 20
    `;
    const t = totals[0] ?? { gross: 0, fees: 0, count: 0 };
    return {
      invoices: invoices.map((r): InvoiceRow => ({
        id: num(r.id), planId: r.plan_id, usdCents: num(r.usd_cents), credits: num(r.credits),
        kind: r.kind, memo: r.memo, createdAt: r.created_at,
      })),
      sales: sales.map((r): SaleRow => ({
        id: num(r.id), nftId: num(r.nft_id), amount: num(r.amount), fee: num(r.fee), createdAt: r.created_at, title: r.title,
      })),
      shop: shop.map((r): ShopPurchase => ({
        itemId: r.item_id,
        name: shopById(r.item_id)?.name ?? r.item_id,
        creditsPaid: num(r.credits_paid),
        createdAt: r.created_at,
      })),
      totals: { gross: num(t.gross), fees: num(t.fees), net: num(t.gross) - num(t.fees), count: num(t.count) },
    };
  });

export const saveProgress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    xp: number; sentinelHealth: number; sentinelAutonomy: number;
    pulseRadius: number; autoIntercept: number; extraNeurons: number;
  }) => ({
    xp: Math.max(0, Math.min(20000, Math.round(input.xp))),
    sentinelHealth: Math.max(0, Math.min(100, Math.round(input.sentinelHealth))),
    sentinelAutonomy: Math.max(0, Math.min(100, Math.round(input.sentinelAutonomy))),
    pulseRadius: Math.max(1, Math.min(5, Math.round(input.pulseRadius))),
    autoIntercept: Math.max(0, Math.min(5, Math.round(input.autoIntercept))),
    extraNeurons: Math.max(0, Math.min(4, Math.round(input.extraNeurons))),
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const p = await loadProfile(sql, context.userId);
    const stage = stageFromXp(data.xp);
    const tier = tierFromProgress(data.xp, Boolean(p?.verifiedAt));
    await sql`
      update viewer_profiles set
        xp = ${data.xp}, sentinel_health = ${data.sentinelHealth}, sentinel_autonomy = ${data.sentinelAutonomy},
        pulse_radius = ${data.pulseRadius}, auto_intercept = ${data.autoIntercept}, extra_neurons = ${data.extraNeurons},
        neuron_stage = ${stage}, tier = ${tier}
      where user_id = ${context.userId}
    `;
    return loadProfile(sql, context.userId);
  });

export const logDefense = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { attackType: string; outcome: string; xpGain: number }) => ({
    attackType: input.attackType.slice(0, 32),
    outcome: input.outcome.slice(0, 16),
    xpGain: Math.max(0, Math.min(80, Math.round(input.xpGain))),
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into defense_log (user_id, attack_type, outcome, xp_gain)
      values (${context.userId}, ${data.attackType}, ${data.outcome}, ${data.xpGain})
    `;
    if (data.outcome === "blocked") {
      await sql`
        update viewer_profiles
        set sentinel_health = least(100, sentinel_health + 2),
            sentinel_autonomy = least(100, sentinel_autonomy + 1)
        where user_id = ${context.userId}
      `;
    } else if (data.outcome === "breached") {
      await sql`
        update viewer_profiles set sentinel_health = greatest(0, sentinel_health - 4)
        where user_id = ${context.userId}
      `;
    }
    return { ok: true as const };
  });

const FLASH = [0, 2, 3, 1];

export const verifyViewer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { sequence: number[] }) => ({ sequence: input.sequence.slice(0, 8) }))
  .handler(async ({ context, data }) => {
    const ok = data.sequence.length === 4 && data.sequence.every((n, i) => n === FLASH[i]);
    if (!ok) return { ok: false as const };
    const sql = await getSql();
    await sql`update viewer_profiles set verified_at = now() where user_id = ${context.userId}`;
    const p = await loadProfile(sql, context.userId);
    return { ok: true as const, profile: p };
  });

export const attestCitizen = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { hash: string; idType: string; idState: string; liveness: number; attest: boolean }) => input)
  .handler(async ({ context, data }) => {
    if (!data.attest) throw new Error("Attestation required");
    if (data.liveness < 8) throw new Error("Liveness too low. Move during the clip.");
    const sql = await getSql();
    const clash = await sql<{ n: number }>`
      select count(*)::int as n from viewer_profiles where citizen_hash = ${data.hash} and user_id <> ${context.userId}
    `;
    if ((clash[0]?.n ?? 0) > 0) throw new Error("That ID seal is already bound to a node.");
    await sql`
      update viewer_profiles
      set citizen_at = now(), citizen_hash = ${data.hash}, id_type = ${data.idType},
          id_state = ${data.idState}, liveness_score = ${Math.round(data.liveness)}
      where user_id = ${context.userId}
    `;
    return loadProfile(sql, context.userId);
  });

export const saveUiTheme = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((raw: string) => raw.slice(0, 2000))
  .handler(async ({ context, data: raw }) => {
    const sql = await getSql();
    await sql`update viewer_profiles set ui_theme = ${raw} where user_id = ${context.userId}`;
    return loadProfile(sql, context.userId);
  });

export const bindWalletPubkey = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((pk: string) => pk.slice(0, 128))
  .handler(async ({ context, data: pk }) => {
    const sql = await getSql();
    await sql`update viewer_profiles set wallet_pubkey = ${pk} where user_id = ${context.userId}`;
    return loadProfile(sql, context.userId);
  });

export const bindPhantomPubkey = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((pk: string) => pk.slice(0, 128))
  .handler(async ({ context, data: pk }) => {
    const sql = await getSql();
    await sql`update viewer_profiles set phantom_pubkey = ${pk} where user_id = ${context.userId}`;
    return loadProfile(sql, context.userId);
  });

export const mintNft = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    title: string; kind: string; imageData: string; priceCredits: number; list: boolean;
    inspiration?: string | null; bundlePrice?: number; mediaRef?: string | null; durationSec?: number;
  }) => ({
    title: input.title.trim().slice(0, 80) || "Untitled",
    kind: ["meme", "pixel", "photo", "gif", "video"].includes(input.kind) ? input.kind : "photo",
    imageData: input.imageData.slice(0, 900_000),
    priceCredits: Math.max(0, Math.min(10000, Math.round(input.priceCredits))),
    list: Boolean(input.list),
    inspiration: input.inspiration?.trim().slice(0, 2000) || null,
    bundlePrice: Math.max(0, Math.min(20000, Math.round(input.bundlePrice || 0))),
    mediaRef: input.mediaRef?.slice(0, 80) || null,
    durationSec: Math.max(0, Math.min(60, Math.round(input.durationSec || 0))),
  }))
  .handler(async ({ context, data }) => {
    if (data.kind !== "video" && !data.imageData.startsWith("data:image/")) throw new Error("Image required");
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      insert into trv_nfts (user_id, title, kind, image_data, listed, price_credits, minted, inspiration_data, bundle_price, media_ref, duration_sec)
      values (${context.userId}, ${data.title}, ${data.kind}, ${data.imageData || "data:image/gif;base64,R0lGODlhAQABAAAAACw="},
        ${data.list}, ${data.priceCredits}, true, ${data.inspiration}, ${data.bundlePrice}, ${data.mediaRef}, ${data.durationSec})
      returning id
    `;
    return { id: Number(rows[0]?.id) };
  });

function mapNft(r: Record<string, unknown>, handle?: string): NftRow {
  return {
    id: num(r.id),
    userId: str(r.user_id),
    handle,
    title: str(r.title),
    kind: str(r.kind),
    imageData: str(r.image_data),
    listed: Boolean(r.listed),
    priceCredits: num(r.price_credits),
    minted: Boolean(r.minted),
    createdAt: str(r.created_at),
    inspirationData: r.inspiration_data ? String(r.inspiration_data) : null,
    bundlePrice: num(r.bundle_price),
    mediaRef: r.media_ref ? String(r.media_ref) : null,
    durationSec: num(r.duration_sec),
  };
}

export const listMyNfts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select * from trv_nfts where user_id = ${context.userId} order by id desc
    `;
    return rows.map((r) => mapNft(r));
  });

export const listMarket = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`
    select n.*, p.handle from trv_nfts n
    join viewer_profiles p on p.user_id = n.user_id
    where n.listed = true order by n.id desc limit 60
  `;
  return rows.map((r) => mapNft(r, str(r.handle)));
});

export const buyNft = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: number | { id: number; bundle?: boolean }) =>
    typeof input === "number" ? { id: input, bundle: false } : { id: Number(input.id), bundle: Boolean(input.bundle) },
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const nfts = await sql<{ id: number; user_id: string; price_credits: number; listed: boolean; bundle_price: number | null; inspiration_data: string | null }>`
      select id, user_id, price_credits, listed, bundle_price, inspiration_data from trv_nfts where id = ${data.id} limit 1
    `;
    const nft = nfts[0];
    if (!nft || !nft.listed) throw new Error("Listing gone");
    if (nft.user_id === context.userId) throw new Error("You already hold this mint");
    const buyer = await loadProfile(sql, context.userId);
    const seller = await loadProfile(sql, nft.user_id);
    if (!buyer || !seller) throw new Error("Profile missing");
    const extra = data.bundle ? Number(nft.bundle_price || 0) : 0;
    const price = Number(nft.price_credits) + extra;
    if (buyer.credits < price) throw new Error("Insufficient TRV credits");
    const fee = Math.round(price * effectiveFeeRate(seller.planId, seller.tier, Boolean(seller.citizenAt)));
    const net = price - fee;
    await sql`update viewer_profiles set credits = credits - ${price} where user_id = ${context.userId}`;
    await sql`update viewer_profiles set credits = credits + ${net} where user_id = ${nft.user_id}`;
    await sql`update trv_nfts set user_id = ${context.userId}, listed = false where id = ${data.id}`;
    await sql`insert into nft_sales (nft_id, seller_id, buyer_id, amount, fee) values (${data.id}, ${nft.user_id}, ${context.userId}, ${price}, ${fee})`;
    return { ok: true as const, fee, net, price, inspiration: data.bundle ? nft.inspiration_data : null };
  });

export const setListing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; listed: boolean; priceCredits: number }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      update trv_nfts set listed = ${data.listed}, price_credits = ${Math.max(0, Math.round(data.priceCredits))}
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const creatorRevenue = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const sales = await sql<{ id: number; nft_id: number; amount: number; fee: number; created_at: string; title: string }>`
      select s.id, s.nft_id, s.amount, s.fee, s.created_at, n.title
      from nft_sales s join trv_nfts n on n.id = s.nft_id
      where s.seller_id = ${context.userId} order by s.id desc limit 50
    `;
    const totals = await sql<{ gross: number; fees: number; count: number }>`
      select coalesce(sum(amount),0)::int as gross, coalesce(sum(fee),0)::int as fees, count(*)::int as count
      from nft_sales where seller_id = ${context.userId}
    `;
    const t = totals[0] ?? { gross: 0, fees: 0, count: 0 };
    return {
      gross: num(t.gross), fees: num(t.fees), net: num(t.gross) - num(t.fees), count: num(t.count),
      sales: sales.map((r): SaleRow => ({
        id: num(r.id), nftId: num(r.nft_id), amount: num(r.amount), fee: num(r.fee), createdAt: r.created_at, title: r.title,
      })),
    };
  });

export const createForumPost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    title: string; body: string; nftId?: number | null; rating?: string; priceCredits?: number;
    mediaKind?: string; mediaRef?: string | null; durationSec?: number;
  }) => ({
    title: input.title.trim().slice(0, 120),
    body: input.body.trim().slice(0, 4000),
    nftId: input.nftId ?? null,
    rating: ["standard", "adult", "cannabis", "civic"].includes(input.rating || "") ? input.rating! : "standard",
    priceCredits: Math.max(0, Math.min(50_000, Math.round(input.priceCredits || 0))),
    mediaKind: ["text", "audio", "gif", "meme", "video"].includes(input.mediaKind || "") ? input.mediaKind! : "text",
    mediaRef: input.mediaRef?.slice(0, 80) || null,
    durationSec: Math.max(0, Math.min(60, Math.round(input.durationSec || 0))),
  }))
  .handler(async ({ context, data }) => {
    if (!data.title || (!data.body && !data.mediaRef)) throw new Error("Title and body or media required");
    const sql = await getSql();
    const me = await loadProfile(sql, context.userId);
    if (data.priceCredits > 0 && !me?.verifiedAt) throw new Error("Verify before charging for content.");
    if (data.priceCredits > 0 && !me?.citizenAt) throw new Error("US Citizen lock required to monetize.");
    await sql`
      insert into forum_posts (user_id, title, body, nft_id, rating, price_credits, media_kind, media_ref, duration_sec)
      values (${context.userId}, ${data.title}, ${data.body || data.mediaKind}, ${data.nftId}, ${data.rating}, ${data.priceCredits}, ${data.mediaKind}, ${data.mediaRef}, ${data.durationSec})
    `;
    return { ok: true as const };
  });

export const listForum = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const me = await loadProfile(sql, context.userId);
    const rows = await sql<Record<string, unknown>>`
      select f.*, p.handle, p.display_name, n.image_data as nft_image
      from forum_posts f
      join viewer_profiles p on p.user_id = f.user_id
      left join trv_nfts n on n.id = f.nft_id
      order by f.id desc limit 40
    `;
    const follows = await sql<{ followee_id: string }>`select followee_id from follows where follower_id = ${context.userId}`;
    const following = new Set(follows.map((f) => f.followee_id));
    const unlocks = await sql<{ post_id: number }>`select post_id from content_unlocks where user_id = ${context.userId}`;
    const unlocked = new Set(unlocks.map((u) => Number(u.post_id)));
    const verified = Boolean(me?.verifiedAt);
    return rows.map((r): ForumPost => {
      const adult = str(r.rating) === "adult";
      const own = str(r.user_id) === context.userId;
      const paid = num(r.price_credits) <= 0 || unlocked.has(num(r.id));
      const ncii = Boolean(r.ncii_sealed);
      const sealed = ncii || (adult && !own && (!verified || !following.has(str(r.user_id)) || !paid));
      return {
        id: num(r.id), userId: str(r.user_id), handle: str(r.handle), displayName: str(r.display_name),
        title: ncii ? "Sealed — NCII takedown" : str(r.title),
        body: sealed ? "" : str(r.body),
        nftId: r.nft_id == null ? null : num(r.nft_id),
        nftImage: sealed ? null : r.nft_image ? String(r.nft_image) : null,
        createdAt: str(r.created_at), rating: str(r.rating) || "standard",
        priceCredits: num(r.price_credits), sealed,
        mediaKind: str(r.media_kind) || "text",
        mediaRef: sealed ? null : r.media_ref ? String(r.media_ref) : null,
        durationSec: num(r.duration_sec),
      };
    });
  });

export const addForumComment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { postId: number; body: string; mediaKind?: string; mediaRef?: string | null }) => ({
    postId: Number(input.postId),
    body: input.body.trim().slice(0, 1200),
    mediaKind: ["text", "audio", "gif", "meme"].includes(input.mediaKind || "") ? input.mediaKind! : "text",
    mediaRef: input.mediaRef?.slice(0, 80) || null,
  }))
  .handler(async ({ context, data }) => {
    if (!data.body && !data.mediaRef) throw new Error("Say something or attach media.");
    const sql = await getSql();
    await sql`
      insert into forum_comments (post_id, user_id, body, media_kind, media_ref)
      values (${data.postId}, ${context.userId}, ${data.body}, ${data.mediaKind}, ${data.mediaRef})
    `;
    return { ok: true as const };
  });

export const flagNcii = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { postId: number; reason: string }) => ({
    postId: Number(input.postId),
    reason: input.reason.trim().slice(0, 400),
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const me = await loadProfile(sql, context.userId);
    await sql`insert into ncii_flags (post_id, reporter_address, reason) values (${data.postId}, ${me?.hydraAddress || context.userId}, ${data.reason})`;
    await sql`update forum_posts set ncii_sealed = true where id = ${data.postId}`;
    return { ok: true as const };
  });

export const followCreator = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((handle: string) => handle.trim().slice(0, 24).toLowerCase())
  .handler(async ({ context, data: handle }) => {
    const sql = await getSql();
    const rows = await sql<{ user_id: string }>`select user_id from viewer_profiles where handle = ${handle} limit 1`;
    if (!rows[0]) throw new Error("No Viewer under that handle");
    if (rows[0].user_id === context.userId) throw new Error("You already watch yourself.");
    await sql`insert into viewership (follower_id, creator_id) values (${context.userId}, ${rows[0].user_id}) on conflict do nothing`;
    return { ok: true as const };
  });

export const postClip = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title: string; mediaRef: string; poster?: string | null; durationSec: number }) => ({
    title: input.title.trim().slice(0, 80) || "Clip",
    mediaRef: input.mediaRef.slice(0, 80),
    poster: input.poster?.slice(0, 400_000) || null,
    durationSec: Math.max(5, Math.min(60, Math.round(input.durationSec))),
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      insert into viewer_clips (user_id, title, media_ref, poster_data, duration_sec)
      values (${context.userId}, ${data.title}, ${data.mediaRef}, ${data.poster}, ${data.durationSec})
      returning id
    `;
    return { id: Number(rows[0]?.id) };
  });

export const listClips = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select c.*, p.handle from viewer_clips c
      join viewer_profiles p on p.user_id = c.user_id
      order by c.id desc limit 40
    `;
    return rows.map((r) => ({
      id: num(r.id), title: str(r.title), mediaRef: str(r.media_ref), poster: r.poster_data ? String(r.poster_data) : null,
      durationSec: num(r.duration_sec), handle: str(r.handle), createdAt: str(r.created_at),
    }));
  });

export const logMoe = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { kind: string; summary: string }) => ({
    kind: input.kind.slice(0, 24),
    summary: input.summary.trim().slice(0, 400),
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`insert into moe_events (user_id, kind, summary) values (${context.userId}, ${data.kind}, ${data.summary})`;
    return { ok: true as const };
  });

export const importMigration = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { source: string; content: string }) => ({
    source: input.source.trim().slice(0, 40) || "unknown",
    content: input.content.trim().slice(0, 20000),
  }))
  .handler(async ({ context, data }) => {
    if (!data.content) throw new Error("Paste is empty");
    const sql = await getSql();
    await sql`insert into migrations_paste (user_id, source_platform, content) values (${context.userId}, ${data.source}, ${data.content})`;
    return listMigrationsHandler(sql, context.userId);
  });

async function listMigrationsHandler(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const rows = await sql<{ id: number; source_platform: string; content: string; created_at: string }>`
    select id, source_platform, content, created_at from migrations_paste where user_id = ${userId} order by id desc limit 20
  `;
  return rows.map((r): MigrationRow => ({
    id: num(r.id), sourcePlatform: r.source_platform, content: r.content, createdAt: r.created_at,
  }));
}

export const listMigrations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => listMigrationsHandler(await getSql(), context.userId));

export const listMyReferrals = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const me = await loadProfile(sql, context.userId);
    if (!me) return [];
    const rows = await sql<{ handle: string; display_name: string }>`
      select handle, display_name from viewer_profiles where referral_handle = ${me.handle} order by created_at desc
    `;
    return rows.map((r) => ({ handle: r.handle, displayName: r.display_name, bonusCredits: REFERRAL_BONUS_CREDITS }));
  });

export const getPublicProfile = createServerFn({ method: "GET" })
  .validator((handle: string) => handle.trim().slice(0, 24).toLowerCase())
  .handler(async ({ data: handle }) => {
    const sql = await getSql();
    await sql`update live_sessions set active = false where active = true and ends_at < now()`;
    const rows = await sql<ProfileRow>`
      select p.*, o.name as org_name, o.seats as org_seats,
        exists(
          select 1 from live_sessions l
          where l.user_id = p.user_id and l.active = true and l.ends_at > now()
        ) as live_now,
        (
          select l.title from live_sessions l
          where l.user_id = p.user_id and l.active = true and l.ends_at > now()
          order by l.id desc limit 1
        ) as live_title
      from viewer_profiles p left join trv_orgs o on o.id = p.org_id
      where p.handle = ${handle} and p.is_public = true limit 1
    `;
    if (!rows[0]) return null;
    const full = mapProfile(rows[0]);
    const profile: PublicViewer = {
      handle: full.handle,
      displayName: full.displayName,
      bio: full.bio,
      manifesto: full.manifesto,
      tier: String(full.tier),
      nativeSecurity: full.nativeSecurity,
      neuronStage: full.neuronStage,
      avatarData: full.avatarData,
      coverData: full.coverData,
      locationLabel: full.locationLabel,
      craft: full.craft,
      website: full.website,
      statusLine: full.statusLine,
      links: full.links,
      shopFrame: full.shopFrame,
      shopTitle: full.shopTitle,
      shopChrome: full.shopChrome,
      uiTheme: full.uiTheme,
      liveNow: full.liveNow,
      liveTitle: full.liveTitle,
      citizenSealed: Boolean(full.citizenAt),
    };
    const nfts = await sql<Record<string, unknown>>`
      select * from trv_nfts where user_id = ${full.userId} and listed = true order by id desc limit 12
    `;
    return { profile, nfts: nfts.map((n) => mapNft(n, full.handle)) };
  });

export const getPublicReferrer = createServerFn({ method: "GET" })
  .validator((handle: string) => handle.trim().slice(0, 24).toLowerCase())
  .handler(async ({ data: handle }) => {
    const sql = await getSql();
    const rows = await sql<{ handle: string; display_name: string }>`
      select handle, display_name from viewer_profiles where handle = ${handle} limit 1
    `;
    return rows[0] ? { handle: rows[0].handle, displayName: rows[0].display_name } : null;
  });

export const startOutsideTrial = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const me = await loadProfile(sql, context.userId);
    if (!me) throw new Error("Node missing");
    return grantOutsideTrial(sql, context.userId, me);
  });

export const listPublicViewers = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  await sql`update live_sessions set active = false where active = true and ends_at < now()`;
  const rows = await sql<ProfileRow>`
    select p.handle, p.display_name, p.bio, p.craft, p.location_label, p.status_line,
      p.avatar_data, p.neuron_stage, p.tier,
      exists(
        select 1 from live_sessions l
        where l.user_id = p.user_id and l.active = true and l.ends_at > now()
      ) as live_now,
      (
        select l.title from live_sessions l
        where l.user_id = p.user_id and l.active = true and l.ends_at > now()
        order by l.id desc limit 1
      ) as live_title
    from viewer_profiles p
    where p.is_public = true
    order by live_now desc, p.created_at desc
    limit 80
  `;
  return rows.map(
    (r): PublicViewerCard => ({
      handle: str(r.handle),
      displayName: str(r.display_name),
      bio: str(r.bio),
      craft: str(r.craft),
      locationLabel: str(r.location_label),
      statusLine: str(r.status_line),
      avatarData: r.avatar_data ? String(r.avatar_data) : null,
      liveNow: Boolean(r.live_now),
      liveTitle: r.live_title ? String(r.live_title) : null,
      neuronStage: num(r.neuron_stage),
      tier: str(r.tier) || "initiate",
    }),
  );
});

export const listPublicHandles = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{ handle: string; created_at: string }>`
    select handle, created_at from viewer_profiles where is_public = true order by created_at desc limit 500
  `;
  return rows.map((r) => ({ handle: r.handle, createdAt: String(r.created_at) }));
});

async function orgSnap(sql: Awaited<ReturnType<typeof getSql>>, orgId: number | null): Promise<OrgSnapshot | null> {
  if (!orgId) return null;
  const orgs = await sql<{ id: number; name: string; slug: string; plan_id: string; seats: number; owner_id: string }>`
    select id, name, slug, plan_id, seats, owner_id from trv_orgs where id = ${orgId} limit 1
  `;
  const o = orgs[0];
  if (!o) return null;
  const members = await sql<{ user_id: string; handle: string; display_name: string; role: string }>`
    select m.user_id, p.handle, p.display_name, m.role
    from org_members m join viewer_profiles p on p.user_id = m.user_id
    where m.org_id = ${orgId}
  `;
  return {
    id: num(o.id), name: o.name, slug: o.slug, planId: o.plan_id, seats: num(o.seats), ownerId: o.owner_id,
    members: members.map((m) => ({ userId: m.user_id, handle: m.handle, displayName: m.display_name, role: m.role })),
  };
}

export const getBilling = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profile = await loadProfile(sql, context.userId);
    const invoices = await sql<{ id: number; plan_id: string; usd_cents: number; credits: number; kind: string; memo: string; created_at: string }>`
      select id, plan_id, usd_cents, credits, kind, memo, created_at from saas_invoices
      where user_id = ${context.userId} order by id desc limit 30
    `;
    return {
      profile,
      org: await orgSnap(sql, profile?.orgId ?? null),
      feeRate: profile ? effectiveFeeRate(profile.planId, profile.tier, Boolean(profile.citizenAt)) : 0.08,
      invoices: invoices.map((r): InvoiceRow => ({
        id: num(r.id), planId: r.plan_id, usdCents: num(r.usd_cents), credits: num(r.credits),
        kind: r.kind, memo: r.memo, createdAt: r.created_at,
      })),
    };
  });

export const convertToTrv = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { usd: number; rail: string }) => ({
    usd: Math.max(1, Math.min(10000, Math.round(input.usd))),
    rail: input.rail.slice(0, 24),
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const credits = usdToCredits(data.usd);
    await sql`update viewer_profiles set credits = credits + ${credits} where user_id = ${context.userId}`;
    await sql`
      insert into saas_invoices (user_id, plan_id, usd_cents, credits, kind, memo)
      values (${context.userId}, 'convert', ${data.usd * 100}, ${credits}, 'convert', ${data.rail})
    `;
    return { credits, profile: await loadProfile(sql, context.userId) };
  });

export const subscribePlan = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { planId: string; interval: BillingInterval; orgName?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const plan = planById(data.planId);
    const me = await loadProfile(sql, context.userId);
    if (!me) throw new Error("Node missing");
    const usd = planPriceUsd(plan, data.interval);
    const credits = planCredits(usdToCredits(plan.usdMonth, data.interval), Boolean(me.citizenAt));
    if (plan.usdMonth > 0 && me.credits < credits) throw new Error("Insufficient TRV credits");
    if (plan.usdMonth > 0) {
      await sql`update viewer_profiles set credits = credits - ${credits} where user_id = ${context.userId}`;
    }
    let orgId = me.orgId;
    if (isCompanyPlan(plan.id)) {
      if (!orgId) {
        const slug = slugify(data.orgName || me.handle);
        const created = await sql<{ id: number }>`
          insert into trv_orgs (name, slug, owner_id, plan_id, seats)
          values (${(data.orgName || me.handle).slice(0, 48)}, ${slug}, ${context.userId}, ${plan.id}, ${plan.seats})
          returning id
        `;
        orgId = Number(created[0]?.id);
        await sql`insert into org_members (org_id, user_id, role) values (${orgId}, ${context.userId}, 'owner') on conflict do nothing`;
      } else {
        await sql`update trv_orgs set plan_id = ${plan.id}, seats = ${plan.seats} where id = ${orgId}`;
      }
    }
    const renew = new Date();
    if (data.interval === "year") renew.setUTCFullYear(renew.getUTCFullYear() + 1);
    else renew.setUTCMonth(renew.getUTCMonth() + 1);
    await sql`
      update viewer_profiles set plan_id = ${plan.id}, edition = ${plan.edition}, billing_interval = ${data.interval},
        plan_renews_at = ${renew.toISOString()}, org_id = ${orgId}
      where user_id = ${context.userId}
    `;
    await sql`
      insert into saas_invoices (user_id, org_id, plan_id, usd_cents, credits, kind, memo)
      values (${context.userId}, ${orgId}, ${plan.id}, ${usd * 100}, ${credits}, 'subscribe', ${data.interval})
    `;
    return { charged: credits, profile: await loadProfile(sql, context.userId) };
  });

export const inviteOrgSeat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((handle: string) => handle.trim().slice(0, 24).toLowerCase())
  .handler(async ({ context, data: handle }) => {
    const sql = await getSql();
    const me = await loadProfile(sql, context.userId);
    if (!me?.orgId) throw new Error("No company cell");
    const org = await orgSnap(sql, me.orgId);
    if (!org || org.ownerId !== context.userId) throw new Error("Owner only");
    const dest = await sql<{ user_id: string }>`select user_id from viewer_profiles where handle = ${handle} limit 1`;
    if (!dest[0]) throw new Error("Viewer not found");
    await sql`insert into org_members (org_id, user_id, role) values (${me.orgId}, ${dest[0].user_id}, 'member') on conflict do nothing`;
    await sql`update viewer_profiles set org_id = ${me.orgId}, edition = 'company' where user_id = ${dest[0].user_id}`;
    return { org: await orgSnap(sql, me.orgId) };
  });

export const startStripeOnramp = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { usd: number; dest: OnrampDest; origin: string }) => ({
    usd: Math.max(1, Math.min(5000, Math.round(input.usd))),
    dest: input.dest === "sol" ? "sol" : "trv",
    origin: input.origin.slice(0, 200),
  }))
  .handler(async ({ context, data }) => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return { mode: "preview" as const, url: null as string | null };
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        mode: "payment",
        success_url: `${data.origin}/hub/billing?paid=1`,
        cancel_url: `${data.origin}/hub/billing`,
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][product_data][name]": data.dest === "sol" ? "TRV SOL on-ramp" : "TRV credits",
        "line_items[0][price_data][unit_amount]": String(data.usd * 100),
        "line_items[0][quantity]": "1",
        "metadata[userId]": context.userId,
        "metadata[dest]": data.dest,
        "metadata[usd]": String(data.usd),
      }),
    });
    if (!res.ok) return { mode: "preview" as const, url: null };
    const body = (await res.json()) as { url?: string };
    return { mode: "stripe" as const, url: body.url ?? null };
  });

export const confirmPreviewOnramp = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { usd: number; dest: OnrampDest }): { usd: number; dest: OnrampDest } => ({
    usd: Math.max(1, Math.min(5000, Math.round(input.usd))),
    dest: input.dest === "sol" ? "sol" : "trv",
  }))
  .handler(async ({ context, data }) => {
    await settleOnramp(context.userId, data.usd, data.dest, `preview-${Date.now()}`);
    const sql = await getSql();
    return { profile: await loadProfile(sql, context.userId) };
  });

export async function settleOnramp(userId: string, usd: number, dest: OnrampDest, sessionId: string) {
  const sql = await getSql();
  if (dest === "sol") {
    const micro = usdToSolMicro(usd);
    await sql`update viewer_profiles set sol_micro = sol_micro + ${micro} where user_id = ${userId}`;
  } else {
    const credits = Math.round(usd * USD_TO_TRV);
    await sql`update viewer_profiles set credits = credits + ${credits} where user_id = ${userId}`;
  }
  await sql`
    insert into saas_invoices (user_id, plan_id, usd_cents, credits, kind, memo)
    values (${userId}, 'onramp', ${usd * 100}, ${dest === "trv" ? usd * USD_TO_TRV : 0}, 'stripe', ${sessionId.slice(0, 80)})
  `;
}

export type SearchHit = { title: string; url: string; snippet: string; source: string };

function isPrivateHost(host: string) {
  const h = host.toLowerCase();
  return h === "localhost" || h.endsWith(".local") || h === "0.0.0.0" || /^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(h);
}

export const shieldSearch = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((q: string) => q.trim().slice(0, 200))
  .handler(async ({ data: q }) => {
    if (!q) return { hits: [] as SearchHit[], error: null as string | null };
    const hits: SearchHit[] = [];
    try {
      const wiki = await fetch(
        `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=5&namespace=0&format=json`,
        { signal: AbortSignal.timeout(8000), headers: { "User-Agent": "TheRemoteViewer/1.0" } },
      );
      if (wiki.ok) {
        const body = (await wiki.json()) as [string, string[], string[], string[]];
        (body[1] ?? []).forEach((title, i) => {
          hits.push({ title, url: body[3]?.[i] || "", snippet: body[2]?.[i] || "", source: "Wikipedia" });
        });
      }
    } catch { /* continue */ }
    if (hits.length === 0) {
      hits.push({
        title: `Search the open web for “${q}”`,
        url: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
        snippet: "Direct results were thin.",
        source: "DuckDuckGo",
      });
    }
    return { hits, error: null as string | null };
  });

export const shieldFetch = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((url: string) => url.trim().slice(0, 500))
  .handler(async ({ data: raw }) => {
    let parsed: URL;
    try { parsed = new URL(raw); } catch { return { ok: false as const, error: "Invalid URL" }; }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return { ok: false as const, error: "Only http(s) is allowed" };
    if (isPrivateHost(parsed.hostname)) return { ok: false as const, error: "Private hosts are blocked" };
    try {
      const res = await fetch(parsed.toString(), { signal: AbortSignal.timeout(8000), redirect: "follow", headers: { "User-Agent": "TheRemoteViewer-Shield/1.0" } });
      const buf = await res.arrayBuffer();
      if (buf.byteLength > 800_000) return { ok: false as const, error: "Page too large" };
      const text = new TextDecoder("utf-8").decode(buf);
      const titleMatch = text.match(/<title[^>]*>([^<]{1,200})<\/title>/i);
      const links: { href: string; label: string }[] = [];
      const seen = new Set<string>();
      const hrefRe = /<a[^>]+href=["'](https?:\/\/[^"'>\s#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
      let m: RegExpExecArray | null;
      while ((m = hrefRe.exec(text)) && links.length < 24) {
        const href = m[1]!;
        if (seen.has(href)) continue;
        try { if (isPrivateHost(new URL(href).hostname)) continue; } catch { continue; }
        seen.add(href);
        links.push({ href, label: m[2]!.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) || href });
      }
      const stripped = text.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 8000);
      return { ok: true as const, title: (titleMatch?.[1] || parsed.hostname).trim(), url: parsed.toString(), text: stripped || "No extractable text.", links };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Fetch failed" };
    }
  });

export async function absorbProbe(path: string, userId?: string | null) {
  const sql = await getSql();
  const { lure, kind } = classifyLure(path);
  const lesson = lessonFor(kind);
  await sql`insert into honeypot_events (user_id, lure, kind, outcome, lesson) values (${userId || null}, ${lure}, ${kind}, ${"blocked"}, ${lesson})`;
  if (userId) {
    await sql`
      update viewer_profiles
      set sentinel_health = least(100, sentinel_health + 2), sentinel_autonomy = least(100, sentinel_autonomy + 1), xp = xp + 3
      where user_id = ${userId} and honeypot_armed = true
    `;
  } else {
    await sql`
      update viewer_profiles
      set sentinel_health = least(100, sentinel_health + 1), sentinel_autonomy = least(100, sentinel_autonomy + 1)
      where honeypot_armed = true
    `;
  }
  return { lure, kind, lesson };
}

export const setHoneypot = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((on: boolean) => Boolean(on))
  .handler(async ({ context, data: on }) => {
    const sql = await getSql();
    await sql`update viewer_profiles set honeypot_armed = ${on} where user_id = ${context.userId}`;
    return loadProfile(sql, context.userId);
  });

export const tickHoneypot = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profile = await loadProfile(sql, context.userId);
    if (!profile?.honeypotArmed) return { ok: false as const, error: "Honeypot is dark." };
    const kinds = ["secret-scan", "cms-brute", "panel-probe", "key-theft", "scanner"];
    const kind = kinds[Math.floor(Math.random() * kinds.length)] ?? "scanner";
    const absorbed = await absorbProbe(`/api/lure/${kind}`, context.userId);
    const next = await loadProfile(sql, context.userId);
    return { ok: true as const, ...absorbed, health: next?.sentinelHealth, autonomy: next?.sentinelAutonomy };
  });

export const listHoneypot = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ id: number; lure: string; kind: string; outcome: string; lesson: string; created_at: string }>`
      select id, lure, kind, outcome, lesson, created_at from honeypot_events
      where user_id = ${context.userId} or user_id is null
      order by id desc limit 40
    `;
    return rows.map((r) => ({ id: num(r.id), lure: r.lure, kind: r.kind, outcome: r.outcome, lesson: r.lesson, createdAt: r.created_at }));
  });

function utcDay(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
function yesterdayUtc(day: string) {
  const t = new Date(`${day}T00:00:00.000Z`);
  t.setUTCDate(t.getUTCDate() - 1);
  return t.toISOString().slice(0, 10);
}
function daysBetween(from: string, to: string) {
  const a = Date.parse(`${from}T00:00:00.000Z`);
  const b = Date.parse(`${to}T00:00:00.000Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0;
  return Math.round((b - a) / 86400000);
}
function secondsUntilUtcMidnight(now = new Date()) {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(0, Math.floor((next - now.getTime()) / 1000));
}
function watchPayout(streak: number, citizen: boolean) {
  return 25 + Math.min(14, streak) * 5 + (citizen ? 10 : 0);
}

async function countTodayIntercepts(sql: Awaited<ReturnType<typeof getSql>>, userId: string, since: string) {
  let intercepts = 0;
  try {
    const d1 = await sql<{ n: number }>`
      select count(*)::int as n from defense_log
      where user_id = ${userId} and outcome = 'blocked' and created_at >= ${since}
    `;
    intercepts += Number(d1[0]?.n ?? 0);
  } catch {
    /* */
  }
  try {
    const d2 = await sql<{ n: number }>`
      select count(*)::int as n from honeypot_events
      where user_id = ${userId} and outcome = 'blocked' and created_at >= ${since}
    `;
    intercepts += Number(d2[0]?.n ?? 0);
  } catch {
    /* */
  }
  return intercepts;
}

/** Missed UTC days wound Sentinel. Creation day and the current day are grace. */
async function applyMissedWatchDecay(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const day = utcDay();
  const yesterday = yesterdayUtc(day);
  try {
    const rows = await sql<{
      last_watch_on: string | null;
      watch_decay_through: string | null;
      created_at: string;
    }>`
      select last_watch_on, watch_decay_through, created_at
      from viewer_profiles where user_id = ${userId} limit 1
    `;
    const row = rows[0];
    if (!row) return { damage: 0, missedDays: 0 };
    const lastWatch = row.last_watch_on ? String(row.last_watch_on).slice(0, 10) : "";
    if (lastWatch === day) return { damage: 0, missedDays: 0 };
    const created = String(row.created_at).slice(0, 10);
    const through =
      (row.watch_decay_through ? String(row.watch_decay_through).slice(0, 10) : "") || lastWatch || created;
    if (!through || through >= yesterday) return { damage: 0, missedDays: 0 };
    const missedDays = daysBetween(through, yesterday);
    if (missedDays < 1) return { damage: 0, missedDays: 0 };
    const damage = Math.min(40, missedDays * 8);
    await sql`
      update viewer_profiles
      set sentinel_health = greatest(12, sentinel_health - ${damage}),
          watch_decay_through = ${yesterday}
      where user_id = ${userId}
    `;
    return { damage, missedDays };
  } catch {
    return { damage: 0, missedDays: 0 };
  }
}

export const watchStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<WatchStatus> => {
    const sql = await getSql();
    const day = utcDay();
    const since = `${day}T00:00:00.000Z`;
    const decay = await applyMissedWatchDecay(sql, context.userId);
    const me = await loadProfile(sql, context.userId);
    const intercepts = await countTodayIntercepts(sql, context.userId, since);
    const streak = Number(me?.watchStreak ?? 0);
    const claimed = (me?.lastWatchOn || "").slice(0, 10) === day;
    const nextStreak = me?.lastWatchOn === yesterdayUtc(day) ? streak + 1 : claimed ? streak : 1;
    return {
      day,
      claimed,
      defended: intercepts > 0,
      intercepts,
      streak,
      nextStreak,
      nextCredits: watchPayout(claimed ? streak : nextStreak, Boolean(me?.citizenAt)),
      health: Number(me?.sentinelHealth ?? 100),
      missedDays: decay.missedDays,
      decayDamage: decay.damage,
      secondsLeft: secondsUntilUtcMidnight(),
    };
  });

export const claimWatch = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const day = utcDay();
    const since = `${day}T00:00:00.000Z`;
    await applyMissedWatchDecay(sql, context.userId);
    const me = await loadProfile(sql, context.userId);
    if (!me) throw new Error("Node missing");
    if ((me.lastWatchOn || "").slice(0, 10) === day) throw new Error("You already stood watch today.");
    const intercepts = await countTodayIntercepts(sql, context.userId, since);
    if (intercepts < 1) throw new Error("Defend first — land one intercept in Neuron, Mesh, or an armed honeypot.");
    const streak = me.lastWatchOn === yesterdayUtc(day) ? (me.watchStreak || 0) + 1 : 1;
    const credits = watchPayout(streak, Boolean(me.citizenAt));
    try {
      await sql`insert into watch_claims (user_id, day, credits, streak) values (${context.userId}, ${day}, ${credits}, ${streak})`;
    } catch {
      /* */
    }
    await sql`
      update viewer_profiles
      set credits = credits + ${credits}, last_watch_on = ${day}, watch_streak = ${streak},
          sentinel_health = least(100, sentinel_health + 4)
      where user_id = ${context.userId}
    `;
    try {
      await sql`update viewer_profiles set watch_decay_through = ${day} where user_id = ${context.userId}`;
    } catch {
      /* column arrives via 0013 */
    }
    return loadProfile(sql, context.userId);
  });
