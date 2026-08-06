# Concepts → Reality Status

**Rule:** A concept is not real until it runs, is auditable, and lives under user control on GrapheneOS + Termux (or equivalent local environment). No marketing language. No future-tense promises presented as current capability.

Last updated: 2026-08-06 (cleanup/professional-structure)

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
| Local age identity / keygen | **PROVEN** | `optical-airgap/rust` + `modules/local-identity/` | Destroy = Restart. No platform custody. |
| Centralized 21+ digit key assignment | **REJECTED** | — | Conflicts with zero-trust. |

## Enhanced Intelligence — The Sentinel

| Concept | Status | Location | Notes |
|---------|--------|----------|-------|
| The Sentinel (Enhanced Intelligence) | **DESIGN + Stage A scaffold** | `docs/architecture/sentinel-moe.md` | Core requirement: **minimum MoE**. |
| MoE Stage A (specialist router) | **SCAFFOLD** | `modules/moe-router/` | Local registry + route/list; fail closed; no network. |
| MoE Stages B–D | **DESIGN** | sentinel-moe.md | Models/adapters → sparse MoE weights → IA of IA. |
| Specialist process supervision | **SCAFFOLD** | `modules/self-heal/` | Keeps expert processes alive. |
| Chain settlement (e.g. Solana) | **NOT STARTED** | — | No chain dependency in core. Optional later only. |

## Resilience & Operations

| Concept | Status | Location | Notes |
|---------|--------|----------|-------|
| Self-Heal / watchdog | **SCAFFOLD** | `modules/self-heal/` | Wired for optical + specialist supervision wrappers. |
| Termux wake-lock persistence | **SCAFFOLD** | `termux-wake-lock`, scripts | |
| Threat / Attack Detection | **DESIGN** | history | Local heuristics only if implemented. No cloud. |

## Value & Contribution

| Concept | Status | Location | Notes |
|---------|--------|----------|-------|
| Creator royalties / treasury split | **SCAFFOLD** | `apps/shared/src/treasury/` | Integer-safe splits, fails closed. |
| Local contribution ledger | **SCAFFOLD** | `modules/contribution/` | Offline-first. Foundation for AR design. |
| AR Token / DePIN flywheel | **DESIGN** | `TOKENOMICS.md` | Design intent only. No live mint. No chain chosen. |

## Data Sovereignty

| Concept | Status | Location | Notes |
|---------|--------|----------|-------|
| Legal hold / minimization boundary | **LOCKED + SCAFFOLD** | `docs/locked/11-*.md` + `modules/data-sovereignty/` | Code: destroy-restart, minimize-check, retention-status. |
| Retention schedules | **LOCKED + SCAFFOLD** | `docs/locked/12-*.md` + module | Device-side enforcement tools. |
| Destroy = Restart | **SCAFFOLD** | `modules/data-sovereignty/destroy-restart.sh` | Local path wipe. |

## Cryptography (Advanced)

| Concept | Status | Location | Notes |
|---------|--------|----------|-------|
| age (local secrets) | **PROVEN** | optical-airgap | |
| PQC (ML-KEM / ML-DSA / SLH-DSA) | **DESIGN** | `modules/crypto/` | NIST FIPS 203/204/205 primary sources. Use existing libs — no reinvention. |
| Bulletproofs / ZK-STARKs / FHE | **DESIGN** | history only | Not near-term code. |
| Media sanitization posture | **DESIGN → aligned** | SP 800-88r2 + destroy-restart | Cryptographic erase when keys destroyed. |

## UI

| Concept | Status | Location | Notes |
|---------|--------|----------|-------|
| Local console (offline-first) | **SCAFFOLD** | `apps/ui/` | Single HTML; no CDN; no telemetry. |

## How a concept becomes REALITY

1. Runs under user control (GrapheneOS preferred).
2. Clear scope; no hidden network calls.
3. Open and auditable in this repository.
4. No corporate intermediary or platform custody of keys.
5. Status updated here only when the above are true.

**Optical air-gap is the reference implementation.** Everything else is measured against that standard.

## Primary sources used this cycle

- NIST FIPS 203, 204, 205 (final PQC standards)
- NIST SP 800-88 Rev. 2 (media sanitization)
- Locked TRV docs 11 & 12 (minimization + retention)
- FOIA principle (possession): what is not held cannot be produced
