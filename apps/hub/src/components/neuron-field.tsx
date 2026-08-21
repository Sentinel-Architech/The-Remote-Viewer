import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ViewerProfile } from "@/lib/trv/types";
import { stageFromXp } from "@/lib/trv/tiers";
import { logDefense, saveProgress } from "@/lib/trv/server";
import { pingWatch } from "@/lib/trv/watch-events";
import { addLesson } from "@/lib/trv/edge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

type AttackKind = "probe" | "spoof" | "flood" | "backdoor" | "drain" | "phantom" | "worm";

type Attack = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: AttackKind;
  r: number;
  hp: number;
};

type Pulse = {
  x: number;
  y: number;
  r: number;
  max: number;
  mode: "tap" | "hold" | "wide" | "burst";
};

const KINDS: AttackKind[] = ["probe", "spoof", "flood", "backdoor", "drain", "phantom", "worm"];

// Correct response for each type — player must discover this
const KILL_METHOD: Record<AttackKind, Pulse["mode"]> = {
  probe: "tap",
  spoof: "hold",
  flood: "wide",
  backdoor: "tap",
  drain: "tap",
  phantom: "tap",
  worm: "burst",
};

export function NeuronField({
  profile,
  onProfile,
}: {
  profile: ViewerProfile;
  onProfile: (p: ViewerProfile) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const [stats, setStats] = useState({
    xp: profile.xp,
    health: profile.sentinelHealth,
    autonomy: profile.sentinelAutonomy,
    stage: profile.neuronStage,
    pulse: profile.pulseRadius,
    auto: profile.autoIntercept,
    extra: profile.extraNeurons,
  });
  const statsRef = useRef(stats);
  statsRef.current = stats;

  // Session discovery memory — no legend
  const known = useRef<Set<AttackKind>>(new Set());

  const pointer = useRef({
    x: 0.5,
    y: 0.5,
    down: false,
    downAt: 0,
    lastTap: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    const attacks: Attack[] = [];
    const pulses: Pulse[] = [];
    let spawnAcc = 0;
    let autoAcc = 0;
    let saveAcc = 0;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const box = canvas.parentElement?.getBoundingClientRect();
      const w = Math.max(canvas.clientWidth || box?.width || 320, 280);
      const h = Math.max(canvas.clientHeight || box?.height || 360, 280);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const uv = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top) / r.height,
      };
    };

    const fire = (x: number, y: number, mode: Pulse["mode"]) => {
      const max =
        mode === "wide"
          ? 0.14 + statsRef.current.pulse * 0.04
          : mode === "hold"
            ? 0.09 + statsRef.current.pulse * 0.03
            : 0.07 + statsRef.current.pulse * 0.025;
      pulses.push({ x, y, r: 0.01, max, mode });
    };

    const onDown = (e: PointerEvent) => {
      const p = uv(e);
      pointer.current = { ...p, down: true, downAt: performance.now(), lastTap: pointer.current.lastTap };
    };

    const onMove = (e: PointerEvent) => {
      const p = uv(e);
      pointer.current.x = p.x;
      pointer.current.y = p.y;
    };

    const onUp = () => {
      const now = performance.now();
      const held = now - pointer.current.downAt;
      const isDouble = now - pointer.current.lastTap < 280;

      let mode: Pulse["mode"] = "tap";
      if (isDouble) mode = "burst";
      else if (held > 380) mode = "hold";
      else if (held > 140) mode = "wide";

      fire(pointer.current.x, pointer.current.y, mode);
      pointer.current.down = false;
      pointer.current.lastTap = now;
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);

    function spawn() {
      const side = Math.floor(Math.random() * 4);
      let x = 0,
        y = 0;
      if (side === 0) {
        x = Math.random();
        y = -0.04;
      } else if (side === 1) {
        x = 1.04;
        y = Math.random();
      } else if (side === 2) {
        x = Math.random();
        y = 1.04;
      } else {
        x = -0.04;
        y = Math.random();
      }
      const dx = 0.5 - x;
      const dy = 0.5 - y;
      const len = Math.hypot(dx, dy) || 1;
      const speed = 0.07 + statsRef.current.stage * 0.025;
      attacks.push({
        x,
        y,
        vx: (dx / len) * speed,
        vy: (dy / len) * speed,
        kind: KINDS[Math.floor(Math.random() * KINDS.length)]!,
        r: 0.013,
        hp: 1,
      });
    }

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.fillStyle = "#08090b";
      ctx.fillRect(0, 0, w, h);

      if (!paused) {
        spawnAcc += dt;
        const rate = Math.max(0.5, 1.5 - statsRef.current.stage * 0.18);
        if (spawnAcc > rate) {
          spawnAcc = 0;
          spawn();
          if (statsRef.current.stage >= 1) spawn();
        }

        // Autonomy starts handling known types
        autoAcc += dt;
        if (statsRef.current.autonomy > 12 && autoAcc > 1.8 - statsRef.current.auto * 0.25) {
          autoAcc = 0;
          const target = attacks.find((a) => known.current.has(a.kind));
          if (target && Math.random() < statsRef.current.autonomy / 130) {
            fire(target.x, target.y, KILL_METHOD[target.kind]);
          }
        }

        for (const p of pulses) p.r += dt * 0.55;
        for (let i = pulses.length - 1; i >= 0; i--) {
          if ((pulses[i]?.r ?? 0) > (pulses[i]?.max ?? 1)) pulses.splice(i, 1);
        }

        for (const a of attacks) {
          a.x += a.vx * dt;
          a.y += a.vy * dt;
        }

        for (let i = attacks.length - 1; i >= 0; i--) {
          const a = attacks[i];
          if (!a) continue;

          for (const p of pulses) {
            if (Math.hypot(a.x - p.x, a.y - p.y) < p.r + a.r) {
              const correct = p.mode === KILL_METHOD[a.kind];
              if (correct) {
                a.hp = 0;

                const firstTime = !known.current.has(a.kind);
                if (firstTime) {
                  known.current.add(a.kind);
                  // Self-heal + learning reward
                  setStats((s) => ({
                    ...s,
                    health: Math.min(100, s.health + 6),
                    autonomy: Math.min(100, s.autonomy + 2.2),
                    xp: s.xp + 28,
                  }));
                  toast.success("Pattern learned. Sentinel self-heals.");
                  void addLesson({
                    at: new Date().toISOString(),
                    agent: "mesh",
                    dir: "h2m",
                    pattern: `Discovered ${a.kind}`,
                    counsel: "Viewer discovered the correct response. Autonomy rises.",
                  });
                } else {
                  setStats((s) => ({
                    ...s,
                    xp: s.xp + 14,
                    autonomy: Math.min(100, s.autonomy + 0.4),
                  }));
                }

                void logDefense({
                  data: { attackType: a.kind, outcome: "blocked", xpGain: firstTime ? 28 : 14 },
                }).then(() => pingWatch());
              }
            }
          }

          if (Math.hypot(a.x - 0.5, a.y - 0.5) < 0.055) {
            a.hp = 0;
            setStats((s) => ({ ...s, health: Math.max(0, s.health - 9) }));
            void logDefense({ data: { attackType: a.kind, outcome: "breached", xpGain: 0 } });
          }
          if (a.hp <= 0) attacks.splice(i, 1);
        }

        saveAcc += dt;
        if (saveAcc > 4) {
          saveAcc = 0;
          const s = statsRef.current;
          void saveProgress({
            data: {
              xp: s.xp,
              sentinelHealth: s.health,
              sentinelAutonomy: Math.round(s.autonomy),
              pulseRadius: s.pulse,
              autoIntercept: s.auto,
              extraNeurons: s.extra,
            },
          }).then((p) => {
            if (p) onProfile(p);
          });
        }
      }

      // Core
      const cx = w * 0.5;
      const cy = h * 0.5;
      const br = Math.min(w, h) * 0.15;
      ctx.strokeStyle = "rgba(197,207,200,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, br, 0, Math.PI * 2);
      ctx.stroke();

      // Player neuron
      const px = pointer.current.x * w;
      const py = pointer.current.y * h;
      ctx.fillStyle = "#ecece8";
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();

      // Pulses
      for (const p of pulses) {
        ctx.strokeStyle =
          p.mode === "hold"
            ? "rgba(120,180,255,0.7)"
            : p.mode === "wide"
              ? "rgba(180,160,90,0.7)"
              : p.mode === "burst"
                ? "rgba(220,100,100,0.8)"
                : "rgba(232,236,233,0.7)";
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r * Math.min(w, h), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Hostiles — no labels
      for (const a of attacks) {
        const knownType = known.current.has(a.kind);
        ctx.fillStyle = knownType ? "#7d9a7e" : "#c45c4a";
        ctx.beginPath();
        ctx.arc(a.x * w, a.y * h, 5.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#8a8d88";
      ctx.font = "12px IBM Plex Sans, sans-serif";
      ctx.fillText("Discover by fire · hold / double-tap / wide", 16, 22);
      ctx.fillText(`Known patterns ${known.current.size}/7`, 16, 40);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
    };
  }, [paused, onProfile]);

  return (
    <div className="flex min-h-[70dvh] flex-col gap-4 p-3 md:flex-row md:p-4">
      <div className="relative min-h-[58dvh] w-full flex-1 overflow-hidden rounded-[var(--radius-xl)] border border-border md:min-h-[70dvh]">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" />
      </div>

      <aside className="w-full shrink-0 space-y-4 rounded-[var(--radius-xl)] border border-border bg-card p-4 md:w-72">
        <h2 className="font-display text-xl">Sentinel R&D</h2>
        <p className="text-xs text-muted-foreground">
          No legend. Discovery is the only teacher. Correct responses permanently raise autonomy and heal the core.
        </p>
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Health</span>
            <span className="font-mono tabular-nums">{stats.health}</span>
          </div>
          <Progress value={stats.health} />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Autonomy</span>
            <span className="font-mono tabular-nums">{Math.round(stats.autonomy)}</span>
          </div>
          <Progress value={stats.autonomy} />
        </div>
        <p className="font-mono text-xs tabular-nums text-muted-foreground">XP {stats.xp}</p>
        <Button variant="outline" className="w-full" onClick={() => setPaused((p) => !p)}>
          {paused ? "Resume" : "Pause"}
        </Button>
      </aside>
    </div>
  );
}
