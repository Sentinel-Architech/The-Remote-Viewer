"use client";

/**
 * NativeDashboard
 * Composes the core native experience:
 *   - Citizen registration (Ed25519)
 *   - Sentinel Security status (MoE)
 *   - Open-source continuity signal
 *
 * Fully operational without Solana. Dual-mode ready.
 */

import React from "react";
import { CitizenRegistration } from "./CitizenRegistration";
import { SecurityStatus } from "./SecurityStatus";
import { ContinuityBadge } from "./ContinuityBadge";
import { useNativeIdentity } from "../providers/NativeIdentityProvider";

interface Props {
  opticalStatus?: string | null;
  mode?: "individual" | "enhanced" | "whole-network";
}

export function NativeDashboard({
  opticalStatus = null,
  mode = "individual",
}: Props) {
  const { identity } = useNativeIdentity();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">Viewer Hub</h1>
        <ContinuityBadge />
      </div>

      <CitizenRegistration />

      <SecurityStatus
        handle={identity.handle}
        opticalStatus={opticalStatus}
        mode={mode}
      />

      <p className="text-center text-xs text-zinc-500">
        Individual sovereignty · Enhanced when connected · Ultimate protection via native MoE
      </p>
    </div>
  );
}
