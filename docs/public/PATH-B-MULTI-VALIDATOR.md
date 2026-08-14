# Path B — Multi-Validator Trajectory

**Status:** Design sketch (public)  
**Last aligned:** 2026-08-13  
**Authority:** This file + locked docs 04 & 17 + `docs/REALITY.md`

This document describes how Path B Independent Completion recognition moves from a single originator gate to a multi-validator model while preserving every non-negotiable.

---

## Non-negotiables (unchanged)

- Offline attestations only
- Zero platform custody
- Private keys never leave the builder’s device
- Destroy = Restart remains absolute
- Packs stay paid (Founding status does not waive catalog prices)
- No required always-on network or cloud account

---

## Stage 0 — Current (live)

| Property | Value |
|----------|-------|
| Verifier | Originator only |
| External finishers | 0 (as of 2026-08-13) |
| Attestation format | Public |
| Issuance | Originator-signed `founding-member-*.json` |
| Recognition | Originator-verified |

This stage is honest about centralization. It is the starting point, not the end state.

---

## Stage 1 — Trusted Validator Set (next)

**Goal:** Replace single-originator issuance with a small, published threshold of validators.

### Rules

1. A published validator list exists (initially originator + any Path B finishers who opt in and run the Integrity Verifier).
2. A Path B submission is accepted when it reaches a simple threshold of the current set (example: 2-of-3 or 3-of-5).
3. Each validator checks the attestation **offline** using the public checklist and proof format.
4. The resulting founding artifact carries multiple validator signatures (or an equivalent threshold proof).
5. Validators exchange material by any means they choose (optical, file, or other offline channel). No central server is required.

### What a builder does in Stage 1

1. Complete the published Path B checklist on a machine they control.
2. Produce the offline attestation (existing `collect-proof` / `make-attestation` flow).
3. Submit the attestation to any current validator(s).
4. Once the threshold is met, receive the multi-signed founding artifact.
5. Install it with the existing `install-founding` path.

### What does not change

- Checklist content
- Offline nature of the proof
- Requirement that the work was done on hardware the builder controls

---

## Stage 2 — Weight-based recognition

**Goal:** Move from simple m-of-n to weighted threshold.

- Each validator has a published weight derived from existing contribution / Integrity Verifier records.
- Acceptance becomes a weighted threshold rather than pure head-count.
- New Path B finishers who operate an Integrity Verifier node can later join the validator set under published rules.
- Originator weight is diluted over time but is never required to reach zero.

---

## Stage 3 — Open validator admission (later)

**Goal:** Clear, public criteria for any Founding member to become a validator.

- Admission rules are published in advance.
- Still offline-first.
- No mandatory always-on node or economic stake requirement in the base design.

---

## Progressive trust summary

| Stage | Trust model | Status |
|-------|-------------|--------|
| 0 | Single originator | **Live** |
| 1 | Small published threshold set | Design |
| 2 | Weighted validators | Design |
| 3 | Open admission under published rules | Design |

---

## Explicit non-goals (all stages)

- On-chain voting as a requirement for Stage 1
- Forced always-on infrastructure
- Platform-held keys or recovery
- Free packs via Path B
- Silent or unpublished changes to the validator set

---

## Relationship to existing documents

- Locked doc 04 (Founding Sovereign Viewer) and 17 (Validator Node First Role) remain authoritative for rights and constraints.
- `docs/public/PATH-B-BUILDER.md`, `PATH-B-FINISHED.md`, and `PATH-B-SUBMISSION.md` describe the current (Stage 0) builder experience.
- This file describes only the **trajectory** for decentralizing recognition.

---

## Final statement

Path B begins with an honest single-verifier gate.  
It is designed to end with a published, offline, multi-validator threshold.  
No stage may re-introduce platform custody or weaken Destroy = Restart.
