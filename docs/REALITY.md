# Reality — authority for PROVEN claims

**Updated 2026-08-14 (night).**  
**Rule:** PROVEN = ran under operator control on a real device. Scripts in git alone are not PROVEN.

**Promotion checklists:** [PROVEN-NEEDED.md](PROVEN-NEEDED.md)  
**Protocol:** [PROTOCOL.md](PROTOCOL.md)  
**Vending:** [../digital-vending/PROTOCOL.md](../digital-vending/PROTOCOL.md)

---

## PROVEN (device-backed)

| Surface | Status | Notes |
|---------|--------|--------|
| Optical air-gap | **PROVEN** | age → Soliton LT (TRVL) → peel → decrypt |
| Local age identity | **PROVEN** | Device-held; Destroy = Restart |
| Path B USDC memo → TRVL | **PROVEN** | Payment ≠ delivery |
| Empty-frame refuse | **PROVEN** | log-sale + verifier |
| Integrity Verifier | **PROVEN** | contribution + sales.log |
| Path B recognition loop | **OPERATIONAL** | collect → attest → verify → issue → install |
| Pool gross visibility | **OPERATIONAL** | public memo volume; no custody |
| Local models / MoE load | **PROVEN** | operator-run Termux paths |
| Hydra / integrity-pulse | **PROVEN** | modules/defense |
| Local operator UI | **PROVEN** | apps/ui |

---

## Not PROVEN (upgraded scaffolds — need proof)

| Item | State | Checklist |
|------|--------|-----------|
| `trv_governance` on chain | Scaffold · CI build blocked | PROVEN-NEEDED **A** |
| $96 sub collection | Policy only | After A + payments |
| Creator settlement rails | Helpers only | **G** |
| PWA as shipped client | Scaffold (code upgraded) | **B** |
| android-cap live probes | Scaffold | **C** |
| Wear companion | Scaffold | **D** |
| Entitlement RPC client | Scaffold | **E** (needs A) |
| Live Integrity network UI | Scaffold | **F** |
| Continuous learning no-exfil | Policy + scaffold | **H** |
| Viewer mail TRV domain | Spec | — |
| Path B external founders | **0** | — |
| Scale / DAU | Not claimed | — |

---

## Operators often miss

1. Solana build host ≠ Termux  
2. Policy ≠ product  
3. Upgraded scaffold ≠ PROVEN  
4. Never commit mint/authority keys  

## Track A

Anchor **0.32.1** scaffold. Not on devnet. [CI-BLOCKER.md](CI-BLOCKER.md).
