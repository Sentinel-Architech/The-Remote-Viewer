import { useEffect, useState } from "react";
import { Download, ExternalLink, RefreshCw, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BOARD_NAME,
  BOARD_TAG,
  ORIGIN_DF,
  ORIGIN_GITHUB,
  ORIGIN_X,
  ORIGIN_X_HANDLE,
} from "@/lib/trv";
import { listBoard, postStanding, type BoardRow } from "@/lib/board";
import { assertMeshAllowed } from "@/lib/affairs";
import { useIdentity } from "@/lib/identity";
import { useInstall } from "@/lib/install";
import { broadcastPulse, regionLabel, rowsFor, useLiveLead, useSnapPressure } from "@/lib/live";
import { learnedCount, osTitle, rankFor, useProgress } from "@/lib/progress";
import { usePulse, usePulseClock, type BoardScope } from "@/lib/pulse";

function snapshot() {
  const id = useIdentity.getState();
  const p = useProgress.getState();
  return {
    pubkey: id.pubkey,
    xp: p.xp,
    seizes: p.seizes,
    healed: p.healed,
    cleared: p.cleared,
    watches: p.watches,
    learned: learnedCount(p.learned),
  };
}

export function InstallStrip() {
  const { install, standalone, canPrompt } = useInstall();
  return (
    <div className="mt-3 rounded-lg bg-card-2 p-3 shadow-[var(--shadow-border)]">
      <p className="text-xs tracking-wide text-muted uppercase">One-tap install</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        {standalone
          ? "Command Deck is on this device."
          : "One tap on phone, desktop, or laptop. Same Viewer key. Native stack A–Z. Defense Front, X, and GitHub carry the install."}
      </p>
      {standalone ? null : (
        <Button variant="solid" className="mt-3" onClick={() => void install()} aria-label="Install Command Deck on this device">
          <Download className="size-4" strokeWidth={1.75} />
          {canPrompt ? "Install app" : "Add to device"}
        </Button>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <OriginLink href={ORIGIN_DF} label="Defense Front" />
        <OriginLink href={ORIGIN_X} label={ORIGIN_X_HANDLE} />
        <OriginLink href={ORIGIN_GITHUB} label="GitHub" />
      </div>
    </div>
  );
}

function OriginLink({ href, label }: { href: string; label: string }) {
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

export function BoardDashboard({ onClose }: { onClose: () => void }) {
  const pubkey = useIdentity((s) => s.pubkey);
  const ready = useIdentity((s) => s.ready);
  const xp = useProgress((s) => s.xp);
  const seizes = useProgress((s) => s.seizes);
  const healed = useProgress((s) => s.healed);
  const cleared = useProgress((s) => s.cleared);
  const learned = useProgress((s) => s.learned);
  const pulseScore = usePulse((s) => s.score);
  const pulseSeizes = usePulse((s) => s.seizes);
  const ghost = usePulse((s) => s.ghost);
  const missed = usePulse((s) => s.missed);
  const rank = rankFor(xp);
  const osName = osTitle(learned);
  const osN = learnedCount(learned);
  const clock = usePulseClock();
  const pressure = useSnapPressure();
  const scope = useLiveLead((s) => s.scope);
  const setScope = useLiveLead((s) => s.setScope);
  const region = useLiveLead((s) => s.region);
  const live = useLiveLead((s) => rowsFor(s));
  const liveError = useLiveLead((s) => s.error);
  const [rows, setRows] = useState<BoardRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  const mine = rows.find((r) => r.pubkey === pubkey) ?? null;
  const liveMine = live.find((r) => r.pubkey === pubkey) ?? null;
  const lead = live[0];
  const youLead = Boolean(liveMine && liveMine.place === 1);
  const snap = clock.phase === "snap";
  const now = pressure.lock;
  const secs = Math.max(0, Math.ceil(clock.left / 1000));
  const snapIn = Math.max(0, Math.ceil(clock.snapIn / 1000));
  const hotIn = Math.max(0, Math.ceil(pressure.hotIn / 1000));
  const where = regionLabel(scope, region);

  async function refreshAllTime() {
    setError(null);
    try {
      setRows(await listBoard());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Board unreachable");
    }
  }

  async function post() {
    if (!ready || !pubkey || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (!assertMeshAllowed()) throw new Error("Internal Affairs holds the Mesh Board.");
      const res = await postStanding({ data: snapshot() });
      setRows(res.rows);
      setPosted(true);
      await broadcastPulse();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Post failed");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void refreshAllTime();
    const id = window.setInterval(() => void refreshAllTime(), 2000);
    return () => window.clearInterval(id);
  }, [clock.id]);

  return (
    <div
      role="dialog"
      aria-label="Mesh Board dashboard"
      data-phase={clock.phase}
      data-severity={pressure.severity}
      className={cn(
        "pointer-events-auto absolute inset-x-3 top-28 bottom-36 z-40 flex max-h-[min(42rem,74dvh)] flex-col overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)] sm:inset-auto sm:top-32 sm:right-16 sm:bottom-auto sm:h-auto sm:w-[min(36rem,calc(100%-5.5rem))] sm:max-h-[min(42rem,72dvh)]",
        now ? "pulse-snap-hot" : snap && "pulse-snap",
      )}
    >
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted uppercase">{BOARD_NAME}</p>
          <p className={cn("mt-1 font-display text-lg", now || snap ? "text-ember" : "text-foreground")}>
            {now
              ? `NOW ${secs}s`
              : snap
                ? `SNAP ${secs}s`
                : missed
                  ? "You wait"
                  : youLead
                    ? "You lead this pulse"
                    : liveMine
                      ? `Pulse place ${liveMine.place}`
                      : "Live pulse"}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {now
              ? pressure.reason === "race"
                ? `Race within ${pressure.gap}. This lock is the upgrade — seize or wait.`
                : "This lock is the upgrade. Seize now or wait for the next pulse."
              : snap
                ? `Window scoring. The lock is in ${hotIn}s, or when a rival closes within 5.`
                : missed
                  ? `Lock missed. Next SNAP in ${snapIn}s.`
                  : BOARD_TAG}
          </p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Close mesh board" onClick={onClose} className="size-11">
          <X className="size-4" strokeWidth={1.75} />
        </Button>
      </div>

      <div className="mx-4 flex w-fit items-center gap-1 rounded-xl bg-card-2 p-1 shadow-[var(--shadow-border)]" role="group" aria-label="Board scope">
        {(["local", "national", "globe"] as BoardScope[]).map((s) => (
          <Button
            key={s}
            variant={scope === s ? "selected" : "ghost"}
            aria-pressed={scope === s}
            aria-label={`${s} board`}
            onClick={() => setScope(s)}
          >
            {s === "globe" ? "Globe" : s === "national" ? "National" : "Local"}
          </Button>
        ))}
      </div>
      <p className="px-4 pt-2 font-mono text-xs text-subtle">
        {scope === "globe" ? "Globe pulse" : `${scope === "local" ? "Local" : "National"} · ${where}`}
      </p>

      <div className="mx-4 mt-3 mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="This pulse" value={String(pulseScore)} hint={now ? "NOW lock" : snap ? `Lock in ${hotIn}s` : `SNAP in ${snapIn}s`} />
        <Stat label="Pulse seizes" value={String(pulseSeizes)} hint={ghost ? `Beat ${ghost}` : "First mark"} />
        <Stat label="OS" value={`${osN}/6`} hint={osName} />
        <Stat label="Dossier" value={String(xp)} hint={rank.title} />
      </div>
      <p className="px-4 pb-2 font-mono text-xs text-subtle">
        {lead && !youLead ? `Lead ${lead.short} · ${lead.pulseScore}` : youLead ? "Leadership live." : "No rivals on this pulse yet."}
        {mine ? ` · All-time ${mine.place}` : ""}
        {` · Tissue ${healed} · Mesh ${cleared} · Seizes ${seizes}`}
      </p>

      <div className="flex flex-wrap gap-2 px-4 pb-3">
        <Button variant="primary" onClick={() => void post()} disabled={!ready || !pubkey || busy}>
          <Upload className="size-4" strokeWidth={1.75} />
          {busy ? "Posting" : posted ? "Update standing" : "Post standing"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            void refreshAllTime();
            void useLiveLead.getState().refresh();
          }}
          disabled={busy}
          aria-label="Refresh board"
        >
          <RefreshCw className="size-4" strokeWidth={1.75} />
          Refresh
        </Button>
      </div>

      {error || liveError ? <p className="px-4 pb-2 text-sm text-ember">{error || liveError}</p> : null}

      <div className="min-h-0 flex-1 overflow-auto px-2 pb-3">
        <p className="px-3 pb-1 text-xs font-medium tracking-wide text-muted uppercase">This pulse · {scope} · live</p>
        {live.length === 0 ? (
          <p className="px-3 py-4 text-sm leading-relaxed text-muted">
            Empty pulse. Tap a strain in the SNAP window. The last four seconds — or a rival within 5 — is NOW. Miss the lock and you wait.
          </p>
        ) : (
          <table className="mb-3 w-full text-left text-sm">
            <caption className="sr-only">Live {scope} pulse standings</caption>
            <thead className="sticky top-0 bg-card text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Viewer</th>
                <th className="px-3 py-2 font-medium">Pulse</th>
                <th className="px-3 py-2 font-medium">Seizes</th>
              </tr>
            </thead>
            <tbody>
              {live.map((row) => {
                const you = row.pubkey === pubkey;
                return (
                  <tr key={row.pubkey} data-you={you ? "1" : "0"} className={cn(you && "bg-sage/10")}>
                    <td className="px-3 py-2 font-mono text-xs tabular-nums">{row.place}</td>
                    <td className="px-3 py-2 font-mono text-xs text-subtle">
                      {you ? "you · " : ""}
                      {row.short}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs tabular-nums">{row.pulseScore}</td>
                    <td className="px-3 py-2 font-mono text-xs tabular-nums">{row.seizes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <p className="px-3 pb-1 text-xs font-medium tracking-wide text-muted uppercase">All-time globe</p>
        {rows.length === 0 ? (
          <p className="px-3 py-4 text-sm leading-relaxed text-muted">No all-time marks yet. Post standing.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <caption className="sr-only">All-time globe standings</caption>
            <thead className="sticky top-0 bg-card text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Viewer</th>
                <th className="hidden px-3 py-2 font-medium sm:table-cell">OS</th>
                <th className="px-3 py-2 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const you = row.pubkey === pubkey;
                return (
                  <tr key={row.pubkey} data-you={you ? "1" : "0"} className={cn(you && "bg-sage/10")}>
                    <td className="px-3 py-2 font-mono text-xs tabular-nums">{row.place}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium text-foreground">{row.rankTitle}</p>
                      <p className="font-mono text-xs text-subtle">
                        {you ? "you · " : ""}
                        {row.short}
                      </p>
                    </td>
                    <td className="hidden px-3 py-2 font-mono text-xs text-sage sm:table-cell">
                      {row.learned}/6 {row.osTitle}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs tabular-nums">{row.score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="px-4 pb-4">
        <InstallStrip />
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg bg-card-2 px-3 py-2 shadow-[var(--shadow-border)]">
      <p className="text-xs tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-1 font-mono text-sm text-foreground tabular-nums">{value}</p>
      {hint ? <p className="font-mono text-xs text-subtle">{hint}</p> : null}
    </div>
  );
}
