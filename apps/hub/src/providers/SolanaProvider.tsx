"use client";

/**
 * SolanaProvider – OPTIONAL parallel track only
 *
 * This module is never required for the Viewer Hub to function.
 * Primary identity is NativeIdentityProvider (Ed25519 + Better Auth).
 * Solana / SIWS is an additive bridge for on-chain actions when desired.
 *
 * To disable completely: do not import or wrap with this provider.
 */

import React, { useMemo, useCallback, useState, ReactNode } from "react";

// Dynamic imports keep the native stack free of Solana packages when unused.
// Consumers must install the packages only if they enable this track.

let ConnectionProvider: any = ({ children }: { children: ReactNode }) => <>{children}</>;
let WalletProvider: any = ({ children }: { children: ReactNode }) => <>{children}</>;
let WalletModalProvider: any = ({ children }: { children: ReactNode }) => <>{children}</>;
let WalletMultiButton: any = () => null;
let useWallet: any = () => ({ publicKey: null, signMessage: null, connected: false });
let clusterApiUrl: any = () => "";
let PhantomWalletAdapter: any = class {};
let SolflareWalletAdapter: any = class {};

try {
  // These will resolve only when the packages are installed.
  // If not installed, the native path continues to work.
  const reactAdapter = require("@solana/wallet-adapter-react");
  const reactUi = require("@solana/wallet-adapter-react-ui");
  const wallets = require("@solana/wallet-adapter-wallets");
  const web3 = require("@solana/web3.js");

  ConnectionProvider = reactAdapter.ConnectionProvider;
  WalletProvider = reactAdapter.WalletProvider;
  useWallet = reactAdapter.useWallet;
  WalletModalProvider = reactUi.WalletModalProvider;
  WalletMultiButton = reactUi.WalletMultiButton;
  PhantomWalletAdapter = wallets.PhantomWalletAdapter;
  SolflareWalletAdapter = wallets.SolflareWalletAdapter;
  clusterApiUrl = web3.clusterApiUrl;

  // CSS is optional; ignore if missing
  try {
    require("@solana/wallet-adapter-react-ui/styles.css");
  } catch {}
} catch {
  // Packages not installed – Solana track is dormant. Native stack remains fully operational.
}

const network = "devnet";

export function SolanaProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => {
    try {
      return clusterApiUrl(network);
    } catch {
      return "";
    }
  }, []);

  const wallets = useMemo(() => {
    try {
      return [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
    } catch {
      return [];
    }
  }, []);

  // If no endpoint or wallets, render children without Solana context.
  if (!endpoint || wallets.length === 0) {
    return <>{children}</>;
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export function SolanaConnectButton() {
  return <WalletMultiButton />;
}

export function useSiwsAuth() {
  const wallet = useWallet();
  const { publicKey, signMessage, connected } = wallet || {};
  const [siwsSession, setSiwsSession] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    if (!publicKey || !signMessage) return;

    const domain =
      typeof window !== "undefined" ? window.location.host : "the-remote-viewer.grok.me";
    const statement = "Sign in to The Remote Viewer Hub (optional Solana bridge)";
    const nonce = crypto.randomUUID();
    const issuedAt = new Date().toISOString();

    const message = `${domain} wants you to sign in with your Solana account:\n${publicKey.toBase58()}\n\n${statement}\n\nNonce: ${nonce}\nIssued At: ${issuedAt}`;

    const encoded = new TextEncoder().encode(message);
    const signature = await signMessage(encoded);

    // Bridge only: bind to native Ed25519 identity in the application layer.
    setSiwsSession(
      typeof Buffer !== "undefined"
        ? Buffer.from(signature).toString("base64")
        : btoa(String.fromCharCode(...new Uint8Array(signature)))
    );
  }, [publicKey, signMessage]);

  return { connected: !!connected, publicKey, siwsSession, signIn };
}
