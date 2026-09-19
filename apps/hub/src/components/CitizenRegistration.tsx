"use client";

/**
 * CitizenRegistration
 * Native Ed25519 registration flow for individual sovereignty.
 * Fully operational without Solana or external services.
 */

import React, { useState } from "react";
import { useNativeIdentity } from "../providers/NativeIdentityProvider";

export function CitizenRegistration() {
  const { identity, registerCitizen, clearIdentity, isReady } = useNativeIdentity();
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isReady) {
    return <div className="text-sm text-zinc-400">Loading native identity…</div>;
  }

  if (identity.isRegistered) {
    return (
      <div className="rounded border border-zinc-700 bg-zinc-900/60 p-4">
        <div className="mb-2 text-sm font-medium text-zinc-200">Citizen Registered</div>
        <div className="space-y-1 text-sm text-zinc-400">
          <div>Handle: <span className="text-zinc-200">{identity.handle}</span></div>
          <div className="truncate">Ed25519: {identity.ed25519PublicKey?.slice(0, 24)}…</div>
          <div className="text-xs text-zinc-500">
            Registered {identity.lastVerifiedAt ? new Date(identity.lastVerifiedAt).toLocaleString() : "—"}
          </div>
        </div>
        <button
          onClick={() => clearIdentity()}
          className="mt-3 text-xs text-zinc-500 hover:text-zinc-300"
        >
          Clear local identity
        </button>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!handle.trim()) {
      setError("Handle required");
      return;
    }
    setBusy(true);
    try {
      await registerCitizen(handle.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="rounded border border-zinc-700 bg-zinc-900/60 p-4">
      <div className="mb-3 text-sm font-medium text-zinc-200">Register Citizen (Native Ed25519)</div>
      <input
        type="text"
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        placeholder="choose a handle"
        className="mb-2 w-full rounded border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600"
        disabled={busy}
      />
      {error && <div className="mb-2 text-xs text-red-400">{error}</div>}
      <button
        type="submit"
        disabled={busy}
        className="rounded bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-50"
      >
        {busy ? "Generating key…" : "Register on-device"}
      </button>
      <p className="mt-2 text-xs text-zinc-500">
        Keys stay on-device. No chain required. Fully sovereign.
      </p>
    </form>
  );
}
