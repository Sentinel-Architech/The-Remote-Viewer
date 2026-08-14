# Implementation Roadmap (Locked)

**Status:** Locked — July 25, 2026 (Phase 0 closed 2026-08-14)  
**Classification:** Execution plan for the Identity Layer and related sovereignty principles  
**Depends on:** All documents in `docs/locked/` (especially `01` through `06`, plus `09`–`13`)

---

## Purpose

This roadmap translates the locked principles and technical stack into a concrete, ordered sequence of work.  
It is designed to protect the non-negotiable rules at every stage so that no intermediate implementation accidentally violates sovereignty, Vault isolation, or the Destroy = Restart guarantee.

---

## Guiding Constraints (Non-Negotiable During Implementation)

- No central store of personal data may be introduced at any phase.
- No platform-held recovery key that could override a burn may be created.
- The Vault must remain sealed from the identity component at all times.
- Every credential and status must be destroyable with the identity path.
- Cryptographic agility and post-quantum readiness must be considered from the first phase.
- EUDI compatibility is a first-class requirement, not a later add-on.

---

## Phase 0 — Foundation & Guardrails (Immediate)

**Goal:** Establish the architectural and policy boundaries before writing production identity code.

- [x] Lock all core principles (`docs/locked/01`–`06`)
- [x] Finalize wallet architecture decision (embedded / external / hybrid) → **Hybrid** (`09-Wallet-Architecture.md`)
- [x] Define exact data-minimization boundary for any future legal hold → `12-Residual-Data-and-Phishing.md`
- [x] Choose initial open-source libraries for DID, VC, OpenID4VCI/VP, and status lists → `11-Library-Choices.md`
- [x] Create threat model focused on key loss, phishing, and residual data after burn → `10` + `12`
- [x] Document the user-facing language for burn confirmation flows → `13-Burn-Confirmation-Language.md`

**Exit criteria:** Written decisions on wallet approach, library choices, and legal-hold boundary. **Met 2026-08-14.**

---

## Phase 1 — Core Identity Primitives

**Goal:** A Viewer can create a DID, receive a basic Verifiable Credential, and present it.

- [ ] DID generation and resolution (`did:key` / `did:jwk` first)
- [ ] Basic Verifiable Credential issuance (W3C VC Data Model 2.0)
- [ ] OpenID4VCI issuance flow
- [ ] OpenID4VP presentation flow
- [ ] On-device storage of credentials and keys (no server-side personal data)
- [ ] Minimal holder binding

**Exit criteria:** End-to-end demo of issue → store → present a credential with no central identity database.

---

## Phase 2 — Privacy & Selective Disclosure

**Goal:** Support the privacy properties required by the locked Identity Layer.

- [ ] SD-JWT selective disclosure
- [ ] BBS+ / Data Integrity selective disclosure suites
- [ ] Zero-knowledge friendly presentation paths for citizenship and similar attributes
- [ ] Bitstring Status List implementation
- [ ] Basic anti-over-request protection in the presentation UI

**Exit criteria:** Ability to prove “U.S. citizen” (or equivalent attribute) without revealing underlying document data.

---

## Phase 3 — Key Management, Backup & Recovery

**Goal:** Make key control and recovery consistent with Destroy = Restart.

- [ ] Hardware-backed key support where available (Secure Enclave / StrongBox / TPM)
- [ ] Encrypted export of credentials and keys under user control
- [ ] Optional user-configured recovery (social recovery or Shamir-style) — never platform-mediated
- [ ] Explicit UX stating that loss of keys with no recovery = permanent loss of the identity path
- [ ] Device-loss and compromise procedures

**Exit criteria:** A Viewer can back up and (optionally) recover their identity without giving the platform the power to restore a burned path.

---

## Phase 4 — EUDI Compatibility & High-Assurance Credentials

**Goal:** European Viewers can use official wallets; high-assurance attributes are supported.

- [ ] EUDI Wallet profile support (ARF 3.0 aligned)
- [ ] PID and Electronic Attestation of Attributes (EAA) presentation
- [ ] ISO 18013-5 / 18013-7 mdoc support as needed
- [ ] Trusted issuer list handling with local caching
- [ ] Founding Sovereign Viewer attestation issuance and verification
- [ ] American citizen discount attestation flow (ZK)

**Exit criteria:** Successful presentation from an EUDI-compatible wallet and working Founding Sovereign + citizenship attestation paths.

---

## Phase 5 — Offline, Multi-Device & Continuity

**Goal:** Identity remains usable without constant connectivity and without central servers.

- [ ] Offline presentation (proximity and offline OpenID4VP profiles)
- [ ] Status-list freshness vs offline usability policy
- [ ] User-controlled multi-device credential presence (encrypted sync or equivalent)
- [ ] Clear rules for adding and removing devices
- [ ] No central “log in anywhere” identity server

**Exit criteria:** Credentials can be presented offline and can exist on more than one user-controlled device without a central account database.

---

## Phase 6 — Hardening, Lifecycle & Post-Quantum

**Goal:** Production-grade security, lifecycle management, and future-proofing.

- [ ] Full anti-phishing measures (origin binding, clear request UI, confirmation for sensitive presentations)
- [ ] Credential expiration, renewal, and schema versioning
- [ ] Cryptographic agility framework
- [ ] Monitoring and adoption plan for W3C Quantum-Resistant Cryptosuites
- [ ] Audit artifacts that prove system behavior without creating surveillance data
- [ ] End-to-end test of Destroy = Restart (including Founding status and membership attestations)

**Exit criteria:** Security review passed, burn flow verified as absolute, post-quantum migration path documented.

---

## Phase 7 — Integration with the Wider System

**Goal:** Identity becomes the stable foundation for the rest of The Remote Viewer.

- [ ] Vault remains sealed from identity component (verified)
- [ ] SENTINEL receives only minimal, user-approved signals
- [ ] Forum / NFT anti-Sybil checks (optional personhood) wired through the identity layer
- [ ] Membership and shop discount enforcement via attestations
- [ ] Digital legacy / transfer options (if any) designed to remain compatible with absolute burn

**Exit criteria:** Identity Layer is the sole source of truth for access, benefits, and status across the product.

---

## Ongoing / Parallel Workstreams

These run alongside the phases above:

- Continuous threat modeling focused on residual data and key compromise
- Tracking of W3C DID 1.1, VC suites, and EUDI ARF updates
- Open-source library evaluation and contribution where aligned with project goals
- Legal and policy review of the burn vs legal-hold boundary
- Documentation of user-facing explanations for every irreversible action

---

## Success Metrics (Sovereignty-Oriented)

- Zero personal identity data stored in identifiable form on project servers
- Ability for a Viewer to leave with their credentials intact
- Ability for a Viewer to burn their identity path with no residual platform-side continuity
- Successful EUDI-compatible presentation
- Working ZK citizenship and Founding Sovereign attestations
- No platform capability to restore a burned identity

---

## Relationship to Other Locked Documents

This roadmap is the execution plan for:

- `01-Identity-Layer.md`
- `02-Vault-Principles.md`
- `03-Destroy-Equals-Restart.md`
- `04-Founding-Sovereign-Viewer.md`
- `05-Membership-Benefits.md`
- `06-Identity-Technical-Stack.md`
- `09-Wallet-Architecture.md`
- `10-Threat-Model-Key-Loss.md`
- `11-Library-Choices.md`
- `12-Residual-Data-and-Phishing.md`
- `13-Burn-Confirmation-Language.md`

Any change to the roadmap that would weaken a locked principle is prohibited.

---

## Final Statement

Implement in the order above.  
Protect the locked principles at every phase.  
When in doubt, choose the option that preserves user control and the absolute nature of Destroy = Restart.

**Start strong. Ship only what remains sovereign. End clean.**
