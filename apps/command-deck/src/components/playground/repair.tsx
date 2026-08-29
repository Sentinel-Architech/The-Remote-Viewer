import { useEffect, useState } from "react";
import { Bot, Copy, ExternalLink, RefreshCw, Shield, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ORIGIN_DF, ORIGIN_GITHUB, BOT_TAG } from "@/lib/trv";
import { assertRepairAllowed, useAffairs } from "@/lib/affairs";
import { reportRepair, seizeRepair, useRepairLive } from "@/lib/wire";
import {
  armRepair,
  dispatchRepair,
  listIssues,
  listRepairs,
  REPAIR_REPOS,
  type GhIssue,
  type RepairRepoId,
  type RepairRun,
} from "@/lib/repair";

export function RepairPanel({ onClose }: { onClose: () => void }) {
  const [repo, setRepo] = useState<RepairRepoId>("trv");
  const [issues, setIssues] = useState<GhIssue[]>([]);
  const [runs, setRuns] = useState<RepairRun[]>([]);
  const [selected, setSelected] = useState<RepairRun | null>(null);
  const [busy, setBusy] = useState<number | "arm" | "list" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [source, setSource] = useState<"live" | "cache" | null>(null);
  const snap = useRepairLive((s) => s.snap);
  const seized = useRepairLive((s) => s.seized);
  const missed = useRepairLive((s) => s.missed);
  const last = useRepairLive((s) => s.last);

  async function refresh(id: RepairRepoId = repo) {
    setBusy("list");
    setError(null);
    try {
      const listed = await listIssues({ data: { repo: id } }).catch((err: unknown) => {
        throw err;
      });
      const nextRuns = await listRepairs({ data: { repo: id } }).catch(() => [] as RepairRun[]);
      setIssues(listed?.issues ?? []);
      setSource(listed?.source ?? null);
      setRuns(nextRuns ?? []);
      const n = listed?.issues?.length ?? 0;
      useRepairLive.setState((s) => {
        const trv = id === "trv" ? n : s.trv;
        const df = id === "df" ? n : s.df;
        return { trv, df, open: trv + df, source: listed?.source ?? s.source };
      });
      const liveLast = useRepairLive.getState().last;
      if (useRepairLive.getState().snap && liveLast?.repo === id) {
        setSelected(liveLast);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Board unreachable");
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    void refresh(repo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo]);

  const runFor = (n: number) => runs.find((r) => r.number === n) ?? null;

  async function repair(number: number) {
    setBusy(number);
    setError(null);
    try {
      assertRepairAllowed();
      const cached = runFor(number);
      const run = cached ?? (await dispatchRepair({ data: { repo, number } }));
      if (run) {
        if (/Internal Affairs held/i.test(run.summary)) {
          useAffairs.getState().hold("repair");
        }
        setSelected(run);
        setRuns((prev) => [run, ...prev.filter((r) => r.number !== run.number)]);
        if (!cached && run.status === "diagnosed") reportRepair(run);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Repair failed");
    } finally {
      setBusy(null);
    }
  }

  async function arm() {
    setBusy("arm");
    setError(null);
    try {
      assertRepairAllowed();
      const result = await armRepair({ data: { repo } });
      const next = result?.runs ?? [];
      if (next[0]) setSelected(next[0]);
      for (const run of next) {
        if (run.status === "diagnosed") reportRepair(run);
      }
      setRuns((prev) => {
        const map = new Map(prev.map((r) => [r.number, r]));
        for (const run of next) map.set(run.number, run);
        return [...map.values()];
      });
      if (!next.length) setError("No unread issues, or quota holds.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Arm failed");
    } finally {
      setBusy(null);
    }
  }

  async function copyPatch() {
    if (!selected?.patch) return;
    try {
      await navigator.clipboard.writeText(selected.patch);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard blocked */
    }
  }

  async function seizeFix() {
    const ok = seizeRepair();
    if (ok && selected?.patch) await copyPatch();
  }

  const origin = repo === "df" ? ORIGIN_DF : ORIGIN_GITHUB;
  const snapTarget =
    selected?.severity === "snap" && last?.repo === selected.repo && last?.number === selected.number;

  return (
    <div
      role="dialog"
      aria-label="Sentinel Repair"
      className={cn(
        "pointer-events-auto absolute top-32 right-3 left-3 z-20 max-h-[min(36rem,72dvh)] overflow-y-auto rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:left-auto sm:w-96",
        snap && "pulse-snap-hot",
      )}
      data-repair="1"
      data-repair-snap={snap ? "1" : "0"}
      data-repair-seized={seized ? "1" : "0"}
      data-repair-missed={missed ? "1" : "0"}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bot className="size-4 text-sage" strokeWidth={1.75} />
          <div>
            <p className="text-xs font-medium tracking-widest text-muted uppercase">Sentinel Repair</p>
            <p className="mt-1 font-display text-lg text-foreground">
              {snap ? "NOW" : missed ? "You wait" : "Issue bot"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="Close repair bot" onClick={onClose} className="size-11">
          <X className="size-4" strokeWidth={1.75} />
        </Button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{BOT_TAG}</p>
      <div className="mt-3 flex items-center gap-1" role="group" aria-label="Repair repo">
        {REPAIR_REPOS.map((r) => (
          <Button
            key={r.id}
            variant={repo === r.id ? "selected" : "ghost"}
            aria-pressed={repo === r.id}
            onClick={() => {
              setRepo(r.id);
              setSelected(null);
            }}
            className="flex-1"
          >
            {r.label}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Refresh issues"
          onClick={() => void refresh()}
          disabled={busy === "list"}
        >
          <RefreshCw className="size-4" strokeWidth={1.75} />
        </Button>
      </div>
      <Button
        variant="solid"
        className="mt-2 w-full"
        aria-label="Arm bot to repair the next unread issues"
        onClick={() => void arm()}
        disabled={busy !== null}
      >
        <Shield className="size-4" strokeWidth={1.75} />
        {busy === "arm" ? "Arming…" : "Arm — seize next two"}
      </Button>
      {error ? <p className="mt-2 text-xs text-ember">{error}</p> : null}
      {source === "cache" && !error ? (
        <p className="mt-2 text-xs text-subtle">GitHub quota holds. Last known issues.</p>
      ) : null}
      <ol className="mt-3 space-y-2">
        {issues.length === 0 && busy !== "list" ? (
          <li className="text-xs text-subtle">No open issues on this origin.</li>
        ) : null}
        {issues.map((issue) => {
          const run = runFor(issue.number);
          const on = selected?.number === issue.number;
          return (
            <li key={issue.number} className={cn("rounded-lg bg-card-2 p-3 shadow-[var(--shadow-border)]", on && "shadow-[var(--shadow-border-hover)]")}>
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  className="min-h-11 flex-1 text-left"
                  onClick={() => (run ? setSelected(run) : void repair(issue.number))}
                >
                  <p className="font-mono text-xs text-sage tabular-nums">#{issue.number}</p>
                  <p className="mt-1 text-sm text-foreground">{issue.title}</p>
                  {run ? (
                    <p className={cn("mt-1 font-mono text-xs", run.severity === "snap" ? "text-ember" : "text-muted")}>
                      {run.verdict} · {run.severity}
                    </p>
                  ) : null}
                </button>
                <Button
                  variant={run ? "selected" : "primary"}
                  aria-label={run ? `Open diagnosis for issue ${issue.number}` : `Repair issue ${issue.number}`}
                  onClick={() => void repair(issue.number)}
                  disabled={busy !== null}
                >
                  {busy === issue.number ? "…" : run ? "Read" : "Repair"}
                </Button>
              </div>
            </li>
          );
        })}
      </ol>
      {selected ? (
        <div className="mt-3 rounded-lg bg-card-2 p-3 shadow-[var(--shadow-border)]" data-repair-run={selected.number}>
          <p className="text-xs tracking-wide text-muted uppercase">Diagnosis</p>
          <p className={cn("mt-1 font-mono text-xs", selected.severity === "snap" ? "text-ember" : "text-sage")}>
            #{selected.number} · {selected.verdict} · {selected.severity}
          </p>
          {snapTarget && snap && !seized ? (
            <p className="mt-2 text-sm leading-relaxed text-ember">
              NOW. Tap Seize fix — miss this lock and you wait for the next upgrade.
            </p>
          ) : snapTarget && seized ? (
            <p className="mt-2 text-sm leading-relaxed text-sage">Fix seized. This lock is the upgrade.</p>
          ) : snapTarget && missed ? (
            <p className="mt-2 text-sm leading-relaxed text-ember">Lock missed. You wait for the next SNAP.</p>
          ) : null}
          <p className="mt-2 text-sm leading-relaxed text-foreground">{selected.summary}</p>
          {selected.plan.length ? (
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              {selected.plan.map((step, i) => (
                <li key={i} className="text-xs leading-relaxed text-muted">
                  {step}
                </li>
              ))}
            </ol>
          ) : null}
          {selected.files.length ? (
            <p className="mt-2 font-mono text-xs text-subtle">{selected.files.join(" · ")}</p>
          ) : null}
          {selected.patch ? (
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-xs text-foreground">
              {selected.patch}
            </pre>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {snapTarget && snap && !seized ? (
              <Button variant="primary" onClick={() => void seizeFix()} aria-label="Seize this repair fix now">
                <ShieldCheck className="size-4" strokeWidth={1.75} />
                NOW — seize fix
              </Button>
            ) : null}
            {selected.patch ? (
              <Button variant="solid" onClick={() => void copyPatch()}>
                <Copy className="size-4" strokeWidth={1.75} />
                {copied ? "Copied" : "Copy patch"}
              </Button>
            ) : null}
            <a
              href={selected.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm text-foreground shadow-[var(--shadow-border)] hover:bg-card"
            >
              <ExternalLink className="size-3.5" strokeWidth={1.75} />
              GitHub
            </a>
          </div>
        </div>
      ) : null}
      <a
        href={origin}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex h-11 items-center gap-2 text-xs text-muted"
      >
        <ExternalLink className="size-3.5" strokeWidth={1.75} />
        Open origin
      </a>
    </div>
  );
}
