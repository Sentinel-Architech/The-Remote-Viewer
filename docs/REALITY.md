# Concepts → Reality Status

**Rule:** A concept is not real until it runs, is auditable, and lives under user control on GrapheneOS + Termux (or equivalent local environment). No marketing language. No future-tense promises presented as current capability.

Last updated: 2026-08-06 (cleanup/professional-structure branch)

## Status Legend

| Status | Meaning |
|--------|---------|
| **PROVEN** | Runs on-device today. Reproducible. Has tests or live verification. |
| **SCAFFOLD** | Real code exists. Minimal but honest. Can be extended. |
| **DESIGN** | Spec / notes only. Not claimed as working. |
| **REJECTED** | Conflicts with zero-trust / local-first posture. Will not be implemented as described. |

## Core Transport & Identity

| Concept | Status | Location | Notes |
|---------|--------|----------|-------|
| Optical Air-Gap (age + Soliton LT) | **PROVEN** | `optical-airgap/` | Verified 2026-07-31 on GrapheneOS + Termux. |
| Local age identity / keygen | **PROVEN** | `optical-airgap/rust` + helpers | Destroy = Restart. No platform custody. |
| Centralized 21+ digit key assignment | **REJECTED** | former `Key Management` | Conflicts with zero-trust. Replaced by local age. |
| Local Identity helpers | **SCAFFOLD** | `modules/local-identity/` | Thin wrappers around age for scripts & Termux. |

## Resilience & Operations

| Concept | Status | Location | Notes |
|---------|--------|----------|-------|
| Self-Heal / watchdog | **SCAFFOLD** | `modules/self-heal/` + `mobile/daemon/` | Real process supervision for Termux. |
| Termux wake-lock persistence | **SCAFFOLD** | `termux-wake-lock`, scripts | |
| Threat / Attack Detection | **DESIGN** | docs/concepts (history) | Local heuristics only when implemented. No cloud. |

## Value & Contribution

| Concept | Status | Location | Notes |
|---------|--------|----------|-------|
| Creator royalties / treasury split | **SCAFFOLD** | `apps/shared/src/treasury/` | Integer-safe splits, fails closed. |
| Local contribution ledger | **SCAFFOLD** | `modules/contribution/` | Offline-first counter. Foundation for AR design. |
| AR Token / DePIN flywheel | **DESIGN** | `TOKENOMICS.md` | Design intent only. No live mint. |
| In-app shop checkout | **DESIGN** | digital-vending + notes | Catalog + delivery scripts exist; no live payments. |

## Cryptography (Advanced)

| Concept | Status | Location | Notes |
|---------|--------|----------|-------|
| Bulletproofs / ZK-STARKs / SLH-DSA | **DESIGN** | former root notes | Use existing open libraries when needed. No re-implementation claims. |
| Homomorphic Encryption | **DESIGN** | former notes | Extremely heavy. Not near-term priority. |
| Full post-quantum suite | **DESIGN** | aspirational structure | |

## Privacy & Governance

| Concept | Status | Location | Notes |
|---------|--------|----------|-------|
| Data Sovereignty / Minimization / Consent | **DESIGN → SCAFFOLD** | docs/locked + modules | Posture is locked. Code enforcement is next. |
| Zero-Trust posture | **PROVEN (posture)** | docs/locked/, optical path | Architectural, not a single module. |
| Governance / Smart Contract | **DESIGN** | former notes | |

## How a concept becomes REALITY

1. It must run under user control (GrapheneOS preferred).
2. It must have clear scope and no hidden network calls.
3. It must be open and auditable in this repository.
4. It must not require a corporate intermediary or platform custody of keys.
5. Status is updated in this file only when the above are true.

**Optical air-gap is the reference implementation.** Everything else is measured against that standard.
