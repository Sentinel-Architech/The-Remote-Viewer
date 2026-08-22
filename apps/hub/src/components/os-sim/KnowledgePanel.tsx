import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { THREAT_TYPES } from "@/os-sim/catalog";
import { useGameStore } from "@/os-sim/store";
import { cn } from "@/lib/utils";

export function KnowledgePanel() {
  const open = useGameStore((s) => s.knowledgeOpen);
  const knowledge = useGameStore((s) => s.knowledge);
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center bg-bg/50 p-3 sm:items-center sm:p-6">
      <div className="chrome-motion hud-enter max-h-[86dvh] w-full max-w-xl overflow-y-auto rounded-[var(--radius-xl)] border border-border bg-surface p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs tracking-[0.18em] text-accent">OS MEMORY</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Knowledge catalog</h2>
            <p className="mt-1 text-sm text-muted">
              Signatures you and Sentinel learned together. Auto-heal comes online once a class is
              internalized.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close catalog"
            onClick={() => useGameStore.getState().setKnowledgeOpen(false)}
          >
            <X />
          </Button>
        </div>
        <ul className="mt-5 flex flex-col gap-2">
          {THREAT_TYPES.map((t) => {
            const k = knowledge[t.id];
            const known = k?.identified;
            return (
              <li
                key={t.id}
                className="rounded-[var(--radius-md)] border border-border bg-bg/40 px-4 py-3"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-medium text-fg">{known ? t.name : "Unknown signature"}</h3>
                  <span
                    className={cn(
                      "font-mono text-[0.65rem] uppercase tracking-[0.14em]",
                      k?.autoHeal ? "text-heal" : known ? "text-accent" : "text-subtle",
                    )}
                  >
                    {k?.autoHeal ? "Auto-heal" : known ? "Mapped" : "Unnamed"}
                  </span>
                </div>
                {known ? (
                  <>
                    <p className="mt-2 text-xs leading-relaxed text-muted">{t.dossier}</p>
                    <p className="mt-1 text-xs text-subtle">{t.protocol}</p>
                  </>
                ) : (
                  <p className="mt-2 text-xs text-subtle">Scan in range to write this fold.</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
