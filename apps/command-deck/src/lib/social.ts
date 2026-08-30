import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export type SocialRow = {
  handle: string;
  pubkey: string;
  short: string;
  avatar: string | null;
  seenAt: string;
};

function shorten(pubkey: string) {
  if (pubkey.length <= 12) return pubkey;
  return `${pubkey.slice(0, 6)}…${pubkey.slice(-4)}`;
}

function parseClaim(input: unknown) {
  const raw = (input ?? {}) as { pubkey?: string; handle?: string; avatar?: string | null };
  const pubkey = String(raw.pubkey ?? "").trim();
  if (!/^[0-9A-Za-z]{12,80}$/.test(pubkey)) throw new Error("Viewer key rejected");
  const handle =
    String(raw.handle ?? "Viewer")
      .replace(/^@/, "")
      .replace(/[^\w.\- ]/g, "")
      .trim()
      .slice(0, 32) || "Viewer";
  const avatarRaw = String(raw.avatar ?? "").trim();
  const avatar = /^https:\/\//.test(avatarRaw) && avatarRaw.length < 400 ? avatarRaw : null;
  return { pubkey, handle, avatar };
}

export const listRoster = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ handle: string; pubkey: string; avatar: string | null; seen_at: string }>`
    select handle, pubkey, avatar, seen_at
    from mesh_social
    order by seen_at desc
    limit 40
  `;
  return rows.map((r) => ({
    handle: r.handle,
    pubkey: r.pubkey,
    short: shorten(r.pubkey),
    avatar: r.avatar,
    seenAt: r.seen_at,
  })) satisfies SocialRow[];
});

export const claimProfile = createServerFn({ method: "POST" })
  .validator((input: unknown) => parseClaim(input))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into mesh_social (user_id, handle, pubkey, avatar, seen_at)
      values (${context.userId}, ${data.handle}, ${data.pubkey}, ${data.avatar}, now())
      on conflict (user_id) do update set
        handle = excluded.handle,
        pubkey = excluded.pubkey,
        avatar = excluded.avatar,
        seen_at = now()
    `;
    return { handle: data.handle, pubkey: data.pubkey };
  });
