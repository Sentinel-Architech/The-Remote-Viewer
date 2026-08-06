# Concepts → Reality Status

**Rule:** A concept is not real until it runs, is auditable, and lives under user control on GrapheneOS + Termux (or equivalent). No marketing language.

Last updated: 2026-08-06 (on-device session)

## Status Legend

| Status | Meaning |
|--------|---------|
| **PROVEN** | Runs on-device. Reproducible. |
| **SCAFFOLD** | Real code exists. Minimal but honest. |
| **DESIGN** | Spec only. |
| **REJECTED** | Conflicts with zero-trust / local-first. |

## Core Transport & Identity

| Concept | Status | Location | Notes |
|---------|--------|----------|-------|
| Optical Air-Gap (age + Soliton LT) | **PROVEN** | `optical-airgap/` | Re-verified **2026-08-06** on Termux (e2e peel ok). |
| Local age identity | **PROVEN** | device vault + `modules/local-identity/` | Rotated after screenshot exposure; secrets not in git. |
| Centralized key assignment | **REJECTED** | — | |

## Enhanced Intelligence — The Sentinel

| Concept | Status | Location | Notes |
|---------|--------|----------|-------|
| MoE Stage A router | **SCAFFOLD** | `modules/moe-router/` | Exercised on-device (list/route). |
| MoE Stages B–D | **DESIGN** | `docs/architecture/sentinel-moe.md` | |
| Self-heal optical pulse | **SCAFFOLD** | `modules/self-heal/` | Pulse + supervise; e2e stays on-demand. |
| Chain settlement | **NOT STARTED** | — | Optional later only. |

## Contribution Ledger

| Stage | Status | Notes |
|-------|--------|-------|
| 0 JSONL record/status/tally | **SCAFFOLD** | `modules/contribution/` |
| 1 On-device habit | **SCAFFOLD** | User records optical_e2e / verification |
| 2 Hash chain + verify | **SCAFFOLD** | `verify.sh` fixed 2026-08-06 |
| 3 Redacted export | **SCAFFOLD** | `export.sh` |
| 4 Tip commitment + local AR claim | **SCAFFOLD** | Not a mint; no RPC |

## Data Sovereignty

| Concept | Status | Notes |
|---------|--------|-------|
| minimize-check | **SCAFFOLD** | Quiet check; real secrets only |
| Destroy = Restart | **SCAFFOLD** | Local path wipe |

## UI

| Concept | Status | Notes |
|---------|--------|-------|
| Local console | **SCAFFOLD** | `apps/ui/` command panels; no remote exec |

## Ops

| Concept | Status | Notes |
|---------|--------|-------|
| git-sync + hooks | **SCAFFOLD** | Termux; hooksPath=scripts/hooks |

## How something becomes PROVEN

Runs under user control · no hidden network · auditable in repo · no platform key custody.

**Optical air-gap remains the reference implementation.**
