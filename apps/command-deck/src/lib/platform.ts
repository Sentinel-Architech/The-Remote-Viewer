import { useEffect, useState } from "react";
import { create } from "zustand";

export const UHD_WIDTH = 3840;
export const UHD_HEIGHT = 2160;
export const UHD_PIXELS = UHD_WIDTH * UHD_HEIGHT;
const PREF_KEY = "trv-field-uhd-v1";

export type FieldQuality = {
  dpr: [number, number];
  pixelRatio: number;
  shadows: false | "percentage";
  shadowMap: number;
  stars: number;
  antialias: boolean;
  power: "default" | "high-performance" | "low-power";
  coarse: boolean;
  uhd: boolean;
  capable: boolean;
  pixels: number;
  texDir: "/textures" | "/textures/uhd";
};

const DESKTOP: FieldQuality = {
  dpr: [1, 1.75],
  pixelRatio: 1.75,
  shadows: "percentage",
  shadowMap: 1024,
  stars: 2200,
  antialias: true,
  power: "high-performance",
  coarse: false,
  uhd: false,
  capable: false,
  pixels: 1920 * 1080,
  texDir: "/textures",
};

type Conn = { saveData?: boolean; effectiveType?: string };

function connection(): Conn | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { connection?: Conn }).connection;
}

export function capPixelRatio(cssW: number, cssH: number, device: number, uhd: boolean) {
  const long = Math.max(cssW, cssH, 1);
  if (uhd) {
    return Math.max(1, Math.min(UHD_WIDTH / long, 3));
  }
  const d = Number.isFinite(device) && device > 0 ? device : 1;
  return Math.max(1, Math.min(d, 1920 / long, 1.75));
}

export function displayCapable(width = 0, height = 0, device = 1) {
  const long = Math.max(width, height) * Math.max(device, 1);
  return long >= 2560 || Math.max(width, height) >= 2560;
}

export function textureDir(uhd: boolean): FieldQuality["texDir"] {
  return uhd ? "/textures/uhd" : "/textures";
}

type QualityState = {
  forced: boolean | null;
  setForced: (v: boolean | null) => void;
  toggleUhd: () => void;
  hydrate: () => void;
};

function readForced(): boolean | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (raw === "1") return true;
    if (raw === "0") return false;
  } catch {
    /* blocked */
  }
  return null;
}

function writeForced(v: boolean | null) {
  try {
    if (v === null) localStorage.removeItem(PREF_KEY);
    else localStorage.setItem(PREF_KEY, v ? "1" : "0");
  } catch {
    /* blocked */
  }
}

export const useQualityPref = create<QualityState>((set, get) => ({
  forced: null,
  setForced: (forced) => {
    writeForced(forced);
    set({ forced });
  },
  toggleUhd: () => {
    const now = readFieldQuality(get().forced).uhd;
    writeForced(!now);
    set({ forced: !now });
  },
  hydrate: () => set({ forced: readForced() }),
}));

function resolveUhd(base: { capable: boolean; coarse: boolean; power: FieldQuality["power"] }, forced: boolean | null) {
  if (forced === true) return true;
  if (forced === false) return false;
  return base.capable && !base.coarse && base.power !== "low-power";
}

export function readFieldQuality(forced?: boolean | null): FieldQuality {
  if (typeof window === "undefined") return DESKTOP;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 700px)").matches;
  const short = window.matchMedia("(max-height: 520px)").matches;
  const conn = connection();
  const saveData = Boolean(conn?.saveData);
  const slow = conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g";
  const cores = navigator.hardwareConcurrency || 4;
  const low = coarse || saveData || slow || cores <= 4 || narrow || short;
  const cssW = window.innerWidth || 1280;
  const cssH = window.innerHeight || 800;
  const device = window.devicePixelRatio || 1;
  const capable = displayCapable(window.screen?.width || cssW, window.screen?.height || cssH, device);
  const want = forced === undefined ? useQualityPref.getState().forced : forced;
  const uhd = resolveUhd({ capable, coarse, power: low ? "low-power" : "high-performance" }, want);
  const pixelRatio = capPixelRatio(cssW, cssH, device, uhd);
  const pixels = Math.round(cssW * pixelRatio) * Math.round(cssH * pixelRatio);
  return {
    dpr: uhd ? [1, pixelRatio] : low ? [1, 1.25] : DESKTOP.dpr,
    pixelRatio,
    shadows: saveData || cores <= 2 ? false : "percentage",
    shadowMap: uhd ? 2048 : low ? 512 : 1024,
    stars: uhd ? 4800 : low ? 800 : DESKTOP.stars,
    antialias: uhd || !low,
    power: uhd ? "high-performance" : low ? "low-power" : "high-performance",
    coarse,
    uhd,
    capable,
    pixels,
    texDir: textureDir(uhd),
  };
}

export function hasWebGL() {
  if (typeof document === "undefined") return true;
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function useFieldQuality() {
  const forced = useQualityPref((s) => s.forced);
  const [q, setQ] = useState<FieldQuality>(() =>
    typeof window === "undefined" ? DESKTOP : readFieldQuality(readForced()),
  );
  useEffect(() => {
    useQualityPref.getState().hydrate();
  }, []);
  useEffect(() => {
    const apply = () => setQ(readFieldQuality());
    apply();
    const mq = [
      window.matchMedia("(pointer: coarse)"),
      window.matchMedia("(max-width: 700px)"),
      window.matchMedia("(max-height: 520px)"),
    ];
    mq.forEach((m) => m.addEventListener("change", apply));
    window.addEventListener("orientationchange", apply);
    window.addEventListener("resize", apply);
    return () => {
      mq.forEach((m) => m.removeEventListener("change", apply));
      window.removeEventListener("orientationchange", apply);
      window.removeEventListener("resize", apply);
    };
  }, [forced]);
  return q;
}
