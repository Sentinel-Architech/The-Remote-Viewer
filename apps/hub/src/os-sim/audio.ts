type AudioHandle = {
  unlock: () => void;
  setMuted: (v: boolean) => void;
  setMaster: (v: number) => void;
  playComms: () => void;
  playScanTick: () => void;
  playPulse: () => void;
  playHit: () => void;
  playNeutralize: () => void;
  playAutoHeal: () => void;
  playIdentify: () => void;
  playAlarm: () => void;
  playJackIn: () => void;
  setProximity: (v: number) => void;
  dispose: () => void;
};

function env(ctx: AudioContext, gain: GainNode, t: number, a: number, d: number) {
  const g = gain.gain;
  g.cancelScheduledValues(t);
  g.setValueAtTime(0.0001, t);
  g.exponentialRampToValueAtTime(a, t + 0.012);
  g.exponentialRampToValueAtTime(0.0001, t + d);
}

export function createAudio(): AudioHandle {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let music: GainNode | null = null;
  let sfx: GainNode | null = null;
  let muted = false;
  let masterVal = 0.7;
  let proximity = 0;
  let heart: { osc: OscillatorNode; gain: GainNode } | null = null;
  const nodes: AudioNode[] = [];

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC({ latencyHint: "interactive" });
    master = ctx.createGain();
    music = ctx.createGain();
    sfx = ctx.createGain();
    music.gain.value = 0.22;
    sfx.gain.value = 0.8;
    master.gain.value = muted ? 0 : masterVal * masterVal;
    music.connect(master);
    sfx.connect(master);
    master.connect(ctx.destination);
    startDrone();
    startHeart();
    return ctx;
  }

  function startDrone() {
    if (!ctx || !music) return;
    const make = (freq: number, type: OscillatorType, detune: number) => {
      const osc = ctx!.createOscillator();
      const g = ctx!.createGain();
      const f = ctx!.createBiquadFilter();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      f.type = "bandpass";
      f.frequency.value = 220;
      f.Q.value = 3.2;
      g.gain.value = 0.18;
      osc.connect(f);
      f.connect(g);
      g.connect(music!);
      osc.start();
      nodes.push(osc, g, f);
      return { osc, f };
    };
    const a = make(55, "sine", 0);
    const b = make(82, "triangle", 7);
    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.frequency.value = 0.07;
    lfoG.gain.value = 40;
    lfo.connect(lfoG);
    lfoG.connect(a.f.frequency);
    lfo.start();
    nodes.push(lfo, lfoG, b.osc);
  }

  function startHeart() {
    if (!ctx || !sfx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 48;
    g.gain.value = 0.0001;
    osc.connect(g);
    g.connect(sfx);
    osc.start();
    heart = { osc, gain: g };
    nodes.push(osc, g);
  }

  function beep(freq: number, dur: number, type: OscillatorType, gain = 0.18, slide?: number) {
    const c = ensure();
    if (!sfx || muted) return;
    const t = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t + dur);
    osc.connect(g);
    g.connect(sfx);
    env(c, g, t, gain, dur);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function noiseBurst(dur: number, gain = 0.08, freq = 1400) {
    const c = ensure();
    if (!sfx || muted) return;
    const n = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = n;
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = 4;
    const g = c.createGain();
    src.connect(f);
    f.connect(g);
    g.connect(sfx);
    const t = c.currentTime;
    env(c, g, t, gain, dur);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  function applyMaster() {
    if (!master || !ctx) return;
    const v = muted ? 0 : masterVal * masterVal;
    master.gain.setTargetAtTime(v, ctx.currentTime, 0.04);
  }

  return {
    unlock() {
      const c = ensure();
      if (c.state === "suspended") void c.resume();
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && ctx?.state === "suspended") void ctx.resume();
      });
    },
    setMuted(v) {
      muted = v;
      applyMaster();
    },
    setMaster(v) {
      masterVal = v;
      applyMaster();
    },
    playComms() {
      noiseBurst(0.09, 0.07, 1800);
      beep(920, 0.07, "sine", 0.05);
    },
    playScanTick() {
      beep(640 + Math.random() * 80, 0.05, "sine", 0.04);
    },
    playPulse() {
      beep(220, 0.18, "sawtooth", 0.16, 90);
      noiseBurst(0.12, 0.06, 400);
    },
    playHit() {
      beep(160, 0.12, "square", 0.1, 70);
    },
    playNeutralize() {
      beep(330, 0.28, "sine", 0.12, 660);
      beep(495, 0.32, "sine", 0.08, 880);
      noiseBurst(0.2, 0.05, 900);
    },
    playAutoHeal() {
      beep(520, 0.22, "sine", 0.1, 780);
      beep(780, 0.28, "sine", 0.07);
    },
    playIdentify() {
      beep(440, 0.12, "sine", 0.1);
      beep(660, 0.16, "sine", 0.08);
      beep(880, 0.22, "sine", 0.06);
    },
    playAlarm() {
      beep(240, 0.4, "triangle", 0.12, 140);
    },
    playJackIn() {
      beep(110, 0.5, "sine", 0.14, 440);
      noiseBurst(0.3, 0.05, 600);
    },
    setProximity(v) {
      proximity = Math.max(0, Math.min(1, v));
      if (!heart || !ctx) return;
      const g = 0.0001 + proximity * proximity * 0.12;
      heart.gain.gain.setTargetAtTime(g, ctx.currentTime, 0.08);
      heart.osc.frequency.setTargetAtTime(42 + proximity * 36, ctx.currentTime, 0.1);
    },
    dispose() {
      try {
        void ctx?.close();
      } catch {
        /* */
      }
      ctx = null;
      heart = null;
    },
  };
}
