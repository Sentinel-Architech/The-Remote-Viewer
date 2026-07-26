# Identity Technical Stack (Locked)

**Status:** Locked — July 25, 2026  
**Classification:** Implementation foundation for the Identity Layer  
**Depends on:** `01-Identity-Layer.md` and all other locked principles

---

## 1. Purpose

This document defines the concrete technical stack that implements the locked Identity Layer while satisfying every non-negotiable rule in the `docs/locked/` set.

It covers both the standards already required and the operational realities that must be designed from the start (key management, recovery, revocation, offline use, multi-device continuity, anti-phishing, post-quantum readiness, and the tension between legal holds and Destroy = Restart).

---

## 2. Core Standards (Confirmed)

| Layer | Standard / Technology | Status (July 2026) | Role in TRV |
|-------|-----------------------|--------------------|-------------|
| Identifier | W3C DIDs v1.0 (Recommendation) + v1.1 (Candidate Recommendation) | Stable + evolving | User-controlled identifiers |
| Credential Model | W3C Verifiable Credentials Data Model v2.0 | Recommendation (May 2025) | Portable, verifiable claims |
| Integrity | W3C Data Integrity 1.0 + BBS Cryptosuites | Recommendation / CR | Selective disclosure + ZK-friendly |
| Selective Disclosure | SD-JWT + BBS+ | Widely deployed | Reveal only required attributes |
| Issuance | OpenID4VCI 1.0 | 1.0 + self-certification available | Credential issuance |
| Presentation | OpenID4VP 1.0 | 1.0 + self-certification available | Credential presentation |
| Mobile Documents | ISO/IEC 18013-5 + 18013-7 | International standards | High-assurance mdoc / mDL |
| EU Compatibility | EUDI Wallet ARF v3.0.0 (July 2026) + eIDAS 2.0 | Production path | Legal recognition in Europe |
| Status / Revocation | W3C Bitstring Status List | Recommendation | Efficient, privacy-preserving status |

Preferred starting DID methods: `did:key`, `did:jwk`, and `did:web` (for any organizational issuers). Additional methods may be supported later without breaking the core model.

---

## 3. Critical Areas Previously Under-Specified

These items are now locked as required design concerns.

### 3.1 Key Management & Recovery

- Private keys must be generated and stored under user control (device Secure Enclave / StrongBox / TPM or external hardware wallet preferred).
- The platform never holds recovery keys that could restore a burned identity.
- Optional user-chosen recovery methods are permitted (social recovery, Shamir sharing, encrypted offline backup). These are configured by the user and never mediated by a central TRV recovery service that could override a burn.
- Clear UX must state: loss of keys with no recovery method = permanent loss of that identity path (equivalent in effect to a burn).

### 3.2 Revocation & Status

- Implement W3C Bitstring Status List.
- Support issuer-driven revocation without forcing the holder to remain online for every check.
- Status mechanisms must not create a tracking vector back to the holder.
- High-assurance credentials (citizenship proofs, Founding Sovereign Viewer attestations) require defined revocation authority and auditability.

### 3.3 Holder Binding & Device Binding

- Credentials must support cryptographic holder binding to prevent theft and replay.
- Device binding is optional and never mandatory for basic use (mandatory device binding would violate portability).
- Design must remain compatible with EUDI guidance on device binding while preserving the ability to move credentials.

### 3.4 Trust Registries & Issuer Discovery

- Support trusted issuer lists (especially important for government and EUDI credentials).
- Verification of issuer recognition must be possible without a permanent dependency on a central TRV server.
- Local caching of trust anchors with user-controlled refresh is required.

### 3.5 Offline & Intermittent Connectivity

- Full offline presentation capability is required (ISO 18013-5 proximity flows + offline-capable OpenID4VP profiles).
- Credentials must remain usable when the device has no network.
- The trade-off between status-list freshness and offline usability must be explicitly designed and documented.

### 3.6 Multi-Device Continuity Without Central Servers

- Multi-device presence of credentials must be achieved through user-controlled mechanisms (encrypted sync, peer-to-peer, or user-hosted storage).
- No design that requires a central account server to “log in on any device and magically receive the identity.”
- Clear rules for lost or compromised devices must exist.

### 3.7 Anti-Phishing & Presentation Security

- Domain / origin binding for OpenID4VP requests.
- Non-spoofable UI that clearly shows what is being requested and by whom.
- Protection against verifiers that over-request attributes.
- Explicit confirmation for high-value or high-sensitivity presentations.

### 3.8 Credential Lifecycle

- Expiration handling
- Renewal flows
- Schema versioning
- Migration path when cryptographic algorithms are deprecated

### 3.9 Post-Quantum Readiness

- Cryptographic agility is mandatory.
- Monitor and plan adoption of W3C Quantum-Resistant Cryptosuites.
- Avoid irreversible commitment to algorithms that will become obsolete.

### 3.10 Legal Hold vs Destroy = Restart

- Minimize the volume of data that could ever be subject to a legal hold.
- When a user invokes a confirmed burn, the absolute restart rule applies to all data not under a specific lawful preservation order.
- The exact boundary must be documented in policy so there is no future ambiguity.

### 3.11 Auditability Without Surveillance

- Cryptographic audit artifacts that can prove system behavior without creating a surveillance database of user activity.
- Presentation history visible to the user (stored on-device or in the Vault only).

### 3.12 Founding Sovereign Viewer & Membership Attestations

- These statuses are issued as Verifiable Credentials or equivalent attestations under user control.
- They are destroyed with the identity path when Destroy = Restart is invoked.
- Technical controls must prevent cloning or unauthorized transfer contrary to the locked rules.

### 3.13 Wallet Architecture Decision

Two primary paths (and a hybrid) are permitted:

1. Embed a standards-compliant wallet inside The Remote Viewer.
2. Treat external EUDI and third-party wallets as first-class and implement only a thin verification + attestation layer inside TRV.
3. Hybrid: internal lightweight wallet + ability to import/present from external wallets.

The chosen path must still satisfy every non-negotiable rule in the Identity Layer and Vault principles.

---

## 4. Concrete Starting Stack

**Identity Core**
- DID methods: `did:key`, `did:jwk`, `did:web`
- Credential formats: JWT-VC and Data Integrity (BBS+) secured credentials
- Protocols: OpenID4VCI + OpenID4VP (prefer mature open-source implementations compatible with EUDI reference components)

**Cryptography**
- Primary signatures: EdDSA / ECDSA
- Selective disclosure: BBS+ and SD-JWT
- Hardware isolation for private keys wherever the platform permits
- Explicit post-quantum migration plan

**Status**
- W3C Bitstring Status List

**Storage**
- Credentials and keys live only on user device or user-controlled encrypted storage
- Vault remains completely sealed from the identity component

**EU Path**
- Implement EUDI Wallet profiles so European Viewers can use official wallets
- Support PID and Electronic Attestations of Attributes (EAA) presentation

**Recovery**
- Optional user-configured social recovery or encrypted offline backup only
- Never platform-mediated recovery that could override a burn

---

## 5. Suggested Implementation Order

1. DID + basic VC issuance and presentation (OpenID4VCI / OpenID4VP)
2. Selective disclosure (SD-JWT / BBS+)
3. Bitstring Status List
4. Hardware key support + export / backup
5. EUDI profile compatibility
6. Founding Sovereign Viewer + citizenship attestation flows
7. Multi-device continuity model
8. Post-quantum agility planning
9. Full anti-phishing hardening and audit design

---

## 6. Explicit Non-Goals (Protecting Locked Principles)

- No central identity database of personal data
- No mandatory biometrics
- No platform ability to restore a burned identity
- No silent data retention after a confirmed burn
- No vendor lock-in that prevents a Viewer from leaving with their credentials
- No design that makes the Vault readable by identity providers or by SENTINEL

---

## 7. Relationship to Other Locked Documents

- `01-Identity-Layer.md` — This stack is the concrete realization of that principle.
- `02-Vault-Principles.md` & `03-Destroy-Equals-Restart.md` — Key management, recovery, and storage rules exist to make absolute destruction enforceable.
- `04-Founding-Sovereign-Viewer.md` & `05-Membership-Benefits.md` — Attestations for these benefits are issued and controlled under this stack and are destroyed with the identity path.

---

## 8. Final Statement

This technical stack is locked as the implementation foundation for identity in The Remote Viewer.  
Any future library, protocol, or architectural choice must remain compatible with the standards, constraints, and non-goals defined above.

**Start strong. Remain portable. End clean.**
