"use client";

/**
 * SolanaProvider – OPTIONAL parallel track only
 *
 * Native stack first. This file intentionally contains no hard dependency
 * on @solana/* packages so the Hub builds and runs without them.
 *
 * When the optional Solana packages are installed, replace the passthrough
 * implementations below with the real Wallet Adapter providers.
 * Until then the native path remains fully operational.
 */

import React, { ReactNode, useCallback, useState } from "react";

/** Passthrough – no Solana packages required */
export function SolanaProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** Placeholder button – inactive until Solana packages are wired */
export function SolanaConnectButton() {
  return (
    <button
      type="button"
      disabled
      className="rounded border border-zinc-600 px-3 py-1.5 text-sm text-zinc-500"
      title="Optional Solana track – install wallet-adapter packages to enable"
    >
      Solana (optional – not loaded)
    </button>
  );
}

/**
 * SIWS helper – inert until real wallet adapter is present.
 * Native Ed25519 identity remains the primary path.
 */
export function useSiwsAuth() {
  const [siwsSession] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    // No-op while Solana packages are absent.
    // Native identity does not depend on this path.
  }, []);

  return {
    connected: false,
    publicKey: null as { toBase58(): string } | null,
    siwsSession,
    signIn,
  };
}
