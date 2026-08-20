/** On-device Viewer wallet. Seed never leaves this browser. Unlock is a PIN the Viewer sets. */

const DB_NAME = "trv-wallet";
const STORE = "vault";
const ALPHA = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
/** RFC 8410 PKCS#8 header for a 32-byte Ed25519 seed. */
const PKCS8_HEAD = Uint8Array.from([
  0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20,
]);

export type VaultCurve = "ed25519" | "hash-v1";

export type VaultRecord = {
  id: "primary";
  pubkey: string;
  salt: string;
  iv: string;
  cipher: string;
  curve?: VaultCurve;
};

export type HelmProof = {
  message: string;
  signature: string;
  pubkey: string;
};

let sessionSeed: Uint8Array | null = null;
let sessionCurve: VaultCurve | null = null;
const listeners = new Set<() => void>;

export function isUnlocked(): boolean {
  return sessionSeed !== null;
}

export function sessionVaultCurve(): VaultCurve | null {
  return sessionCurve;
}

export function vaultCurve(vault: VaultRecord | null): VaultCurve {
  return vault?.curve === "ed25519" ? "ed25519" : "hash-v1";
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

export function b58(bytes: Uint8Array): string {
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

function b64urlToBytes(s: string): Uint8Array {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/");
  return b64ToBuf(pad + "=".repeat((4 - (pad.length % 4)) % 4));
}

export function seedToPkcs8(seed: Uint8Array): Uint8Array {
  if (seed.length !== 32) throw new Error("Ed25519 seed must be 32 bytes");
  const out = new Uint8Array(48);
  out.set(PKCS8_HEAD);
  out.set(seed, 16);
  return out;
}

function asBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

export async function ed25519PubRaw(seed: Uint8Array): Promise<Uint8Array> {
  const priv = await crypto.subtle.importKey("pkcs8", asBuffer(seedToPkcs8(seed)), { name: "Ed25519" }, true, ["sign"]);
  const jwk = await crypto.subtle.exportKey("jwk", priv);
  if (!jwk.x) throw new Error("Ed25519 public key missing");
  return b64urlToBytes(jwk.x);
}

export async function ed25519PubkeyFromSeed(seed: Uint8Array): Promise<string> {
  return b58(await ed25519PubRaw(seed));
}

export async function ed25519Sign(seed: Uint8Array, msg: Uint8Array): Promise<Uint8Array> {
  const priv = await crypto.subtle.importKey("pkcs8", asBuffer(seedToPkcs8(seed)), { name: "Ed25519" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign({ name: "Ed25519" }, priv, asBuffer(msg)));
}

export async function ed25519Verify(pubRaw: Uint8Array, msg: Uint8Array, sig: Uint8Array): Promise<boolean> {
  const pub = await crypto.subtle.importKey("raw", asBuffer(pubRaw), { name: "Ed25519" }, false, ["verify"]);
  return crypto.subtle.verify({ name: "Ed25519" }, pub, asBuffer(sig), asBuffer(msg));
}

function rememberWalletMeta(curve: VaultCurve) {
  try {
    localStorage.setItem("trv-wallet-meta", JSON.stringify({ curve, at: Date.now() }));
  } catch {
    /* quota / private mode */
  }
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
  const pubkey = await ed25519PubkeyFromSeed(seed);
  await putVault({
    id: "primary",
    pubkey,
    salt: bufToB64(salt),
    iv: bufToB64(iv),
    cipher: bufToB64(cipher),
    curve: "ed25519",
  });
  sessionSeed = seed;
  sessionCurve = "ed25519";
  rememberWalletMeta("ed25519");
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
    sessionCurve = vaultCurve(vault);
    rememberWalletMeta(sessionCurve);
    emit();
    return vault.pubkey;
  } catch {
    throw new Error("Unlock rejected");
  }
}

/** Re-derive an Ed25519 address from the same 32-byte seed. Hash-v1 unlock still works until this runs. */
export async function upgradeVaultToEd25519(): Promise<string> {
  if (!sessionSeed) throw new Error("Unlock first");
  const vault = await loadVault();
  if (!vault) throw new Error("No wallet on this device");
  if (vaultCurve(vault) === "ed25519") return vault.pubkey;
  const pubkey = await ed25519PubkeyFromSeed(sessionSeed);
  await putVault({ ...vault, pubkey, curve: "ed25519" });
  sessionCurve = "ed25519";
  rememberWalletMeta("ed25519");
  emit();
  return pubkey;
}

export function lockWallet() {
  sessionSeed = null;
  sessionCurve = null;
  emit();
}

export function peekPubkeySync(vault: VaultRecord | null): string | null {
  return vault?.pubkey ?? null;
}

export function exportSeedIfUnlocked(): string | null {
  if (!sessionSeed) return null;
  return b58(sessionSeed);
}

export async function exportSolanaSecretIfUnlocked(): Promise<string | null> {
  if (!sessionSeed || sessionCurve !== "ed25519") return null;
  const pub = await ed25519PubRaw(sessionSeed);
  const secret = new Uint8Array(64);
  secret.set(sessionSeed);
  secret.set(pub, 32);
  return b58(secret);
}

export async function signHelmProof(): Promise<HelmProof> {
  if (!sessionSeed || sessionCurve !== "ed25519") throw new Error("Unlock an Ed25519 vault first");
  const vault = await loadVault();
  if (!vault) throw new Error("No wallet on this device");
  const message = `TRV-HELM|1|${vault.pubkey}|${new Date().toISOString()}`;
  const signature = b58(await ed25519Sign(sessionSeed, new TextEncoder().encode(message)));
  return { message, signature, pubkey: vault.pubkey };
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
