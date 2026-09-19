# Solana Wallet + SIWS Integration Notes

## Install dependencies (run once)

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

## Wire into the Hub

1. Import and wrap the root layout / app with `<SolanaProvider>`.
2. Place `<SolanaConnectButton />` or a custom button that calls `useSiwsAuth().signIn()` where the citizen registration / login UI lives.
3. After successful SIWS, bind the Solana public key to the existing Ed25519 citizen identity (Better Auth session or local vault).

## Design constraints preserved

- Local-first Ed25519 remains the primary identity.
- SIWS is the bridge to on-chain actions.
- Optical air-gap verification stays the highest-trust path.
- Wallet connection is optional; the Hub functions without it.
