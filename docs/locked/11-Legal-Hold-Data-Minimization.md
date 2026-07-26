# Legal Hold & Data-Minimization Boundary (Locked)

**Status:** Locked — July 25, 2026  
**Phase:** 0 — Foundation & Guardrails  
**Depends on:** `01-Identity-Layer.md`, `02-Vault-Principles.md`, `03-Destroy-Equals-Restart.md`, `06-Identity-Technical-Stack.md`, `09-Wallet-Architecture.md`, `10-Threat-Model-Key-Loss.md`

---

## 1. Purpose

This document defines the **exact data-minimization boundary** for The Remote Viewer and how that boundary interacts with a possible **legal hold** (lawful preservation order, subpoena, or equivalent process).

Design goals:

1. Minimize what the platform could ever be ordered to preserve.
2. Keep private keys and personal credential payloads **off platform servers** so they are not available to produce.
3. Preserve **Destroy = Restart** for all data not under a specific, lawful preservation obligation.
4. Avoid building a surveillance or identity archive “in case” of future process.

This is an architecture and policy boundary, not legal advice. Counsel must review jurisdiction-specific duties before production launch.

---

## 2. Design Principle

**If the platform does not hold it, it cannot produce it and need not preserve it.**

Therefore the system is designed so that:

- Private keys for the internal TRV wallet exist only on user devices or in user-held backups.
- Full Verifiable Credential payloads and Disclosures are not stored long-term on TRV servers.
- Vault contents are sealed and user-controlled; the identity stack never reads them; servers are not the Vault archive.
- Platform-side data is limited to what is required to operate the service (authorization decisions, non-personal ops, ephemeral protocol state, minimal account/routing metadata if any).

Legal hold, if it ever applies, can only attach to **what actually exists** on systems under the operator’s control at the time of the order.

---

## 3. Data Classification

### 3.1 Class A — Never held by platform (non-retainable by design)

These must not be stored on TRV servers in recoverable form:

| Data | Rule |
|------|------|
| Internal wallet private keys | Device / user-held only |
| Platform-held recovery / escrow keys | Forbidden |
| Full VC payloads, SD-JWT Disclosures, raw BBS messages as a personal archive | Not retained server-side after protocol completion |
| Passport/ID images, biometrics templates for “citizenship proof” | Not collected for benefit grants; ZK / minimal attestation only |
| Vault journals, private notes, encrypted Vault blobs as server-side store | Vault is user-sealed; not an identity or platform content archive |

**Legal-hold implication:** If an order seeks Class A data and the architecture has been followed, the truthful response is that the platform does not possess it. Implementation and ops must not quietly reintroduce Class A storage.

### 3.2 Class B — Minimal operational data (may exist briefly or in limited form)

| Data | Allowed use | Retention posture |
|------|-------------|-------------------|
| Ephemeral protocol state (OID4VCI/VP transaction correlation IDs, short-lived nonces) | Complete an issuance/presentation | Minutes–hours; then delete |
| Verification *result* for authorization (e.g. “citizenship attestation accepted at time T for path P”) | Grant discount / feature | Prefer minimal boolean + timestamp + path id; avoid storing underlying claims |
| Status-list fetch cache (non-personal bitstrings / trust material) | Revocation checks | Technical cache; not a per-user activity log |
| Trust anchors / issuer lists | Verify signatures | Non-personal |
| App diagnostics without PII | Reliability | Scrubbed; no keys, no credential bodies |

**Legal-hold implication:** Class B is the primary surface that might exist under operator control. Keep it small, time-bounded, and free of credential bodies and keys.

### 3.3 Class C — Account / commerce metadata (if product requires any)

If membership billing or similar exists, only the minimum needed for the payment provider and fraud prevention should exist (often largely on the processor’s side).

| Data | Rule |
|------|------|
| Payment processor tokens / customer ids | Prefer processor vault; TRV stores reference ids only if required |
| Email for 2FA / notices | If used, treat as contact channel not identity dossier; separate from wallet keys |
| Founding Sovereign / tier flags | Authorization state tied to identity path; extinguished on burn subject to §5 |

**Legal-hold implication:** Billing and contact records may be subject to ordinary business preservation rules. They must not be expanded into a substitute identity database.

### 3.4 Class D — Security and integrity logs

| Data | Rule |
|------|------|
| Security event logs (auth failures, burn confirmations, abuse signals) | Allowed for integrity and abuse response |
| Content of presentations or Vault | Not logged |
| Private keys | Never logged |

Logs should be designed so they prove *that* an event occurred without becoming a transcript of personal claims.

---

## 4. Legal Hold — Definition and Scope

**Legal hold** means a specific, lawful obligation to preserve identified information from deletion or alteration for a stated matter (e.g. valid legal process directed at the operator).

### 4.1 What a hold can cover

Only data that:

1. Is actually in the possession, custody, or control of the operator, and  
2. Is within the scope of the order, and  
3. Exists in Class B, C, or D (or any future class explicitly allowed by a revised locked policy).

### 4.2 What a hold cannot invent

A hold does not authorize:

- Reconstruction of private keys the platform never had  
- Production of Vault contents never stored on platform servers  
- Production of external-wallet credentials never received in full  
- Creation of new surveillance collection to satisfy curiosity beyond the order  

### 4.3 Specificity requirement (policy)

Ops policy: do not interpret vague requests as authority to dump entire user bases. Preservation and production should be limited to the identities, time ranges, and data types specified in valid process, as advised by counsel.

---

## 5. Interaction with Destroy = Restart

### 5.1 Default rule

When a user confirms **Destroy = Restart**:

- All TRV identity-path state and TRV-held material for that path that is **not** under an active, specific legal hold is extinguished per `03-Destroy-Equals-Restart.md` and `09-Wallet-Architecture.md`.
- Platform recognition (tiers, Founding status, discounts) for that path is dropped unless a hold explicitly requires preservation of particular authorization records — and even then, preservation is of *records*, not resurrection of a live path for the user.

### 5.2 Hold vs burn

| Situation | Outcome |
|-----------|---------|
| Burn, no hold | Full path termination; square one on return |
| Burn while specific Class B/C/D records are under hold | User-facing path still ends; held records preserved only as required until release; no “login restore” of the burned path |
| Hold exists, user has not burned | Ordinary preservation of in-scope existing data; no expansion into Class A |

### 5.3 User-facing honesty

Burn confirmation copy may note, where accurate, that **lawful process could require the operator to retain limited operational records** that already exist, but that:

- Keys and Vault contents not held by the platform are not restored by the platform, and  
- A burned path is not reactivated as a continuing identity for the user.

Do not over-claim “we delete everything everywhere including data we never had,” and do not under-claim absolute burn of path continuity.

---

## 6. Operational Rules

1. **Architecture reviews** must reject features that move Class A data onto servers “for convenience.”  
2. **Default retention** for Class B ephemeral state is short; document TTLs in implementation.  
3. **No shadow identity DB** — do not accumulate presentation histories, full claim sets, or document images under a user id.  
4. **Hold procedure** (pre-launch): written steps for counsel + ops to freeze deletion jobs only for in-scope records, with audit of what was frozen.  
5. **Release of hold:** resume normal deletion/burn semantics; do not keep held data indefinitely without ongoing legal basis.  
6. **Hybrid wallet:** external presentations verified in real time; do not archive the presented credential. Store at most minimal authorization outcomes if required.

---

## 7. Boundary Summary Table

| Data type | On TRV servers? | Subject to legal hold if present? | Survives user burn? |
|-----------|-----------------|-----------------------------------|---------------------|
| Private keys | No | N/A (not held) | N/A |
| Full credentials / disclosures archive | No | N/A | N/A |
| Vault contents | No (not platform archive) | N/A if never held | User Vault burn rules |
| Ephemeral protocol state | Brief only | Only if still present when ordered | Deleted on schedule / burn |
| Minimal auth result flags | Limited | Possible | Dropped on burn unless specific hold |
| Billing / contact metadata | Minimum if required | Possible under business rules | Per policy + hold |
| Security logs (no PII bodies) | Yes, limited | Possible | Retention schedule; not a live identity |

---

## 8. Acceptance Criteria (Phase 0)

- [ ] This boundary is referenced from the Implementation Roadmap and Wallet Architecture docs  
- [ ] Engineering checklist: no Class A storage in proposed designs  
- [ ] Burn flow design includes “path dead even if limited ops records preserved under hold”  
- [ ] Counsel review scheduled before handling real personal data in production  
- [ ] Support language forbids promising platform recovery of keys or Vault data never held  

---

## 9. Non-Goals

- Providing jurisdiction-by-jurisdiction legal advice  
- Implementing full eDiscovery tooling in Phase 0  
- Weakening Destroy = Restart into “soft delete pending possible future process” for unconstrained data categories  

---

## 10. Final Statement

**Minimize first. Hold only what exists. Burn the path anyway.**

The strongest response to legal process is not a larger archive — it is an architecture that never centralized keys, credentials, or Vault contents.

**What we do not hold, we cannot turn over. What we must preserve stays narrow. What the user burns stays dead as an identity path.**
