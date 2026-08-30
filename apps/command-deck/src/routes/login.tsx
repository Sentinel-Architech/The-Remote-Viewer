import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fingerprint, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import {
  DECK_NAME,
  IDENTITY_TAG,
  MOTTO,
  NETWORK_NAME,
  NETWORK_SHORT,
  ORIGIN_DF,
  ORIGIN_GITHUB,
  ORIGIN_X,
  ORIGIN_X_HANDLE,
} from "@/lib/trv";
import { PILL_TAG, usePill } from "@/lib/pill";
import { PillGate, useHydratePill } from "@/components/playground/pill";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const nav = useNavigate();
  const x = GROK_PROVIDERS.find((p) => p.idp === "twitter");
  useHydratePill();
  const ready = usePill((s) => s.ready);
  const lens = usePill((s) => s.lens);

  if (!ready || !lens) {
    return (
      <main className="relative min-h-dvh bg-background text-foreground">
        <PillGate />
      </main>
    );
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-6 py-10 text-foreground">
      <div className="w-full max-w-sm">
        <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">{NETWORK_SHORT}</p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">{NETWORK_NAME}</h1>
        <p className="mt-1 text-xs font-medium tracking-[0.18em] text-sage uppercase">{MOTTO}</p>
        <p className="mt-1 text-sm text-sage">{DECK_NAME}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{PILL_TAG[lens]}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Sign in with X. Compete with friends on local, national, and globe boards. Your Viewer key stays on this
          device.
        </p>
        <div className="mt-6 space-y-2">
          {authEnabled && x ? (
            <Button
              variant="primary"
              className="w-full"
              onClick={() => void signIn(x.providerId, { callbackURL: "/" })}
              aria-label={`Sign in with X as ${ORIGIN_X_HANDLE}`}
            >
              <LogIn className="size-4" strokeWidth={1.75} />
              Sign in with X
            </Button>
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
          <Button variant="ghost" className="w-full" onClick={() => void nav({ to: "/" })}>
            <Fingerprint className="size-4" strokeWidth={1.75} />
            Play as Viewer key
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <a
            href={ORIGIN_X}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-md px-3 text-sm text-foreground shadow-[var(--shadow-border)] hover:bg-card-2"
          >
            Follow {ORIGIN_X_HANDLE}
          </a>
          <a
            href={ORIGIN_GITHUB}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-md px-3 text-sm text-foreground shadow-[var(--shadow-border)] hover:bg-card-2"
          >
            GitHub
          </a>
          <a
            href={ORIGIN_DF}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-md px-3 text-sm text-foreground shadow-[var(--shadow-border)] hover:bg-card-2"
          >
            Defense Front
          </a>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">{IDENTITY_TAG}</p>
      </div>
    </main>
  );
}
