# android-cap — device potential (strong, honest)

Not a Graphene detector. A **capability** detector for **any Android phone**.

| File | Role |
|------|------|
| `potential.ts` | Types + `mapTier()` |
| `map-tier.ts` | Re-export |
| `probes.android.md` | Kotlin probe checklist |

Policy: [`docs/locked/ANDROID-CAPABILITIES.md`](../../docs/locked/ANDROID-CAPABILITIES.md)  
Surface: [`docs/locked/CLIENT-SURFACE.md`](../../docs/locked/CLIENT-SURFACE.md)

## Rules baked in

1. Tier is **derived from probes**, never a vanity picker.  
2. Feature off when probe is `none` / `denied` — plain copy, no fake glow.  
3. Graphene/local runtime raises tier when **detected**, not when advertised.  
4. Node opt-in ≠ unlimited comms until **Solana entitlement** says so.  
5. Permissions asked **at feature use**, not as a first-launch shakedown.

## Signal

`signalHint`: `weak` | `standard` | `strong` — product may throttle quality; it may **not** throttle rights (constitution, creator splits, safety rules).
