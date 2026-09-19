"use client";

/**
 * NativeIdentityProvider – 100% native stack
 *
 * Primary identity path for The Remote Viewer Hub.
 * On-device Ed25519 via Web Crypto. Optical-air-gap compatible.
 * Solana is never required.
 *
 * Rule of Law:
 * - Local-first
 * - No mandatory external services
 * - Fully operational offline
 * - Individual sovereignty preserved
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

      // Native path: generate on-device Ed25519 keypair via Web Crypto.
      // Production: private key material must live in the age / optical-air-gap vault,
      // never in localStorage.
      const keyPair = await crypto.subtle.generateKey(
        { name: "Ed25519" },
        true,
        ["sign", "verify"]
      );

      const rawPub = await crypto.subtle.exportKey("raw", keyPair.publicKey);
      const publicKeyB64 = btoa(String.fromCharCode(...new Uint8Array(rawPub)));

      const next: NativeIdentity = {
        handle: trimmed,
        ed25519PublicKey: publicKeyB64,
        isRegistered: true,
        lastVerifiedAt: new Date().toISOString(),
      };

      persist(next);
    },
    [persist]
  );

  const signLocalMessage = useCallback(
    async (message: string): Promise<string | null> => {
      if (!identity.isRegistered) return null;
      // Placeholder: production loads private key from secure vault and signs.
      // Optical-air-gap path remains the preferred high-trust channel.
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
