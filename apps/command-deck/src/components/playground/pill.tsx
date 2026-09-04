import { useEffect, useRef, useState } from "react";
import { Eye, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOTTO, NETWORK_NAME, GATEWAY_HREF, GATEWAY_TITLE, GATEWAY_YEAR } from "@/lib/trv";
import { PILL_TAG, usePill, viewingLens } from "@/lib/pill";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

const X_PROVIDER = GROK_PROVIDERS.find((p) => p.idp === "twitter");
const WIDE_MQ = "(min-width: 880px) and (min-aspect-ratio: 4/3)";

function signInWithX() {
  if (!authEnabled || !X_PROVIDER) return;
  void signIn(X_PROVIDER.providerId, { callbackURL: "/" });
}

function GatewayFilm() {
  const ref = useRef<HTMLVideoElement>(null);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(WIDE_MQ);
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (reduce.matches) {
        video.pause();
        return;
      }
      void video.play().catch(() => undefined);
    };
    sync();
    reduce.addEventListener("change", sync);
    return () => reduce.removeEventListener("change", sync);
  }, [wide]);

  const src = wide ? "/gateway/eye-wide.mp4" : "/gateway/eye.mp4";
  const poster = wide ? "/gateway/eye-wide.jpg" : "/gateway/eye.jpg";

  return (
    <video
      key={src}
      ref={ref}
      className="gateway-film"
      data-gateway-eye="1"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

export function useHydratePill() {
  useEffect(() => {
    usePill.getState().hydrate();
  }, []);
}

export function PillGate() {
  const lens = usePill((s) => s.lens);
  const choose = usePill((s) => s.choose);

  if (lens) return null;

  return (
    <div
      role="dialog"
      aria-label="Gateway. Choose red or blue lens"
      data-pill-gate="1"
      className="gateway-gate pointer-events-auto absolute inset-0 z-50 overflow-hidden text-foreground"
    >
      <GatewayFilm />
      <div className="gateway-veil" aria-hidden="true" />
      <div className="gateway-copy">
        <p className="gateway-rise text-center text-xs font-medium tracking-[0.28em] text-sage uppercase">{MOTTO}</p>
        <p className="gateway-rise mt-5 text-center text-xs tracking-[0.32em] text-muted uppercase">Remote viewing simulation</p>
        <h1 className="gateway-rise font-display mt-2 text-center text-4xl font-semibold tracking-tight sm:text-5xl">{NETWORK_NAME}</h1>
        <p className="gateway-rise font-display mt-2 text-center text-lg italic text-sage">Gateway Process</p>
        <a
          href={GATEWAY_HREF}
          target="_blank"
          rel="noreferrer"
          className="gateway-rise mt-3 block text-center text-xs leading-relaxed text-muted"
        >
          {GATEWAY_TITLE}, {GATEWAY_YEAR}. CIA FOIA.
        </a>
        <div className="gateway-rise mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className={cn("pill-red min-h-28 rounded-xl p-4 text-left shadow-[var(--shadow-border)]")}
            aria-label="Take the red lens"
            data-pill-choose="red"
            onClick={() => choose("red")}
          >
            <p className="text-xs font-medium tracking-[0.18em] uppercase">Red pill</p>
            <p className="font-display mt-2 text-xl">Raw wire</p>
            <p className="mt-2 text-sm leading-relaxed">Same facts. No frame.</p>
          </button>
          <button
            type="button"
            className={cn("pill-blue min-h-28 rounded-xl p-4 text-left shadow-[var(--shadow-border)]")}
            aria-label="Take the blue lens"
            data-pill-choose="blue"
            onClick={() => choose("blue")}
          >
            <p className="text-xs font-medium tracking-[0.18em] uppercase">Blue pill</p>
            <p className="font-display mt-2 text-xl">Briefing</p>
            <p className="mt-2 text-sm leading-relaxed">Same facts. Framed.</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export function PillChip() {
  const lens = usePill((s) => s.lens);
  const glimpse = usePill((s) => s.glimpse);
  const peek = usePill((s) => s.peek);
  const viewing = viewingLens({ lens, glimpse });
  if (!lens || !viewing) return null;
  const other = lens === "red" ? "blue" : "red";
  return (
    <div className="pointer-events-auto mt-1 flex w-fit items-center gap-1 rounded-xl bg-card p-1 shadow-[var(--shadow-border)]">
      <p
        className={cn("px-3 font-mono text-xs tracking-wide uppercase", viewing === "red" ? "text-ember" : "text-muted")}
        data-pill-chip={viewing}
      >
        {viewing} lens
        {glimpse ? " · glimpse" : ""}
      </p>
      <Button
        variant={glimpse ? "selected" : "ghost"}
        aria-label={`Glimpse the ${other} lens of the same fact`}
        onClick={() => peek()}
        data-pill-glimpse="1"
      >
        <Eye className="size-4" strokeWidth={1.75} />
        Glimpse
      </Button>
    </div>
  );
}

export function PillAfter({ onPlay }: { onPlay: () => void }) {
  const lens = usePill((s) => s.lens);
  if (!lens) return null;
  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm leading-relaxed text-muted">{PILL_TAG[lens]}</p>
      {authEnabled && X_PROVIDER ? (
        <Button variant="primary" className="w-full" onClick={signInWithX} aria-label="Sign in with X">
          <LogIn className="size-4" strokeWidth={1.75} />
          Sign in with X
        </Button>
      ) : null}
      <Button variant="ghost" className="w-full" onClick={onPlay} aria-label="Play as Viewer key">
        Play as Viewer key
      </Button>
    </div>
  );
}
