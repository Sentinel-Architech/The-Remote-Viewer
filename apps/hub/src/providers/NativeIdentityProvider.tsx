"use client";

/**
 * NativeIdentityProvider – 100% native stack
 *
 * Primary identity path for The Remote Viewer Hub.
 * Uses on-device Ed25519 (Web Crypto / age-compatible) and Better Auth.
 * Solana / SIWS is strictly optional and never required for Hub operation.
 *
 * Design rules (Rule of Law):
 * - Local-first
 * - No mandatory external services
 * - Optical air-gap compatible
 * - Fully operational offline
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
  ed25519PublicKey: string | null; // base64 or hex
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
      // Native path: generate or unlock on-device Ed25519 keypair via Web Crypto.
      // In production this should integrate with the existing age / optical-air-gap vault.
      const keyPair = await crypto.subtle.generateKey(
        { name: "Ed25519" },
        true,
        ["sign", "verify"]
      );

      const rawPub = await crypto.subtle.exportKey("raw", keyPair.publicKey);
      const publicKeyB64 = btoa(String.fromCharCode(...new Uint8Array(rawPub)));

      const next: NativeIdentity = {
        handle: handle.trim().toLowerCase(),
        ed25519PublicKey: publicKeyB64,
        isRegistered: true,
        lastVerifiedAt: new Date().toISOString(),
      };

      // TODO: store private key material in the existing secure vault / age-encrypted store.
      // Never persist raw private key in localStorage in production.

      persist(next);
    },
    [persist]
  );

  const signLocalMessage = useCallback(
    async (message: string): Promise<string | null> => {
      if (!identity.isRegistered) return null;
      // Placeholder: real implementation must load the private key from the secure vault
      // and produce an Ed25519 signature. Optical-air-gap path remains preferred for high-trust.
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
