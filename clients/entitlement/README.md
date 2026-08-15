# Entitlement client stub

Reads Viewer unlimited-comms state after Phase 1 deploy.

## Source of truth

Solana `trv_governance` entitlement PDA — **not** the device tier.

| Path | unlimited_comms |
|------|-----------------|
| Active yearly sub | true until expiry |
| Permanent node registered + active | true while active |
| Free | false (weaker signal in product) |

## Files

- `types.ts` — view models  
- `read.ts` — placeholder until IDL artifact exists  

Wire from PWA Access card and native shells the same way.
