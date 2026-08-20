import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Gauge, ShieldCheck } from "lucide-react";
import { useViewer } from "@/components/viewer-context";
import { getSkillAudits, runSkillAudit } from "@/lib/trv/sentinel-ai";
import { AGENTS, AGENT_IDS, edgeVitals, type AgentId } from "@/lib/trv/edge";
import { SKILL_PAR, SKILLS, type AuditRun, type SkillResult } from "@/lib/trv/skill-audit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hub/audit")({ component: AuditPage });

function verdictBadge(v: SkillResult["verdict"]) {
  if (v === "pass") return <Badge variant="native">At par</Badge>;
  if (v === "short") return <Badge variant="warn">Short</Badge>;
  if (v === "dark") return <Badge variant="muted">Helm dark</Badge>;
  return <Badge variant="warn">Below par</Badge>;
}

function AuditPage() {
  const { profile, setProfile } = useViewer();
  const [run, setRun] = useState<AuditRun | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void getSkillAudits()
      .then((r) => setRun(r))
      .finally(() => setLoaded(true));
  }, []);

  const byAgent = useMemo(() => {
    const map = new Map<AgentId, SkillResult[]>();
    for (const id of AGENT_IDS) map.set(id, []);
    for (const r of run?.results ?? []) {
      const list = map.get(r.agent) ?? [];
      list.push(r);
      map.set(r.agent, list);
    }
    return map;
  }, [run]);

  async function runNow() {
    setBusy(true);
    try {
      const next = await runSkillAudit({ data: { vitals: edgeVitals() } });
      setRun(next);
      if (profile) {
        setProfile({
          ...profile,
          lastSkillAuditAt: next.at,
          lastSkillAuditScore: next.overall,
        });
      }
      toast.success(
        next.helm === "live"
          ? `Skill audit sealed · ${next.overall} / par ${SKILL_PAR}`
          : `Doctrine + edge sealed · helm dark · ${next.overall}`,
      );
    } catch (err) {
      console.error("[skill-audit client]", err);
      toast.error(err instanceof Error ? err.message : "Audit failed");
    } finally {
      setBusy(false);
    }
  }

  const short = (run?.results ?? []).filter((r) => r.verdict !== "pass").length;

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <p className="text-[11px] tracking-[0.2em] uppercase text-accent">Sentinel OS</p>
        <h1 className="mt-1 flex items-center gap-2 font-display text-3xl">
          <Gauge className="size-7" />
          Skill audit
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Cipher, Watcher, Privacy, Mesh, Healer, and Sentinel Super are scored
          against a written bar: doctrine (the skill itself), edge vitals (this
          node), and a live helm probe when the voice is lit. Par is {SKILL_PAR}.
          The OS does not grade itself in secret — you run it.
        </p>
      </div>

      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Last run</p>
            {run ? (
              <>
                <p className="mt-1 font-display text-3xl tabular-nums">{run.overall}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {run.helm === "live" ? "Live helm" : "Helm dark"} · {short} skill{short === 1 ? "" : "s"} short of par ·{" "}
                  {new Date(run.at).toLocaleString()}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {loaded ? "No audit on this node yet. The bar is already written — run it." : "Reading ledger…"}
              </p>
            )}
          </div>
          <Button disabled={busy} onClick={() => void runNow()}>
            {busy ? "Auditing…" : run ? "Re-run skill audit" : "Run skill audit"}
          </Button>
        </div>
        {run ? <Progress className="mt-4" value={run.overall} /> : null}
        <p className="mt-3 text-xs text-muted-foreground">
          Live probes are six short questions, one per super, only when you click.
          If the helm is dark, doctrine and edge still score — the written skill
          must be up to par even when Grok is silent.
        </p>
      </section>

      {AGENT_IDS.map((id) => {
        const skills = byAgent.get(id) ?? [];
        const catalog = SKILLS.filter((s) => s.agent === id);
        const avg = skills.length ? Math.round(skills.reduce((n, s) => n + s.score, 0) / skills.length) : null;
        return (
          <section key={id} className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-2xl">{AGENTS[id].name}</h2>
                <p className="text-[11px] uppercase tracking-wide text-accent">
                  {AGENTS[id].rank === "super" ? "Super agent" : `Super of ${AGENTS[id].field}`}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{AGENTS[id].duty}</p>
              </div>
              {avg != null ? (
                <p className={cn("font-mono text-2xl tabular-nums", avg >= SKILL_PAR ? "text-ok" : "text-warn")}>
                  {avg}
                </p>
              ) : (
                <Badge variant="muted">Unaudited</Badge>
              )}
            </div>
            <ul className="mt-4 space-y-3">
              {skills.length
                ? skills.map((s) => (
                    <li key={s.skillId} className="rounded-[var(--radius-md)] border border-border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm">{s.name}</p>
                        {verdictBadge(s.verdict)}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.bar}</p>
                      <Progress className="mt-2" value={s.score} />
                      <p className="mt-2 font-mono text-[11px] tabular-nums text-muted-foreground">
                        {s.score} · doctrine {s.doctrine}
                        {s.edge != null ? ` · edge ${s.edge}` : ""}
                        {s.live != null ? ` · live ${s.live}` : " · live —"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{s.evidence}</p>
                    </li>
                  ))
                : catalog.map((s) => (
                    <li key={s.id} className="rounded-[var(--radius-md)] border border-border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm">{s.name}</p>
                        <Badge variant="muted">Bar</Badge>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.bar}</p>
                    </li>
                  ))}
            </ul>
            {skills.some((s) => s.verdict !== "pass") ? (
              <Button asChild variant="secondary" size="sm" className="mt-4">
                <Link to="/hub/os">Brief {AGENTS[id].name} on OS</Link>
              </Button>
            ) : null}
          </section>
        );
      })}

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" />
        Below-par skills are wounds. Healer names them. You train the machine; the machine must stay at par.
      </p>
    </div>
  );
}
