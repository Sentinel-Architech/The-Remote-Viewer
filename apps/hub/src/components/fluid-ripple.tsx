import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { CpuEngine, type RippleApi } from "./cpu-ripple";

export const COLOR_MAPS = ["abyss", "neural", "thermal", "frost", "ion", "ink"] as const;
export type ColorMap = (typeof COLOR_MAPS)[number];

export type RippleParams = {
  viscosity: number;
  waveStrength: number;
  colorMap: ColorMap;
  vortex: number;
};

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const SIM_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uState;
uniform vec2 uTexel;
uniform float uDamping;
void main() {
  vec2 uv = clamp(vUv, uTexel, 1.0 - uTexel);
  vec4 c = texture2D(uState, uv);
  float h = c.r;
  float prev = c.g;
  float l = texture2D(uState, uv - vec2(uTexel.x, 0.0)).r;
  float r = texture2D(uState, uv + vec2(uTexel.x, 0.0)).r;
  float t = texture2D(uState, uv + vec2(0.0, uTexel.y)).r;
  float b = texture2D(uState, uv - vec2(0.0, uTexel.y)).r;
  float next = (l + r + t + b) * 0.5 - prev;
  next = 0.5 + (next - 0.5) * uDamping;
  gl_FragColor = vec4(next, h, 0.0, 1.0);
}
`;

const DROP_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uState;
uniform vec2 uCenter;
uniform float uStrength;
uniform float uRadius;
void main() {
  vec4 s = texture2D(uState, vUv);
  vec2 d = (vUv - uCenter);
  d.x *= 1.6;
  float dist = length(d);
  float bump = uStrength * exp(-dist * dist / uRadius);
  gl_FragColor = vec4(s.r + bump, s.g, 0.0, 1.0);
}
`;

const RENDER_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uState;
uniform vec2 uTexel;
uniform float uVortex;
uniform float uTime;
uniform float uMap;
vec3 colormap(float t, float m) {
  t = clamp(t, 0.0, 1.0);
  if (m < 0.5) return mix(vec3(0.03, 0.035, 0.04), vec3(0.82, 0.86, 0.84), t);
  if (m < 1.5) return mix(vec3(0.05, 0.08, 0.1), vec3(0.78, 0.86, 0.88), t);
  if (m < 2.5) return mix(mix(vec3(0.05, 0.03, 0.03), vec3(0.45, 0.18, 0.12), t), vec3(0.92, 0.86, 0.78), smoothstep(0.55, 1.0, t));
  if (m < 3.5) return mix(vec3(0.04, 0.07, 0.1), vec3(0.86, 0.91, 0.93), t);
  if (m < 4.5) return mix(vec3(0.05, 0.08, 0.06), vec3(0.8, 0.88, 0.82), t);
  return mix(vec3(0.92, 0.92, 0.9), vec3(0.06, 0.07, 0.08), t);
}
void main() {
  vec2 p = vUv - 0.5;
  float rad = length(p);
  float ang = uVortex * (0.35 + rad * 1.8) + uTime * 0.08 * uVortex;
  float c = cos(ang);
  float s = sin(ang);
  vec2 q = vec2(c * p.x - s * p.y, s * p.x + c * p.y) + 0.5;
  q = clamp(q, uTexel, 1.0 - uTexel);
  float h = texture2D(uState, q).r - 0.5;
  float nL = texture2D(uState, q - vec2(uTexel.x, 0.0)).r;
  float nR = texture2D(uState, q + vec2(uTexel.x, 0.0)).r;
  float nT = texture2D(uState, q + vec2(0.0, uTexel.y)).r;
  float nB = texture2D(uState, q - vec2(0.0, uTexel.y)).r;
  vec3 n = normalize(vec3((nL - nR) * 4.0, (nB - nT) * 4.0, 0.35));
  float spec = pow(max(dot(n, normalize(vec3(-0.3, 0.5, 0.8))), 0.0), 28.0);
  float t = clamp(0.5 + h * 3.4, 0.0, 1.0);
  vec3 col = colormap(t, uMap);
  col += spec * 0.45;
  float vig = smoothstep(1.15, 0.25, rad * 1.6);
  gl_FragColor = vec4(col * vig, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type);
  if (!sh) throw new Error("shader");
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(log || "compile");
  }
  return sh;
}

function program(gl: WebGLRenderingContext, vs: string, fs: string): WebGLProgram {
  const p = gl.createProgram();
  if (!p) throw new Error("program");
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(p, 0, "aPos");
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || "link");
  return p;
}

function makeTarget(gl: WebGLRenderingContext, size: number) {
  const tex = gl.createTexture();
  if (!tex) throw new Error("tex");
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    data[i * 4] = 128;
    data[i * 4 + 1] = 128;
    data[i * 4 + 3] = 255;
  }
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  const fbo = gl.createFramebuffer();
  if (!fbo) throw new Error("fbo");
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  return { tex, fbo };
}

type Target = ReturnType<typeof makeTarget>;

const MAP_INDEX: Record<ColorMap, number> = {
  abyss: 0,
  neural: 1,
  thermal: 2,
  frost: 3,
  ion: 4,
  ink: 5,
};

class RippleEngine {
  gl: WebGLRenderingContext;
  canvas: HTMLCanvasElement;
  size = 256;
  sim: WebGLProgram;
  drop: WebGLProgram;
  render: WebGLProgram;
  read: Target;
  write: Target;
  buf: WebGLBuffer;
  params: RippleParams;
  last = 0;
  pointer = { x: 0.5, y: 0.5, down: false, px: 0.5, py: 0.5 };
  raf = 0;
  disposed = false;
  reduced: boolean;

  constructor(canvas: HTMLCanvasElement, params: RippleParams) {
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: false, antialias: false });
    if (!gl) throw new Error("webgl");
    this.gl = gl;
    this.canvas = canvas;
    this.params = { ...params };
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.sim = program(gl, VERT, SIM_FRAG);
    this.drop = program(gl, VERT, DROP_FRAG);
    this.render = program(gl, VERT, RENDER_FRAG);
    this.read = makeTarget(gl, this.size);
    this.write = makeTarget(gl, this.size);
    const buf = gl.createBuffer();
    if (!buf) throw new Error("buf");
    this.buf = buf;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    this.resize();
  }

  swap() {
    const t = this.read;
    this.read = this.write;
    this.write = t;
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, this.canvas.clientWidth);
    const h = Math.max(1, this.canvas.clientHeight);
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  setParams(p: Partial<RippleParams>) {
    Object.assign(this.params, p);
  }

  clear() {
    const gl = this.gl;
    for (const t of [this.read, this.write]) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
      gl.viewport(0, 0, this.size, this.size);
      gl.clearColor(0.5, 0.5, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  blit(prog: WebGLProgram, setup: (gl: WebGLRenderingContext) => void) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.write.fbo);
    gl.viewport(0, 0, this.size, this.size);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.read.tex);
    setup(gl);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.swap();
  }

  addDrop(uvx: number, uvy: number, strength: number) {
    this.blit(this.drop, (gl) => {
      gl.uniform1i(gl.getUniformLocation(this.drop, "uState"), 0);
      gl.uniform2f(gl.getUniformLocation(this.drop, "uCenter"), uvx, 1 - uvy);
      gl.uniform1f(gl.getUniformLocation(this.drop, "uStrength"), strength);
      gl.uniform1f(gl.getUniformLocation(this.drop, "uRadius"), 0.012 + this.params.waveStrength * 0.02);
    });
  }

  step(now: number) {
    if (this.disposed) return;
    this.last = now;
    const gl = this.gl;
    const damping = 0.994 - this.params.viscosity * 0.07;

    if (this.pointer.down) {
      const dx = this.pointer.x - this.pointer.px;
      const dy = this.pointer.y - this.pointer.py;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.min(8, Math.ceil(dist * 40)));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        this.addDrop(
          this.pointer.px + dx * t,
          this.pointer.py + dy * t,
          (0.08 + this.params.waveStrength * 0.22) / steps,
        );
      }
      this.pointer.px = this.pointer.x;
      this.pointer.py = this.pointer.y;
    }

    if (!this.reduced) {
      this.blit(this.sim, (g) => {
        g.uniform1i(g.getUniformLocation(this.sim, "uState"), 0);
        g.uniform2f(g.getUniformLocation(this.sim, "uTexel"), 1 / this.size, 1 / this.size);
        g.uniform1f(g.getUniformLocation(this.sim, "uDamping"), damping);
      });
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.render);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.read.tex);
    gl.uniform1i(gl.getUniformLocation(this.render, "uState"), 0);
    gl.uniform2f(gl.getUniformLocation(this.render, "uTexel"), 1 / this.size, 1 / this.size);
    gl.uniform1f(gl.getUniformLocation(this.render, "uVortex"), this.params.vortex);
    gl.uniform1f(gl.getUniformLocation(this.render, "uTime"), now * 0.001);
    gl.uniform1f(gl.getUniformLocation(this.render, "uMap"), MAP_INDEX[this.params.colorMap]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.raf = requestAnimationFrame((t) => this.step(t));
  }

  start() {
    this.last = performance.now();
    this.raf = requestAnimationFrame((t) => this.step(t));
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    const gl = this.gl;
    gl.deleteProgram(this.sim);
    gl.deleteProgram(this.drop);
    gl.deleteProgram(this.render);
    gl.deleteBuffer(this.buf);
    for (const t of [this.read, this.write]) {
      gl.deleteTexture(t.tex);
      gl.deleteFramebuffer(t.fbo);
    }
  }
}

export function FluidRipple({
  className,
  viscosity,
  waveStrength,
  colorMap,
  vortex,
  interactive = true,
  onReady,
}: RippleParams & {
  className?: string;
  interactive?: boolean;
  onReady?: (api: { clear: () => void; drop: (x: number, y: number, s: number) => void }) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const engine = useRef<RippleApi | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const eng: RippleApi = new CpuEngine(canvas, { viscosity, waveStrength, colorMap, vortex });
    engine.current = eng;
    const onResize = () => eng.resize();
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);
    requestAnimationFrame(onResize);

    const uvFromEvent = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    };

    const down = (e: PointerEvent) => {
      if (!interactive) return;
      canvas.setPointerCapture(e.pointerId);
      const uv = uvFromEvent(e);
      eng.pointer = { ...uv, down: true, px: uv.x, py: uv.y };
      eng.addDrop(uv.x, uv.y, 0.14 + waveStrength * 0.2);
    };
    const move = (e: PointerEvent) => {
      if (!interactive) return;
      const uv = uvFromEvent(e);
      eng.pointer.x = uv.x;
      eng.pointer.y = uv.y;
    };
    const up = () => {
      eng.pointer.down = false;
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("pointerleave", up);

    onReady?.({
      clear: () => eng.clear(),
      drop: (x, y, s) => eng.addDrop(x, y, s),
    });
    eng.start();
    for (let i = 0; i < 6; i++) {
      eng.addDrop(0.2 + Math.random() * 0.6, 0.2 + Math.random() * 0.6, 0.9);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("pointerleave", up);
      eng.dispose();
      engine.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engine.current?.setParams({ viscosity, waveStrength, colorMap, vortex });
  }, [viscosity, waveStrength, colorMap, vortex]);

  return (
    <canvas
      ref={ref}
      className={cn("h-full w-full touch-none", className)}
      style={{ display: "block" }}
    />
  );
}
