# Library Choices (Locked)

**Status:** Locked — July 25, 2026  
**Phase:** 0 — Foundation & Guardrails  
**Stack target:** TypeScript (web + mobile scaffold under `apps/`)  
**Architecture:** Hybrid wallet (`09-Wallet-Architecture.md`)  
**Depends on:** `06-Identity-Technical-Stack.md`, `07-Implementation-Roadmap.md`, `08-Phase2-Privacy-Technical-Design.md`

---

## 1. Purpose

This document locks the **initial open-source libraries** for implementing the internal TRV wallet and external verification path.

Constraints that every choice must satisfy:

- No requirement to store private keys or full credential archives on TRV servers  
- TypeScript-friendly for `apps/web` and `apps/mobile`  
- Align with OpenID4VCI / OpenID4VP, SD-JWT, and W3C Bitstring Status List where applicable  
- Prefer actively maintained, standards-oriented projects over proprietary SDKs that force custody models  
- Cryptographic agility: suites can be swapped without redesigning product policy  

Libraries are **implementation tools**. They do not override locked principles. If a library’s default patterns encourage server-side key custody or credential archiving, those patterns must not be used.

---

## 2. Primary Stack (Recommended Default)

| Layer | Primary library / package | Role |
|-------|---------------------------|------|
| JOSE / JWT primitives | [`jose`](https://github.com/panva/jose) | Sign, verify, JWK, compact JWS — shared foundation |
| SD-JWT core | `@sd-jwt/core` (+ `@sd-jwt/types`, `@sd-jwt/decode`, `@sd-jwt/present`) | Issue, present, verify Selective Disclosure JWTs (RFC 9901 line) |
| SD-JWT VC | `@sd-jwt/sd-jwt-vc` | SD-JWT-based Verifiable Credentials profile |
| Token status (SD-JWT ecosystem) | `@sd-jwt/jwt-status-list` (evaluate at integrate time) | Status list support in the SD-JWT / OAuth status-list family |
| OpenID4VCI | `@openid4vc/openid4vci` (OpenWallet Foundation Labs `oid4vc-ts`) | Issuance protocol (holder + issuer roles as needed) |
| OpenID4VP | `@openid4vc/openid4vp` (same monorepo) | Presentation protocol (wallet + verifier roles) |
| OAuth helpers (as needed) | `@openid4vc/oauth2` (same monorepo) | Auth server / client primitives used by OID4VC flows |
| W3C Bitstring Status List | `@digitalbazaar/vc-bitstring-status-list` | Create/read Bitstring Status List credentials for W3C VC status |
| DID: key / jwk | Lean custom helpers **or** minimal method packages (see §4) | `did:key` and `did:jwk` for Phase 1 internal wallet |

**Why this set**

- **OpenWallet Foundation `oid4vc-ts`**: TypeScript-native OpenID4VCI/VP with HAIP-oriented features; fits web/mobile TS monorepo; not a full custodial “identity cloud.”  
- **`@sd-jwt/*`**: Dominant TS SD-JWT stack; React Native–capable lineage; pairs with EUDI-oriented SD-JWT VC usage.  
- **`jose`**: Standard, audited-pattern JOSE toolkit; keep crypto surface coherent.  
- **Digital Bazaar bitstring list**: Direct implementation of the W3C Bitstring Status List Recommendation used in Phase 2 design.

---

## 3. Alternate / Complementary Libraries

| Need | Alternate | When to use |
|------|-----------|-------------|
| EUDI-focused **verifier** parsing (SD-JWT VC + mdoc) | `@openeudi/openid4vp` | External-wallet verification path specialized for EUDI presentations |
| OID4VC (Sphereon) | `@sphereon/oid4vci-client`, Sphereon OID4VP packages | If OWF packages block progress; re-evaluate maturity and draft version support |
| Full agent framework | Veramo (`@veramo/*`) | Only if product later needs a large plugin agent; **not** default for Phase 1 (heavy, easy to misuse with server KMS) |
| walt.id | Kotlin multiplatform OpenID4VP 1.0 libraries | If a future native Kotlin path appears; not primary for current TS scaffold |
| BBS+ / Data Integrity | W3C VC Data Integrity BBS cryptosuite implementations (evaluate at Phase 2) | Unlinkable selective disclosure path per `08-Phase2-Privacy-Technical-Design.md` |

**Default policy:** Start with OWF + `@sd-jwt/*` + `jose` + Digital Bazaar status list. Add `@openeudi/openid4vp` when implementing the EUDI external presentation verifier.

---

## 4. DID Method Strategy (Phase 1)

| Method | Phase 1 stance |
|--------|----------------|
| `did:key` | **Primary** for internal wallet identifiers |
| `did:jwk` | **Supported** where JWK-native interop helps |
| `did:web` | Optional later for organizational issuers — not required for holder Phase 1 |

**Implementation note:** Prefer small, explicit create/resolve helpers over adopting a full DID manager that defaults to networked or server-side key stores. If Veramo DID providers are considered later, configure **local-only** KMS and never ship a platform-held `SecretBox` master key model for user identity keys.

---

## 5. Mapping to Hybrid Roles

### Internal TRV wallet (holder + TRV-as-issuer for TRV attestations)

- `jose` + `@sd-jwt/*` for credential format  
- `@openid4vc/openid4vci` client for receiving credentials; issuer pieces only for TRV-issued attestations  
- `@openid4vc/openid4vp` wallet-side for presentations  
- Keys: device-local (Web Crypto / secure enclave paths in later phases); **no server KMS for user keys**

### External wallet path (TRV as verifier)

- `@openid4vc/openid4vp` verifier role and/or `@openeudi/openid4vp` for EUDI SD-JWT VC / mdoc  
- Verify → emit **minimal authorization result** only (retention R3)  
- Do not archive full presentations or Disclosures

### Status

- W3C list path: `@digitalbazaar/vc-bitstring-status-list`  
- SD-JWT token status path: evaluate `@sd-jwt/jwt-status-list` for consistency with SD-JWT VC deployments  
- Cache per R4 (≤ 24 hours); no 1:1 tracking status endpoints

---

## 6. Explicit Non-Choices (Initial Generation)

| Avoid as default | Reason |
|------------------|--------|
| Server-side Veramo/KMS with platform master secret for user keys | Violates key-loss threat model and Class A zero retention |
| Custodial SaaS wallet APIs as the only identity path | Conflicts with Hybrid internal burn semantics and no-custody rule |
| Draft-only OID4VC stacks without a maintenance path | Prefer OWF TS or clearly versioned alternatives; pin versions |
| Logging middleware that dumps JWTs / Disclosures | Violates retention and legal-hold boundary |

---

## 7. Version Pinning & Supply Chain

1. Pin exact versions in lockfiles for all identity packages.  
2. Prefer packages with public repos, clear licenses (Apache-2.0 / MIT / BSD), and recent commits.  
3. On upgrade: re-run Phase 1/2 acceptance tests (issue → present → verify; selective disclosure; status check; burn does not require server keys).  
4. Document any fork or patch in-repo; do not silently vendor unbroken upstream semantics.

---

## 8. Phase Alignment

| Phase | Libraries in play |
|-------|-------------------|
| **1** | `jose`, DID key/jwk helpers, basic JWT-VC or SD-JWT issue/present, `@openid4vc/openid4vci` + `openid4vp` minimal path |
| **2** | Full `@sd-jwt/sd-jwt-vc`, status lists, anti-over-request UI (app code), optional BBS+ evaluation |
| **3** | Hardware-backed key integration (platform APIs), encrypted export — libraries above unchanged in role |
| **4** | `@openeudi/openid4vp` (or equivalent) for EUDI external verify; Founding/citizenship attestation profiles |

---

## 9. Acceptance Criteria (Phase 0 complete for libraries)

- [x] Primary stack named and locked in this document  
- [ ] Spike: create `did:key`, issue one SD-JWT or JWT credential in-process, verify locally (no server key store)  
- [ ] Spike: one OpenID4VP request/response round-trip in dev  
- [ ] Confirm chosen packages build in `apps/web` (and mobile constraints noted)  
- [ ] Dependency review: no forced telemetry/custody SaaS requirement  

---

## 10. Final Statement

**Default identity libraries:** `jose` + OpenWallet Foundation `@openid4vc/*` + `@sd-jwt/*` + Digital Bazaar bitstring status list, with lean `did:key` / `did:jwk`.

**EUDI external verify:** add `@openeudi/openid4vp` when that path is built.

**Never let a library default become key custody.**

Pin, spike, then implement Phase 1 against the locked roadmap — not against vendor demos that store what we refuse to hold.
