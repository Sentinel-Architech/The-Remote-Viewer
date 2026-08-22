import { Activity, Radio, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATALOG_TOTAL } from "@/os-sim/catalog";
import { autoHealCount, catalogedCount } from "@/os-sim/save";
import { getEngine } from "@/os-sim/engine-api";
import { useGameStore } from "@/os-sim/store";
import { useJackSession } from "./session-context";

export function StartScreen() {
  const knowledge = useGameStore((s) => s.knowledge);
  const missions = useGameStore((s) => s.missionsCleared);
  const best = useGameStore((s) => s.bestAutonomy);
  const ready = useGameStore((s) => s.engineReady);
  const cataloged = catalogedCount(knowledge);
  const auto = autoHealCount(knowledge);
  const { onClose } = useJackSession();

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center p-4 sm:items-center sm:p-8">
      <div className="chrome-motion hud-enter pointer-events-auto w-full max-w-lg rounded-[var(--radius-xl)] border border-border bg-surface/90 p-5 shadow-[0_24px_80px_color-mix(in_oklab,black_55%,transparent)] sm:p-8">
        <p className="font-mono text-xs tracking-[0.22em] text-accent">REMOTE VIEWER PROTOCOL</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-fg sm:text-4xl">
          SENTINEL OS
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          You are jacked into a living brain as a guided neuron. I am Sentinel, on comms. We find
          what does not belong, name it together, and write it into the Operating System. Once I
          know a signature, I can auto-heal that class without you.
        </p>

        <dl className="mt-6 grid grid-cols-3 gap-2">
          <Stat label="Catalog" value={`${cataloged}/${CATALOG_TOTAL}`} />
          <Stat label="Autonomy" value={`${Math.round((auto / CATALOG_TOTAL) * 100)}%`} />
          <Stat label="Watches" value={`${missions}`} />
        </dl>

        {best > 0 && (
          <p className="mt-3 font-mono text-xs text-subtle">Best autonomy {best}%</p>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            className="h-12 flex-1"
            disabled={!ready}
            onClick={() => getEngine()?.startMission()}
          >
            <Radio />
            {ready ? "Jack In" : "Establishing link"}
          </Button>
          {cataloged > 0 && (
            <Button
              variant="secondary"
              className="h-12"
              onClick={() => {
                useGameStore.getState().resetMemory();
              }}
            >
              <Activity />
              Reset OS memory
            </Button>
          )}
          {onClose ? (
            <Button variant="secondary" className="h-12" onClick={onClose}>
              <Undo2 />
              Surface
            </Button>
          ) : null}
        </div>

        <p className="mt-5 hidden text-xs leading-relaxed text-subtle sm:block">
          W/S throttle · A/D yaw · Space rise · Ctrl descend · F scan · Click pulse · K catalog
        </p>
        <p className="mt-5 text-xs leading-relaxed text-subtle sm:hidden">
          Stick to fly. Scan, then pulse. Stay in range while we read the fold.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-bg/60 px-3 py-2">
      <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-subtle">{label}</dt>
      <dd className="mt-1 font-mono text-sm tabular text-fg">{value}</dd>
    </div>
  );
}
