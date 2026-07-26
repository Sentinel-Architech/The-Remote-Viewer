# Wallet Architecture (Locked)

**Status:** Locked — July 25, 2026  
**Phase:** 0 — Foundation & Guardrails  
**Decision:** **Hybrid**

---

## 1. Official Decision

The Remote Viewer uses a **Hybrid** wallet architecture.

- **Internal (TRV Wallet):** A standards-oriented wallet module inside The Remote Viewer for TRV-issued and TRV-relevant credentials.
- **External:** First-class support for external wallets (especially EUDI-compatible and other OpenID4VP wallets) for presentation and verification.

This decision is permanent for the current architecture generation. Changing it would require a new locked revision and an explicit migration plan.

---

## 2. Why Hybrid

| Requirement | How Hybrid satisfies it |
|-------------|-------------------------|
| Destroy = Restart for TRV identity path | TRV can issue, hold, and extinguish TRV-specific attestations in the internal wallet |
| Founding Sovereign + membership attestations | Native issuance and presentation without depending on a third-party wallet |
| EUDI compatibility | External path accepts official EUDI (and similar) presentations |
| No central personal data store | Internal wallet is on-device / user-controlled only; servers do not store credential payloads |
| No vendor lock-in | Export + external presentation paths remain first-class |
| Vault isolation | Identity/wallet module never reads Vault contents |

Embedded-only would fight EUDI and portability. External-only would weaken absolute burn of TRV-issued status. Hybrid is the only option that preserves both.

---

## 3. Internal TRV Wallet — Scope and Rules

### 3.1 Role

- Generate and control DIDs (`did:key`, `did:jwk`, later others as needed).
- Receive, store, and present **TRV-issued** Verifiable Credentials and attestations (Founding Sovereign Viewer, membership-related claims, future app-specific credentials).
- Optionally hold other credentials the user chooses to keep in-app, without making that mandatory.
- Present via OpenID4VP (and later SD-JWT / BBS+ profiles per Phase 2 design).

### 3.2 Non-negotiable constraints

1. **On-device / user-controlled storage only** for private keys and credential material. No server-side long-term store of personal credentials.
2. **Never reads the Vault.** Hard module boundary.
3. **User-initiated export only.** Encrypted export under user control; no silent sync to TRV servers.
4. **Burn scope:** Confirmed Destroy = Restart destroys TRV identity path state and TRV-issued material held in the internal wallet, and drops platform-side recognition of that path.
5. **No mandatory biometrics** for basic operation (optional device features may be offered).

### 3.3 Module boundary

Suggested package name: `trv-wallet` (or equivalent).  
Must remain separable from Vault, SENTINEL, Forum, and commerce modules.

---

## 4. External Wallet Path — Scope and Rules

### 4.1 Role

- Accept OpenID4VP (and compatible) presentations from external wallets, including EUDI Wallet profiles where applicable.
- Verify presentations and authorize TRV features (e.g. citizenship discount, tier recognition) **without** retaining full credential payloads.
- Treat external wallets as first-class, not second-class workarounds.

### 4.2 Non-negotiable constraints

1. TRV does **not** claim the ability to “burn” or delete credentials that live only in an external wallet.
2. Burn confirmation UX must state clearly: external-wallet credentials remain under the user’s control elsewhere; only the TRV identity path and TRV-held material are extinguished.
3. Verification should process minimal attested claims / proofs; no document-image or raw PII retention for benefit grants.
4. Origin binding and anti-over-request rules from Phase 2 still apply when TRV is the verifier.

---

## 5. Platform / Server Role

- **No persistent personal credential database.**
- May hold only what is required for immediate authorization decisions, ephemeral protocol state, or non-personal operational data.
- Trust anchors / issuer lists may be cached locally or fetched under user-controlled refresh policies; they are not personal data stores.
- Status list handling must follow the privacy rules in `08-Phase2-Privacy-Technical-Design.md`.

---

## 6. Burn Semantics Under Hybrid

When the user confirms **Destroy = Restart from Square One**:

| Asset | Outcome |
|-------|---------|
| TRV identity path | Terminated |
| TRV-issued attestations in internal wallet | Destroyed / unusable |
| Platform recognition of that path (tiers, Founding status, discounts) | Dropped |
| Credentials held only in external wallets | Unchanged by TRV; user manages those wallets separately |
| Vault contents for that path | Subject to Vault burn rules already locked |

User-facing copy must not imply that TRV can erase credentials in Apple Wallet, EUDI Wallet, or other third-party apps.

---

## 7. Implementation Implications (Phase 0 → 1)

1. Scaffold `trv-wallet` as a distinct module in web and mobile apps.
2. Phase 1 builds DID + basic VC issue/present **inside** the internal wallet first.
3. External presentation verification can be parallelized but is not a substitute for internal TRV attestation control.
4. Library choices (DID, VC, OpenID4VCI/VP, status lists) must support both internal holdership and external verification.
5. Export path is a Phase 3 priority alongside key management; design for it from Phase 1 so data shapes stay portable.

---

## 8. Explicit Non-Choices (Rejected for this generation)

- **Embedded-only:** Rejected — weakens EUDI path and portability.
- **External-only:** Rejected — cannot guarantee Destroy = Restart for TRV-issued Founding / membership attestations.
- **Server-custodied keys or credentials:** Rejected — violates Identity Layer and Vault isolation.

---

## 9. Relationship to Other Locked Documents

- `01-Identity-Layer.md` — Hybrid is the concrete architecture for that layer.
- `02` / `03` — Vault and Destroy rules apply fully to TRV-held material; external material is out of TRV burn scope.
- `04` / `05` — Founding Sovereign and membership attestations are issued into the internal wallet (and may be presented externally if the user exports or re-presents).
- `06` / `07` / `08` — Technical stack, roadmap, and Phase 2 privacy design assume this Hybrid decision.

---

## 10. Final Statement

**Wallet architecture is Hybrid.**

Internal wallet for sovereignty over TRV-issued identity and status.  
External wallets for interoperability and EUDI.  
Servers hold neither the keys nor the credential archive.

**Control what you issue. Accept what others present. Burn only what is yours to burn.**
