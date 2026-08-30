import { useEffect, useState } from "react";
import { ExternalLink, ListOrdered, LogIn, Share2, Store, Users, X as Close } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { usePill } from "@/lib/pill";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useIdentity } from "@/lib/identity";
import { claimProfile, listRoster, type SocialRow } from "@/lib/social";
import {
  IDENTITY_TAG,
  MOTTO,
  ORIGIN_DF,
  ORIGIN_GITHUB,
  ORIGIN_X,
  ORIGIN_X_HANDLE,
  sharePulseHref,
} from "@/lib/trv";
import { rowsFor, useLiveLead } from "@/lib/live";
import { usePulse } from "@/lib/pulse";
import { useHub } from "@/lib/hub-sync";

const X_PROVIDER = GROK_PROVIDERS.find((p) => p.idp === "twitter");

function signInWithX() {
  if (!usePill.getState().lens) return;
  if (!authEnabled || !X_PROVIDER) return;
  void signIn(X_PROVIDER.providerId, { callbackURL: "/" });
}

export function useClaimSocial() {
  const { user, isPending } = useCurrentUserState();
  const pubkey = useIdentity((s) => s.pubkey);
  useEffect(() => {
    if (isPending || !user || user.isDevFallback || !pubkey) return;
    void claimProfile({
      data: {
        pubkey,
        handle: user.displayName ?? "Viewer",
        avatar: user.profileImageUrl,
      },
    }).catch(() => undefined);
  }, [isPending, user, pubkey]);
}

export function SocialDock({
  panel,
  onFriends,
  onBoard,
  onYou,
}: {
  panel: "friends" | "board" | "shop" | string | null;
  onFriends: () => void;
  onBoard: () => void;
  onYou: () => void;
}) {
  const { user, isPending } = useCurrentUserState();
  const score = usePulse((s) => s.score);
  const share = sharePulseHref(score);
  const name = user?.displayName?.split(" ")[0] ?? "You";

  return (
    <nav
      aria-label="Sign in and social"
      data-social-dock="1"
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1 shadow-[var(--shadow-border)]"
    >
      <div className="grid grid-cols-4 gap-1">
        {isPending ? (
          <div className="h-11 rounded-md bg-foreground/12" aria-hidden />
        ) : user ? (
          <Button
            variant={panel === "vault" ? "selected" : "ghost"}
            aria-label={`${name}. Open vault.`}
            onClick={onYou}
            className="flex h-12 flex-col gap-0.5 px-1 text-xs tracking-wide uppercase"
          >
            {user.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" className="size-5 rounded-full object-cover" />
            ) : (
              <LogIn className="size-4" strokeWidth={1.75} />
            )}
            <span className="max-w-full truncate">{name}</span>
          </Button>
        ) : (
          <Button
            variant="primary"
            aria-label="Sign in with X"
            onClick={signInWithX}
            className="flex h-12 flex-col gap-0.5 px-1 text-xs tracking-wide uppercase"
            data-auth="signin"
          >
            <LogIn className="size-4" strokeWidth={1.75} />
            Sign in
          </Button>
        )}
        <Button
          variant={panel === "friends" ? "selected" : "ghost"}
          aria-label="Open friends and social"
          aria-pressed={panel === "friends"}
          onClick={onFriends}
          className="flex h-12 flex-col gap-0.5 px-1 text-xs tracking-wide uppercase"
          data-social-chip="friends"
        >
          <Users className="size-4" strokeWidth={1.75} />
          Friends
        </Button>
        <Button
          variant={panel === "board" ? "selected" : "ghost"}
          aria-label="Open mesh board"
          aria-pressed={panel === "board"}
          onClick={onBoard}
          className="flex h-12 flex-col gap-0.5 px-1 text-xs tracking-wide uppercase"
        >
          <ListOrdered className="size-4" strokeWidth={1.75} />
          Board
        </Button>
        <a
          href={share}
          target="_blank"
          rel="noreferrer"
          aria-label="Share this pulse on X"
          className="inline-flex h-12 flex-col items-center justify-center gap-0.5 rounded-md px-1 text-xs tracking-wide text-foreground uppercase shadow-[var(--shadow-border)] hover:bg-card-2"
          data-social-chip="share"
        >
          <Share2 className="size-4" strokeWidth={1.75} />
          Share
        </a>
      </div>
    </nav>
  );
}

export function GuestGate({ onPlay }: { onPlay: () => void }) {
  const { user, isPending } = useCurrentUserState();
  const [hide, setHide] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem("trv.gate") === "1") setHide(true);
    } catch {
      /* storage blocked */
    }
  }, []);

  if (isPending || user || hide) return null;

  return (
    <div
      role="dialog"
      aria-label="Sign in with X"
      data-social="gate"
      className="pointer-events-auto absolute right-3 bottom-48 left-3 z-20 max-w-md rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:right-auto sm:bottom-40 sm:left-5"
    >
      <p className="text-xs font-medium tracking-[0.22em] text-sage uppercase">{MOTTO}</p>
      <p className="font-display mt-1 text-xl text-foreground">Sign in with X</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Compete with friends on local, national, and globe boards. Your Viewer key stays on this device. No Google
        identity.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <Button variant="primary" aria-label="Sign in with X" onClick={signInWithX} className="w-full">
          <LogIn className="size-4" strokeWidth={1.75} />
          Sign in with X
        </Button>
        <Button
          variant="ghost"
          aria-label="Play as Viewer key without signing in"
          onClick={() => {
            try {
              window.localStorage.setItem("trv.gate", "1");
            } catch {
              /* storage blocked */
            }
            setHide(true);
            onPlay();
          }}
        >
          Play as Viewer key
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <OriginChip href={ORIGIN_X} label={ORIGIN_X_HANDLE} />
        <OriginChip href={ORIGIN_GITHUB} label="GitHub" />
        <OriginChip href={ORIGIN_DF} label="Defense Front" />
      </div>
    </div>
  );
}

function OriginChip({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-11 items-center gap-1 rounded-md px-3 text-sm text-foreground shadow-[var(--shadow-border)] hover:bg-card-2"
    >
      <ExternalLink className="size-3.5" strokeWidth={1.75} />
      {label}
    </a>
  );
}

export function FriendsPanel({
  onClose,
  onPair,
  onBoard,
  onShop,
}: {
  onClose: () => void;
  onPair: () => void;
  onBoard: () => void;
  onShop: () => void;
}) {
  const { user, isPending } = useCurrentUserState();
  const score = usePulse((s) => s.score);
  const live = useHub((s) => s.live);
  const pubkey = useIdentity((s) => s.pubkey);
  const pulseLive = useLiveLead((s) => rowsFor(s));
  const share = sharePulseHref(score);
  const [roster, setRoster] = useState<SocialRow[]>([]);

  useEffect(() => {
    void listRoster()
      .then((rows) => setRoster(rows ?? []))
      .catch(() => setRoster([]));
  }, [user?.id]);

  return (
    <div
      role="dialog"
      aria-label="Friends and social"
      className="pointer-events-auto absolute top-28 right-3 left-3 z-40 max-h-[min(36rem,62dvh)] overflow-y-auto rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:left-auto sm:w-96"
      data-social="friends"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-sage" strokeWidth={1.75} />
          <div>
            <p className="text-xs font-medium tracking-widest text-muted uppercase">Friends</p>
            <p className="mt-1 font-display text-lg text-foreground">Live mesh</p>
            <p className="mt-1 text-xs font-medium tracking-[0.18em] text-sage uppercase">{MOTTO}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="Close friends" onClick={onClose} className="size-11">
          <Close className="size-4" strokeWidth={1.75} />
        </Button>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted">{IDENTITY_TAG}</p>

      {isPending ? (
        <div className="mt-3 h-11 rounded-md bg-foreground/12" aria-hidden />
      ) : user ? (
        <div className="mt-3 flex items-center gap-3 rounded-lg bg-card-2 p-3">
          {user.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="" className="size-10 rounded-full object-cover" />
          ) : (
            <span className="grid size-10 place-items-center rounded-full bg-foreground/12 font-display text-lg">
              {(user.displayName ?? "V").slice(0, 1)}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm text-foreground">{user.displayName ?? "Viewer"}</p>
            <p className="font-mono text-xs text-sage tabular-nums">
              signed in · {live} hub live · pulse {score}
            </p>
          </div>
        </div>
      ) : (
        <Button variant="primary" className="mt-3 w-full" aria-label="Sign in with X" onClick={signInWithX}>
          <LogIn className="size-4" strokeWidth={1.75} />
          Sign in with X
        </Button>
      )}

      <section className="mt-4" aria-label="People on the mesh">
        <p className="text-xs tracking-wide text-muted uppercase">On the mesh</p>
        {roster.length === 0 ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">
            No X identities posted yet. Sign in and you land first.
          </p>
        ) : (
          <ul className="mt-2 space-y-1">
            {roster.map((row) => {
              const you = row.pubkey === pubkey;
              return (
                <li
                  key={`${row.pubkey}-${row.handle}`}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2 py-2",
                    you ? "bg-card-2" : undefined,
                  )}
                >
                  {row.avatar ? (
                    <img src={row.avatar} alt="" className="size-8 rounded-full object-cover" />
                  ) : (
                    <span className="grid size-8 place-items-center rounded-full bg-foreground/12 text-xs">
                      {row.handle.slice(0, 1)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      {row.handle}
                      {you ? " · you" : ""}
                    </p>
                    <p className="font-mono text-xs text-subtle">{row.short}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-4" aria-label="This pulse">
        <p className="text-xs tracking-wide text-muted uppercase">This pulse</p>
        {pulseLive.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Board is empty. Seize, then compete.</p>
        ) : (
          <ol className="mt-2 space-y-1">
            {pulseLive.slice(0, 8).map((row) => (
              <li key={row.pubkey} className="flex items-baseline justify-between gap-2 font-mono text-xs tabular-nums">
                <span className="text-muted">#{row.place}</span>
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {row.pubkey === pubkey ? "you" : row.short}
                </span>
                <span className="text-sage">{row.pulseScore}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="mt-4 flex flex-col gap-2">
        <Button variant="primary" onClick={onBoard} aria-label="Open mesh board to compete">
          Compete on Mesh Board
        </Button>
        <Button variant="solid" onClick={onPair} aria-label="Pair a friend device with a PIN">
          Pair a friend · PIN
        </Button>
        <a
          href={share}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-card-2 px-3 text-sm text-foreground shadow-[var(--shadow-border)] hover:bg-card"
        >
          <Share2 className="size-4" strokeWidth={1.75} />
          Share this pulse on X
        </a>
        <a
          href={ORIGIN_X}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md px-3 text-sm text-foreground shadow-[var(--shadow-border)] hover:bg-card-2"
        >
          <ExternalLink className="size-4" strokeWidth={1.75} />
          Follow {ORIGIN_X_HANDLE}
        </a>
        <Button variant="ghost" onClick={onShop} aria-label="Open shop">
          <Store className="size-4" strokeWidth={1.75} />
          Shop · GitHub · Defense Front
        </Button>
      </div>
    </div>
  );
}

export function ShopPanel({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-label="TRV shop"
      className="pointer-events-auto absolute top-28 right-3 left-3 z-40 max-h-[min(36rem,62dvh)] overflow-y-auto rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:left-auto sm:w-96"
      data-social="shop"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Store className="size-4 text-sage" strokeWidth={1.75} />
          <div>
            <p className="text-xs font-medium tracking-widest text-muted uppercase">Shop</p>
            <p className="mt-1 font-display text-lg text-foreground">Origins</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="Close shop" onClick={onClose} className="size-11">
          <Close className="size-4" strokeWidth={1.75} />
        </Button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Stripe is a rail, not an identity. Sign in is X. GitHub and Defense Front are origins, not logins.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <a
          href={ORIGIN_X}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm text-primary-foreground shadow-[var(--shadow-border)]"
        >
          X {ORIGIN_X_HANDLE}
        </a>
        <a
          href={ORIGIN_GITHUB}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-card-2 px-3 text-sm text-foreground shadow-[var(--shadow-border)] hover:bg-card"
        >
          GitHub source
        </a>
        <a
          href={ORIGIN_DF}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-card-2 px-3 text-sm text-foreground shadow-[var(--shadow-border)] hover:bg-card"
        >
          Defense Front
        </a>
      </div>
    </div>
  );
}
