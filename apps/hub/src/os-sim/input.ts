import type { TouchAxes } from "./types";

const GAME_CODES = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyQ",
  "KeyE",
  "KeyF",
  "KeyR",
  "KeyC",
  "KeyK",
  "Space",
  "ControlLeft",
  "ControlRight",
  "ShiftLeft",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Escape",
  "Tab",
  "KeyP",
]);

export type Actions = {
  throttle: number;
  steer: number;
  rise: number;
  pitch: number;
  scan: boolean;
  pulse: boolean;
  pause: boolean;
  knowledge: boolean;
};

export type InputHandle = {
  update: () => Actions;
  consumePulse: () => boolean;
  consumePause: () => boolean;
  consumeKnowledge: () => boolean;
  setTouch: (t: Partial<TouchAxes>) => void;
  setPointerDelta: (x: number, y: number) => void;
  setSteerOverride: (v: number | null) => void;
  setKeysOverride: (codes: string[] | null) => void;
  dispose: () => void;
};

export function createInput(target: HTMLElement): InputHandle {
  const keys = new Set<string>();
  const touch: TouchAxes = { moveX: 0, moveY: 0, rise: 0, scan: false, pulse: false };
  let pointerDx = 0;
  let pointerDy = 0;
  let steerOverride: number | null = null;
  let keysOverride: string[] | null = null;
  let prevPulse = false;
  let prevPause = false;
  let prevKnow = false;
  let pulseEdge = false;
  let pauseEdge = false;
  let knowEdge = false;

  const onDown = (e: KeyboardEvent) => {
    if (e.repeat) {
      if (GAME_CODES.has(e.code)) e.preventDefault();
      return;
    }
    keys.add(e.code);
    if (GAME_CODES.has(e.code)) e.preventDefault();
  };
  const onUp = (e: KeyboardEvent) => {
    keys.delete(e.code);
  };
  const onBlur = () => keys.clear();

  window.addEventListener("keydown", onDown, { capture: true });
  window.addEventListener("keyup", onUp);
  window.addEventListener("blur", onBlur);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") keys.clear();
  });

  const onPointerDown = (e: PointerEvent) => {
    if (e.button === 0) keys.add("Mouse0");
    if (e.button === 2) keys.add("Mouse2");
  };
  const onPointerUp = (e: PointerEvent) => {
    if (e.button === 0) keys.delete("Mouse0");
    if (e.button === 2) keys.delete("Mouse2");
  };
  target.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointerup", onPointerUp);
  target.addEventListener("contextmenu", (e) => e.preventDefault());

  return {
    update() {
      const src = keysOverride ? new Set(keysOverride) : keys;
      const has = (c: string) => src.has(c);

      let throttle = 0;
      if (has("KeyW") || has("ArrowUp")) throttle += 1;
      if (has("KeyS") || has("ArrowDown")) throttle -= 1;
      throttle += -touch.moveY;
      throttle = Math.max(-1, Math.min(1, throttle));

      let steer = 0;
      if (has("KeyA") || has("ArrowLeft")) steer += 1;
      if (has("KeyD") || has("ArrowRight")) steer -= 1;
      steer += -touch.moveX;
      if (steerOverride !== null) steer = steerOverride;
      steer = Math.max(-1, Math.min(1, steer));

      let rise = 0;
      if (has("Space") || has("KeyR")) rise += 1;
      if (has("ControlLeft") || has("ControlRight") || has("KeyC") || has("ShiftLeft")) rise -= 1;
      rise += touch.rise;
      rise = Math.max(-1, Math.min(1, rise));

      let pitch = 0;
      if (has("KeyQ")) pitch += 1;
      if (has("KeyE")) pitch -= 1;
      pitch += -pointerDy * 0.045;
      pitch = Math.max(-1, Math.min(1, pitch));

      const scan = has("KeyF") || has("Mouse2") || touch.scan;
      const pulseHeld = has("Mouse0") || touch.pulse;
      const pauseHeld = has("Escape") || has("KeyP");
      const knowHeld = has("KeyK") || has("Tab");

      pulseEdge = pulseHeld && !prevPulse;
      pauseEdge = pauseHeld && !prevPause;
      knowEdge = knowHeld && !prevKnow;
      prevPulse = pulseHeld;
      prevPause = pauseHeld;
      prevKnow = knowHeld;

      pointerDx = 0;
      pointerDy = 0;
      if (touch.pulse) touch.pulse = false;

      return { throttle, steer, rise, pitch, scan, pulse: pulseHeld, pause: pauseHeld, knowledge: knowHeld };
    },
    consumePulse() {
      if (!pulseEdge) return false;
      pulseEdge = false;
      return true;
    },
    consumePause() {
      if (!pauseEdge) return false;
      pauseEdge = false;
      return true;
    },
    consumeKnowledge() {
      if (!knowEdge) return false;
      knowEdge = false;
      return true;
    },
    setTouch(t) {
      Object.assign(touch, t);
    },
    setPointerDelta(x, y) {
      pointerDx += x;
      pointerDy += y;
    },
    setSteerOverride(v) {
      steerOverride = v;
    },
    setKeysOverride(codes) {
      keysOverride = codes;
    },
    dispose() {
      window.removeEventListener("keydown", onDown, { capture: true } as AddEventListenerOptions);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
      target.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
    },
  };
}
