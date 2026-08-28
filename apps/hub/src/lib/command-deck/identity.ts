import { create } from "zustand";

const STORAGE = "trv-deck-identity-v1";
const ALPHA = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const PKCS8_HEAD = Uint8Array.from([
  0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20,
]);

export type InjectedKind = "eip1193" | "solana";

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
  injected: string | null;
  injectedKind: InjectedKind | null;
  error: string | null;
  busy: boolean;
  init: () => Promise<void>;
  connectInjected: () => Promise<void>;
  disconnectInjected: () => void;
};

function b58(bytes: Uint8Array): string {
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

function bufToB64(bytes: Uint8Array): string {
  let s = "";
  bytes.forEach((b) => {
    s += String.fromCharCode(b);
  });
  return btoa(s);
}

function b64ToBuf(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64urlToBytes(s: string): Uint8Array {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/");
  return b64ToBuf(pad + "=".repeat((4 - (pad.length % 4)) % 4));
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
  return b58(b64urlToBytes(jwk.x));
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

function injectedAvailable(): { eth: boolean; sol: boolean } {
  if (typeof window === "undefined") return { eth: false, sol: false };
  return {
    eth: typeof window.ethereum?.request === "function",
    sol: typeof window.solana?.connect === "function",
  };
}

export function hasInjectedWallet() {
  const a = injectedAvailable();
  return a.eth || a.sol;
}

export const useIdentity = create<IdentityState>((set, get) => ({
  ready: false,
  pubkey: "",
  short: "minting",
  curve: null,
  injected: null,
  injectedKind: null,
  error: null,
  busy: false,
  init: async () => {
    if (typeof window === "undefined") return;
    if (get().ready) return;
    let rec = readPersisted();
    if (!rec) {
      const seed = crypto.getRandomValues(new Uint8Array(32));
      const minted = await mintFromSeed(seed);
      rec = { seedB64: bufToB64(seed), ...minted };
      writePersisted(rec);
    }
    set({
      ready: true,
      pubkey: rec.pubkey,
      short: shorten(rec.pubkey),
      curve: rec.curve,
      error: null,
    });
  },
  connectInjected: async () => {
    set({ busy: true, error: null });
    try {
      const avail = injectedAvailable();
      if (avail.eth && window.ethereum) {
        const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as unknown;
        const list = Array.isArray(accounts) ? accounts.filter((a): a is string => typeof a === "string") : [];
        const addr = list[0];
        if (!addr) throw new Error("Injected wallet returned no account");
        set({ injected: addr, injectedKind: "eip1193", busy: false, error: null });
        return;
      }
      if (avail.sol && window.solana) {
        const res = await window.solana.connect();
        const addr = res.publicKey.toString();
        set({ injected: addr, injectedKind: "solana", busy: false, error: null });
        return;
      }
      throw new Error("No injected wallet in this browser. Local identity is already live.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Wallet connect failed";
      set({ busy: false, error: message });
    }
  },
  disconnectInjected: () => set({ injected: null, injectedKind: null, error: null }),
}));

declare global {
  interface Window {
    ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
  }
}
