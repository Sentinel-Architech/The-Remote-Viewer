"use client";

/**
 * Wraps node runtime UI with the same on-device identity as /hub/native.
 * Optional orchestrator calls are not custody. No chain required.
 */

import type { ReactNode } from "react";
import { CitizenRegistration } from "@/components/CitizenRegistration";
import { NativeIdentityProvider } from "@/providers/NativeIdentityProvider";

export function NodeNativeShell({ children }: { children: ReactNode }) {
  return (
    <NativeIdentityProvider>
      <div className="space-y-0">
        <div className="border-b border-border px-5 py-4 md:px-8">
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Citizen identity · on-device · no back door
          </p>
          <CitizenRegistration />
        </div>
        {children}
      </div>
    </NativeIdentityProvider>
  );
}
