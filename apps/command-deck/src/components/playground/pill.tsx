import { useEffect, useState } from "react";
import { Eye, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOTTO } from "@/lib/trv";
import {
  FACTS,
  PILL_TAG,
  currentFact,
  speakFact,
  usePill,
  viewingLens,
  type Pill,
} from "@/lib/pill";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

const X_PROVIDER = GROK_PROVIDERS.find((p) => p.idp === "twitter");

function signInWithX() {
  if (!authEnabled || !X_PROVIDER) return;
  void signIn(X_PROVIDER.providerId, { callbackURL: "/" });
}

function GatewayEye() {
  return (
    <div className="gateway-eye" data-gateway-eye="1" aria-hidden="true">
      <div className="gateway-eye-well">
        <div className="gateway-eye-iris">
          <span className="gateway-eye-paper" />
          <span className="gateway-eye-paper gateway-eye-paper-2" />
          <span className="gateway-eye-pupil" />
        </div>
        <div className="gateway-eye-lid gateway-eye-lid-top" />
        <div className="gateway-eye-lid gateway-eye-lid-bottom" />
      </div>
    </div>
  );
}

export function useHydratePill() {
  useEffect(() => {
    usePill.getState().hydrate();
  }, []);
}

export function PillGate() {
  const ready = usePill((s) => s.ready);
  const lens = usePill((s) => s.lens);
  const factId = usePill((s) => s.factId);
  const choose = usePill((s) => s.choose);
  const setFact = usePill((s) => s.setFact);
  const [preview, setPreview] = useState<Pill | null>(null);
  const fact = currentFact(factId);
  const shown = preview;

  if (!ready) {
    return <div className="pointer-events-auto absolute inset-0 z-50 bg-background" aria-hidden />;
  }
  if (lens) return null;

  return (
    <div
      role="dialog"
      aria-label="Choose red or blue lens"
      data-pill-gate="1"
      className="pointer-events-auto absolute inset-0 z-50 overflow-y-auto bg-background/95 px-4 py-8 text-foreground"
    >
      <div className="mx-auto w-full max-w-lg">
        <GatewayEye />
        <p className="mt-4 text-xs font-medium tracking-[0.22em] text-sage uppercase">{MOTTO}</p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">Choose your lens</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Same facts. Two deliveries. Red is the raw wire. Blue is the briefing. Glimpse the other side before you
          sign in.
        </p>

        <p className="mt-5 text-xs tracking-wide text-muted uppercase">The fact</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{fact.fact}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {FACTS.map((f) => (
            <Button
              key={f.id}
              size="sm"
              variant={f.id === factId ? "selected" : "ghost"}
              aria-pressed={f.id === factId}
              onClick={() => setFact(f.id)}
            >
              {f.id}
            </Button>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className={cn("pill-red min-h-28 rounded-xl p-4 text-left shadow-[var(--shadow-border)]")}
            aria-label="Take the red lens"
            data-pill-choose="red"
            onClick={() => choose("red")}
          >
            <p className="text-xs font-medium tracking-[0.18em] uppercase">Red pill</p>
            <p className="font-display mt-2 text-xl">Raw wire</p>
            <p className="mt-2 text-sm leading-relaxed">{speakFact(fact, "red")}</p>
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
            <p className="mt-2 text-sm leading-relaxed">{speakFact(fact, "blue")}</p>
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
          <p className="text-xs tracking-wide text-muted uppercase">Glimpse</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {shown ? speakFact(fact, shown) : "Tap a pill to preview. Both sides speak the same fact."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant={preview === "red" ? "selected" : "ghost"}
              aria-label="Glimpse the red lens"
              onClick={() => setPreview(preview === "red" ? null : "red")}
            >
              <Eye className="size-4" strokeWidth={1.75} />
              Glimpse red
            </Button>
            <Button
              variant={preview === "blue" ? "selected" : "ghost"}
              aria-label="Glimpse the blue lens"
              onClick={() => setPreview(preview === "blue" ? null : "blue")}
            >
              <Eye className="size-4" strokeWidth={1.75} />
              Glimpse blue
            </Button>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          Neither lens invents. Sign-in waits until you choose. In God We Trust.
        </p>
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
