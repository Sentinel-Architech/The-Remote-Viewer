# Library Choices (Locked) — Phase 0

**Status:** Locked — 2026-08-14  
**Phase:** 0 — Foundation & Guardrails  
**Depends on:** `06-Identity-Technical-Stack.md`, `09-Wallet-Architecture.md`

---

## 1. Decision Summary

Initial open-source libraries for the Identity Layer are locked as follows.  
Choices prioritize:

- Local-first / on-device execution
- React Native / Expo compatibility (mobile client)
- No platform key custody
- Alignment with W3C VC 2.0, OpenID4VCI/VP 1.0, SD-JWT, Bitstring Status List
- EUDI path compatibility without locking into a single vendor SDK
- Ability to implement Destroy = Restart cleanly

---

## 2. Core Stack (Phase 1 starting point)

| Concern | Library / Package | Notes |
|---------|-------------------|-------|
| did:key generation & signing | `@noble/ed25519` + `multiformats` (base58btc) | Already in mobile client; keep |
| Secure storage (mobile) | `expo-secure-store` with hardened options | Already in use; Expo Go is exploration-only |
| CSPRNG polyfill | `expo-crypto` | Already in use |
| OpenID4VCI | `@openid4vc/openid4vci` (openwallet-foundation-labs/oid4vc-ts) | RN / Node / browser; format-agnostic |
| OpenID4VP | `@openid4vc/openid4vp` (same family) | Same runtime support |
| SD-JWT / SD-JWT-VC | `@sd-jwt/core` + `@sd-jwt/sd-jwt-vc` (OpenWallet Foundation) | TypeScript reference implementation; RN-compatible |
| DID resolution (generic) | `did-resolver` + method-specific resolvers as needed | Universal interface; add only methods required |
| Bitstring Status List | Pair with SD-JWT / VC libraries that implement W3C Bitstring Status List | Prefer implementations that do not require continuous online tracking |

---

## 3. Explicit Non-Choices (Initial Phase)

| Option | Reason |
|--------|--------|
| Full Veramo agent as mandatory core | Heavier; useful later if needed, not required for Phase 1 primitives |
| Credo as mandatory core | Strong RN + OpenID4VC support; evaluate as optional upgrade path after thin stack proves viable |
| walt.id as primary mobile stack | Kotlin-first; less natural fit for current Expo TypeScript client |
| Any library that mandates server-side key or credential storage | Violates locked principles |
| Libraries that embed recovery escrow controlled by a third party | Violates Destroy = Restart |

---

## 4. Hybrid Wallet Mapping

- **Internal TRV wallet:** Uses the stack above for DID creation, credential hold, OpenID4VCI receive, OpenID4VP present of TRV-issued material.
- **External path:** Uses OpenID4VP verification side of the same libraries (or equivalent) to accept presentations from EUDI and other compliant wallets without importing their private keys.

---

## 5. Evolution Rules

1. New libraries may be added only if they remain compatible with the non-negotiables in `01`–`06` and `09`.
2. Replacing a locked library requires an explicit locked revision and migration note.
3. Post-quantum / new cryptosuites will be evaluated under the cryptographic agility requirement; the current stack must not block that path.
4. Hardware-backed key providers (StrongBox, Secure Enclave, external hardware) are Phase 3; the chosen libraries must not prevent their later introduction.

---

## 6. Acceptance

- Phase 1 implementation of DID + basic VC issue/store/present must use only libraries consistent with this document (or document a justified, temporary exception).
- Mobile client continues to treat Expo Go as non-production.

**Final statement**  
Start thin, stay portable, keep the burn path absolute.  
These libraries are the approved starting surface — not a permanent ceiling.
