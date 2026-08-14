# Path B — Multi-Validator Trajectory

**Status:** Design sketch (public)  
**Last aligned:** 2026-08-13  
**Authority:** This file + locked docs 04 & 17 + `docs/REALITY.md`

This document describes how Path B Independent Completion recognition moves from a single originator gate to a multi-validator model.

**Hard constraints:**
- Zero centralization — no required platform, server, or single party
- Every active validator must run a continuous process / beacon
- Private keys never leave the builder’s device
- Destroy = Restart remains absolute
- Packs stay paid

---

## Non-negotiables

- Path B *proofs* remain offline attestations produced on hardware the builder controls
- Zero platform custody
- No originator (or any single party) veto once the validator set is live
- No required central server or proprietary beacon endpoint
- Destroy = Restart is absolute
- Packs remain paid (Founding status does not waive catalog prices)

---

## Stage 0 — Current (live)

| Property | Value |
|----------|-------|
| Verifier | Originator only |
| External finishers | 0 (as of 2026-08-13) |
| Attestation format | Public |
| Issuance | Originator-signed `founding-member-*.json` |
| Liveness | Not yet required (single gate) |

This stage is honest about centralization. It is the starting point, not the end state.

---

## Stage 1 — Trusted Validator Set + Liveness

**Goal:** Replace single-originator issuance with a small published threshold of *active* validators.

### Validator liveness rule (hard)

1. Every validator that wishes to be counted must run a continuous process or beacon.
2. The beacon / heartbeat must be independently verifiable by other parties.
3. The beacon must **not** depend on any platform, originator-controlled server, or single required endpoint.
4. Multiple transports are allowed (local network, optical, public non-custodial channels, etc.). Implementations may differ as long as the signal is continuous and independently checkable.
5. Only validators that are currently demonstrating liveness are counted toward the recognition threshold.
6. Failure or silence of any single validator (including the originator) must not halt the system once the active set is large enough.

### Recognition rules

1. A published validator list exists.
2. A Path B submission is accepted when it reaches a threshold of *currently active* validators (example: 2-of-3 or 3-of-5 of the live set).
3. Each validator checks the attestation offline using the public checklist and proof format.
4. The founding artifact carries multiple validator signatures (or equivalent threshold proof) from active validators only.
5. Validators may exchange attestation material by any means they choose. No central server is required.

### What a builder does in Stage 1

1. Complete the published Path B checklist on a machine they control.
2. Produce the offline attestation (existing collect-proof / make-attestation flow).
3. Submit the attestation to active validators.
4. Once the live threshold is met, receive the multi-signed founding artifact.
5. Install it with the existing install-founding path.

---

## Stage 2 — Weight-based recognition

**Goal:** Move from simple m-of-n of active validators to weighted threshold.

- Each validator has a published weight derived from contribution / Integrity Verifier records.
- Only currently active (beaconing) validators contribute their weight.
- Acceptance is a weighted threshold of the live set.
- New Path B finishers who operate an Integrity Verifier and maintain liveness can later join the validator set under published rules.
- Originator weight is diluted over time and is never required to remain dominant.

---

## Stage 3 — Open validator admission

**Goal:** Clear, public criteria for any Founding member to become a validator.

- Admission rules are published in advance.
- Liveness requirement continues to apply.
- No mandatory proprietary infrastructure.
- No single party can block admission if the published criteria are met.

---

## Progressive trust summary

| Stage | Trust model | Liveness | Status |
|-------|-------------|----------|--------|
| 0 | Single originator | Not required | **Live** |
| 1 | Small published threshold of *active* validators | Required continuous beacon | Design |
| 2 | Weighted active validators | Required continuous beacon | Design |
| 3 | Open admission under published rules | Required continuous beacon | Design |

---

## Explicit non-goals

- Any design that re-creates a required central party or platform
- Originator veto after Stage 1 is active
- Beacon that can only be verified through an originator-controlled or proprietary endpoint
- Forced use of one specific transport
- On-chain voting as a requirement for Stage 1
- Free packs via Path B
- Silent or unpublished changes to the validator set or liveness rules

---

## Relationship to existing documents

- Locked doc 04 (Founding Sovereign Viewer) and 17 (Validator Node First Role) remain authoritative for rights and constraints.
- `docs/public/PATH-B-BUILDER.md`, `PATH-B-FINISHED.md`, and `PATH-B-SUBMISSION.md` describe the current (Stage 0) builder experience.
- This file describes the trajectory for decentralizing recognition under the hard constraints above.

---

## Final statement

Path B begins with an honest single-verifier gate.  
It ends with a published set of validators that must remain on, whose signals are independently verifiable, and that no single party controls.  

No stage may re-introduce platform custody, a required central endpoint, or weaken Destroy = Restart.
