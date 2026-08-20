import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { WatchClaim } from "@/components/watch-claim";
import { useViewer } from "@/components/viewer-context";
import { pingWatch } from "@/lib/trv/watch-events";
import { LURES } from "@/lib/trv/honeypot";
import { listHoneypot, setHoneypot, tickHoneypot } from "@/lib/trv/server";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/hub/honeypot")({ component: HoneypotPage });

function HoneypotPage() {
  const { profile, setProfile, reload } = useViewer();
  const [events, setEvents] = useState<Awaited<ReturnType<typeof listHoneypot>>>([]);

  async function loadEvents() {
    setEvents(await listHoneypot());
    await reload();
  }

  useEffect(() => {
    void loadEvents().catch(() => {});
  }, []);

  useEffect(() => {
    if (!profile?.honeypotArmed) return;
    const id = window.setInterval(() => {
      void tickHoneypot()
        .then((r) => {
          if (r.ok) {
            void loadEvents();
            pingWatch();
          }
        })
        .catch(() => {});
    }, 9000);
    return () => window.clearInterval(id);
  }, [profile?.honeypotArmed]);

  if (!profile) return <div className="p-8 text-sm text-muted-foreground">Binding node…</div>;

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <p className="text-[11px] tracking-[0.2em] uppercase text-accent">Honeypot</p>
        <h1 className="mt-1 font-display text-3xl">The Network is the lure</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The Remote Viewer is a consenting honeypot. Scanners hit decoy
          wallets, env files, and admin panels that never existed. Sentinel
          learns the pattern, adapts, and self-heals. You are not silent bait —
          you arm the pot. Neuron and Mesh are the drill; this is the live tarpit.
          A blocked lure counts toward daily duty.
        </p>
        <div className="mt-4">
          <WatchClaim layout="compact" />
        </div>
      </div>

      <section className="flex flex-wrap items-center gap-4 rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <label className="flex items-center gap-3 text-sm">
          <Switch
            checked={Boolean(profile.honeypotArmed)}
            onCheckedChange={async (on: boolean) => {
              const p = await setHoneypot({ data: on });
              if (p) setProfile(p);
              toast.success(on ? "Honeypot armed. Sentinel watches." : "Honeypot dark.");
            }}
          />
          {profile.honeypotArmed ? "Armed" : "Dark"}
        </label>
        <Badge variant={profile.honeypotArmed ? "native" : "muted"}>
          {profile.honeypotArmed ? "Learning" : "Idle"}
        </Badge>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[var(--radius-xl)] border border-border bg-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Health (self-heal)</p>
          <Progress className="mt-2" value={profile.sentinelHealth} />
          <p className="mt-2 font-mono text-sm tabular-nums">{profile.sentinelHealth}/100</p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-border bg-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Autonomy (adapt)</p>
          <Progress className="mt-2" value={profile.sentinelAutonomy} />
          <p className="mt-2 font-mono text-sm tabular-nums">{profile.sentinelAutonomy}%</p>
        </div>
      </div>

      <section>
        <h2 className="font-display text-xl">Decoy surfaces</h2>
        <ul className="mt-3 space-y-2">
          {LURES.map((l) => (
            <li key={l.path} className="rounded-[var(--radius-md)] border border-border bg-card px-3 py-2 font-mono text-xs">
              {l.path} · {l.bait}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          robots.txt points scanners here on purpose. 403 canaries. No real seeds.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl">Absorbed probes</h2>
        <ul className="mt-3 space-y-2">
          {events.map((e) => (
            <li key={e.id} className="rounded-[var(--radius-md)] border border-border bg-card p-3 text-sm">
              <p className="text-[11px] uppercase tracking-wide text-accent">{e.kind} · {e.outcome}</p>
              <p className="mt-1 text-muted-foreground">{e.lesson}</p>
            </li>
          ))}
          {events.length === 0 ? (
            <li className="text-sm text-muted-foreground">Arm the pot. Ambient scans and live canaries land here.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
