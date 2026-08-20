export type ColorMap = "abyss" | "neural" | "thermal" | "frost" | "ion" | "ink";
export type RippleParams = {
  viscosity: number;
  waveStrength: number;
  colorMap: ColorMap;
  vortex: number;
};


export type RippleApi = {
  pointer: { x: number; y: number; down: boolean; px: number; py: number };
  setParams: (p: Partial<RippleParams>) => void;
  clear: () => void;
  addDrop: (x: number, y: number, s: number) => void;
  start: () => void;
  dispose: () => void;
  resize: () => void;
};

function mix3(a: number[], b: number[], t: number): [number, number, number] {
  const u = Math.max(0, Math.min(1, t));
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
}

const MAPS: Record<ColorMap, (t: number) => [number, number, number]> = {
  abyss: (t) => mix3([12, 14, 16], [210, 220, 214], t),
  neural: (t) => mix3([14, 22, 26], [198, 220, 224], t),
  thermal: (t) =>
    t < 0.55 ? mix3([18, 10, 10], [160, 70, 48], t / 0.55) : mix3([160, 70, 48], [235, 220, 200], (t - 0.55) / 0.45),
  frost: (t) => mix3([12, 18, 24], [220, 232, 236], t),
  ion: (t) => mix3([14, 22, 16], [204, 224, 210], t),
  ink: (t) => mix3([235, 235, 230], [16, 18, 20], t),
};

export class CpuEngine implements RippleApi {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  n = 96;
  curr: Float32Array;
  prev: Float32Array;
  params: RippleParams;
  pointer = { x: 0.5, y: 0.5, down: false, px: 0.5, py: 0.5 };
  raf = 0;
  disposed = false;
  last = 0;

  constructor(canvas: HTMLCanvasElement, params: RippleParams) {
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("2d");
    this.canvas = canvas;
    this.ctx = ctx;
    this.params = { ...params };
    this.curr = new Float32Array(this.n * this.n);
    this.prev = new Float32Array(this.n * this.n);
    this.resize();
  }

  setParams(p: Partial<RippleParams>) {
    Object.assign(this.params, p);
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, this.canvas.clientWidth);
    const h = Math.max(1, this.canvas.clientHeight);
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
  }

  clear() {
    this.curr.fill(0);
    this.prev.fill(0);
  }

  addDrop(uvx: number, uvy: number, strength: number) {
    const n = this.n;
    const cx = uvx * (n - 1);
    const cy = uvy * (n - 1);
    const rad = 2.2 + this.params.waveStrength * 3;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const d = Math.hypot(x - cx, y - cy);
        this.curr[y * n + x] += strength * Math.exp((-d * d) / (rad * rad));
      }
    }
  }

  start() {
    this.last = performance.now();
    const tick = (now: number) => {
      if (this.disposed) return;
      this.last = now;
      const n = this.n;
      const damping = 0.985 - this.params.viscosity * 0.06;

      if (this.pointer.down) {
        const dx = this.pointer.x - this.pointer.px;
        const dy = this.pointer.y - this.pointer.py;
        const steps = Math.max(1, Math.min(6, Math.ceil(Math.hypot(dx, dy) * 30)));
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          this.addDrop(
            this.pointer.px + dx * t,
            this.pointer.py + dy * t,
            (0.45 + this.params.waveStrength * 0.8) / steps,
          );
        }
        this.pointer.px = this.pointer.x;
        this.pointer.py = this.pointer.y;
      }

      const next = this.prev;
      for (let y = 1; y < n - 1; y++) {
        for (let x = 1; x < n - 1; x++) {
          const i = y * n + x;
          const h =
            ((this.curr[i - 1] ?? 0) +
              (this.curr[i + 1] ?? 0) +
              (this.curr[i - n] ?? 0) +
              (this.curr[i + n] ?? 0)) *
              0.5 -
            (this.prev[i] ?? 0);
          next[i] = h * damping;
        }
      }
      this.prev = this.curr;
      this.curr = next;

      const w = this.canvas.width;
      const hgt = this.canvas.height;
      const img = this.ctx.createImageData(w, hgt);
      const data = img.data;
      const map = MAPS[this.params.colorMap];
      const vortex = this.params.vortex;
      const time = now * 0.001;
      for (let py = 0; py < hgt; py += 2) {
        const v = py / hgt - 0.5;
        for (let px = 0; px < w; px += 2) {
          const u = px / w - 0.5;
          const rad = Math.hypot(u, v);
          const ang = vortex * (0.35 + rad * 1.8) + time * 0.08 * vortex;
          const c = Math.cos(ang);
          const s = Math.sin(ang);
          const qx = c * u - s * v + 0.5;
          const qy = s * u + c * v + 0.5;
          const gx = Math.max(1, Math.min(n - 2, qx * (n - 1)));
          const gy = Math.max(1, Math.min(n - 2, qy * (n - 1)));
          const x0 = gx | 0;
          const y0 = gy | 0;
          const fx = gx - x0;
          const fy = gy - y0;
          const s00 = this.curr[y0 * n + x0] ?? 0;
          const s10 = this.curr[y0 * n + x0 + 1] ?? 0;
          const s01 = this.curr[(y0 + 1) * n + x0] ?? 0;
          const s11 = this.curr[(y0 + 1) * n + x0 + 1] ?? 0;
          const h = s00 * (1 - fx) * (1 - fy) + s10 * fx * (1 - fy) + s01 * (1 - fx) * fy + s11 * fx * fy;
          const t = Math.max(0, Math.min(1, 0.38 + h * 1.9));
          const col = map(t);
          const vig = Math.max(0.28, 1 - rad * 1.1);
          const paint = (x: number, y: number) => {
            if (x >= w || y >= hgt) return;
            const o = (y * w + x) * 4;
            data[o] = col[0] * vig;
            data[o + 1] = col[1] * vig;
            data[o + 2] = col[2] * vig;
            data[o + 3] = 255;
          };
          paint(px, py);
          paint(px + 1, py);
          paint(px, py + 1);
          paint(px + 1, py + 1);
        }
      }
      this.ctx.putImageData(img, 0, 0);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
  }
}
