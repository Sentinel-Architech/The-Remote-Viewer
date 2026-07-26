# Retention Schedules (Locked)

**Status:** Locked — July 25, 2026  
**Phase:** 0 — Foundation & Guardrails  
**Depends on:** `11-Legal-Hold-Data-Minimization.md`, `03-Destroy-Equals-Restart.md`, `09-Wallet-Architecture.md`, `10-Threat-Model-Key-Loss.md`

---

## 1. Purpose

This document sets **specific retention schedules** for data that The Remote Viewer is permitted to hold under the locked data-minimization boundary.

Rules:

- Class A data (keys, full credentials archive, Vault contents as platform store) has **no retention schedule** because it must not be held on platform servers.
- Class B–D data is retained only for the durations below, then deleted or anonymized.
- **Destroy = Restart** deletes path-scoped operational state immediately, except records under an active, specific legal hold.
- Legal hold **pauses deletion** only for in-scope existing records; it does not extend collection or create new categories.

Times are maximums unless a shorter product-specific TTL is configured. Implementations may delete sooner; they must not retain longer without a locked policy revision and counsel review.

---

## 2. Schedule Overview

| ID | Data category | Max retention | Clock starts | On burn (no hold) |
|----|---------------|---------------|--------------|-------------------|
| R1 | OID4VCI / OID4VP ephemeral protocol state | **1 hour** | Transaction creation | Delete immediately |
| R2 | Presentation / issuance correlation nonces & short-lived session keys | **15 minutes** after completion or abort | Event end | Delete immediately |
| R3 | Minimal authorization result (e.g. path P accepted citizenship attestation) | **90 days** or until superseded / burn | Decision time | Delete immediately |
| R4 | Status-list / trust-anchor technical cache | **24 hours** (refresh earlier as needed) | Cache write | Unaffected (non-personal) |
| R5 | Rate-limit / abuse counters (no credential bodies) | **7 days** | Event window | Delete path-scoped counters |
| R6 | Security event logs (auth failure, burn confirm, integrity alerts; no PII bodies) | **180 days** | Log write | Retain per schedule; must not restore path |
| R7 | Support tickets / contact emails (if any) | **2 years** after closed, or per counsel | Ticket close | Path unlink; content per support policy |
| R8 | Billing references (processor customer id, invoice metadata) | **7 years** or legal minimum for tax/commercial records in operating jurisdiction | Transaction date | Retain as required by law; no wallet keys |
| R9 | Marketing / analytics identifiers | **Not used by default**; if ever enabled, max **30 days** and opt-in only | Event | Delete immediately |
| R10 | Debug / crash diagnostics | **14 days**; PII and secrets scrubbed at ingest | Capture | Delete path-scoped dumps |

---

## 3. Detailed Rules by Category

### R1 — Ephemeral protocol state (max 1 hour)

**Includes:** In-flight OpenID4VCI issuance sessions, OpenID4VP request/response correlation state, temporary redirect state, PAR/JAR artifacts if used.

**Must not include:** Private keys, full Disclosures, Vault data.

**Deletion:** Automated job at least hourly; also on success/abort when practical.

### R2 — Nonces & short-lived session material (max 15 minutes post-completion)

**Includes:** one-time nonces, PKCE verifiers after use, ephemeral server-side session blobs for a single presentation.

**Deletion:** Prefer immediate on completion; hard cap 15 minutes after terminal state.

### R3 — Minimal authorization results (max 90 days)

**Includes only:**  
`{ path_id or equivalent, attribute_type, boolean_or_enum_result, issued_at, optional expiry }`  
Example: `path X — us_citizen_attestation — accepted — timestamp`.

**Must not include:** Full VC JSON, SD-JWT with Disclosures, name, document numbers, photos.

**Purpose:** Enforce membership discount / feature gates without re-verifying every request when appropriate.

**On burn:** Delete all R3 rows for that path immediately (unless legal hold names those rows).

**On superseding proof:** Replace or invalidate prior result; do not accumulate history of every presentation.

### R4 — Status-list & trust-anchor cache (max 24 hours)

**Includes:** Cached bitstring status list segments, issuer public keys / DID documents used for verification.

**Nature:** Technical, non-personal when implemented per Phase 2 privacy rules (no 1:1 per-credential tracking endpoints operated by TRV as a surveillance log).

**Deletion / refresh:** TTL ≤ 24 hours; may refresh more often.

### R5 — Rate-limit & abuse counters (max 7 days)

**Includes:** Counts of failed attempts, presentations per IP/device fingerprint bucket, flagged abuse events **without** credential payloads.

**On burn:** Remove counters keyed to the burned path id.

### R6 — Security event logs (max 180 days)

**Includes:**  
- Burn confirmation events (path id, timestamp, success)  
- Authn failures to app account surface (if any), not wallet key material  
- Integrity / anomaly alerts  

**Must not include:** Private keys, Disclosures, Vault plaintext, full presentation bodies.

**On burn:** Logs may remain for the retention window as evidence that a burn occurred; they must not be usable to reactivate the path or reconstruct Class A data.

### R7 — Support communications (max 2 years after close)

Only if a support channel exists. Unlink from burned path identifiers where feasible; retain ticket body only as needed for dispute/abuse handling per counsel.

### R8 — Billing / commercial records (jurisdictional minimum, often up to 7 years)

Payment processor is preferred system of record. TRV stores reference ids and minimal invoice metadata only if required. **Never** store wallet private keys or credential archives in billing systems.

Burn does not erase legally required financial records; it does erase live identity-path privileges.

### R9 — Marketing / product analytics

**Default: off.**  
If enabled later: opt-in, no correlation to credential contents, max 30 days, deleted on burn. Requires explicit policy amendment before enablement.

### R10 — Diagnostics (max 14 days)

Crash and performance diagnostics scrubbed at ingest (strip tokens, keys, header payloads that may contain secrets). Path-scoped artifacts deleted on burn.

---

## 4. Class A — Explicit Zero Retention on Platform

| Data | Platform retention |
|------|---------------------|
| Internal wallet private keys | **0** — never stored on servers |
| Platform recovery / escrow keys | **0** — forbidden |
| Full VC / SD-JWT Disclosure archive | **0** |
| ID document images / biometrics for citizenship | **0** |
| Vault contents as server-side store | **0** |

Any feature that would assign a non-zero server retention to Class A is a **policy violation** until a new locked revision is approved.

---

## 5. Burn vs Schedule vs Legal Hold

```
User confirms Destroy = Restart
        │
        ├─► Delete all path-scoped R1, R2, R3, R5, R9, R10 immediately
        ├─► Drop live tier / Founding / discount recognition
        ├─► R6: keep only within 180-day log policy; no path reactivation
        ├─► R7/R8: per support/billing law; unlink path where possible
        └─► If legal hold active on specific records:
                freeze deletion of those records only until release
                still do not reactivate identity path for the user
```

---

## 6. Implementation Requirements

1. **TTL fields** on every Class B store (created_at, expires_at).  
2. **Scheduled deletion workers** with monitoring (failed deletion = incident).  
3. **Burn API / job** that enumerates path-scoped tables and deletes per this schedule.  
4. **Hold flag** mechanism that can exempt specific record ids from deletion jobs without disabling global TTLs.  
5. **No silent extension** — increasing any max retention requires updating this locked document.  
6. **Client-side data** (on device) is user-controlled; these schedules govern **platform-side** retention only. Device wipe / key loss follow `10-Threat-Model-Key-Loss.md`.

---

## 7. Acceptance Criteria

- [ ] Each platform data store mapped to an R-id or Class A (forbidden)  
- [ ] Automated tests or jobs enforce R1–R3 TTLs in non-production  
- [ ] Burn path deletes R3 authorization rows  
- [ ] Logging configuration verified to exclude credential bodies and keys  
- [ ] Counsel review of R7/R8 against actual operating entity jurisdiction before production billing/support  

---

## 8. Final Statement

Retention is a liability. These ceilings exist to keep that liability small and explicit.

**Short for protocol. Minimal for authorization. Zero for keys and credentials. Burn still ends the path.**
