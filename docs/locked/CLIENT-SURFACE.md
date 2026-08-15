# Client surface — any capable phone (+ optional wearables)

**Locked 2026-08-14.** GrapheneOS is the *hardened tier*, not the only door.  
Wearables: [WEARABLES.md](WEARABLES.md) — optional endpoints, never a gate.

## Principle

A Viewer uses The Remote Viewer on **any phone that can reasonably run the client**, with capability scaled to the device. Watches, earbuds, and bands **extend** modalities when present.

## Tiers (device potential → product strength)

| Tier | Example devices | What Viewers get |
|------|-----------------|------------------|
| **T0 — Baseline** | Stock Android, modern browsers | Account, text, web/DApp, sub/node entitlement, basic STT/TTS if OS allows |
| **T1 — Capable** | Camera + mic + secure storage | T0 + sight, hearing, wake where OS permits |
| **T2 — Hardened** | Graphene / de-Googled + local runtime | T1 + optical, local models, stronger custody |
| **T3 — Edge node** | Always-on node host | Unlimited comms while chain says active |
| **Wear adjunct** | Wear OS / earbuds / headset | Glance, haptics, audio route — keys stay phone-bridged |

**Weaker signal on lower tiers is allowed.** Exclusion of an entire phone *or* wearable class is not required for membership.

## Explicit non-gates

- GrapheneOS **not** required  
- Pixel **not** required  
- Wearable **not** required  
- iOS when E2E holds  

## Engineering order

1. Solana entitlement  
2. Web/PWA  
3. Android + `android-cap`  
4. Wear OS glance + audio route  
5. Graphene T2  
6. iOS / watch bridge under E2E rules  

## One line

**Any capable phone can be a Viewer; wearables optional; Graphene stronger, not exclusive.**
