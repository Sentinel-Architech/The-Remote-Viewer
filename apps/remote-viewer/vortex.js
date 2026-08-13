/**
 * High-resolution vortex transition + synthesized vortex sound.
 * Device-pixel-ratio aware canvas. No external media files.
 */

let audioCtx = null;
let running = false;

function getAudioCtx() {
  if (audioCtx) return audioCtx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  audioCtx = new AC();
  return audioCtx;
}

/** Synthesized vortex / whoosh — descending noise + spiral tone */
export function playVortexSound(durationMs = 720) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  const dur = durationMs / 1000;

  // Noise buffer (vortex air)
  const len = Math.floor(ctx.sampleRate * dur);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t = i / len;
    const env = Math.sin(Math.PI * t) * (1 - t * 0.35);
    data[i] = (Math.random() * 2 - 1) * env * 0.55;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(900, now);
  noiseFilter.frequency.exponentialRampToValueAtTime(180, now + dur);
  noiseFilter.Q.value = 0.9;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.35, now + 0.05);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + dur + 0.02);

  // Spiral tone
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(420, now);
  osc.frequency.exponentialRampToValueAtTime(70, now + dur);
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.0001, now);
  oscGain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + dur + 0.02);

  // Soft sub thump
  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(55, now);
  sub.frequency.exponentialRampToValueAtTime(28, now + dur * 0.6);
  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0.0001, now);
  subGain.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
  subGain.gain.exponentialRampToValueAtTime(0.0001, now + dur * 0.7);
  sub.connect(subGain);
  subGain.connect(ctx.destination);
  sub.start(now);
  sub.stop(now + dur);
}

/**
 * Full-viewport high-DPI vortex animation, then runs onDone.
 * @param {() => void} [onDone]
 * @param {{ duration?: number, playSound?: boolean }} [opts]
 */
export function playVortexTransition(onDone, opts = {}) {
  const duration = opts.duration ?? 700;
  const playSound = opts.playSound !== false;

  if (running) {
    if (typeof onDone === 'function') onDone();
    return;
  }
  running = true;

  if (playSound) playVortexSound(duration);

  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const overlay = document.createElement('div');
  overlay.id = 'vortex-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:100000;pointer-events:none;background:transparent;';

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  overlay.appendChild(canvas);
  document.body.appendChild(overlay);

  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  const ctx = canvas.getContext('2d', { alpha: true });
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.hypot(w, h) * 0.72;
  const arms = 5;
  const start = performance.now();

  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    // Ease in-out cubic
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    ctx.clearRect(0, 0, w, h);

    // Dark veil
    ctx.fillStyle = `rgba(4, 8, 14, ${0.15 + e * 0.55})`;
    ctx.fillRect(0, 0, w, h);

    const rot = e * Math.PI * 3.2;
    const pull = e * e;

    for (let a = 0; a < arms; a++) {
      const base = (a / arms) * Math.PI * 2 + rot;
      ctx.beginPath();
      for (let i = 0; i <= 90; i++) {
        const p = i / 90;
        const r = maxR * (1 - pull * 0.92) * p + 4;
        const ang = base + p * Math.PI * 2.4 * (0.4 + e);
        const x = cx + Math.cos(ang) * r;
        const y = cy + Math.sin(ang) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      const g = ctx.createLinearGradient(cx, cy, cx + maxR, cy);
      g.addColorStop(0, `rgba(46, 230, 197, ${0.55 * (1 - e * 0.3)})`);
      g.addColorStop(0.45, `rgba(110, 182, 255, ${0.35 * (1 - e * 0.2)})`);
      g.addColorStop(1, 'rgba(4, 8, 14, 0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 3.2 + (1 - e) * 4;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Core glow
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40 + e * 80);
    core.addColorStop(0, `rgba(184, 255, 232, ${0.55 * (1 - e)})`);
    core.addColorStop(0.4, `rgba(46, 230, 197, ${0.25 * (1 - e)})`);
    core.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, 120, 0, Math.PI * 2);
    ctx.fill();

    // Particle sparks
    const n = 48;
    for (let i = 0; i < n; i++) {
      const seed = i * 1.7 + e * 6;
      const ang = seed + rot * 1.3;
      const r = maxR * (0.15 + (i / n) * 0.85) * (1 - pull * 0.85);
      const x = cx + Math.cos(ang) * r;
      const y = cy + Math.sin(ang) * r;
      const alpha = (1 - e) * (0.35 + (i % 5) * 0.08);
      ctx.fillStyle = i % 2 === 0 ? `rgba(93,255,192,${alpha})` : `rgba(110,182,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.2 + (i % 3) * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      overlay.remove();
      running = false;
      if (typeof onDone === 'function') onDone();
    }
  }

  requestAnimationFrame(frame);
}

/** Switch UI after vortex midpoint for snappier feel */
export function vortexThen(switchFn, opts = {}) {
  const duration = opts.duration ?? 700;
  const mid = Math.floor(duration * 0.42);
  let switched = false;

  const timer = setTimeout(() => {
    switched = true;
    if (typeof switchFn === 'function') switchFn();
  }, mid);

  playVortexTransition(() => {
    if (!switched) {
      clearTimeout(timer);
      if (typeof switchFn === 'function') switchFn();
    }
  }, opts);
}
