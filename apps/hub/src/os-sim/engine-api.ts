import type { TouchAxes } from "./types";

export type EngineHandle = {
  dispose: () => void;
  startMission: () => void;
  pause: () => void;
  resume: () => void;
  setTouch: (t: Partial<TouchAxes>) => void;
  applySettings: () => void;
};

let current: EngineHandle | null = null;

export function setEngine(handle: EngineHandle | null) {
  current = handle;
}

export function getEngine() {
  return current;
}
