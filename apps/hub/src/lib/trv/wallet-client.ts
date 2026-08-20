/** On-device Viewer wallet. Seed never leaves this browser. Unlock is a PIN the Viewer sets. */

const DB_NAME = "trv-wallet";
const STORE = "vault";
const ALPHA = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export type VaultRecord = {
  id: "primary";
  pubkey: string;
  salt: string;
  iv: string;
  cipher: string;
};

let sessionSeed: Uint8Array | null = null;
const listeners = new Set<() => void>;

export function isUnlocked(): boolean {
  return sessionSeed !== null;
}

export function onWalletChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function emit() {
  listeners.forEach((fn) => fn());
}

function b58(bytes: Uint8Array): string {
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros += 1;
  const digits = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let i = 0; i < digits.length; i++) {
      const x = digits[i] * 256 + carry;
      digits[i] = x % 58;
      carry = Math.floor(x / 58);
    }
    while (carry) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  return "1".repeat(zeros) + digits.reverse().map((d) => ALPHA[d]).join("");
}

function bufToB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
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

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putVault(rec: VaultRecord) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(rec);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadVault(): Promise<VaultRecord | null> {
  const db = await openDb();
  const rec = await new Promise<VaultRecord | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get("primary");
    req.onsuccess = () => resolve((req.result as VaultRecord) ?? null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return rec;
}

async function derive(pin: string, saltIn: Uint8Array) {
  const salt = new Uint8Array(saltIn);
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 120_000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function createWallet(pin: string): Promise<string> {
  const seed = crypto.getRandomValues(new Uint8Array(32));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await derive(pin, salt);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, seed);
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", new Uint8Array(seed)));
  const pubkey = b58(hash);
  await putVault({
    id: "primary",
    pubkey,
    salt: bufToB64(salt),
    iv: bufToB64(iv),
    cipher: bufToB64(cipher),
  });
  sessionSeed = seed;
  emit();
  return pubkey;
}

export async function unlockWallet(pin: string): Promise<string> {
  const vault = await loadVault();
  if (!vault) throw new Error("No wallet on this device");
  const key = await derive(pin, b64ToBuf(vault.salt));
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(b64ToBuf(vault.iv)) },
      key,
      new Uint8Array(b64ToBuf(vault.cipher)),
    );
    sessionSeed = new Uint8Array(plain);
    emit();
    return vault.pubkey;
  } catch {
    throw new Error("Unlock rejected");
  }
}

export function lockWallet() {
  sessionSeed = null;
  emit();
}

export function peekPubkeySync(vault: VaultRecord | null): string | null {
  return vault?.pubkey ?? null;
}

export function exportSeedIfUnlocked(): string | null {
  if (!sessionSeed) return null;
  return b58(sessionSeed);
}

export async function connectPhantom(): Promise<string> {
  const provider = window.solana;
  if (!provider?.isPhantom) throw new Error("Phantom is not installed in this browser");
  const res = await provider.connect();
  return res.publicKey.toString();
}

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
      disconnect?: () => Promise<void>;
    };
  }
}
