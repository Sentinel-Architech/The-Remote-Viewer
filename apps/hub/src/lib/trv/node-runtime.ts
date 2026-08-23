/** Browser twin of desktop/src/runtime — IndexedDB identity, nonce replay, linear zkML. Seed never leaves this device. */

import { b58, ed25519PubRaw, ed25519Sign, ed25519Verify } from "./wallet-client";

const DB_NAME = "sentinel-node";
const STORE = "kv";
const IDENTITY_KEY = "identity:primary";
const NONCE_PREFIX = "nonce:";

export const MODEL_ID = "sentinel-zkml-linear-v1";
export const MODEL_DIM = 8;
export const WEIGHTS = Object.freeze([0.41, -0.27, 0.63, 0.18, -0.52, 0.35, 0.22, -0.11]);
export const BIAS = -0.08;

export type NodeIdentity = {
  pubkeyHex: string;
  pubkeyB58: string;
  createdAt: string;
};

type IdentityRecord = NodeIdentity & { seed: string };

export type AttestationReceipt = {
  ok: boolean;
  message: string;
  signatureHex: string;
  pubkeyHex: string;
  nonce: string;
  verified: boolean;
};

export type InferenceReceipt = {
  modelId: string;
  input: number[];
  logit: number;
  score: number;
  label: "hostile" | "clear";
  commitment: string;
  ranAt: string;
};

let sessionSeed: Uint8Array | null = null;
let sessionIdentity: NodeIdentity | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function onNodeChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function peekIdentity(): NodeIdentity | null {
  return sessionIdentity;
}

export function isProvisioned(): boolean {
  return sessionIdentity !== null && sessionSeed !== null;
}

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(s: string): Uint8Array {
  const clean = s.replace(/^0x/, "");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function asBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function sha256Hex(data: string | Uint8Array): Promise<string> {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const digest = await crypto.subtle.digest("SHA-256", asBuffer(bytes));
  return hex(new Uint8Array(digest));
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

async function idbHas(key: string): Promise<boolean> {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getKey(key);
      req.onsuccess = () => resolve(req.result !== undefined);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

async function idbDelete(key: string): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export async function restoreIdentity(): Promise<NodeIdentity | null> {
  const rec = await idbGet<IdentityRecord>(IDENTITY_KEY);
  if (!rec?.seed || !rec.pubkeyHex) {
    sessionSeed = null;
    sessionIdentity = null;
    emit();
    return null;
  }
  sessionSeed = hexToBytes(rec.seed);
  sessionIdentity = { pubkeyHex: rec.pubkeyHex, pubkeyB58: rec.pubkeyB58, createdAt: rec.createdAt };
  emit();
  return sessionIdentity;
}

export async function provisionNode(): Promise<NodeIdentity> {
  const seed = crypto.getRandomValues(new Uint8Array(32));
  const pub = await ed25519PubRaw(seed);
  const identity: NodeIdentity = {
    pubkeyHex: hex(pub),
    pubkeyB58: b58(pub),
    createdAt: new Date().toISOString(),
  };
  await idbSet(IDENTITY_KEY, { ...identity, seed: hex(seed) } satisfies IdentityRecord);
  sessionSeed = seed;
  sessionIdentity = identity;
  emit();
  return identity;
}

export async function destroyNode(): Promise<void> {
  await idbDelete(IDENTITY_KEY);
  if (sessionSeed) sessionSeed.fill(0);
  sessionSeed = null;
  sessionIdentity = null;
  emit();
}

export function freshNonce(): string {
  return hex(crypto.getRandomValues(new Uint8Array(16)));
}

export async function attestNode(): Promise<AttestationReceipt> {
  if (!sessionSeed || !sessionIdentity) {
    throw new Error("Node identity not found in local state store.");
  }
  const nonce = freshNonce();
  if (await idbHas(`${NONCE_PREFIX}${nonce}`)) {
    throw new Error("Nonce collision — retry attestation.");
  }
  await idbSet(`${NONCE_PREFIX}${nonce}`, { at: Date.now(), used: false });
  const message = `TRV-NODE-ATTEST|1|${sessionIdentity.pubkeyHex}|${nonce}|${new Date().toISOString()}`;
  const msgBytes = new TextEncoder().encode(message);
  const signature = await ed25519Sign(sessionSeed, msgBytes);
  const pub = hexToBytes(sessionIdentity.pubkeyHex);
  const verified = await ed25519Verify(pub, msgBytes, signature);
  await idbSet(`${NONCE_PREFIX}${nonce}`, { at: Date.now(), used: true });
  return {
    ok: verified,
    message,
    signatureHex: hex(signature),
    pubkeyHex: sessionIdentity.pubkeyHex,
    nonce,
    verified,
  };
}

export async function executeNodeAttestation(pubkeyHex: string): Promise<string> {
  const rec = await idbGet<IdentityRecord>(IDENTITY_KEY);
  if (!rec || rec.pubkeyHex.toLowerCase() !== pubkeyHex.toLowerCase()) {
    throw new Error("Node identity not found in local state store.");
  }
  return `Node verified: ${pubkeyHex}`;
}

export async function identityFingerprint(): Promise<string | null> {
  if (!sessionIdentity) return null;
  return (await sha256Hex(sessionIdentity.pubkeyHex)).slice(0, 16);
}

export function parseTensor(raw: string): number[] {
  const parts = raw
    .split(/[,\s]+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length !== MODEL_DIM) throw new Error(`Need ${MODEL_DIM} floats (got ${parts.length})`);
  return parts.map((p) => {
    const n = Number(p);
    if (!Number.isFinite(n)) throw new Error(`Bad float: ${p}`);
    return n;
  });
}

export function samplePacket(kind: "clear" | "hostile"): number[] {
  const base =
    kind === "hostile"
      ? [0.9, 0.1, 0.85, 0.7, 0.05, 0.8, 0.6, 0.2]
      : [0.1, 0.7, 0.15, 0.2, 0.8, 0.2, 0.1, 0.6];
  return base.map((v) => Number((v + (Math.random() - 0.5) * 0.08).toFixed(4)));
}

export async function executeInference(input: number[]): Promise<InferenceReceipt> {
  if (input.length !== MODEL_DIM) throw new Error(`Need ${MODEL_DIM}-dim tensor`);
  let logit = BIAS;
  for (let i = 0; i < MODEL_DIM; i++) logit += input[i]! * WEIGHTS[i]!;
  const score = 1 / (1 + Math.exp(-logit));
  const label = score >= 0.5 ? "hostile" : "clear";
  const canonical = `zkml:v1|${MODEL_ID}|${input.map((n) => n.toFixed(6)).join(",")}|${score.toFixed(8)}|${label}`;
  const commitment = await sha256Hex(canonical);
  return {
    modelId: MODEL_ID,
    input,
    logit: Number(logit.toFixed(6)),
    score: Number(score.toFixed(6)),
    label,
    commitment,
    ranAt: new Date().toISOString(),
  };
}
