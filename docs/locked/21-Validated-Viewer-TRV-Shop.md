# 21 — Validated Viewer · TRV credits · Native shop

**Status:** LOCKED  
**Date:** 2026-08-07  
**Parallel brands:** The Remote Viewer (social) · The Sentinel (core)

---

## 0. Parallel to core (non-negotiable)

| Surface | Brand | Where |
|---------|-------|--------|
| Optical · Hydra · Verifier · Vending · MoE · local console | **The Sentinel** | `apps/ui` · device · no network required |
| Directory · posts · talk · welcome · Gateway link · **Validated Viewer** · **TRV credits** · **Aurora shop** | **The Remote Viewer** | `apps/remote-viewer/` · network · labeled |

**Shop, credits, aurora skins, and Validated Viewer opt-in are not Sentinel core features.**  
They do not run inside the 127.0.0.1 core console as unlabeled social.  
They do not change Destroy=Restart, no-custody, or optical air-gap rules.

Proofs may **bridge** (a Viewer may attach Sentinel attestations to a persona).  
Credits and skins **do not** unlock Sentinel integrity or replace seals.

---

## 1. Validated Viewer (Node)

A Viewer may **opt in** to become a **Validated Viewer** when they exercise the Integrity Verifier / node path (locked doc 17) and accept node constraints.

| Field | Rule |
|-------|------|
| Opt-in | Explicit — never automatic |
| Proof | Sentinel-side attestation / Path completion (user-published into RV) |
| Role | Validating node option for The Sentinel |
| Home of the reward UI | **The Remote Viewer only** |

---

## 2. TRV credits (utility, not market yield)

On successful Validated Viewer activation, the Viewer receives **TRV credits**.

| Rule | Detail |
|------|--------|
| **Only use** | Native **TRV Shop** inside **The Remote Viewer** |
| **Not** | External cash-out, DEX, transfer-for-value, staking APY |
| **Not** | Payment for Sentinel packs (USDC remains pack currency) |
| **Purpose** | Customize **their** profile presentation and **their** RV UI colors |
| **Theme family** | **Aurora Borealis only** |

Cosmetic utility credit. No investment return promised.

---

## 3. Native TRV Shop (Remote Viewer)

| Item | Spends credits | Effect |
|------|----------------|--------|
| Aurora UI skin | Yes | RV interface color wash (fixed aurora set) |
| Aurora profile accent | Yes | Profile presentation within RV |

Fixed variants only (e.g. Borealis Green, Polar Violet, Ion Gold, Night Curtain, Crimson Arc).

---

## 4. Custody

| Layer | Holding |
|-------|---------|
| Credits ledger | Viewer-local in RV until a chain mint exists; redeem only in RV shop |
| Sentinel vault keys | Never mixed with shop credits |
| Core console | No shop, no credit balance UI |

---

## 5. Related

- `docs/locked/17-Validator-Node-First-Role.md`
- `docs/locked/18-Sovereign-Social-Layer.md`
- `docs/locked/20-Native-Remote-Viewer.md`
- `apps/remote-viewer/` (shop + social)
- `apps/ui/` (Sentinel core only)
