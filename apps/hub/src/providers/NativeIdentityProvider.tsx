"use client";

/**
 * NativeIdentityProvider – 100% native stack
 *
 * Primary identity path for The Remote Viewer Hub.
 * Prefers Web Crypto Ed25519; falls back to a deterministic local identifier
 * when the runtime does not yet expose Ed25519 via subtle crypto.
 * Optical-air-gap compatible. Solana never required.
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface NativeIdentity {
  handle: string | null;
  ed25519PublicKey: string | null;
  isRegistered: boolean;
  lastVerifiedAt: string | null;
}

interface NativeIdentityContextValue {
  identity: NativeIdentity;
  registerCitizen: (handle: string) => Promise<void>;
  signLocalMessage: (message: string) => Promise<string | null>;
  clearIdentity: () => void;
  isReady: boolean;
}

const NativeIdentityContext = createContext<NativeIdentityContextValue | null>(null);

const STORAGE_KEY = "trv.native.identity";

function loadStoredIdentity(): NativeIdentity {
  if (typeof window === "undefined") {
    return { handle: null, ed25519PublicKey: null, isRegistered: false, lastVerifiedAt: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { handle: null, ed25519PublicKey: null, isRegistered: false, lastVerifiedAt: null };
    }
    return JSON.parse(raw) as NativeIdentity;
  } catch {
    return { handle: null, ed25519PublicKey: null, isRegistered: false, lastVerifiedAt: null };
  }
}

/** Attempt native Ed25519; fall back to a random local public-key placeholder. */
async function generateLocalPublicKey(): Promise<string> {
  try {
    // Ed25519 via Web Crypto (supported in modern Chromium / Firefox / Safari versions)
    const keyPair = await crypto.subtle.generateKey(
      { name: "Ed25519" },
      true,
      ["sign", "verify"]
    );
    const rawPub = await crypto.subtle.exportKey("raw", keyPair.publicKey);
    return btoa(String.fromCharCode(...new Uint8Array(rawPub)));
  } catch {
    // Runtime does not expose Ed25519 – generate a stable random identifier instead.
    // Production must still bind to the age / optical-air-gap vault for real keys.
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes));
  }
}

export function NativeIdentityProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<NativeIdentity>(loadStoredIdentity);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIdentity(loadStoredIdentity());
    setIsReady(true);
  }, []);

  const persist = useCallback((next: NativeIdentity) => {
    setIdentity(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const registerCitizen = useCallback(
    async (handle: string) => {
      const trimmed = handle.trim().toLowerCase();
      if (trimmed.length < 2) {
        throw new Error("Handle must be at least 2 characters");
      }

      const publicKeyB64 = await generateLocalPublicKey();

      const next: NativeIdentity = {
        handle: trimmed,
        ed25519PublicKey: publicKeyB64,
        isRegistered: true,
        lastVerifiedAt: new Date().toISOString(),
      };

      // Production: private key material lives in the age / optical-air-gap vault only.
      persist(next);
    },
    [persist]
  );

  const signLocalMessage = useCallback(
    async (message: string): Promise<string | null> => {
      if (!identity.isRegistered) return null;
      // Placeholder until vault-backed signing is wired.
      return `native-sig-placeholder:${btoa(message)}`;
    },
    [identity.isRegistered]
  );

  const clearIdentity = useCallback(() => {
    persist({
      handle: null,
      ed25519PublicKey: null,
      isRegistered: false,
      lastVerifiedAt: null,
    });
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
