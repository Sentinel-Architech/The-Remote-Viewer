import { create } from "zustand";

const STORAGE = "trv-deck-identity-v1";
const ALPHA = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const PKCS8_HEAD = Uint8Array.from([
  0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20,
]);

type Persisted = {
  seedB64: string;
  pubkey: string;
  curve: "ed25519" | "hash";
};

type IdentityState = {
  ready: boolean;
  pubkey: string;
  short: string;
  curve: "ed25519" | "hash" | null;
  error: string | null;
  init: () => Promise<void>;
  reload: () => Promise<void>;
  adopt: (seedB64: string) => Promise<void>;
};

let seedBytes: Uint8Array | null = null;

export function encodeB58(bytes: Uint8Array): string {
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros += 1;
  const digits = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let i = 0; i < digits.length; i++) {
      const x = (digits[i] ?? 0) * 256 + carry;
      digits[i] = x % 58;
      carry = Math.floor(x / 58);
    }
    while (carry) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  return "1".repeat(zeros) + digits.reverse().map((d) => ALPHA[d] ?? "1").join("");
}

export function decodeB58(s: string): Uint8Array {
  let zeros = 0;
  while (zeros < s.length && s[zeros] === "1") zeros += 1;
  const bytes = [0];
  for (let i = zeros; i < s.length; i++) {
    const val = ALPHA.indexOf(s[i] ?? "");
    if (val < 0) throw new Error("bad b58");
    let carry = val;
    for (let j = 0; j < bytes.length; j++) {
      const x = (bytes[j] ?? 0) * 58 + carry;
      bytes[j] = x & 0xff;
      carry = x >> 8;
    }
    while (carry) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  const out = new Uint8Array(zeros + bytes.length);
  for (let i = 0; i < bytes.length; i++) out[out.length - 1 - i] = bytes[i] ?? 0;
  return out;
}

export function bufToB64(bytes: Uint8Array): string {
  let s = "";
  bytes.forEach((b) => {
    s += String.fromCharCode(b);
  });
  return btoa(s);
}

export function b64ToBuf(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64urlToBytes(s: string): Uint8Array {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/");
  return b64ToBuf(pad + "=".repeat((4 - (pad.length % 4)) % 4));
}

function bytesToB64url(bytes: Uint8Array): string {
  return bufToB64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function asBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function shorten(pubkey: string) {
  if (pubkey.length <= 12) return pubkey;
  return `${pubkey.slice(0, 6)}…${pubkey.slice(-4)}`;
}

function hex32(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashPubkey(seed: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", asBuffer(seed));
  return hex32(new Uint8Array(digest)).slice(0, 40);
}

async function ed25519Pubkey(seed: Uint8Array): Promise<string> {
  const pkcs8 = new Uint8Array(48);
  pkcs8.set(PKCS8_HEAD);
  pkcs8.set(seed, 16);
  const priv = await crypto.subtle.importKey("pkcs8", asBuffer(pkcs8), { name: "Ed25519" }, true, ["sign"]);
  const jwk = await crypto.subtle.exportKey("jwk", priv);
  if (!jwk.x) throw new Error("Ed25519 public key missing");
  return encodeB58(b64urlToBytes(jwk.x));
}

async function mintFromSeed(seed: Uint8Array): Promise<Omit<Persisted, "seedB64">> {
  try {
    const pubkey = await ed25519Pubkey(seed);
    return { pubkey, curve: "ed25519" };
  } catch {
    const pubkey = await hashPubkey(seed);
    return { pubkey, curve: "hash" };
  }
}

function readPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    if (typeof parsed.seedB64 !== "string" || typeof parsed.pubkey !== "string") return null;
    return {
      seedB64: parsed.seedB64,
      pubkey: parsed.pubkey,
      curve: parsed.curve === "ed25519" ? "ed25519" : "hash",
    };
  } catch {
    return null;
  }
}

function writePersisted(rec: Persisted) {
  localStorage.setItem(STORAGE, JSON.stringify(rec));
}

function applyRec(rec: Persisted) {
  seedBytes = b64ToBuf(rec.seedB64);
  useIdentity.setState({
    ready: true,
    pubkey: rec.pubkey,
    short: shorten(rec.pubkey),
    curve: rec.curve,
    error: null,
  });
}

export function exportSeedB64(): string | null {
  if (!seedBytes) return null;
  return bufToB64(seedBytes);
}

export async function signPayload(text: string): Promise<string | null> {
  if (!seedBytes) return null;
  try {
    const pkcs8 = new Uint8Array(48);
    pkcs8.set(PKCS8_HEAD);
    pkcs8.set(seedBytes, 16);
    const priv = await crypto.subtle.importKey("pkcs8", asBuffer(pkcs8), { name: "Ed25519" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("Ed25519", priv, asBuffer(new TextEncoder().encode(text)));
    return bufToB64(new Uint8Array(sig));
  } catch {
    return null;
  }
}

export async function verifyEd25519(pubkey: string, text: string, sigB64: string): Promise<boolean> {
  try {
    const raw = decodeB58(pubkey);
    if (raw.byteLength !== 32) return false;
    const key = await crypto.subtle.importKey(
      "jwk",
      { kty: "OKP", crv: "Ed25519", x: bytesToB64url(raw) },
      { name: "Ed25519" },
      false,
      ["verify"],
    );
    return crypto.subtle.verify("Ed25519", key, asBuffer(b64ToBuf(sigB64)), asBuffer(new TextEncoder().encode(text)));
  } catch {
    return false;
  }
}

export const useIdentity = create<IdentityState>((set, get) => ({
  ready: false,
  pubkey: "",
  short: "minting",
  curve: null,
  error: null,
  init: async () => {
    if (typeof window === "undefined") return;
    if (get().ready && seedBytes) return;
    let rec = readPersisted();
    if (!rec) {
      const seed = crypto.getRandomValues(new Uint8Array(32));
      const minted = await mintFromSeed(seed);
      rec = { seedB64: bufToB64(seed), ...minted };
      writePersisted(rec);
    }
    applyRec(rec);
  },
  reload: async () => {
    if (typeof window === "undefined") return;
    const rec = readPersisted();
    if (rec) applyRec(rec);
  },
  adopt: async (seedB64) => {
    if (typeof window === "undefined") return;
    const seed = b64ToBuf(seedB64);
    if (seed.byteLength !== 32) throw new Error("Viewer seed rejected");
    const minted = await mintFromSeed(seed);
    const rec: Persisted = { seedB64, ...minted };
    writePersisted(rec);
    applyRec(rec);
  },
}));
