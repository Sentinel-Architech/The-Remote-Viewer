import { useEffect, useState } from "react";

export type FieldQuality = {
  dpr: [number, number];
  shadows: false | "percentage";
  stars: number;
  antialias: boolean;
  power: "default" | "high-performance" | "low-power";
  coarse: boolean;
};

const DESKTOP: FieldQuality = {
  dpr: [1, 1.75],
  shadows: "percentage",
  stars: 2200,
  antialias: true,
  power: "high-performance",
  coarse: false,
};

type Conn = { saveData?: boolean; effectiveType?: string };

function connection(): Conn | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { connection?: Conn }).connection;
}

export function readFieldQuality(): FieldQuality {
  if (typeof window === "undefined") return DESKTOP;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 700px)").matches;
  const short = window.matchMedia("(max-height: 520px)").matches;
  const conn = connection();
  const saveData = Boolean(conn?.saveData);
  const slow = conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g";
  const cores = navigator.hardwareConcurrency || 4;
  const low = coarse || saveData || slow || cores <= 4 || narrow || short;
  return {
    dpr: low ? [1, 1.25] : DESKTOP.dpr,
    shadows: saveData || cores <= 2 ? false : "percentage",
    stars: low ? 800 : DESKTOP.stars,
    antialias: !low,
    power: low ? "low-power" : "high-performance",
    coarse,
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
  const [q, setQ] = useState<FieldQuality>(DESKTOP);
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
    return () => {
      mq.forEach((m) => m.removeEventListener("change", apply));
      window.removeEventListener("orientationchange", apply);
    };
  }, []);
  return q;
}
