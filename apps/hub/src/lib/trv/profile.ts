import type { ProfileLink } from "./types";

export const DOC_KINDS = ["note", "receipt", "contract", "image", "other"] as const;
export type DocKind = (typeof DOC_KINDS)[number];

export const DOC_KIND_LABEL: Record<DocKind, string> = {
  note: "Note",
  receipt: "Receipt",
  contract: "Contract",
  image: "Image",
  other: "File",
};

export function sanitizeHttps(url: string): string {
  const t = url.trim();
  if (!t) return "";
  try {
    const u = new URL(t.includes("://") ? t : `https://${t}`);
    if (u.protocol !== "https:") return "";
    return u.toString().slice(0, 200);
  } catch {
    return "";
  }
}

export function parseLinks(raw: unknown): ProfileLink[] {
  let arr: unknown = raw;
  if (typeof raw === "string") {
    try {
      arr = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(arr)) return [];
  const out: ProfileLink[] = [];
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const rec = item as { label?: unknown; url?: unknown };
    const label = String(rec.label ?? "").trim().slice(0, 24);
    const url = sanitizeHttps(String(rec.url ?? ""));
    if (label && url) out.push({ label, url });
    if (out.length >= 6) break;
  }
  return out;
}

export function assertImageData(value: string | null | undefined, maxChars: number): string | null {
  if (value == null || value === "") return null;
  if (!value.startsWith("data:image/")) throw new Error("Portrait must be an image.");
  if (value.length > maxChars) throw new Error("Image is too large for this node.");
  return value;
}
