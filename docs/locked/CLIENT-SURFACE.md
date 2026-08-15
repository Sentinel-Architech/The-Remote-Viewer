# Client surface — any capable phone

**Locked 2026-08-14.** GrapheneOS is the *hardened tier*, not the only door.

## Principle

A Viewer should be able to use The Remote Viewer on **any phone that can reasonably run the client**, with capability scaled to what that device actually provides. No lock-in to one OEM, one ROM, or one app store as a hard requirement for membership.

## Tiers (device potential → product strength)

| Tier | Example devices | What Viewers get |
|------|-----------------|------------------|
| **T0 — Baseline** | Stock Android (recent), most mid/high phones | Account, text, web/DApp surface, sub/node entitlement, basic STT/TTS if OS allows |
| **T1 — Capable** | Android with reliable camera + mic + secure storage | T0 + camera sight, mic hearing, on-device preference storage, wake phrase where OS permits |
| **T2 — Hardened** | GrapheneOS / de-Googled + Termux-class local stack | T1 + optical air-gap paths, local models, stronger key custody, minimal Google surface |
| **T3 — Edge node** | Phone or always-on small hardware that opts in as validator/node | T2 goals + permanent node path → unlimited comms entitlement |

**Weaker signal on lower tiers is allowed** (already product policy). Exclusion of an entire phone class is not.

## Explicit non-gates

- GrapheneOS is **not** required to join, buy $96, create, or sell.  
- Pixel is **not** required.  
- iOS is **not** forbidden by policy; ship when a real client path exists without violating E2E / no-backdoor rules.  
- Expo Go / closed store-only demos are convenience, not the sovereignty definition.

## Capability negotiation (client must)

1. Detect what the device actually offers (camera, mic, biometrics, background, secure storage).  
2. Enable features that work; **degrade clearly** when they do not (no fake “on” states).  
3. Never claim Graphene-only features on stock if they are not present.  
4. Prefer open clients (PWA / sideload / F-Droid-class) alongside any store build.

## Store vs sideload

| Channel | Role |
|---------|------|
| Web / PWA | Fastest “any phone” entry |
| Android APK (sideload) | Full capability without single-store veto |
| Play / other stores | Reach; must not become the only entitlement path |
| Graphene / hardened | Best custody and local AI; marketing as *stronger*, not *exclusive* |

## Security bar (all tiers)

- No platform cut of creator earnings (still 95/5 and 90/10).  
- Deepfake / non-distinguishable human likeness rules still apply.  
- Integrity / Area bulletin behavior remains real-data and discrete.  
- Keys: best available on device; document tradeoffs per tier.

## Engineering order

1. Shared protocol + Solana entitlement (chain is source of truth).  
2. Web/PWA baseline so *any* browser phone can enter.  
3. Android app with capability detection (T0→T1).  
4. Graphene / Termux paths as T2 enhancements.  
5. iOS only when E2E and distribution rules are satisfied without silent compromise.

## One line

**Any phone with the potential can be a Viewer; Graphene makes a stronger Viewer, not the only Viewer.**
