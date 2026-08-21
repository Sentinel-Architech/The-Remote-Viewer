import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ViewerProfile } from "@/lib/trv/types";
import { logDefense, saveProgress } from "@/lib/trv/server";
import { pingWatch } from "@/lib/trv/watch-events";
import { addLesson } from "@/lib/trv/edge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

type AttackKind = "probe" | "spoof" | "flood" | "backdoor" | "drain" | "phantom" | "worm";
type FireMode = "tap" | "hold" | "wide" | "burst";

type Hostile = {
  id: number;
  kind: AttackKind;
  path: number;
  t: number;
  speed: number;
  depth: number;
};

type Pulse = {
  x: number;
  y: number;
  r: number;
  max: number;
  mode: FireMode;
};

const KINDS: AttackKind[] = ["probe", "spoof", "flood", "backdoor", "drain", "phantom", "worm"];

const KILL_METHOD: Record<AttackKind, FireMode> = {
  probe: "tap",
  spoof: "hold",
  flood: "wide",
  backdoor: "tap",
  drain: "tap",
  phantom: "tap",
  worm: "burst",
};

const PATHS = [
  [[0.15, 0.25], [0.28, 0.38], [0.42, 0.48], [0.5, 0.5]],
  [[0.85, 0.25], [0.72, 0.38], [0.58, 0.48], [0.5, 0.5]],
  [[0.12, 0.55], [0.25, 0.52], [0.38, 0.51], [0.5, 0.5]],
  [[0.88, 0.55], [0.75, 0.52], [0.62, 0.51], [0.5, 0.5]],
  [[0.5, 0.88], [0.5, 0.72], [0.5, 0.58], [0.5, 0.5]],
  [[0.35, 0.7], [0.42, 0.62], [0.48, 0.55], [0.5, 0.5]],
];

function lerpPath(path: number[][], t: number) {
  const seg = Math.min(path.length - 2, Math.floor(t * (path.length - 1)));
  const localT = t * (path.length - 1) - seg;
  const a = path[seg];
  const b = path[seg + 1];
  return {
    x: a[0] + (b[0] - a[0]) * localT,
    y: a[1] + (b[1] - a[1]) * localT,
  };
}

export function NeuralSpace({
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
  });
  const statsRef = useRef(stats);
  statsRef.current = stats;

  const known = useRef<Set<AttackKind>>(new Set());
  const litPaths = useRef<Set<number>>(new Set());

  const yaw = useRef(0);
  const pitch = useRef(0);
  const drag = useRef<{ active: boolean; lastX: number; lastY: number }>({ active: false, lastX: 0, lastY: 0 });

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
    let idCounter = 0;
    const hostiles: Hostile[] = [];
    const pulses: Pulse[] = [];
    let spawnAcc = 0;
    let autoAcc = 0;
    let saveAcc = 0;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma != null && e.beta != null) {
        yaw.current = (e.gamma / 45) * 0.35;
        pitch.current = ((e.beta - 45) / 45) * 0.25;
      }
    };
    window.addEventListener("deviceorientation", onOrient);

    const onDown = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.current = {
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top) / r.height,
        down: true,
        downAt: performance.now(),
        lastTap: pointer.current.lastTap,
      };
      drag.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.current.x = (e.clientX - r.left) / r.width;
      pointer.current.y = (e.clientY - r.top) / r.height;

      if (drag.current.active) {
        const dx = e.clientX - drag.current.lastX;
        const dy = e.clientY - drag.current.lastY;
        yaw.current += dx * 0.004;
        pitch.current = Math.max(-0.4, Math.min(0.4, pitch.current + dy * 0.003));
        drag.current.lastX = e.clientX;
        drag.current.lastY = e.clientY;
      }
    };

    const onUp = () => {
      const now = performance.now();
      const held = now - pointer.current.downAt;
      const isDouble = now - pointer.current.lastTap < 280;

      let mode: FireMode = "tap";
      if (isDouble) mode = "burst";
      else if (held > 380) mode = "hold";
      else if (held > 140) mode = "wide";

      const fx = 0.5 + (pointer.current.x - 0.5) * 0.7;
      const fy = 0.5 + (pointer.current.y - 0.5) * 0.7;
      const max = mode === "wide" ? 0.13 : mode === "hold" ? 0.09 : 0.07;
      pulses.push({ x: fx, y: fy, r: 0.01, max, mode });

      pointer.current.down = false;
      pointer.current.lastTap = now;
      drag.current.active = false;
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);

    const project = (nx: number, ny: number, depth: number) => {
      const scale = 0.55 + depth * 0.45;
      const cx = 0.5 + yaw.current * 0.4;
      const cy = 0.5 + pitch.current * 0.35;
      return {
        x: cx + (nx - 0.5) * scale,
        y: cy + (ny - 0.5) * scale,
        s: 0.55 + depth * 0.9,
      };
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      ctx.fillStyle = "#050608";
      ctx.fillRect(0, 0, w, h);

      const grd = ctx.createRadialGradient(w * 0.5, h * 0.5, 20, w * 0.5, h * 0.5, Math.min(w, h) * 0.55);
      grd.addColorStop(0, "rgba(40, 55, 50, 0.35)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      PATHS.forEach((path, i) => {
        const lit = litPaths.current.has(i);
        ctx.beginPath();
        path.forEach((pt, idx) => {
          const p = project(pt[0], pt[1], 0.3 + idx * 0.15);
          if (idx === 0) ctx.moveTo(p.x * w, p.y * h);
          else ctx.lineTo(p.x * w, p.y * h);
        });
        ctx.strokeStyle = lit ? "rgba(120, 200, 150, 0.55)" : "rgba(80, 100, 95, 0.25)";
        ctx.lineWidth = lit ? 2.5 : 1.2;
        ctx.stroke();
      });

      const core = project(0.5, 0.5, 1);
      ctx.beginPath();
      ctx.arc(core.x * w, core.y * h, 18 + Math.sin(now / 600) * 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(180, 220, 200, 0.25)";
      ctx.fill();
      ctx.strokeStyle = "rgba(200, 230, 210, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (!paused) {
        spawnAcc += dt;
        if (spawnAcc > 1.35) {
          spawnAcc = 0;
          const pathIdx = Math.floor(Math.random() * PATHS.length);
          hostiles.push({
            id: idCounter++,
            kind: KINDS[Math.floor(Math.random() * KINDS.length)]!,
            path: pathIdx,
            t: 0,
            speed: 0.07 + Math.random() * 0.04,
            depth: 0,
          });
        }

        for (const h of hostiles) {
          h.t += h.speed * dt;
          h.depth = Math.min(1, h.t);
        }

        autoAcc += dt;
        if (statsRef.current.autonomy > 15 && autoAcc > 1.6) {
          autoAcc = 0;
          const target = hostiles.find((h) => known.current.has(h.kind) && h.t < 0.92);
          if (target && Math.random() < statsRef.current.autonomy / 140) {
            const pos = lerpPath(PATHS[target.path], target.t);
            const p = project(pos.x, pos.y, target.depth);
            pulses.push({ x: p.x, y: p.y, r: 0.01, max: 0.08, mode: KILL_METHOD[target.kind] });
          }
        }

        for (const p of pulses) p.r += dt * 0.55;
        for (let i = pulses.length - 1; i >= 0; i--) {
          if (pulses[i].r > pulses[i].max) pulses.splice(i, 1);
        }

        for (let i = hostiles.length - 1; i >= 0; i--) {
          const h = hostiles[i];
          const pos = lerpPath(PATHS[h.path], h.t);
          const scr = project(pos.x, pos.y, h.depth);

          for (const p of pulses) {
            if (Math.hypot(scr.x - p.x, scr.y - p.y) < p.r + 0.025) {
              if (p.mode === KILL_METHOD[h.kind]) {
                const first = !known.current.has(h.kind);
                if (first) {
                  known.current.add(h.kind);
                  litPaths.current.add(h.path);
                  setStats((s) => ({
                    ...s,
                    health: Math.min(100, s.health + 7),
                    autonomy: Math.min(100, s.autonomy + 2.4),
                    xp: s.xp + 30,
                  }));
                  toast.success("Pattern learned. Pathway lit. Sentinel self-heals.");
                  void addLesson({
                    at: new Date().toISOString(),
                    agent: "mesh",
                    dir: "h2m",
                    pattern: `Discovered ${h.kind}`,
                    counsel: "Spatial discovery. Autonomy and tissue recovery.",
                  });
                } else {
                  setStats((s) => ({
                    ...s,
                    xp: s.xp + 14,
                    autonomy: Math.min(100, s.autonomy + 0.35),
                  }));
                }
                void logDefense({
                  data: { attackType: h.kind, outcome: "blocked", xpGain: first ? 30 : 14 },
                }).then(() => pingWatch());
                hostiles.splice(i, 1);
                break;
              }
            }
          }

          if (h.t >= 1) {
            setStats((s) => ({ ...s, health: Math.max(0, s.health - 9) }));
            void logDefense({ data: { attackType: h.kind, outcome: "breached", xpGain: 0 } });
            hostiles.splice(i, 1);
          }
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
              pulseRadius: profile.pulseRadius,
              autoIntercept: profile.autoIntercept,
              extraNeurons: profile.extraNeurons,
            },
          }).then((p) => {
            if (p) onProfile(p);
          });
        }
      }

      for (const h of hostiles) {
        const pos = lerpPath(PATHS[h.path], h.t);
        const scr = project(pos.x, pos.y, h.depth);
        const knownType = known.current.has(h.kind);
        const radius = (4.5 + h.depth * 5) * (scr.s || 1);

        ctx.beginPath();
        ctx.arc(scr.x * w, scr.y * h, radius, 0, Math.PI * 2);
        ctx.fillStyle = knownType ? "rgba(120, 190, 140, 0.9)" : "rgba(210, 90, 70, 0.9)";
        ctx.fill();
      }

      for (const p of pulses) {
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r * Math.min(w, h), 0, Math.PI * 2);
        ctx.strokeStyle =
          p.mode === "hold"
            ? "rgba(100, 170, 255, 0.7)"
            : p.mode === "wide"
              ? "rgba(200, 170, 80, 0.7)"
              : p.mode === "burst"
                ? "rgba(230, 90, 90, 0.8)"
                : "rgba(220, 230, 220, 0.7)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(220, 230, 220, 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#9aa89a";
      ctx.font = "12px IBM Plex Sans, sans-serif";
      ctx.fillText("Tilt or drag to look · discover by fire", 14, 22);
      ctx.fillText(`Known ${known.current.size}/7   Pathways lit ${litPaths.current.size}`, 14, 40);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("deviceorientation", onOrient);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
    };
  }, [paused, onProfile, profile]);

  return (
    <div className="flex min-h-[70dvh] flex-col gap-4 p-3 md:flex-row md:p-4">
      <div className="relative min-h-[58dvh] w-full flex-1 overflow-hidden rounded-[var(--radius-xl)] border border-border md:min-h-[70dvh]">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" />
      </div>

      <aside className="w-full shrink-0 space-y-4 rounded-[var(--radius-xl)] border border-border bg-card p-4 md:w-72">
        <h2 className="font-display text-xl">Neural Space</h2>
        <p className="text-xs text-muted-foreground">
          You are inside the brain. Hostiles travel pathways. Discover the correct response — the tissue lights up and heals.
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
