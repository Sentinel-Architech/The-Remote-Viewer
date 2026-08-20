import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function MemeStudio({
  baseImage,
  onExport,
}: {
  baseImage: string | null;
  onExport: (dataUrl: string, title: string) => void;
}) {
  const [top, setTop] = useState("WATCHFUL");
  const [bottom, setBottom] = useState("NEURON");
  const [title, setTitle] = useState("TRV native");
  const [bg, setBg] = useState("#12141a");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const drawText = () => {
      ctx.fillStyle = "#ecece8";
      ctx.strokeStyle = "#08090b";
      ctx.lineWidth = 8;
      ctx.textAlign = "center";
      ctx.font = "bold 56px IBM Plex Sans, sans-serif";
      ctx.strokeText(top, w / 2, 80);
      ctx.fillText(top, w / 2, 80);
      ctx.strokeText(bottom, w / 2, h - 36);
      ctx.fillText(bottom, w / 2, h - 36);
      ctx.font = "14px IBM Plex Mono, monospace";
      ctx.fillStyle = "#8a8d88";
      ctx.fillText("THE REMOTE VIEWER", w / 2, h - 12);
    };

    if (baseImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const scale = Math.max(w / img.width, h / img.height);
        const iw = img.width * scale;
        const ih = img.height * scale;
        ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
        drawText();
      };
      img.src = baseImage;
    } else {
      drawText();
    }
  }, [top, bottom, bg, baseImage]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="mt">Title</Label>
        <Input id="mt" className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <canvas ref={canvasRef} width={640} height={640} className="w-full max-w-md rounded-[var(--radius-md)] border border-border" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="top">Top text</Label>
          <Input id="top" className="mt-1.5" value={top} onChange={(e) => setTop(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="bot">Bottom text</Label>
          <Input id="bot" className="mt-1.5" value={bottom} onChange={(e) => setBottom(e.target.value)} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Label htmlFor="bg">Field</Label>
        <input id="bg" type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
        <label className="text-sm text-muted-foreground">
          Upload
          <input
            type="file"
            accept="image/*"
            className="ml-2 text-xs"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const reader = new FileReader();
              reader.onload = () => {
                const canvas = canvasRef.current;
                if (!canvas || typeof reader.result !== "string") return;
                const img = new Image();
                img.onload = () => {
                  const ctx = canvas.getContext("2d");
                  if (!ctx) return;
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.src = reader.result;
              };
              reader.readAsDataURL(f);
            }}
          />
        </label>
      </div>
      <Button
        onClick={() => {
          const c = canvasRef.current;
          if (!c) return;
          onExport(c.toDataURL("image/jpeg", 0.82), title);
        }}
      >
        Use in mint
      </Button>
    </div>
  );
}
