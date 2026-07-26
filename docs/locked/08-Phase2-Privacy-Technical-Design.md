# Phase 2 — Privacy & Selective Disclosure
## Formal Technical Design (Locked)

**Status:** Locked — July 25, 2026  
**Classification:** Detailed design for Implementation Roadmap Phase 2  
**Depends on:** `01-Identity-Layer.md`, `06-Identity-Technical-Stack.md`, `07-Implementation-Roadmap.md`

---

## 1. Purpose and Scope

This document provides the formal technical design for Phase 2 of the Identity implementation roadmap. Phase 2 transforms the basic issue–store–present flow of Phase 1 into a privacy-preserving system capable of satisfying the locked requirements of The Remote Viewer:

- Minimal and selective disclosure of attributes
- Zero-knowledge-style proofs for high-value claims (especially U.S. citizenship)
- Privacy-preserving revocation and status checking
- Protection against over-requesting verifiers
- Compatibility with Destroy = Restart and Vault isolation

All designs in this document are subordinate to the non-negotiable rules already locked in `docs/locked/`.

---

## 2. Design Goals

1. Enable a Viewer to prove specific attributes without revealing underlying documents or unnecessary personal data.
2. Support both broad interoperability (SD-JWT) and stronger privacy/unlinkability (BBS+).
3. Prevent status checking from becoming a tracking side-channel.
4. Give the holder clear, enforceable control over what is disclosed in every presentation.
5. Ensure that every credential, status entry, and derived proof can be extinguished when Destroy = Restart is invoked.
6. Remain compatible with EUDI Wallet profiles and OpenID4VC ecosystems.

---

## 3. Selective Disclosure Mechanisms

### 3.1 Dual-Suite Strategy

The Remote Viewer shall support two complementary selective disclosure mechanisms:

| Suite | Primary Strength | Primary Use in TRV |
|-------|------------------|--------------------|
| **SD-JWT** (IETF Selective Disclosure for JWTs / SD-JWT VC) | Interoperability, maturity, EUDI alignment | Default path for most attribute presentations |
| **BBS+** (W3C Data Integrity BBS Cryptosuites) | Unlinkability + selective disclosure | High-privacy presentations and correlatable-risk attributes |

Cryptographic agility is mandatory. Profiles may choose one suite or both according to the sensitivity of the attribute and the requirements of the verifier.

### 3.2 SD-JWT Technical Design

**Issuance**
- Issuer constructs a JWT payload in which selectively disclosable claims are replaced by digests.
- Each selectively disclosable claim is salted and hashed; the digest is placed in an `_sd` array (or equivalent structure defined by the SD-JWT specification).
- Issuer produces a signed SD-JWT (JWS) and delivers it to the holder together with the corresponding Disclosures.
- Always-visible (non-selectively-disclosable) claims may remain in cleartext inside the signed payload when required by the use case.

**Storage**
- The SD-JWT and its Disclosures are stored only on the holder’s device or in user-controlled encrypted storage.
- The platform never retains the cleartext Disclosures or the full set of salted values after issuance is complete.

**Presentation**
- Holder selects the subset of Disclosures required for the transaction.
- Holder transmits the SD-JWT + chosen Disclosures to the verifier (via OpenID4VP or equivalent).
- Verifier recomputes digests from the received Disclosures and confirms they match the digests inside the signed SD-JWT; signature verification confirms issuer authenticity and integrity.

**Limitations (explicitly accepted)**
- Standard SD-JWT presentations are not inherently unlinkable. Repeated presentations of the same credential can potentially be correlated.
- Where unlinkability is required, BBS+ (or an equivalent unlinkable scheme) must be used instead of or in addition to SD-JWT.

### 3.3 BBS+ / Data Integrity BBS Technical Design

**Issuance**
- Issuer uses the BBS Sign operation to produce a single signature over multiple messages (the credential claims).
- The resulting base proof / signature is delivered to the holder together with the credential.

**Holder Operations**
- Holder verifies the credential with the BBS Verify operation.
- When presenting, the holder chooses a subset of messages to disclose and invokes BBS ProofGen to produce a derived proof.
- The derived proof is unlinkable to the original signature and to other derived proofs generated from the same credential.

**Verification**
- Verifier uses BBS ProofVerify to confirm that the disclosed messages are consistent with a valid signature from the issuer, without learning the undisclosed messages and without being able to link the presentation to other presentations of the same credential.

**Usage Policy**
- BBS+ is preferred for citizenship proofs, Founding Sovereign Viewer attestations when correlation risk is material, and any presentation profile that explicitly requires unlinkability.
- SD-JWT remains available for verifiers or ecosystems that do not yet support BBS+.

---

## 4. Zero-Knowledge Style Attribute Proofs

### 4.1 Design Principle

High-value attributes (especially U.S. citizenship for the 17.76% membership discount) must be provable with minimal disclosure. The platform must never require upload or retention of underlying identity documents.

### 4.2 Preferred Patterns

1. **Boolean / Derived Claim Pattern**  
   Credential contains a claim such as `isUSCitizen: true` (or an age-over / jurisdiction predicate).  
   Holder discloses only that claim via SD-JWT Disclosure or BBS+ derived proof.

2. **Predicate Pattern (where supported)**  
   Where the credential contains richer data (e.g., date of birth), the presentation may prove a predicate (`age >= 18`) without revealing the raw value, using the capabilities of the chosen suite.

3. **Issuer-Asserted High-Assurance Claim**  
   For citizenship and Founding Sovereign status, the issuer of the attestation is expected to be a trusted authority or the project originator under the locked rules. The holder presents only the resulting attestation, not the evidence that was used to obtain it.

### 4.3 Platform Constraints

- TRV servers must not receive or store passport images, full legal names, addresses, or other raw identity documents for the purpose of granting membership benefits.
- Only the cryptographic proof (or the minimal attested claim) is processed.
- After a successful verification, no residual personal data beyond what is required for the immediate authorization decision may be retained.

### 4.4 Founding Sovereign Viewer Attestations

Founding Sovereign Viewer status is issued as a Verifiable Credential or equivalent attestation under the control of the holder.  
Presentation of this status follows the same selective disclosure and unlinkability rules as other high-value attributes.  
The attestation is destroyed with the identity path when Destroy = Restart is executed.

---

## 5. Bitstring Status List (Revocation and Suspension)

### 5.1 Purpose

Provide a privacy-preserving, space-efficient mechanism for issuers to publish the status (valid, revoked, suspended) of credentials without creating a one-to-one tracking channel between a credential and a status check.

### 5.2 Technical Requirements

- Implement the W3C Bitstring Status List Recommendation.
- Credentials that support status checking must reference a status list entry in a manner consistent with the specification.
- Status lists must be designed so that individual credentials are not given unique, easily correlatable status endpoints.
- Random bit assignment and related mitigations against statistical attacks should be considered in light of current W3C guidance.

### 5.3 Privacy Rules

- The system must not create a unique status list or unique cryptographic status material per credential in a way that enables 1:1 tracking by default.
- Status checks performed by verifiers or by the platform must not become a reliable side-channel for learning a holder’s activity patterns.
- After a confirmed burn of an identity path, residual status information must not be usable to re-link the destroyed path to a future identity.

### 5.4 Operational Rules

- Issuers (including the project when acting as issuer of Founding Sovereign or membership attestations) are responsible for maintaining accurate status lists.
- Holders must be able to discover the status of their own credentials.
- Offline presentation policies must define how status freshness is handled when a device cannot reach a status list endpoint.

---

## 6. Anti-Over-Request Protection

### 6.1 Problem Statement

Cryptographic selective disclosure is insufficient if the presentation interface allows a verifier to demand excessive attributes or if the holder cannot clearly see and refuse individual requests.

### 6.2 Mandatory UI and Protocol Controls

1. **Clear Request Display**  
   The interface must show, in non-spoofable form, exactly which claims or attributes are being requested and by which verifier (origin / domain binding).

2. **Granular Holder Control**  
   The holder must be able to accept or refuse individual claims within a presentation request where the protocol and credential structure permit.

3. **Purpose and Minimization Warnings**  
   When a request appears to ask for more than necessary for a stated purpose, the interface should surface a warning.

4. **High-Sensitivity Confirmation**  
   Presentation of citizenship, Founding Sovereign status, or other high-value attributes requires explicit additional confirmation.

5. **Origin Binding**  
   OpenID4VP (and equivalent) requests must be bound to the requesting origin so that the holder can trust the displayed verifier identity.

### 6.3 Protocol Alignment

Anti-over-request controls are implemented primarily in the wallet / presentation layer that processes OpenID4VP requests (and any future equivalent protocols). They complement, rather than replace, the cryptographic selective disclosure mechanisms.

---

## 7. Interaction with Locked Principles

| Locked Principle | Design Response in Phase 2 |
|------------------|----------------------------|
| No centralized personal data | Selective disclosure + on-device / user-controlled storage; platform processes only proofs or minimal attested claims |
| Minimal disclosure for citizenship | Boolean or derived claim presented via SD-JWT or BBS+; no document upload to TRV |
| Destroy = Restart | Status entries, derived proofs, and attestations are designed so that a confirmed burn leaves no residual re-linkable identity path |
| Vault sealed from identity | Identity component never reads Vault contents; presentations remain in the identity layer |
| EUDI compatibility | SD-JWT path prioritized for interoperability; BBS+ available where stronger privacy is needed |
| Founding Sovereign & membership benefits | Issued and presented as holder-controlled attestations subject to the same privacy and destruction rules |

---

## 8. Implementation Sequence Inside Phase 2

1. SD-JWT issuance and presentation end-to-end  
2. Bitstring Status List support  
3. BBS+ Data Integrity suite (issuance, proof generation, verification)  
4. Presentation UI anti-over-request controls and origin binding  
5. Specific profiles for citizenship and Founding Sovereign Viewer attestations using the above mechanisms  
6. Verification that burn flows extinguish status and attestation material appropriately

---

## 9. Testing and Acceptance Criteria

Phase 2 is complete only when all of the following are demonstrated:

- A holder can prove a citizenship (or equivalent) attribute without revealing name, document number, photograph, or other raw identity data to the verifier or to TRV servers.
- Both SD-JWT and BBS+ presentation paths function correctly for at least one high-value attribute.
- Status list checks do not create an obvious 1:1 tracking channel under normal operation.
- The presentation interface clearly displays requested claims, supports refusal of individual claims where applicable, and requires extra confirmation for high-sensitivity attributes.
- After a confirmed Destroy = Restart, no residual status or attestation artifact remains that can re-identify the burned identity path.
- EUDI-oriented SD-JWT flows remain interoperable with the chosen profiles.

---

## 10. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Correlation of repeated SD-JWT presentations | Prefer BBS+ for high-correlation-risk attributes; design claims carefully; educate holders |
| Malicious issuer creating unique status lists per credential | Policy and technical detection; reject or flag non-conformant status list designs |
| Over-requesting verifiers | Mandatory UI controls and origin binding; holder ability to refuse |
| Complexity of supporting two suites | Clear profiles, cryptographic agility, and phased rollout (SD-JWT first, BBS+ next) |
| Status list freshness vs offline use | Explicit offline policy; documented trade-offs |
| Residual data after burn | Design status and attestation lifecycle so that burn is absolute for all non-legally-required data |

---

## 11. Non-Goals of Phase 2

- Full post-quantum selective disclosure suites (addressed in later phases under cryptographic agility)
- Complete multi-device encrypted sync (Phase 5)
- Production hardening and formal security audit (Phase 6)
- Replacement of the Vault or any weakening of Destroy = Restart

---

## 12. Relationship to Other Locked Documents

This design is the detailed realization of Phase 2 in `07-Implementation-Roadmap.md` and implements the privacy-related requirements of:

- `01-Identity-Layer.md`
- `06-Identity-Technical-Stack.md`
- `03-Destroy-Equals-Restart.md`
- `04-Founding-Sovereign-Viewer.md`
- `05-Membership-Benefits.md`

Any implementation that contradicts this design or the higher-level locked principles is prohibited.

---

## 13. Final Statement

Phase 2 exists so that The Remote Viewer can keep its privacy promises in cryptographic reality, not only in policy language.

Selective disclosure, unlinkable proofs where required, privacy-preserving status, and holder-controlled presentation decisions are mandatory.

**Disclose only what is necessary. Prove without exposing. Burn without residue.**
