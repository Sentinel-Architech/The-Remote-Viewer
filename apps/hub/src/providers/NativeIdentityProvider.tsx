"use client";

/**
 * NativeIdentityProvider – 100% native stack. Zero back doors.
 *
 * No master key. No Architect override. No remote recovery.
 * Private key is non-extractable IndexedDB CryptoKey when Ed25519 exists.
 * Only public metadata is written to localStorage.
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { assertNonExtractablePrivate, publicIdentityOnly } from "@/lib/native-custody";

export interface NativeIdentity {
  handle: string | null;
  ed25519PublicKey: string | null;
  isRegistered: boolean;
  lastVerifiedAt: string | null;
  signing: "ed25519" | "local-id" | null;
}

interface NativeIdentityContextValue {
  identity: NativeIdentity;
  registerCitizen: (handle: string) => Promise<void>;
  signLocalMessage: (message: string) => Promise<string | null>;
  clearIdentity: () => Promise<void>;
  isReady: boolean;
}

const NativeIdentityContext = createContext<NativeIdentityContextValue | null>(null);

const STORAGE_KEY = "trv.native.identity";
const IDB_NAME = "trv-native-identity";
const IDB_STORE = "keys";
const IDB_KEY = "ed25519";

function emptyIdentity(): NativeIdentity {
  return {
    handle: null,
    ed25519PublicKey: null,
    isRegistered: false,
    lastVerifiedAt: null,
    signing: null,
  };
}

function loadStoredIdentity(): NativeIdentity {
  if (typeof window === "undefined") return emptyIdentity();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyIdentity();
    const parsed = JSON.parse(raw) as NativeIdentity;
    return publicIdentityOnly({
      ...emptyIdentity(),
      ...parsed,
    }) as NativeIdentity;
  } catch {
    return emptyIdentity();
  }
}

function bytesToB64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function openKeyDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("indexedDB open failed"));
  });
}

async function idbPut(value: CryptoKeyPair): Promise<void> {
  assertNonExtractablePrivate(value);
  const db = await openKeyDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("indexedDB put failed"));
    tx.objectStore(IDB_STORE).put(value, IDB_KEY);
  });
  db.close();
}

async function idbGet(): Promise<CryptoKeyPair | null> {
  const db = await openKeyDb();
  const pair = await new Promise<CryptoKeyPair | null>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
    req.onsuccess = () => resolve((req.result as CryptoKeyPair | undefined) ?? null);
    req.onerror = () => reject(req.error ?? new Error("indexedDB get failed"));
  });
  db.close();
  return pair;
}

async function idbClear(): Promise<void> {
  try {
    const db = await openKeyDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("indexedDB clear failed"));
      tx.objectStore(IDB_STORE).delete(IDB_KEY);
    });
    db.close();
  } catch {
    /* ignore */
  }
}

async function generateEd25519Pair(): Promise<{
  pair: CryptoKeyPair;
  publicKeyB64: string;
} | null> {
  try {
    const pair = (await crypto.subtle.generateKey(
      { name: "Ed25519" },
      false,
      ["sign", "verify"]
    )) as CryptoKeyPair;
    assertNonExtractablePrivate(pair);
    const rawPub = await crypto.subtle.exportKey("raw", pair.publicKey);
    return { pair, publicKeyB64: bytesToB64(new Uint8Array(rawPub)) };
  } catch {
    return null;
  }
}

function generateLocalId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToB64(bytes);
}

export function NativeIdentityProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<NativeIdentity>(emptyIdentity);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIdentity(loadStoredIdentity());
    setIsReady(true);
  }, []);

  const persist = useCallback((next: NativeIdentity) => {
    const publicOnly = publicIdentityOnly({ ...next }) as NativeIdentity;
    setIdentity(publicOnly);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(publicOnly));
    }
  }, []);

  const registerCitizen = useCallback(
    async (handle: string) => {
      const trimmed = handle.trim().toLowerCase();
      if (trimmed.length < 2) {
        throw new Error("Handle must be at least 2 characters");
      }

      const generated = await generateEd25519Pair();
      let publicKeyB64: string;
      let signing: NativeIdentity["signing"];

      if (generated) {
        await idbPut(generated.pair);
        publicKeyB64 = generated.publicKeyB64;
        signing = "ed25519";
      } else {
        await idbClear();
        publicKeyB64 = generateLocalId();
        signing = "local-id";
      }

      persist({
        handle: trimmed,
        ed25519PublicKey: publicKeyB64,
        isRegistered: true,
        lastVerifiedAt: new Date().toISOString(),
        signing,
      });
    },
    [persist]
  );

  const signLocalMessage = useCallback(
    async (message: string): Promise<string | null> => {
      if (!identity.isRegistered) return null;

      if (identity.signing === "ed25519") {
        const pair = await idbGet();
        if (pair?.privateKey) {
          if (pair.privateKey.extractable) {
            throw new Error("Refusing to sign with an extractable key");
          }
          const data = new TextEncoder().encode(message);
          const sig = await crypto.subtle.sign({ name: "Ed25519" }, pair.privateKey, data);
          return bytesToB64(new Uint8Array(sig));
        }
      }

      return `local-id:${identity.ed25519PublicKey}:${bytesToB64(new TextEncoder().encode(message))}`;
    },
    [identity.isRegistered, identity.signing, identity.ed25519PublicKey]
  );

  const clearIdentity = useCallback(async () => {
    await idbClear();
    persist(emptyIdentity());
  }, [persist]);

  const value: NativeIdentityContextValue = {
    identity,
    registerCitizen,
    signLocalMessage,
    clearIdentity,
    isReady,
  };

  return (
    <NativeIdentityContext.Provider value={value}>
      {children}
    </NativeIdentityContext.Provider>
  );
}

export function useNativeIdentity() {
  const ctx = useContext(NativeIdentityContext);
  if (!ctx) {
    throw new Error("useNativeIdentity must be used within NativeIdentityProvider");
  }
  return ctx;
}
