# Concepts → Reality Status

**Rule:** A concept is not real until it runs, is auditable, and lives under user control on GrapheneOS + Termux (or equivalent). No marketing language.

Last updated: 2026-08-06 (dual GGUF Stage B)

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
| Optical Air-Gap (age + Soliton LT) | **PROVEN** | `optical-airgap/` | Re-verified 2026-08-06 (e2e peel ok). |
| Local age identity | **PROVEN** | device vault + `modules/local-identity/` | Secrets not in git. |
| Centralized key assignment | **REJECTED** | — | |

## Enhanced Intelligence — The Sentinel

| Concept | Status | Location | Notes |
|---------|--------|----------|-------|
| MoE Stage A (process experts) | **SCAFFOLD** | `modules/moe-router/` experts | list/route on-device |
| MoE Stage B (local models) | **PROVEN** | `models.json` + GGUF | **2026-08-06:** TinyLlama general + Qwen2.5-Coder-0.5B code; router select; llama.cpp ~17–21 t/s |
| MoE Stage C (sparse MoE weights) | **DESIGN** | — | Hardware-heavy on phone |
| MoE Stage D (IA of IA) | **DESIGN** | — | |
| Self-heal optical pulse | **SCAFFOLD** | `modules/self-heal/` | |
| Chain settlement | **NOT STARTED** | — | Optional later only |

## Contribution Ledger

Stages 0–4 **SCAFFOLD** under `modules/contribution/` — offline hash-chain, export, local AR claim (not a mint).

## Data Sovereignty / UI / Ops

minimize-check · Destroy=Restart · `apps/ui/` · git-sync + hooks — **SCAFFOLD**, exercised.

**Optical air-gap remains the reference implementation.** Stage B model routing is the second on-device proof point.
