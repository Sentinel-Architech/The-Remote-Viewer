import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const PALETTE = [
  "#08090b",
  "#ecece8",
  "#c5cfc8",
  "#8a8d88",
  "#181b22",
  "#c45c4a",
  "#7d9a7e",
  "#c4a574",
  "#4a5560",
  "#d7ddd8",
];

export function PixelStudio({ onExport }: { onExport: (dataUrl: string, title: string) => void }) {
  const size = 32;
  const [pixels, setPixels] = useState(() => Array.from({ length: size * size }, () => "#08090b"));
  const [color, setColor] = useState("#ecece8");
  const [title, setTitle] = useState("Watchful mark");
  const [down, setDown] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const cell = c.width / size;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        ctx.fillStyle = pixels[y * size + x] ?? "#08090b";
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  }, [pixels]);

  function paint(e: PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * size);
    const y = Math.floor(((e.clientY - r.top) / r.height) * size);
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    setPixels((p) => {
      const next = p.slice();
      next[y * size + x] = color;
      return next;
    });
  }

  function exportPng() {
    const out = document.createElement("canvas");
    out.width = 512;
    out.height = 512;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    const cell = 512 / size;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        ctx.fillStyle = pixels[y * size + x] ?? "#08090b";
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
    onExport(out.toDataURL("image/png"), title);
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="pt">Title</Label>
        <Input id="pt" className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <canvas
        ref={canvasRef}
        width={320}
        height={320}
        className="w-full max-w-sm touch-none rounded-[var(--radius-md)] border border-border"
        onPointerDown={(e) => {
          setDown(true);
          paint(e);
        }}
        onPointerMove={(e) => {
          if (down) paint(e);
        }}
        onPointerUp={() => setDown(false)}
        onPointerLeave={() => setDown(false)}
      />
      <div className="flex flex-wrap gap-1.5">
        {PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className="h-9 w-9 rounded-[var(--radius-xs)] border border-border"
            style={{ background: c, outline: color === c ? "2px solid var(--color-accent)" : undefined }}
            aria-label={c}
          />
        ))}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded-[var(--radius-xs)] border border-border bg-transparent"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => setPixels(Array.from({ length: size * size }, () => "#08090b"))}>
          Clear
        </Button>
        <Button onClick={exportPng}>Use in mint</Button>
      </div>
    </div>
  );
}
