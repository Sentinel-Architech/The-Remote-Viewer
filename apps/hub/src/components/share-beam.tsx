import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { THEME_PRESETS, parseTheme, type ViewerTheme } from "@/lib/trv/themes";

type NDEFWriter = {
  write: (data: { records: { recordType: string; data: string }[] }) => Promise<void>;
};

function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function ShareBeam({
  value,
  label,
  theme,
}: {
  value: string;
  label: string;
  theme?: ViewerTheme | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nfcOn, setNfcOn] = useState(false);
  const t = theme ?? parseTheme(null);
  const palette = THEME_PRESETS[t.preset];
  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const qr = useMemo(() => QRCode.create(value, { errorCorrectionLevel: "H" }), [value]);

  useEffect(() => {
    let raf = 0;
    let dead = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const SIZE = 1024;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const dark = hexRgb(palette.bg);
    const light = hexRgb(palette.fg);
    const accent = hexRgb(t.accent);
    const n = qr.modules.size;
    const pad = 48;
    const cell = (SIZE - pad * 2) / n;
    const get = (r: number, c: number) => {
      const m = qr.modules as unknown as { get: (row: number, col: number) => number | boolean };
      return Boolean(m.get(r, c));
    };

    const tick = (ts: number) => {
      if (dead) return;
      const phase = reduced ? 0 : (ts / 900) % (Math.PI * 2);
      ctx.fillStyle = `rgb(${light.join(",")})`;
      ctx.fillRect(0, 0, SIZE, SIZE);

      const cx = SIZE / 2;
      const cy = SIZE / 2;
      const glow = 0.35 + 0.2 * Math.sin(phase);
      const g = ctx.createRadialGradient(cx, cy, SIZE * 0.12, cx, cy, SIZE * 0.55);
      g.addColorStop(0, `rgba(${accent.join(",")},${0.18 + glow * 0.12})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, SIZE, SIZE);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(reduced ? 0 : phase * 0.08);
      ctx.strokeStyle = `rgba(${accent.join(",")},0.55)`;
      ctx.lineWidth = 6;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, SIZE * 0.46 - i * 14, i, Math.PI * 1.4 + i);
        ctx.stroke();
      }
      ctx.restore();

      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (!get(r, c)) continue;
          const finder = (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
          const pulse = finder ? 1 + 0.08 * Math.sin(phase + r * 0.2) : 1;
          const x = pad + c * cell;
          const y = pad + r * cell;
          const s = cell * 0.86 * pulse;
          const inset = (cell - s) / 2;
          ctx.fillStyle = finder ? `rgb(${accent.join(",")})` : `rgb(${dark.join(",")})`;
          ctx.fillRect(x + inset, y + inset, s, s);
        }
      }

      const eye = cell * 5;
      ctx.fillStyle = `rgb(${accent.join(",")})`;
      ctx.beginPath();
      ctx.ellipse(cx, cy, eye * 0.7, eye * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgb(${dark.join(",")})`;
      ctx.beginPath();
      ctx.arc(cx + Math.sin(phase) * 6, cy, eye * 0.22, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
    };
  }, [qr, palette, t.accent, reduced]);

  async function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `trv-${label.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    a.click();
  }

  async function beamNfc() {
    const Ctor = (window as unknown as { NDEFReader?: new () => NDEFWriter }).NDEFReader;
    if (!Ctor) {
      toast.error("Web NFC is Chrome on Android only. Use the QR or copy the link.");
      return;
    }
    try {
      const ndef = new Ctor();
      await ndef.write({ records: [{ recordType: "url", data: value }] });
      setNfcOn(true);
      toast.success("NFC wrote this payload. Tap phones back-to-back.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "NFC write failed");
    }
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="w-full rounded-[var(--radius-md)]"
        style={{ imageRendering: "auto" }}
        aria-label={`${label} animated QR`}
      />
      <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">{value}</p>
      <div className="mt-3 grid gap-2">
        <Button
          className="w-full"
          variant="secondary"
          onClick={() => {
            void navigator.clipboard.writeText(value);
            toast.success("Copied");
          }}
        >
          Copy {label}
        </Button>
        <Button className="w-full" variant="secondary" onClick={() => void download()}>
          Download 1024² PNG
        </Button>
        <Button className="w-full" onClick={() => void beamNfc()}>
          {nfcOn ? "NFC written" : "Beam via NFC"}
        </Button>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        NFC writes a URL/text NDEF record (Chrome Android). Seeds, ID photos, and
        large files never ride NFC — beam the link, not the vault.
      </p>
    </div>
  );
}
