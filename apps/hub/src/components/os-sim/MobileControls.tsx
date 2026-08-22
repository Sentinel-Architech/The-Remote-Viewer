import { useRef } from "react";
import { getEngine } from "@/os-sim/engine-api";
import { useGameStore } from "@/os-sim/store";
import { cn } from "@/lib/utils";

export function MobileControls() {
  const coarse = useGameStore((s) => s.isCoarse);
  const phase = useGameStore((s) => s.phase);
  if (!coarse || phase !== "playing") return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <Joystick />
      <div className="pointer-events-auto mb-2 flex flex-col gap-2">
        <div className="flex gap-2">
          <HoldButton label="Up" onHold={(v) => getEngine()?.setTouch({ rise: v ? 1 : 0 })} />
          <HoldButton label="Down" onHold={(v) => getEngine()?.setTouch({ rise: v ? -1 : 0 })} />
        </div>
        <div className="flex gap-2">
          <HoldButton label="Scan" onHold={(v) => getEngine()?.setTouch({ scan: v })} />
          <button
            type="button"
            className="h-14 min-w-14 rounded-[var(--radius-md)] border border-border bg-accent px-3 font-mono text-xs font-medium text-accent-fg"
            onPointerDown={(e) => {
              e.preventDefault();
              getEngine()?.setTouch({ pulse: true });
            }}
          >
            Pulse
          </button>
        </div>
        <button
          type="button"
          className="h-11 rounded-[var(--radius-sm)] border border-border bg-surface/80 font-mono text-xs text-fg"
          onClick={() => useGameStore.getState().setKnowledgeOpen(true)}
        >
          Catalog
        </button>
      </div>
    </div>
  );
}

function HoldButton({ label, onHold }: { label: string; onHold: (v: boolean) => void }) {
  return (
    <button
      type="button"
      className="h-14 min-w-14 rounded-[var(--radius-md)] border border-border bg-surface/85 px-3 font-mono text-xs text-fg"
      onPointerDown={(e) => {
        e.preventDefault();
        (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
        onHold(true);
      }}
      onPointerUp={() => onHold(false)}
      onPointerCancel={() => onHold(false)}
    >
      {label}
    </button>
  );
}

function Joystick() {
  const origin = useRef<{ x: number; y: number } | null>(null);
  const knob = useRef<HTMLDivElement>(null);

  const end = () => {
    origin.current = null;
    getEngine()?.setTouch({ moveX: 0, moveY: 0 });
    if (knob.current) knob.current.style.transform = "translate(-50%, -50%)";
  };

  return (
    <div
      className="pointer-events-auto relative size-32 touch-none rounded-full border border-border bg-surface/50"
      onPointerDown={(e) => {
        e.preventDefault();
        const r = e.currentTarget.getBoundingClientRect();
        origin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        move(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (!origin.current) return;
        move(e.clientX, e.clientY);
      }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div
        ref={knob}
        className={cn(
          "absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full",
          "border border-border-strong bg-accent/80",
        )}
      />
    </div>
  );

  function move(cx: number, cy: number) {
    const o = origin.current;
    if (!o) return;
    let dx = (cx - o.x) / 52;
    let dy = (cy - o.y) / 52;
    const m = Math.hypot(dx, dy);
    if (m > 1) {
      dx /= m;
      dy /= m;
    }
    getEngine()?.setTouch({ moveX: dx, moveY: dy });
    if (knob.current) {
      knob.current.style.transform = `translate(calc(-50% + ${dx * 28}px), calc(-50% + ${dy * 28}px))`;
    }
  }
}
