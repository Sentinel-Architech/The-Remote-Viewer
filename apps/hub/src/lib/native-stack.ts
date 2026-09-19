/**
 * Native stack facade for The Remote Viewer Hub.
 *
 * Single import surface so any AI or route can wire identity + security
 * without hunting paths.
 *
 * @example
 * import { evaluateHubSecurity, type OperatingMode } from "@/lib/native-stack";
 */

export {
  evaluateHubSecurity,
  enforceHubDecision,
  type OperatingMode,
  type SecurityDecision,
  type EnforcementResult,
} from "./sentinel";

export {
  NativeIdentityProvider,
  useNativeIdentity,
  type NativeIdentity,
} from "@/providers/NativeIdentityProvider";
