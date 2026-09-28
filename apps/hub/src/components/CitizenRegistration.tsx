"use client";

/**
 * CitizenRegistration – native Ed25519 registration UI.
 * Fully operational without Solana or external services.
 */

import { useState } from "react";
import { useNativeIdentity } from "@/providers/NativeIdentityProvider";

export function CitizenRegistration() {
  const { identity, registerCitizen, signLocalMessage, clearIdentity, isReady } =
    useNativeIdentity();
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proof, setProof] = useState<string | null>(null);

  if (!isReady) {
    return <div className="text-sm text-muted-foreground">Loading native identity…</div>;
  }

  if (identity.isRegistered) {
    const onProve = async () => {
      setError(null);
      setBusy(true);
      try {
        const payload = `trv.native.prove:${identity.handle}:${Date.now()}`;
        const sig = await signLocalMessage(payload);
        setProof(sig);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sign failed");
      } finally {
        setBusy(false);
      }
    };

    return (
      <div className="rounded border border-border bg-card p-4">
        <div className="mb-2 text-sm font-medium">Citizen Registered</div>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div>
            Handle: <span className="text-foreground">{identity.handle}</span>
          </div>
          <div className="truncate">
            Public: {identity.ed25519PublicKey?.slice(0, 24)}…
          </div>
          <div className="text-xs">
            Signing:{" "}
            <span className="text-foreground">{identity.signing ?? "unknown"}</span>
            {" · "}
            {identity.lastVerifiedAt
              ? new Date(identity.lastVerifiedAt).toLocaleString()
              : "—"}
          </div>
        </div>
        {proof ? (
          <p className="mt-3 break-all font-mono text-[11px] text-muted-foreground">
            {identity.signing === "ed25519" ? "ed25519 sig" : "local-id mark"}: {proof}
          </p>
        ) : null}
        {error ? <div className="mt-2 text-xs text-destructive">{error}</div> : null}
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void onProve()}
            disabled={busy}
            className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Signing…" : "Prove local signature"}
          </button>
          <button
            type="button"
            onClick={() => {
              setProof(null);
              void clearIdentity();
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear local identity
          </button>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProof(null);
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
        Keys stay on-device. No chain required. Source is public. Fully sovereign.
      </p>
    </form>
  );
}
