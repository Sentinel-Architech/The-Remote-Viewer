import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useViewer } from "./viewer-context";
import { completeTutorial } from "@/lib/trv/server";
import { BRIEFING_STEPS } from "@/lib/trv/briefing";
import { NETWORK_NAME } from "@/lib/trv/network";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

const STEP_KEY = "trv-briefing-step";
const SEAL_LABEL =
  "I know what each station is and where it lives. Open the hub.";

function readStep() {
  if (typeof window === "undefined") return 0;
  const n = Number(sessionStorage.getItem(STEP_KEY) || "0");
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(0, Math.floor(n)), BRIEFING_STEPS.length - 1);
}

export function ViewerBriefing() {
  const { profile, setProfile } = useViewer();
  const panelRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [acked, setAcked] = useState(false);
  const [busy, setBusy] = useState(false);

  const locked =
    Boolean(profile) && Boolean(profile?.ageOk) && Boolean(profile?.ofacOk) && !profile?.tutorialAt;

  useEffect(() => {
    if (!locked) return;
    setStep(readStep());
    setReady(true);
  }, [locked]);

  useEffect(() => {
    if (!locked || !ready) return;
    sessionStorage.setItem(STEP_KEY, String(step));
  }, [locked, ready, step]);

  useEffect(() => {
    if (!locked || !ready) return;
    const root = panelRef.current;
    if (!root) return;
    const focusables = () =>
      [...root.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled])")];
    const first = focusables()[0];
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = focusables();
      if (!nodes.length) {
        e.preventDefault();
        return;
      }
      const i = nodes.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey) {
        if (i <= 0) {
          e.preventDefault();
          nodes[nodes.length - 1]?.focus();
        }
      } else if (i === nodes.length - 1 || i === -1) {
        e.preventDefault();
        nodes[0]?.focus();
      }
    };
    window.addEventListener("keydown", onKey, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
    };
  }, [locked, ready, step, acked]);

  if (!locked || !ready) return null;

  const total = BRIEFING_STEPS.length;
  const current = BRIEFING_STEPS[step]!;
  const last = Boolean(current.seal);
  const Icon = current.icon;
  const pct = Math.round(((step + 1) / total) * 100);

  async function seal() {
    if (!acked || busy) return;
    setBusy(true);
    try {
      const p = await completeTutorial();
      if (p) setProfile(p);
      sessionStorage.removeItem(STEP_KEY);
      toast.success("Briefing sealed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Seal failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      id="viewer-briefing"
      data-briefing="true"
      data-briefing-step={step}
      role="dialog"
      aria-modal="true"
      aria-labelledby="briefing-title"
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-bg p-3 sm:items-center sm:p-6"
    >
      <div
        ref={panelRef}
        className="my-2 w-full max-w-lg rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-lg sm:p-6"
      >
        <div key={step} className="trv-brief-enter">
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">{NETWORK_NAME}</p>
          <p className="mt-1 font-mono text-[11px] tabular-nums text-accent">
            {current.kicker} · {String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
          <div className="mt-4 flex items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-border bg-elevated">
              <Icon className="size-5 text-accent" />
            </div>
            <div className="min-w-0">
              <h1 id="briefing-title" className="font-display text-2xl leading-tight sm:text-3xl">
                {current.title}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">{current.where}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-fg">{current.body}</p>
          {current.stops?.length ? (
            <ul className="mt-4 space-y-2.5">
              {current.stops.map((stop) => {
                const StopIcon = stop.icon;
                return (
                  <li key={stop.label} className="flex gap-3">
                    <StopIcon className="mt-0.5 size-4 shrink-0 text-accent" />
                    <div className="min-w-0">
                      <p className="text-sm">{stop.label}</p>
                      <p className="text-xs text-muted-foreground">{stop.line}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
          {last ? (
            <label className="mt-5 flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4 shrink-0"
                checked={acked}
                onChange={(e) => setAcked(e.target.checked)}
              />
              <span>{SEAL_LABEL}</span>
            </label>
          ) : null}
        </div>

        <div className="mt-6">
          <Progress value={pct} />
          <p className="mt-2 font-mono text-[11px] tabular-nums text-muted-foreground">
            {step + 1} of {total} · cannot skip
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          {step > 0 ? (
            <Button
              type="button"
              variant="secondary"
              className="min-w-20"
              onClick={() => {
                setAcked(false);
                setStep((s) => Math.max(0, s - 1));
              }}
            >
              Back
            </Button>
          ) : null}
          {last ? (
            <Button type="button" className="flex-1" disabled={!acked || busy} onClick={() => void seal()}>
              Seal briefing
            </Button>
          ) : (
            <Button type="button" className="flex-1" onClick={() => setStep((s) => Math.min(total - 1, s + 1))}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
