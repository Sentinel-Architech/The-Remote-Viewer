import { Button } from "@/components/ui/button";
import { CATALOG_TOTAL, THREAT_TYPES } from "@/os-sim/catalog";
import { getEngine } from "@/os-sim/engine-api";
import { autoHealCount, catalogedCount } from "@/os-sim/save";
import { useGameStore } from "@/os-sim/store";

export function DebriefScreen({ collapsed }: { collapsed: boolean }) {
  const knowledge = useGameStore((s) => s.knowledge);
  const cataloged = catalogedCount(knowledge);
  const auto = autoHealCount(knowledge);
  const autonomy = Math.round((auto / CATALOG_TOTAL) * 100);

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center bg-bg/50 p-4 sm:items-center">
      <div className="chrome-motion hud-enter w-full max-w-lg rounded-[var(--radius-xl)] border border-border bg-surface p-5 sm:p-8">
        <p className="font-mono text-xs tracking-[0.18em] text-accent">
          {collapsed ? "COGNITIVE CASCADE" : "WATCH COMPLETE"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {collapsed ? "Integrity failed" : "Brain is clearing"}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {collapsed
            ? "The cascade pulled you out. Catalog entries you already wrote are still in OS memory."
            : autonomy >= 100
              ? "SENTINEL OS can now defend this brain without a Viewer. Auto-heal is live for every known class."
              : "What you named stays named. Next watch, I handle those classes while you hunt the rest."}
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-[var(--radius-md)] border border-border bg-bg/50 px-3 py-2">
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-subtle">Catalog</dt>
            <dd className="mt-1 font-mono tabular text-fg">
              {cataloged}/{CATALOG_TOTAL}
            </dd>
          </div>
          <div className="rounded-[var(--radius-md)] border border-border bg-bg/50 px-3 py-2">
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-subtle">Autonomy</dt>
            <dd className="mt-1 font-mono tabular text-fg">{autonomy}%</dd>
          </div>
        </dl>
        <ul className="mt-4 flex flex-col gap-1">
          {THREAT_TYPES.map((t) => {
            const k = knowledge[t.id];
            return (
              <li key={t.id} className="flex justify-between gap-3 font-mono text-xs text-muted">
                <span>{k?.identified ? t.short : "——"}</span>
                <span className={k?.autoHeal ? "text-heal" : k?.identified ? "text-accent" : "text-subtle"}>
                  {k?.autoHeal ? "auto-heal" : k?.identified ? "mapped" : "unknown"}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button className="h-11 flex-1" onClick={() => getEngine()?.startMission()}>
            {collapsed ? "Re-enter" : "Next watch"}
          </Button>
          <Button
            variant="secondary"
            className="h-11 flex-1"
            onClick={() => useGameStore.getState().setPhase("briefing")}
          >
            Surface
          </Button>
        </div>
      </div>
    </div>
  );
}
