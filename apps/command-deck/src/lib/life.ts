import { exportSeedB64, useIdentity } from "@/lib/identity";
import { emptySnapshot, parseSnapshot, readSnapshot, useProgress, type Snapshot } from "@/lib/progress";
import { usePill, type Pill } from "@/lib/pill";
import { isLoopbackNode, isVendorAi, useSpecialist } from "@/lib/specialist";

const KIND = "trv.life";
const KDF = "trv-digital-life-v1";
const PIN_RE = /^\d{6}$/;
const enc = new TextEncoder();
const dec = new TextDecoder();

export const LIFE_KEYS = [
  "trv-deck-identity-v1",
  "trv-deck-progress-v1",
  "trv.pill",
  "trv.specialist",
  "trv-deck-discovered-v1",
  "trv-watch-day",
  "trv.gate",
  "trv-pulse-ghost-v1",
  "trv-affairs-v1",
] as const;

export type LifeFile = {
  v: 1;
  kind: typeof KIND;
  motto: "In God We Trust";
  pubkey: string;
  wrap: string;
  at: number;
};

type LifePack = {
  v: 1;
  seedB64: string;
  pubkey: string;
  curve: string | null;
  snap: Snapshot;
  lens: Pill | null;
  specialist: { source: "device" | "node"; node: string };
};

function bytesToB64(bytes: Uint8Array) {
  let s = "";
  bytes.forEach((b) => {
    s += String.fromCharCode(b);
  });
  return btoa(s);
}

function b64ToBytes(s: string) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pinKey(pin: string) {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(`${KDF}:${pin}`));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export function parsePin(raw: string) {
  const pin = raw.trim();
  if (!PIN_RE.test(pin)) throw new Error("Six digits. That is the only wrap.");
  return pin;
}

export function ownsLifeCopy() {
  return Boolean(useIdentity.getState().pubkey);
}

function pack(): LifePack {
  const id = useIdentity.getState();
  const seedB64 = exportSeedB64();
  if (!seedB64 || !id.pubkey) throw new Error("No Viewer life on this device yet.");
  const spec = useSpecialist.getState();
  const node = spec.source === "node" && isLoopbackNode(spec.node) && !isVendorAi(spec.node) ? spec.node : "";
  return {
    v: 1,
    seedB64,
    pubkey: id.pubkey,
    curve: id.curve,
    snap: readSnapshot(),
    lens: usePill.getState().lens,
    specialist: { source: node ? "node" : "device", node },
  };
}

export async function wrapLife(pinRaw: string): Promise<LifeFile> {
  const pin = parsePin(pinRaw);
  const inner = JSON.stringify(pack());
  const key = await pinKey(pin);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(inner));
  const packed = new Uint8Array(12 + new Uint8Array(ct).byteLength);
  packed.set(iv, 0);
  packed.set(new Uint8Array(ct), 12);
  const id = useIdentity.getState();
  return {
    v: 1,
    kind: KIND,
    motto: "In God We Trust",
    pubkey: id.pubkey,
    wrap: bytesToB64(packed),
    at: Date.now(),
  };
}

export async function takeLife(pin: string) {
  const file = await wrapLife(pin);
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
  const short = useIdentity.getState().short.replace(/[^\w]/g, "") || "viewer";
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = `remote-viewer-life-${short}.json`;
  a.rel = "noopener";
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(href), 1500);
  return file.pubkey;
}

async function unwrapPack(pin: string, file: LifeFile): Promise<LifePack> {
  const packed = b64ToBytes(file.wrap);
  if (packed.byteLength < 13) throw new Error("Life wrap rejected.");
  const key = await pinKey(pin);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: packed.slice(0, 12) }, key, packed.slice(12));
  const raw = JSON.parse(dec.decode(pt)) as LifePack;
  if (raw.v !== 1 || typeof raw.seedB64 !== "string") throw new Error("Life pack rejected.");
  if (file.pubkey && raw.pubkey && file.pubkey !== raw.pubkey) throw new Error("This wrap is not that Viewer.");
  return raw;
}

export function parseLifeFile(raw: unknown): LifeFile {
  const v = (raw ?? {}) as Record<string, unknown>;
  if (v.kind !== KIND || v.v !== 1) throw new Error("Not a Remote Viewer life.");
  const pubkey = String(v.pubkey ?? "");
  const wrap = String(v.wrap ?? "");
  if (!pubkey || wrap.length < 16) throw new Error("Life file empty.");
  return { v: 1, kind: KIND, motto: "In God We Trust", pubkey, wrap, at: Number(v.at) || Date.now() };
}

export async function carryLife(pinRaw: string, raw: unknown) {
  const pin = parsePin(pinRaw);
  const file = parseLifeFile(raw);
  const inner = await unwrapPack(pin, file);
  await useIdentity.getState().adopt(inner.seedB64);
  useProgress.getState().replaceLocal(parseSnapshot(inner.snap) ?? emptySnapshot());
  if (inner.lens === "red" || inner.lens === "blue") usePill.getState().choose(inner.lens);
  if (inner.specialist?.source === "node" && inner.specialist.node) {
    useSpecialist.getState().setNode(inner.specialist.node);
    useSpecialist.getState().setSource("node");
  } else {
    useSpecialist.getState().setSource("device");
  }
  return useIdentity.getState().pubkey;
}

export async function destroyThisCopy() {
  try {
    for (const key of LIFE_KEYS) localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
  useProgress.getState().replaceLocal(emptySnapshot());
  usePill.getState().hydrate();
  useSpecialist.getState().hydrate();
  await useIdentity.getState().wipeAndMint();
}
