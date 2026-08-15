# android-cap — device potential detection

Scaffold for **any Android phone**. Graphene is detected as a stronger environment when present; it is not required.

## Layout

```text
clients/android-cap/
  README.md
  potential.ts          # pure types + tier derivation (PWA + RN shared)
  probes.android.md     # native probe checklist (Kotlin/Java)
  map-tier.ts           # tier 0–3 from probe results
```

## Use

1. Run probes at session start and when returning from settings.  
2. Feed results into `mapTier()`.  
3. Gate UI features on `DevicePotential`, not on marketing labels.  
4. Entitlement (unlimited comms) still comes from Solana node/sub — not from tier alone.

See `docs/locked/ANDROID-CAPABILITIES.md`.
