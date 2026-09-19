"use client";

/**
 * NativeDashboard
 * Composes identity, Sentinel security status, and continuity signal.
 * Fully operational without Solana.
 */

import { CitizenRegistration } from "@/components/CitizenRegistration";
import { SecurityStatus } from "@/components/SecurityStatus";
import { ContinuityBadge } from "@/components/ContinuityBadge";
import { useNativeIdentity } from "@/providers/NativeIdentityProvider";

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
        <h1 className="text-lg font-semibold">Viewer Hub · Native</h1>
        <ContinuityBadge />
      </div>

      <CitizenRegistration />

      <SecurityStatus
        handle={identity.handle}
        opticalStatus={opticalStatus}
        mode={mode}
      />

      <p className="text-center text-xs text-muted-foreground">
        Individual sovereignty · Enhanced when connected · Ultimate protection via native MoE
      </p>
    </div>
  );
}
