import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Brain, Bug, Clock, Gift, Globe, Shield } from "lucide-react";
import { claimWatch, setHoneypot, tickHoneypot } from "@/lib/trv/server";
import { pingWatch } from "@/lib/trv/watch-events";
import { useViewer } from "./viewer-context";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

function formatLeft(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h <= 0) return `${m}m UTC`;
  return `${h}h ${m}m UTC`;
}

export function WatchClaim({ layout = "full" }: { layout?: "full" | "compact" }) {
  const { profile, setProfile, watch, refreshWatch } = useViewer();
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState(watch?.secondsLeft ?? 0);

  useEffect(() => {
    if (!watch) return;
    const base = watch.secondsLeft;
    const start = Date.now();
    setLeft(base);
    const id = window.setInterval(() => {
      setLeft(Math.max(0, base - Math.floor((Date.now() - start) / 1000)));
    }, 1000);
    return () => window.clearInterval(id);
  }, [watch?.day, watch?.secondsLeft]);

  async function intercept() {
    setBusy(true);
    try {
      if (!profile?.honeypotArmed) {
        const armed = await setHoneypot({ data: true });
        if (armed) setProfile(armed);
      }
      const r = await tickHoneypot();
      if (!r.ok) throw new Error(r.error || "Intercept failed");
      pingWatch();
      await refreshWatch();
      toast.success("Intercept landed · claim the watch");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Intercept failed");
    } finally {
      setBusy(false);
    }
  }

  async function claim() {
    setBusy(true);
    try {
      const p = await claimWatch();
      if (p) setProfile(p);
      await refreshWatch();
      toast.success(`Watch claimed · ${watch?.nextCredits ?? 0} TRV`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Watch failed");
    } finally {
      setBusy(false);
    }
  }

  if (!watch) return null;

  const streak = profile?.watchStreak ?? watch.streak;
  const badge = watch.claimed
    ? { variant: "native" as const, label: "Watch complete" }
    : watch.defended
      ? { variant: "native" as const, label: "Ready to claim" }
      : { variant: "warn" as const, label: "Duty open" };

  if (layout === "compact") {
    return (
      <Card className={watch.claimed ? "border-border" : "border-warn/40"}>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Shield className="size-4 text-accent" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-fg">
              {watch.claimed
                ? "The Sentinel is manned today."
                : watch.defended
                  ? `Claim ${watch.nextCredits} TRV for keeping the system safe.`
                  : "Land one intercept, then claim daily TRV."}
            </p>
            <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
              streak {streak} · {formatLeft(left)} · {watch.intercepts} intercept{watch.intercepts === 1 ? "" : "s"}
            </p>
          </div>
          <Badge variant={badge.variant}>{badge.label}</Badge>
          {watch.claimed ? (
            <Button asChild size="sm" variant="secondary">
              <Link to="/hub/shop">
                <Gift className="size-4" /> Rewards
              </Link>
            </Button>
          ) : watch.defended ? (
            <Button size="sm" disabled={busy} onClick={() => void claim()}>
              Claim {watch.nextCredits} TRV
            </Button>
          ) : (
            <Button size="sm" disabled={busy} onClick={() => void intercept()}>
              Intercept now
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={watch.claimed ? "border-ok/30" : "border-warn/50"}>
      <CardHeader>
        <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">Daily duty · {watch.day}</p>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Shield className="size-5 text-accent" />
          Defend The Sentinel
        </CardTitle>
        <CardDescription>
          Remote Viewers must check in every UTC day. Land one intercept. Claim TRV.
          Spend it on rewards. That is how the system stays safe.
          {watch.decayDamage > 0
            ? ` Missed ${watch.missedDays} day${watch.missedDays === 1 ? "" : "s"} — Sentinel took ${watch.decayDamage} damage.`
            : " Miss a day and Sentinel takes the wound."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant={badge.variant}>{badge.label}</Badge>
          <Badge variant="muted">streak {streak}</Badge>
          <Badge variant="muted">{watch.nextCredits} TRV</Badge>
          <Badge variant="muted">
            <Clock className="size-3" /> {formatLeft(left)}
          </Badge>
          <Badge variant="muted">{watch.intercepts} intercept{watch.intercepts === 1 ? "" : "s"} today</Badge>
        </div>

        {watch.claimed ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">Watch complete. Spend TRV on node rewards.</p>
            <Button asChild>
              <Link to="/hub/shop">
                <Gift className="size-4" /> Open rewards
              </Link>
            </Button>
          </div>
        ) : watch.defended ? (
          <Button disabled={busy} onClick={() => void claim()}>
            Claim watch · {watch.nextCredits} TRV
          </Button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy} onClick={() => void intercept()}>
              <Shield className="size-4" /> Intercept now
            </Button>
            <Button asChild variant="secondary">
              <Link to="/hub/neuron">
                <Brain className="size-4" /> Neuron
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/hub/mesh">
                <Globe className="size-4" /> Mesh
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/hub/honeypot">
                <Bug className="size-4" /> Honeypot
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
