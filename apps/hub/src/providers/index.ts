/**
 * Native stack providers – barrel export.
 * Solana remains optional and is never required for Hub operation.
 */

export {
  NativeIdentityProvider,
  useNativeIdentity,
  type NativeIdentity,
} from "./NativeIdentityProvider";

export {
  SolanaProvider,
  SolanaConnectButton,
  useSiwsAuth,
} from "./SolanaProvider";
