# Identity Layer (Locked)

**Status:** Locked — July 25, 2026  
**Classification:** Non-negotiable foundation

---

## Core Principle

Every Viewer enters The Remote Viewer through a high-assurance, privacy-preserving identity system.  
**Identity is the foundation of sovereignty.**

Without a strong, user-controlled identity layer, every subsequent claim of privacy, data ownership, or “zero-trust” becomes cosmetic. This layer is therefore locked first and treated as permanent architecture, not a feature that can be weakened later for convenience or growth.

---

## Why This Exists

Traditional identity systems create three permanent risks:

1. **Centralized honeypots** — platforms store personal data that becomes a high-value target.
2. **Forced disclosure** — users must reveal more than necessary to prove a single attribute.
3. **Vendor dependency** — identity is tied to a company’s continued existence and policies.

The Remote Viewer rejects all three. The Identity Layer is designed so that:

- The user holds the keys.
- Proofs can be selective and zero-knowledge.
- No single party (including the project itself) can unilaterally revoke or inspect the underlying personal data.

---

## Standards Supported

The system is built on open, battle-tested standards rather than proprietary schemes:

- **W3C Decentralized Identifiers (DIDs)** — user-controlled, resolvable identifiers that do not require a central registry owned by any company.
- **W3C Verifiable Credentials Data Model 2.0** — cryptographically signed claims that can be verified without contacting the issuer in real time.
- **OpenID for Verifiable Credentials (OID4VCI / OID4VP)** — modern issuance and presentation protocols used by the EUDI Wallet and growing enterprise ecosystems.
- **Selective Disclosure** (SD-JWT, AnonCreds) — ability to reveal only the exact attributes required for a given interaction.
- **Zero-Knowledge Proofs** — mathematical proofs that an attribute is true (e.g., “is a U.S. citizen”, “is over 18”) without revealing the underlying document or biometric.
- **ISO/IEC 18013-5 and 18013-7** — mobile driving licence / mobile document standards, enabling high-assurance physical credentials to be used digitally.
- **Full compatibility with the official EU Digital Identity (EUDI) Wallet under eIDAS 2.0** — ensuring European Viewers can use their legally recognized national wallets.

These standards are chosen because they are already recognized by governments and large institutions, reducing future regulatory friction while preserving user control.

---

## Key Capabilities

| Capability | Purpose | Privacy Property |
|------------|---------|------------------|
| Proof of U.S. citizenship | Claim the 17.76% membership discount | Zero-knowledge; no document images or full personal data required |
| Proof of EU residency / nationality | Compatibility with EU services and future regional benefits | Uses official EUDI Wallet or equivalent ZK credentials |
| Proof of unique personhood | Optional anti-Sybil protection for Forum participation and native NFT minting | Can be biometric, social-graph, or puzzle-based; never mandatory for core use |
| Geographic / jurisdictional attributes | Support location-aware features without doxxing | Selective disclosure only |
| Full user control of credentials and keys | Prevent platform lock-in or sudden policy changes | Keys never leave the user’s device or hardware wallet without explicit consent |

---

## Non-Negotiable Rules

These rules cannot be overridden by future product decisions, growth pressure, or partnerships:

1. **No centralized database of personal data**  
   The project never becomes a store of passports, biometrics, or full identity dossiers.

2. **No forced biometrics**  
   Biometric methods may be offered as one optional path to uniqueness, never as a requirement.

3. **No vendor lock-in**  
   Credentials and keys must remain portable. A Viewer must be able to leave with their identity intact.

4. **The Vault remains completely sealed**  
   No identity provider, no platform service, and no version of SENTINEL may read the contents of a Viewer’s Vault.

5. **SENTINEL never gains access to raw personal data stored in the Vault**  
   Even the AI companion operates under this constraint. It may receive only the minimal, user-approved signals required for its function.

---

## Interaction with Other Locked Principles

- **Vault Principles** — Identity credentials may be stored inside the Vault, but the Vault itself is never opened to identity providers.
- **Destroy = Restart** — Permanent destruction of the identity path wipes all associated credentials and status. There is no residual identity that survives the burn.
- **Founding Sovereign Viewer & Membership Benefits** — These statuses are attested through the Identity Layer and can be proven without revealing unnecessary personal information.

---

## Design Goal

**Start strong. End strong.**  

Identity is locked as the unbreakable foundation of the entire system. Every later feature — community, commerce, AI companionship, research access — rests on this layer. Weakening it later would invalidate the project’s core claim of sovereignty.
