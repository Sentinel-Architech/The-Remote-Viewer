import { BookOpen, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEngine } from "@/os-sim/engine-api";
import { useGameStore } from "@/os-sim/store";
import { cn } from "@/lib/utils";
import { CommsLog } from "./CommsLog";

export function HUD() {
  const hud = useGameStore((s) => s.hud);
  const coarse = useGameStore((s) => s.isCoarse);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 p-3 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="hud-enter rounded-[var(--radius-md)] border border-border bg-surface/75 px-3 py-2">
          <p className="font-mono text-[0.65rem] tracking-[0.18em] text-accent">SENTINEL OS</p>
          <p className="mt-0.5 text-sm font-medium text-fg">{hud.region}</p>
        </div>
        <div className="flex items-start gap-2">
          <Meter label="Integrity" value={hud.integrity} warn={hud.integrity < 32} />
          <Meter label="Autonomy" value={hud.autonomy} />
          <div className="pointer-events-auto hidden sm:flex">
            <Button
              variant="ghost"
              size="icon"
              className="bg-surface/70"
              aria-label="Open catalog"
              onClick={() => useGameStore.getState().setKnowledgeOpen(true)}
            >
              <BookOpen />
            </Button>
          </div>
          <div className="pointer-events-auto">
            <Button
              variant="ghost"
              size="icon"
              className="bg-surface/70"
              aria-label="Pause"
              onClick={() => getEngine()?.pause()}
            >
              <Pause />
            </Button>
          </div>
        </div>
      </div>

      {hud.waypoint.visible && (
        <div
          className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-accent bg-accent/20"
          style={{ left: `${hud.waypoint.x * 100}%`, top: `${hud.waypoint.y * 100}%` }}
          aria-hidden
        />
      )}

      <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2" aria-hidden>
        <div className="size-4 rounded-full border border-fg/30">
          <div className="absolute left-1/2 top-1/2 size-0.5 -translate-x-1/2 -translate-y-1/2 bg-fg/80" />
        </div>
      </div>

      <div
        className={cn(
          "absolute left-3 right-3 flex flex-col gap-2 sm:left-5 sm:right-auto",
          coarse ? "bottom-40" : "bottom-3 sm:bottom-5",
        )}
      >
        <TargetChip />
        {(hud.scanning && hud.viewerSync > 0.04) && <SyncBars />}
        <CommsLog />
      </div>

      {!coarse && (
        <p className="absolute bottom-5 right-5 hidden max-w-[14rem] text-right font-mono text-[0.65rem] leading-relaxed text-subtle md:block">
          F scan · click pulse
          <br />
          {hud.threatsLeft} threats · {hud.cataloged}/{hud.catalogTotal} mapped
        </p>
      )}
    </div>
  );
}

function Meter({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="min-w-[7.5rem] rounded-[var(--radius-md)] border border-border bg-surface/75 px-3 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-subtle">{label}</p>
        <p className={cn("font-mono text-xs tabular", warn ? "text-threat" : "text-fg")}>{Math.round(v)}</p>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-bg">
        <div
          className={cn("h-full rounded-full", warn ? "bg-threat" : "bg-accent")}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

function TargetChip() {
  const hud = useGameStore((s) => s.hud);
  if (!hud.targetName) return null;
  return (
    <div className="w-fit rounded-[var(--radius-sm)] border border-border bg-surface/80 px-2.5 py-1 font-mono text-[0.7rem] text-fg">
      <span className={hud.targetKnown ? "text-accent" : "text-warn"}>{hud.targetName}</span>
      <span className="mx-2 text-subtle">{Math.round(hud.waypointDist)}u</span>
      {hud.inScanRange ? <span className="text-heal">in range</span> : <span className="text-subtle">close in</span>}
    </div>
  );
}

function SyncBars() {
  const hud = useGameStore((s) => s.hud);
  return (
    <div className="w-full max-w-md rounded-[var(--radius-md)] border border-border bg-surface/80 px-3 py-2">
      <p className="mb-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-subtle">
        Dual scan
      </p>
      <Bar label="Viewer" value={hud.viewerSync} />
      <Bar label="Sentinel" value={hud.sentinelSync} />
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-1 flex items-center gap-2 last:mb-0">
      <span className="w-16 font-mono text-[0.65rem] text-muted">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg">
        <div className="h-full bg-accent" style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
    </div>
  );
}
