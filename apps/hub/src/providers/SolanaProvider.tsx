"use client";

import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

// SIWS (Sign-In With Solana) helpers will be expanded here.
// For now we expose a basic connect flow that can later be
// bound to Better Auth / Ed25519 citizen identity.

const network = "devnet"; // change to mainnet-beta when ready
const endpoint = useMemo(() => clusterApiUrl(network), []);

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      // Add more adapters as needed
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

/** Simple connect button for testing. Replace with SIWS-aware component later. */
export function SolanaConnectButton() {
  return <WalletMultiButton />;
}

/** Hook placeholder for SIWS authentication flow */
export function useSiwsAuth() {
  const { publicKey, signMessage, connected } = useWallet();
  const [siwsSession, setSiwsSession] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    if (!publicKey || !signMessage) return;

    const domain = typeof window !== "undefined" ? window.location.host : "the-remote-viewer.grok.me";
    const statement = "Sign in to The Remote Viewer Hub";
    const nonce = crypto.randomUUID();
    const issuedAt = new Date().toISOString();

    const message = `${domain} wants you to sign in with your Solana account:\n${publicKey.toBase58()}\n\n${statement}\n\nNonce: ${nonce}\nIssued At: ${issuedAt}`;

    const encoded = new TextEncoder().encode(message);
    const signature = await signMessage(encoded);

    // TODO: send { message, signature, publicKey } to Better Auth / backend for verification
    // and bind to existing Ed25519 citizen identity.
    setSiwsSession(Buffer.from(signature).toString("base64"));
  }, [publicKey, signMessage]);

  return { connected, publicKey, siwsSession, signIn };
}
