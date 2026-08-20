import { useEffect, useRef } from "react";
import type { ViewerProfile } from "@/lib/trv/types";
import { logDefense, saveProgress } from "@/lib/trv/server";
import { pingWatch } from "@/lib/trv/watch-events";
import { stageFromXp } from "@/lib/trv/tiers";

type Node = { lat: number; lon: number; id: number; hp: number };
type Pulse = { a: number; b: number; t: number; hostile: boolean };

function project(lat: number, lon: number, rot: number, w: number, h: number, scale: number) {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180 + rot;
  const x = Math.cos(la) * Math.sin(lo);
  const y = Math.sin(la);
  const z = Math.cos(la) * Math.cos(lo);
  return { x: w / 2 + x * scale, y: h / 2 - y * scale, z, vis: z > -0.05 };
}

const SEEDS: Array<[number, number]> = [
  [40.7, -74],
  [51.5, -0.1],
  [35.7, 139.7],
  [-33.9, 151.2],
  [19.4, -99.1],
  [55.7, 37.6],
  [1.3, 103.8],
  [-23.5, -46.6],
  [30.0, 31.2],
  [37.5, 127.0],
  [48.8, 2.3],
  [28.6, 77.2],
  [59.3, 18.0],
  [43.7, -79.4],
  [25.2, 55.3],
];

export function MeshGlobe({
  profile,
  onProfile,
}: {
  profile: ViewerProfile;
  onProfile: (p: ViewerProfile) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef<{ on: boolean; lastX: number }>({ on: false, lastX: 0 });
  const rotRef = useRef(0.4);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    const nodes: Node[] = SEEDS.map((s, i) => ({ lat: s[0], lon: s[1], id: i, hp: 3 }));
    const pulses: Pulse[] = [];
    let acc = 0;
    let xp = profile.xp;
    let health = profile.sentinelHealth;
    let autonomy = profile.sentinelAutonomy;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onDown = (e: PointerEvent) => {
      dragging.current = { on: true, lastX: e.clientX };
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const scale = Math.min(w, h) * 0.38;
      let hit = -1;
      nodes.forEach((n, i) => {
        const p = project(n.lat, n.lon, rotRef.current, w, h, scale);
        if (p.vis && Math.hypot(p.x - mx, p.y - my) < 14) hit = i;
      });
      if (hit >= 0) {
        for (let i = pulses.length - 1; i >= 0; i--) {
          const pu = pulses[i];
          if (pu && pu.hostile && (pu.a === hit || pu.b === hit)) {
            pulses.splice(i, 1);
            xp += 18;
            autonomy = Math.min(100, autonomy + 0.5);
            void logDefense({ data: { attackType: "mesh-intrusion", outcome: "blocked", xpGain: 18 } }).then(() => pingWatch());
          }
        }
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current.on) return;
      const dx = e.clientX - dragging.current.lastX;
      dragging.current.lastX = e.clientX;
      rotRef.current += dx * 0.006;
    };
    const onUp = () => {
      dragging.current.on = false;
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.fillStyle = "#08090b";
      ctx.fillRect(0, 0, w, h);
      if (!dragging.current.on) rotRef.current += dt * 0.12;

      const scale = Math.min(w, h) * 0.38;
      ctx.strokeStyle = "rgba(197,207,200,0.25)";
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, scale, 0, Math.PI * 2);
      ctx.stroke();

      acc += dt;
      if (acc > 1.1) {
        acc = 0;
        const a = Math.floor(Math.random() * nodes.length);
        let b = Math.floor(Math.random() * nodes.length);
        if (b === a) b = (b + 1) % nodes.length;
        pulses.push({ a, b, t: 0, hostile: Math.random() > 0.35 });
      }

      for (const p of pulses) p.t += dt * 0.35;
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        if (!p) continue;
        if (p.t >= 1) {
          if (p.hostile) {
            const n = nodes[p.b];
            if (n) n.hp -= 1;
            health = Math.max(0, health - 4);
            void logDefense({ data: { attackType: "mesh-intrusion", outcome: "breached", xpGain: 0 } });
          }
          pulses.splice(i, 1);
        }
      }

      const pts = nodes.map((n) => project(n.lat, n.lon, rotRef.current, w, h, scale));
      ctx.strokeStyle = "rgba(197,207,200,0.12)";
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const A = pts[i];
          const B = pts[j];
          if (A && B && A.vis && B.vis) {
            ctx.beginPath();
            ctx.moveTo(A.x, A.y);
            ctx.lineTo(B.x, B.y);
            ctx.stroke();
          }
        }
      }

      for (const p of pulses) {
        const A = pts[p.a];
        const B = pts[p.b];
        if (!A || !B) continue;
        const x = A.x + (B.x - A.x) * p.t;
        const y = A.y + (B.y - A.y) * p.t;
        ctx.fillStyle = p.hostile ? "#c45c4a" : "#7d9a7e";
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      pts.forEach((p, i) => {
        if (!p.vis) return;
        ctx.fillStyle = (nodes[i]?.hp ?? 0) > 0 ? "#ecece8" : "#c45c4a";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = "#8a8d88";
      ctx.font = "12px IBM Plex Sans, sans-serif";
      ctx.fillText("God's eye · drag to yaw · tap a node to intercept", 16, 22);
      ctx.fillText(`XP ${xp}  health ${health}  autonomy ${Math.round(autonomy)}`, 16, 40);

      if (Math.floor(now / 4000) !== Math.floor((now - dt * 1000) / 4000)) {
        void saveProgress({
          data: {
            xp,
            sentinelHealth: health,
            sentinelAutonomy: Math.round(autonomy),
            pulseRadius: profile.pulseRadius,
            autoIntercept: profile.autoIntercept,
            extraNeurons: profile.extraNeurons,
          },
        }).then((pr) => {
          if (pr) onProfile({ ...pr, neuronStage: stageFromXp(xp) });
        });
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [onProfile, profile.autoIntercept, profile.extraNeurons, profile.pulseRadius, profile.sentinelAutonomy, profile.sentinelHealth, profile.xp]);

  return (
    <div className="space-y-3 p-3 md:p-4">
      {profile.neuronStage < 2 ? (
        <p className="text-sm text-muted-foreground">
          Training galaxy until Remote Node (400 XP). Same war — tap a node to intercept.
        </p>
      ) : null}
      <canvas ref={canvasRef} className="h-[min(70dvh,36rem)] w-full touch-none rounded-[var(--radius-xl)] border border-border" />
    </div>
  );
}
