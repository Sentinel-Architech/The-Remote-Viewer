import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ViewerProfile } from "@/lib/trv/types";
import { STAGE_LABEL, stageFromXp } from "@/lib/trv/tiers";
import { logDefense, saveProgress } from "@/lib/trv/server";
import { pingWatch } from "@/lib/trv/watch-events";
import { addLesson } from "@/lib/trv/edge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

type Attack = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: string;
  r: number;
  hp: number;
};

type Pulse = { x: number; y: number; r: number; max: number };

const KINDS = ["probe", "spoof", "flood", "backdoor", "drain"] as const;

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
  const pointer = useRef({ x: 0.5, y: 0.5, pulse: false });

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
      return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    };

    const onDown = (e: PointerEvent) => {
      pointer.current = { ...uv(e), pulse: true };
    };
    const onMove = (e: PointerEvent) => {
      const p = uv(e);
      pointer.current.x = p.x;
      pointer.current.y = p.y;
    };
    const onUp = () => {
      pointer.current.pulse = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        pointer.current.pulse = true;
      }
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    window.addEventListener("keydown", onKey);

    function spawn() {
      const side = Math.floor(Math.random() * 4);
      let x = 0;
      let y = 0;
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
      const speed = 0.08 + statsRef.current.stage * 0.03;
      attacks.push({
        x,
        y,
        vx: (dx / len) * speed,
        vy: (dy / len) * speed,
        kind: KINDS[Math.floor(Math.random() * KINDS.length)] ?? "probe",
        r: 0.012,
        hp: 1,
      });
    }

    function fire(x: number, y: number) {
      pulses.push({ x, y, r: 0.01, max: 0.08 + statsRef.current.pulse * 0.035 });
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
        const rate = Math.max(0.45, 1.4 - statsRef.current.stage * 0.2);
        if (spawnAcc > rate) {
          spawnAcc = 0;
          spawn();
          if (statsRef.current.stage >= 1) spawn();
        }

        autoAcc += dt;
        if (statsRef.current.autonomy > 8 && autoAcc > 1.6 - statsRef.current.auto * 0.2) {
          autoAcc = 0;
          if (attacks[0] && Math.random() < statsRef.current.autonomy / 140) {
            fire(attacks[0].x, attacks[0].y);
          }
        }

        if (pointer.current.pulse) {
          fire(pointer.current.x, pointer.current.y);
          pointer.current.pulse = false;
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
              a.hp = 0;
              const xpGain = 12 + statsRef.current.stage * 4;
              const nextXp = statsRef.current.xp + xpGain;
              const nextAuto = Math.min(100, statsRef.current.autonomy + 0.4);
              const nextStage = stageFromXp(nextXp);
              setStats((s) => ({
                ...s,
                xp: nextXp,
                autonomy: nextAuto,
                stage: nextStage,
              }));
              void logDefense({ data: { attackType: a.kind, outcome: "blocked", xpGain } }).then(() => pingWatch());
              void addLesson({
                at: new Date().toISOString(),
                agent: "mesh",
                dir: "h2m",
                pattern: `Intercept ${a.kind}`,
                counsel: "Viewer taught Mesh a live pulse.",
              });
            }
          }
          if (Math.hypot(a.x - 0.5, a.y - 0.5) < 0.055) {
            a.hp = 0;
            setStats((s) => ({ ...s, health: Math.max(0, s.health - 8) }));
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

      // holographic brain
      const cx = w * 0.5;
      const cy = h * 0.5;
      const br = Math.min(w, h) * 0.16;
      ctx.strokeStyle = "rgba(197,207,200,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, br, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, br * 0.55, 0, Math.PI * 2);
      ctx.stroke();
      const t = now / 1000;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + t * 0.15;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * br * 0.2, cy + Math.sin(a) * br * 0.2);
        ctx.lineTo(cx + Math.cos(a) * br * 1.35, cy + Math.sin(a) * br * 1.35);
        ctx.stroke();
      }

      const extras = statsRef.current.extra;
      const px = pointer.current.x * w;
      const py = pointer.current.y * h;
      ctx.fillStyle = "#ecece8";
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < extras; i++) {
        const a = t + (i / Math.max(1, extras)) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(px + Math.cos(a) * 28, py + Math.sin(a) * 28, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = "rgba(232,236,233,0.7)";
      for (const p of pulses) {
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r * Math.min(w, h), 0, Math.PI * 2);
        ctx.stroke();
      }

      for (const a of attacks) {
        ctx.fillStyle = a.kind === "backdoor" || a.kind === "drain" ? "#c45c4a" : "#c4a574";
        ctx.beginPath();
        ctx.arc(a.x * w, a.y * h, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#8a8d88";
      ctx.font = "12px IBM Plex Sans, sans-serif";
      ctx.fillText(STAGE_LABEL[statsRef.current.stage] ?? "Watchful Neuron", 16, 22);
      ctx.fillText("tap / space to pulse · pointer is the neuron", 16, 40);

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
      window.removeEventListener("keydown", onKey);
    };
  }, [paused, onProfile]);

  function buy(kind: "heal" | "pulse" | "auto" | "extra") {
    setStats((s) => {
      const cost = kind === "heal" ? 80 : kind === "pulse" ? 140 : kind === "auto" ? 180 : 220;
      if (s.xp < cost) {
        toast.error("Not enough XP");
        return s;
      }
      const next = { ...s, xp: s.xp - cost };
      if (kind === "heal") next.health = Math.min(100, s.health + 25);
      if (kind === "pulse") next.pulse = Math.min(5, s.pulse + 1);
      if (kind === "auto") {
        next.auto = Math.min(5, s.auto + 1);
        next.autonomy = Math.min(100, s.autonomy + 8);
      }
      if (kind === "extra") next.extra = Math.min(4, s.extra + 1);
      void saveProgress({
        data: {
          xp: next.xp,
          sentinelHealth: next.health,
          sentinelAutonomy: Math.round(next.autonomy),
          pulseRadius: next.pulse,
          autoIntercept: next.auto,
          extraNeurons: next.extra,
        },
      }).then((p) => {
        if (p) onProfile(p);
      });
      return next;
    });
  }

  return (
    <div className="flex min-h-[70dvh] flex-col gap-4 p-3 md:flex-row md:p-4">
      <div className="relative min-h-[58dvh] w-full flex-1 overflow-hidden rounded-[var(--radius-xl)] border border-border md:min-h-[70dvh]">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" />
      </div>
      <aside className="w-full shrink-0 space-y-4 rounded-[var(--radius-xl)] border border-border bg-card p-4 md:w-72">
        <h2 className="font-display text-xl">Sentinel R&D</h2>
        <p className="text-xs text-muted-foreground">
          The OS learns only from intercepts you land. Autonomy is copied habit,
          not magic.
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
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="secondary" onClick={() => buy("heal")}>
            Heal 80
          </Button>
          <Button size="sm" variant="secondary" onClick={() => buy("pulse")}>
            Pulse 140
          </Button>
          <Button size="sm" variant="secondary" onClick={() => buy("auto")}>
            Train 180
          </Button>
          <Button size="sm" variant="secondary" onClick={() => buy("extra")}>
            Neuron 220
          </Button>
        </div>
        <Button variant="outline" className="w-full" onClick={() => setPaused((p) => !p)}>
          {paused ? "Resume" : "Pause"}
        </Button>
      </aside>
    </div>
  );
}
