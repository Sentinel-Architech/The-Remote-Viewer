"use client";

import { CitizenRegistration } from "@/components/CitizenRegistration";

/** Source-only native identity on the node route. Host /hub* stays dark until republish (STATUS.md #55). */
export function NativeNodeBanner() {
  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Native identity · on this device · not a chain gate · not a host-LIVE stamp
      </p>
      <CitizenRegistration />
    </div>
  );
}
