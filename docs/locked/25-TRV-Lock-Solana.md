# 25 — TRV lock (USD → Solana) · 90-day minimum

**Status:** LOCKED  
**Date:** 2026-08-07  
**Surface:** The Remote Viewer · **TRV Shop only** (parallel to The Sentinel core)  
**Chain:** Solana

---

## 1. Product rule

Viewers may **lock USD** in the **TRV Shop** as **TRV tokens on Solana**.

| Rule | Detail |
|------|--------|
| **Where** | Native TRV Shop (Remote Viewer) — not Sentinel core console |
| **Asset** | TRV tokens recorded on **Solana** |
| **Source** | USD (or USDC settlement path into the lock) |
| **Minimum lock** | **90 days** — no early unlock under standard terms |
| **Roll** | If the Viewer **continues for another 90 days**, the system adds **a few TRV tokens as a gift** |
| **Gift** | Fixed small amount (policy-set), **not** an APY / yield schedule |

---

## 2. Parallel to core

| TRV Shop lock | The Sentinel |
|---------------|--------------|
| Social / Service plane | Device integrity · packs still USDC |
| Solana lock ledger | Optical · Hydra · seals unchanged |
| Optional for Viewers | Not required to run core |

Locking USD for TRV does **not** fund or unlock Sentinel vault keys.

---

## 3. Lock lifecycle

```
USD (Shop) ──► lock instruction ──► TRV on Solana
                    │
                    ├─ locked until T0 + 90 days
                    │
                    ├─ at maturity: unlock eligible OR roll +90
                    │
                    └─ on roll: gift_few_TRV credited (policy)
```

| Event | Effect |
|-------|--------|
| Open lock | USD amount → TRV locked balance; `unlock_at = now + 90d` |
| Before unlock_at | Not redeemable to USD under standard path |
| At maturity | Viewer may unlock **or** roll another 90 days |
| Roll | New `unlock_at += 90d`; **gift** few TRV tokens added |
| Gift size | Small, fixed per roll (e.g. policy constant) — not compounded yield marketing |

---

## 4. Relation to prior credit rules

| Prior (doc 21) | This lock (doc 25) |
|----------------|--------------------|
| Cosmetic TRV **credits** for Aurora skins | **On-chain** TRV from USD lock |
| Device-local credits | Solana ledger |
| Shop skins only | Lock / roll / gift + still usable toward shop policy when unlocked per rules |

Cosmetic credits and **locked Solana TRV** are related brand units but **separate ledgers** until a formal bridge is locked.

---

## 5. Language constraints

| Allowed | Avoid |
|---------|--------|
| Lock · 90 days · roll · gift | APY · interest · guaranteed return · “earn while you sleep” |
| Parallel Service shop | Core yield product |

---

## 6. Implementation phases

| Phase | Deliverable |
|-------|-------------|
| **L0** | This lock |
| **L1** | Shop UI: Lock USD · show 90-day clock · Roll / Unlock |
| **L2** | Solana program / token accounts for locked TRV |
| **L3** | Settlement (USDC → lock) + gift mint on roll |
| **L4** | Bridge policy: unlocked TRV ↔ shop redemption |

---

## Related

- `docs/locked/21-Validated-Viewer-TRV-Shop.md`  
- `docs/locked/22-Public-DApp.md`  
- Pack sales remain USDC (vending) — distinct from this lock  
