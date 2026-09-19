"use client";

/**
 * CitizenRegistration – native Ed25519 registration UI.
 * Fully operational without Solana or external services.
 */

import { useState } from "react";
import { useNativeIdentity } from "@/providers/NativeIdentityProvider";

export function CitizenRegistration() {
  const { identity, registerCitizen, clearIdentity, isReady } = useNativeIdentity();
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isReady) {
    return <div className="text-sm text-muted-foreground">Loading native identity…</div>;
  }

  if (identity.isRegistered) {
    return (
      <div className="rounded border border-border bg-card p-4">
        <div className="mb-2 text-sm font-medium">Citizen Registered</div>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div>
            Handle: <span className="text-foreground">{identity.handle}</span>
          </div>
          <div className="truncate">Ed25519: {identity.ed25519PublicKey?.slice(0, 24)}…</div>
          <div className="text-xs">
            Registered{" "}
            {identity.lastVerifiedAt
              ? new Date(identity.lastVerifiedAt).toLocaleString()
              : "—"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => clearIdentity()}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground"
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
    <form onSubmit={onSubmit} className="rounded border border-border bg-card p-4">
      <div className="mb-3 text-sm font-medium">Register Citizen (Native Ed25519)</div>
      <input
        type="text"
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        placeholder="choose a handle"
        className="mb-2 h-10 w-full rounded border border-input bg-background px-3 text-sm"
        disabled={busy}
      />
      {error && <div className="mb-2 text-xs text-destructive">{error}</div>}
      <button
        type="submit"
        disabled={busy}
        className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {busy ? "Generating key…" : "Register on-device"}
      </button>
      <p className="mt-2 text-xs text-muted-foreground">
        Keys stay on-device. No chain required. Fully sovereign.
      </p>
    </form>
  );
}
