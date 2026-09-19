# Solana Wallet Setup (OPTIONAL TRACK ONLY)

**Rule of Law**: The Viewer Hub is 100% native stack and fully operational without any Solana packages or blockchain dependency.

Primary identity = `NativeIdentityProvider` (Ed25519 + Better Auth + optical air-gap).

Solana / SIWS is a parallel, additive bridge. It must never become a requirement.

## When you want the optional Solana track

```bash
cd apps/hub
npm install \
  @solana/wallet-adapter-base \
  @solana/wallet-adapter-react \
  @solana/wallet-adapter-react-ui \
  @solana/wallet-adapter-wallets \
  @solana/web3.js \
  bs58
```

Then wrap only the parts of the tree that need it:

```tsx
import { NativeIdentityProvider } from "./providers/NativeIdentityProvider";
import { SolanaProvider } from "./providers/SolanaProvider"; // optional

export function App({ children }) {
  return (
    <NativeIdentityProvider>
      <SolanaProvider>   {/* can be omitted entirely */}
        {children}
      </SolanaProvider>
    </NativeIdentityProvider>
  );
}
```

## Native path (always on)

- Use `useNativeIdentity()` for citizen registration and local signing.
- Optical air-gap remains the highest-trust verification method.
- No external wallet, no RPC, no chain required for Hub features.

## Design constraints (non-negotiable)

- Local-first
- No mandatory external services
- Fully operational offline
- Solana is never required for the Viewer Hub to function
