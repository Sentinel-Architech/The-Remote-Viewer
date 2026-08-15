import { viewFromFlags, type EntitlementView } from "./types";

/**
 * Placeholder until IDL + program id ship from a green anchor build.
 * Do not invent on-chain success.
 */
export async function readEntitlement(_viewer: string): Promise<EntitlementView> {
  return viewFromFlags({
    hasActiveSub: false,
    subExpiresAt: null,
    hasActiveNode: false,
    chainReadable: false,
  });
}
