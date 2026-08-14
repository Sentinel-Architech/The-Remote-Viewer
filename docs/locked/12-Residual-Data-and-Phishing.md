# Residual Data After Burn & Phishing / Malicious Verifiers (Locked)

**Status:** Locked — 2026-08-14  
**Phase:** 0 — Foundation & Guardrails  
**Depends on:** `03-Destroy-Equals-Restart.md`, `09-Wallet-Architecture.md`, `10-Threat-Model-Key-Loss.md`

---

## 1. Purpose

This document closes two remaining Phase 0 threat-model items:

1. Residual data that could survive a confirmed Destroy = Restart.
2. Phishing and malicious-verifier attacks against presentation flows.

Both are constrained by the same non-negotiables: no platform recovery of a burned path, minimal personal data, and honest user control.

---

## 2. Residual Data After Burn

### 2.1 Goal

After a user confirms **Destroy = Restart**, the TRV identity path and all TRV-held material for that path must be unusable. Residual data that remains must not allow reconstruction of the path or silent restoration of status.

### 2.2 Categories

| Category | Treatment after confirmed burn |
|----------|--------------------------------|
| Private keys (internal wallet) | Deleted / zeroized on device |
| TRV-issued VCs / attestations in internal wallet | Deleted or cryptographically invalidated |
| Platform recognition (Founding, membership, discounts) | Dropped; no lookup key remains that restores the old path |
| Local logs / contribution / sales records tied to the path | Subject to user-controlled retention; must not re-bind a burned path to new status |
| Ephemeral protocol state (OpenID sessions, nonces) | Expire or purge |
| External-wallet credentials | Unchanged (out of TRV burn scope) — see `09` |
| Data under a specific lawful preservation order | Documented exception only; volume kept minimal by design |

### 2.3 Data-Minimization Boundary (Legal Hold)

- TRV servers must not maintain a long-term personal identity or credential archive.
- Only the minimum data required for immediate authorization, operational integrity, or a specific lawful order may exist outside the user’s device.
- After burn, any server-side record that previously recognized the path must not be usable to re-issue the same path’s status.
- Exact legal-hold procedures (if ever required) are policy documents, not identity-layer features. The technical system is designed so the volume of holdable personal data is near zero.

### 2.4 Residual Risk (Honest)

- Local device forensic recovery of deleted material is outside the cryptographic trust boundary.
- Public Solana memos and other intentionally public signals remain public.
- External systems the user interacted with independently are outside TRV control.

---

## 3. Phishing & Malicious Verifiers

### 3.1 Threats

- Fake presentation requests that mimic legitimate verifiers.
- Over-request of attributes beyond what the user intended to disclose.
- Origin / domain spoofing in OpenID4VP flows.
- Social engineering that causes the user to present high-value credentials to an attacker.

### 3.2 Required Mitigations (Design Level)

1. **Clear request UI** — Show who is asking, what is being requested, and for what purpose before any presentation.
2. **Origin / domain binding** where the protocol and platform allow.
3. **Anti-over-request** — Prefer selective disclosure; surface excess claims as a warning.
4. **Explicit confirmation** for high-sensitivity or high-value presentations (Founding status, citizenship-related claims, etc.).
5. **No silent presentation** of TRV-held credentials.

### 3.3 Residual Risk

A determined social-engineering attack against a user who ignores warnings cannot be fully eliminated by software. The system’s duty is to make the request transparent and the confirmation deliberate.

---

## 4. Relationship to Key-Loss Model

Key loss without recovery ends the path (see `10`).  
Confirmed burn is the intentional equivalent.  
Residual-data rules ensure that neither event leaves a platform-side resurrection path.

---

## 5. Acceptance Criteria

- [ ] Burn flow deletes or invalidates internal-wallet material for the path.
- [ ] Platform recognition of a burned path cannot be restored by any server-side action alone.
- [ ] Presentation UI design includes request summary + confirmation for sensitive claims.
- [ ] Legal-hold boundary is documented as data-minimization first; hold is the exception, not the default store.

**Final statement**  
After burn, the path is gone.  
What remains must not let anyone — including the platform — bring it back.  
Presentation requests must be visible, deliberate, and minimal.
