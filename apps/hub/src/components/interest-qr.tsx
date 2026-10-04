"use client";

import { useEffect, useMemo, useRef } from "react";
import QRCode from "qrcode";
import { IN_APP_TOKEN_NAME, signatureLine, type QrStyle } from "@/lib/trv/viewer-locks";

export function InterestQr({
  value,
  handle,
  interests,
  style,
}: {
  value: string;
  handle: string;
  interests: string[];
  style: QrStyle;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qr = useMemo(() => QRCode.create(value, { errorCorrectionLevel: "M" }), [value]);
  const signed = signatureLine(handle);
  const words = interests.length > 0 ? interests : ["No interests written on this handle"];
  const holographic = style === "holographic";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    let dead = false;
    const size = 720;
    canvas.width = size;
    canvas.height = size;
    const modules = qr.modules;
    const n = modules.size;
    const pad = 72;
    const cell = (size - pad * 2) / n;
    const read = (row: number, col: number) => {
      const grid = modules as unknown as { get: (r: number, c: number) => boolean | number };
      return Boolean(grid.get(row, col));
    };

    const draw = (ts: number) => {
      if (dead) return;
      const phase = ts / 700;
      ctx.fillStyle = "#f4f1ea";
      ctx.fillRect(0, 0, size, size);
      if (holographic) {
        const hue = (ts / 40) % 360;
        ctx.strokeStyle = `hsl(${hue} 70% 45%)`;
        ctx.lineWidth = 10;
        ctx.strokeRect(18, 18, size - 36, size - 36);
      } else {
        ctx.strokeStyle = "#1c1f1a";
        ctx.lineWidth = 4;
        ctx.strokeRect(24, 24, size - 48, size - 48);
      }
      for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
          if (!read(row, col)) continue;
          ctx.fillStyle = "#12140f";
          const inset = cell * 0.08;
          ctx.fillRect(pad + col * cell + inset, pad + row * cell + inset, cell - inset * 2, cell - inset * 2);
        }
      }
      const word = words[Math.floor(phase) % words.length] ?? words[0];
      ctx.fillStyle = holographic ? `hsl(${(ts / 30) % 360} 65% 32%)` : "#1c1f1a";
      ctx.font = "28px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(word, size / 2, size - 28);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      dead = true;
      cancelAnimationFrame(frame);
    };
  }, [qr, holographic, words]);

  return (
    <figure className="space-y-2">
      <canvas ref={canvasRef} className="w-full rounded-[var(--radius-md)] bg-[#f4f1ea]" aria-label={`${signed} interest QR`} />
      <figcaption className="text-sm text-muted-foreground">
        Signed by {signed}. {holographic ? "Holographic" : "Plain"} animated interests. An accepted scan can note {IN_APP_TOKEN_NAME}. That token is a simulation for exclusive in-app customizations only. It is not money, not crypto, and not on Solana.
      </figcaption>
    </figure>
  );
}
