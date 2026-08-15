# solana/scripts

| Script | When |
|--------|------|
| `smoke-entitlement.ts` | After local `anchor test` or devnet deploy — proves grant → refresh |

```bash
cd solana
npm install
# local validator via anchor test, or set ANCHOR_PROVIDER_URL=devnet
npx ts-node scripts/smoke-entitlement.ts
```

Requires build host + green `anchor build`. Not for Termux.
