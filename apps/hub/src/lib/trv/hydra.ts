import { coarsen } from "./content";

export const HYDRA_CATEGORIES = [
  { id: "sa", label: "Suspected sexual assault" },
  { id: "child_harm", label: "Harm against a child / innocent" },
  { id: "trafficking", label: "Trafficking" },
  { id: "violence", label: "Violence against innocents" },
  { id: "ncii", label: "Non-consensual intimate imagery" },
] as const;

export type HydraCategory = (typeof HYDRA_CATEGORIES)[number]["id"];

export function emergencyForRegion(hint: string | null): {
  emergency: string;
  emergencyTel: string;
  saName: string;
  saTel: string;
  saDisplay: string;
  note: string;
} {
  const h = (hint || "").toLowerCase();
  if (/\bunited kingdom\b|\buk\b|\bengland\b|\bscotland\b|\bwales\b/.test(h)) {
    return {
      emergency: "999",
      emergencyTel: "999",
      saName: "UK 999 / 101",
      saTel: "999",
      saDisplay: "999",
      note: "UK emergency 999. Non-emergency 101.",
    };
  }
  if (/\bcanada\b/.test(h)) {
    return {
      emergency: "911",
      emergencyTel: "911",
      saName: "Talk to 911 / local victim services",
      saTel: "911",
      saDisplay: "911",
      note: "Canada emergency 911.",
    };
  }
  return {
    emergency: "911",
    emergencyTel: "911",
    saName: "RAINN National Sexual Assault Hotline",
    saTel: "18006564673",
    saDisplay: "1-800-656-4673",
    note: "If anyone is in immediate danger, call 911 now. TRV cannot place that call for you.",
  };
}

export function packetText(p: {
  address: string;
  category: string;
  summary: string;
  hash: string | null;
  includeCoords: boolean;
  lat?: number | null;
  lng?: number | null;
  region?: string | null;
  at: string;
}): string {
  const loc = p.includeCoords && p.lat != null && p.lng != null
    ? `${coarsen(p.lat)}, ${coarsen(p.lng)}${p.region ? ` (${p.region})` : ""}`
    : "WITHHELD — reporter identity is the chain address only";
  return [
    "HYDRA PROTOCOL // SENTINEL OS",
    `Address: ${p.address}`,
    `Category: ${p.category}`,
    `Filed: ${p.at}`,
    `Location for authorities: ${loc}`,
    `Evidence hash (redacted original stays on device): ${p.hash || "none"}`,
    `Summary: ${p.summary}`,
    "Outbound copy is censored. Original seal remains in local M-o-E.",
  ].join("\n");
}

export async function hashText(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Mosaic the bitmap so the copy that leaves the device is censored. */
export function censorDataUrl(dataUrl: string, block = 16): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = 320;
      const h = Math.max(1, Math.round((img.height / img.width) * w));
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.imageSmoothingEnabled = false;
      const dw = Math.max(1, Math.floor(w / block));
      const dh = Math.max(1, Math.floor(h / block));
      ctx.drawImage(img, 0, 0, dw, dh);
      ctx.drawImage(c, 0, 0, dw, dh, 0, 0, w, h);
      resolve(c.toDataURL("image/jpeg", 0.4));
    };
    img.onerror = () => reject(new Error("Censor failed"));
    img.src = dataUrl;
  });
}
