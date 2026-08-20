import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { coarsen, milesBetween, WATCH_MILES } from "./content";
import { shopById, SHOP_ITEMS } from "./shop";
import { effectiveFeeRate } from "./saas";
import { shopPrice } from "./citizen";
import { loadProfile } from "./server";

async function requireMutualVerified(
  sql: Awaited<ReturnType<typeof getSql>>,
  a: string,
  b: string,
) {
  const [pa, pb] = await Promise.all([loadProfile(sql, a), loadProfile(sql, b)]);
  if (!pa?.verifiedAt || !pb?.verifiedAt) throw new Error("Both Viewers must complete the robot handshake.");
  const ab = await sql<{ n: number }>`
    select count(*)::int as n from follows where follower_id = ${a} and followee_id = ${b}
  `;
  const ba = await sql<{ n: number }>`
    select count(*)::int as n from follows where follower_id = ${b} and followee_id = ${a}
  `;
  if ((ab[0]?.n ?? 0) < 1 || (ba[0]?.n ?? 0) < 1) {
    throw new Error("Mutual follow required before talk / video.");
  }
}

export const followViewer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((handle: string) => handle.trim().slice(0, 24).toLowerCase())
  .handler(async ({ context, data: handle }) => {
    const sql = await getSql();
    const rows = await sql<{ user_id: string }>`
      select user_id from viewer_profiles where handle = ${handle} limit 1
    `;
    if (!rows[0]) throw new Error("Viewer not found");
    if (rows[0].user_id === context.userId) throw new Error("Cannot follow yourself");
    await sql`
      insert into follows (follower_id, followee_id)
      values (${context.userId}, ${rows[0].user_id})
      on conflict do nothing
    `;
    return { ok: true as const };
  });

export const unfollowViewer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((handle: string) => handle.trim().slice(0, 24).toLowerCase())
  .handler(async ({ context, data: handle }) => {
    const sql = await getSql();
    await sql`
      delete from follows
      where follower_id = ${context.userId}
        and followee_id = (select user_id from viewer_profiles where handle = ${handle} limit 1)
    `;
    return { ok: true as const };
  });

export const listSocial = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const following = await sql<{ handle: string; display_name: string; user_id: string; avatar_data: string | null; live_now: boolean }>`
      select p.handle, p.display_name, p.user_id, p.avatar_data,
        exists(select 1 from live_sessions l where l.user_id = p.user_id and l.active = true and l.ends_at > now()) as live_now
      from follows f join viewer_profiles p on p.user_id = f.followee_id
      where f.follower_id = ${context.userId}
      order by p.handle
    `;
    const followers = await sql<{ handle: string; display_name: string; user_id: string; avatar_data: string | null; live_now: boolean }>`
      select p.handle, p.display_name, p.user_id, p.avatar_data,
        exists(select 1 from live_sessions l where l.user_id = p.user_id and l.active = true and l.ends_at > now()) as live_now
      from follows f join viewer_profiles p on p.user_id = f.follower_id
      where f.followee_id = ${context.userId}
      order by p.handle
    `;
    const followSet = new Set(following.map((r) => r.user_id));
    const friends = followers.filter((r) => followSet.has(r.user_id));
    const mapRow = (r: { handle: string; display_name: string; user_id: string; avatar_data: string | null; live_now: boolean }) => ({
      handle: r.handle,
      displayName: r.display_name,
      userId: r.user_id,
      avatarData: r.avatar_data,
      liveNow: Boolean(r.live_now),
    });
    return {
      following: following.map(mapRow),
      followers: followers.map(mapRow),
      friends: friends.map(mapRow),
    };
  });

export const unlockPost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((postId: number) => postId)
  .handler(async ({ context, data: postId }) => {
    const sql = await getSql();
    const me = await loadProfile(sql, context.userId);
    if (!me?.verifiedAt) throw new Error("Handshake required to unseal adult content.");
    const posts = await sql<{
      id: number;
      user_id: string;
      price_credits: number;
      rating: string;
    }>`select id, user_id, price_credits, rating from forum_posts where id = ${postId} limit 1`;
    const post = posts[0];
    if (!post || post.rating !== "adult") throw new Error("Not an adult post");
    const fol = await sql<{ n: number }>`
      select count(*)::int as n from follows
      where follower_id = ${context.userId} and followee_id = ${post.user_id}
    `;
    if ((fol[0]?.n ?? 0) < 1) throw new Error("Follow this Viewer first.");
    const price = Number(post.price_credits);
    if (price > 0) {
      if (me.credits < price) throw new Error("Need more TRV. Convert in Billing.");
      const seller = await loadProfile(sql, post.user_id);
      const fee = Math.round(price * effectiveFeeRate(seller?.planId || "initiate", seller?.tier || "initiate", Boolean(seller?.citizenAt)));
      await sql`update viewer_profiles set credits = credits - ${price} where user_id = ${context.userId}`;
      await sql`update viewer_profiles set credits = credits + ${price - fee} where user_id = ${post.user_id}`;
    }
    await sql`
      insert into content_unlocks (user_id, post_id, credits_paid)
      values (${context.userId}, ${postId}, ${price})
      on conflict do nothing
    `;
    return { ok: true as const };
  });

export const setWatchPresence = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { public?: boolean; radiusOptIn?: boolean; lat?: number | null; lng?: number | null }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const lat = data.lat == null ? null : coarsen(data.lat);
    const lng = data.lng == null ? null : coarsen(data.lng);
    if (data.public !== undefined) {
      await sql`update viewer_profiles set is_public = ${Boolean(data.public)} where user_id = ${context.userId}`;
    }
    if (data.radiusOptIn !== undefined) {
      await sql`update viewer_profiles set radius_opt_in = ${Boolean(data.radiusOptIn)} where user_id = ${context.userId}`;
    }
    if (lat != null && lng != null) {
      await sql`update viewer_profiles set lat = ${lat}, lng = ${lng} where user_id = ${context.userId}`;
    }
    return loadProfile(sql, context.userId);
  });

export const listNearby = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const me = await sql<{ lat: number | null; lng: number | null; radius_opt_in: boolean; is_public: boolean }>`
      select lat, lng, radius_opt_in, is_public from viewer_profiles where user_id = ${context.userId} limit 1
    `;
    const row = me[0];
    if (!row?.radius_opt_in || row.lat == null || row.lng == null) {
      return { ready: false as const, nodes: [] as { handle: string; displayName: string; miles: number }[] };
    }
    const others = await sql<{ handle: string; display_name: string; lat: number; lng: number }>`
      select handle, display_name, lat, lng
      from viewer_profiles
      where radius_opt_in = true and is_public = true
        and lat is not null and lng is not null
        and user_id <> ${context.userId}
      limit 200
    `;
    const nodes = others
      .map((o) => ({
        handle: o.handle,
        displayName: o.display_name,
        miles: Math.round(milesBetween(row.lat as number, row.lng as number, o.lat, o.lng)),
      }))
      .filter((n) => n.miles <= WATCH_MILES)
      .sort((a, b) => a.miles - b.miles)
      .slice(0, 40);
    return { ready: true as const, nodes };
  });

export const buyShopItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((itemId: string) => itemId.slice(0, 40))
  .handler(async ({ context, data: itemId }) => {
    const item = shopById(itemId);
    if (!item) throw new Error("Unknown shop item");
    const sql = await getSql();
    const me = await loadProfile(sql, context.userId);
    if (!me) throw new Error("Profile missing");
    const owned = await sql<{ n: number }>`
      select count(*)::int as n from shop_purchases where user_id = ${context.userId} and item_id = ${itemId}
    `;
    if ((owned[0]?.n ?? 0) > 0) throw new Error("Already owned");
    const price = shopPrice(item.price, Boolean(me.citizenAt));
    if (me.credits < price) throw new Error("Need more TRV. Convert FDIC-backed funds in Billing.");
    await sql`update viewer_profiles set credits = credits - ${price} where user_id = ${context.userId}`;
    await sql`
      insert into shop_purchases (user_id, item_id, credits_paid)
      values (${context.userId}, ${item.id}, ${price})
    `;
    if (item.slot === "frame") {
      await sql`update viewer_profiles set shop_frame = ${item.id} where user_id = ${context.userId}`;
    } else if (item.slot === "title") {
      await sql`update viewer_profiles set shop_title = ${item.id} where user_id = ${context.userId}`;
    } else {
      await sql`update viewer_profiles set shop_chrome = ${item.id} where user_id = ${context.userId}`;
    }
    return loadProfile(sql, context.userId);
  });

export const equipShopItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((itemId: string) => itemId.slice(0, 40))
  .handler(async ({ context, data: itemId }) => {
    const item = shopById(itemId);
    if (!item) throw new Error("Unknown item");
    const sql = await getSql();
    const owned = await sql<{ n: number }>`
      select count(*)::int as n from shop_purchases where user_id = ${context.userId} and item_id = ${itemId}
    `;
    if ((owned[0]?.n ?? 0) < 1) throw new Error("Buy it in the native shop first");
    if (item.slot === "frame") {
      await sql`update viewer_profiles set shop_frame = ${item.id} where user_id = ${context.userId}`;
    } else if (item.slot === "title") {
      await sql`update viewer_profiles set shop_title = ${item.id} where user_id = ${context.userId}`;
    } else {
      await sql`update viewer_profiles set shop_chrome = ${item.id} where user_id = ${context.userId}`;
    }
    return loadProfile(sql, context.userId);
  });

export const listMyShop = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ item_id: string }>`
      select item_id from shop_purchases where user_id = ${context.userId}
    `;
    const owned = new Set(rows.map((r) => r.item_id));
    const me = await loadProfile(sql, context.userId);
    const citizen = Boolean(me?.citizenAt);
    return SHOP_ITEMS.map((i) => ({ ...i, owned: owned.has(i.id), price: shopPrice(i.price, citizen), listPrice: i.price }));
  });

export const startLive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title: string; kind: string; rating: string; minutes: number; priceCredits: number }) => ({
    title: input.title.trim().slice(0, 80) || "Live",
    kind: ["camera", "mic", "both"].includes(input.kind) ? input.kind : "camera",
    rating: ["standard", "adult", "cannabis", "civic"].includes(input.rating) ? input.rating : "standard",
    minutes: Math.max(1, Math.min(720, Math.round(input.minutes))),
    priceCredits: Math.max(0, Math.min(50_000, Math.round(input.priceCredits))),
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const me = await loadProfile(sql, context.userId);
    if (data.priceCredits > 0 && !me?.verifiedAt) throw new Error("Verify before monetizing a live.");
    if (data.priceCredits > 0 && !me?.citizenAt) throw new Error("US Citizen lock required to monetize.");
    await sql`update live_sessions set active = false where user_id = ${context.userId} and active = true`;
    const ends = new Date(Date.now() + data.minutes * 60_000).toISOString();
    const rows = await sql<{ id: number }>`
      insert into live_sessions (user_id, title, kind, rating, price_credits, duration_min, ends_at)
      values (${context.userId}, ${data.title}, ${data.kind}, ${data.rating}, ${data.priceCredits}, ${data.minutes}, ${ends})
      returning id
    `;
    return { id: Number(rows[0]?.id) };
  });

export const pulseLive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; frame: string }) => ({
    id: input.id,
    frame: input.frame.slice(0, 180_000),
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      update live_sessions
      set last_frame = ${data.frame}
      where id = ${data.id} and user_id = ${context.userId} and active = true and ends_at > now()
    `;
    return { ok: true as const };
  });

export const stopLive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: number) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`
      update live_sessions set active = false where id = ${id} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const listLive = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`update live_sessions set active = false where active = true and ends_at < now()`;
    const me = await loadProfile(sql, context.userId);
    const follows = await sql<{ followee_id: string }>`
      select followee_id from follows where follower_id = ${context.userId}
    `;
    const following = new Set(follows.map((f) => f.followee_id));
    const unlocks = await sql<{ live_id: number }>`
      select live_id from live_unlocks where user_id = ${context.userId}
    `;
    const unlocked = new Set(unlocks.map((u) => Number(u.live_id)));
    const rows = await sql<{
      id: number;
      user_id: string;
      handle: string;
      display_name: string;
      title: string;
      kind: string;
      rating: string;
      price_credits: number;
      ends_at: string;
      last_frame: string | null;
    }>`
      select l.id, l.user_id, p.handle, p.display_name, l.title, l.kind, l.rating, l.price_credits, l.ends_at, l.last_frame
      from live_sessions l
      join viewer_profiles p on p.user_id = l.user_id
      where l.active = true
      order by l.id desc
      limit 30
    `;
    const verified = Boolean(me?.verifiedAt);
    return rows.map((r) => {
      const own = r.user_id === context.userId;
      const adult = r.rating === "adult";
      const paid = Number(r.price_credits) <= 0 || unlocked.has(Number(r.id));
      const sealed = adult && !own && (!verified || !following.has(r.user_id) || !paid);
      return {
        id: Number(r.id),
        handle: r.handle,
        displayName: r.display_name,
        title: r.title,
        kind: r.kind,
        rating: r.rating,
        priceCredits: Number(r.price_credits),
        endsAt: r.ends_at,
        frame: sealed ? null : r.last_frame,
        sealed,
        own,
      };
    });
  });

export const unlockLive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: number) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const me = await loadProfile(sql, context.userId);
    if (!me?.verifiedAt) throw new Error("Handshake required.");
    const lives = await sql<{ user_id: string; price_credits: number; rating: string }>`
      select user_id, price_credits, rating from live_sessions where id = ${id} limit 1
    `;
    const live = lives[0];
    if (!live) throw new Error("Live gone");
    const fol = await sql<{ n: number }>`
      select count(*)::int as n from follows
      where follower_id = ${context.userId} and followee_id = ${live.user_id}
    `;
    if ((fol[0]?.n ?? 0) < 1) throw new Error("Follow this Viewer first.");
    const price = Number(live.price_credits);
    if (price > 0) {
      if (me.credits < price) throw new Error("Need more TRV.");
      const seller = await loadProfile(sql, live.user_id);
      const fee = Math.round(price * effectiveFeeRate(seller?.planId || "initiate", seller?.tier || "initiate", Boolean(seller?.citizenAt)));
      await sql`update viewer_profiles set credits = credits - ${price} where user_id = ${context.userId}`;
      await sql`update viewer_profiles set credits = credits + ${price - fee} where user_id = ${live.user_id}`;
    }
    await sql`
      insert into live_unlocks (user_id, live_id, credits_paid)
      values (${context.userId}, ${id}, ${price})
      on conflict do nothing
    `;
    return { ok: true as const };
  });

export const listInbox = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      body: string;
      created_at: string;
      handle: string;
      from_id: string;
    }>`
      select m.id, m.body, m.created_at, p.handle, m.from_id
      from messages m
      join viewer_profiles p on p.user_id = m.from_id
      where m.to_id = ${context.userId} and m.kind = 'text'
      order by m.id desc
      limit 16
    `;
    return rows.map((r) => ({
      id: Number(r.id),
      body: r.body.slice(0, 280),
      createdAt: r.created_at,
      handle: r.handle,
      inbound: r.from_id !== context.userId,
    }));
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { handle: string; body: string; kind?: string }) => ({
    handle: input.handle.trim().slice(0, 24).toLowerCase(),
    body: input.body.slice(0, 4000),
    kind: input.kind === "rtc" ? "rtc" : "text",
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const dest = await sql<{ user_id: string }>`
      select user_id from viewer_profiles where handle = ${data.handle} limit 1
    `;
    if (!dest[0]) throw new Error("Viewer not found");
    await requireMutualVerified(sql, context.userId, dest[0].user_id);
    if (!data.body) throw new Error("Empty");
    await sql`
      insert into messages (from_id, to_id, kind, body)
      values (${context.userId}, ${dest[0].user_id}, ${data.kind}, ${data.body})
    `;
    return { ok: true as const };
  });

export const listThread = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((handle: string) => handle.trim().slice(0, 24).toLowerCase())
  .handler(async ({ context, data: handle }) => {
    const sql = await getSql();
    const dest = await sql<{ user_id: string }>`
      select user_id from viewer_profiles where handle = ${handle} limit 1
    `;
    if (!dest[0]) return [];
    await requireMutualVerified(sql, context.userId, dest[0].user_id);
    const rows = await sql<{ id: number; from_id: string; kind: string; body: string; created_at: string }>`
      select id, from_id, kind, body, created_at from messages
      where (from_id = ${context.userId} and to_id = ${dest[0].user_id})
         or (from_id = ${dest[0].user_id} and to_id = ${context.userId})
      order by id desc
      limit 80
    `;
    return rows
      .reverse()
      .filter((r) => r.kind === "text")
      .map((r) => ({
        id: Number(r.id),
        mine: r.from_id === context.userId,
        body: r.body,
        createdAt: r.created_at,
      }));
  });

export const listRtc = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((handle: string) => handle.trim().slice(0, 24).toLowerCase())
  .handler(async ({ context, data: handle }) => {
    const sql = await getSql();
    const dest = await sql<{ user_id: string }>`
      select user_id from viewer_profiles where handle = ${handle} limit 1
    `;
    if (!dest[0]) return [];
    const rows = await sql<{ id: number; body: string }>`
      select id, body from messages
      where kind = 'rtc' and from_id = ${dest[0].user_id} and to_id = ${context.userId}
      order by id asc
      limit 40
    `;
    if (rows.length) {
      for (const r of rows) {
        await sql`delete from messages where id = ${Number(r.id)}`;
      }
    }
    return rows.map((r) => r.body);
  });
