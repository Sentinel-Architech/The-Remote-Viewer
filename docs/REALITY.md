# Reality — authority for PROVEN claims

**Updated 2026-08-14 (night).**  
**Rule:** PROVEN = ran under operator control on a real device. Scripts in git alone are not PROVEN. Chat is subordinate to this file.

Protocol map: [`PROTOCOL.md`](PROTOCOL.md) · Vending: [`../digital-vending/PROTOCOL.md`](../digital-vending/PROTOCOL.md)

---

## PROVEN (device-backed)

| Surface | Status | Notes |
|---------|--------|--------|
| Optical air-gap | **PROVEN** | age → Robust Soliton LT (TRVL) → peel → decrypt; GrapheneOS+Termux |
| Local age identity | **PROVEN** | Device-held; not in git; Destroy = Restart |
| Path B USDC memo → TRVL deliver | **PROVEN** | Payment signal ≠ delivery; local sales.log |
| Empty-frame / empty sha refuse | **PROVEN** | log-sale + verifier |
| Integrity Verifier | **PROVEN** | Contribution + sales.log attestation |
| Path B recognition loop | **OPERATIONAL** | collect → attest → verify → issue → install |
| Community pool gross visibility | **OPERATIONAL** | Public memo volume; no custody |
| Dense local models (Termux) | **PROVEN** | e.g. TinyLlama / Qwen paths as operator-run |
| Sparse MoE load+gen | **PROVEN** | Operator-run weights |
| Hydra / integrity-pulse | **PROVEN** | modules/defense as operator-run |
| Local operator UI | **PROVEN** | apps/ui under operator control |

Prefer `optical-airgap/`, `digital-vending/`, `modules/integrity-verifier/`, and operator logs over any summary.

---

## Not PROVEN

| Item | State |
|------|--------|
| `trv_governance` on Solana | Scaffold + CI only — **not deployed** |
| Green `anchor build` on GH Actions | **Blocked** (SBF Cargo / edition2024) |
| $96 network sub collection | Policy only |
| Creator 95/5 settlement rails | Policy + client helpers only |
| Viewer mail @ TRV domain | Spec only |
| Live social Integrity network | Policy + UI scaffold |
| Wear OS companion app | Scaffold only |
| Multi-phone production clients | Scaffold (PWA / android-cap) |
| Scale / DAU claims | **Not claimed** |
| Path B external founders | **0** |

---

## Operators often miss

1. Solana **build host ≠ Termux**  
2. `declare_id!` is scaffold until `anchor keys list` on a real host  
3. Policy ($96, splits, mail) ≠ shipped product  
4. Mint/authority keys are root power — never commit  
5. Green unit tests ≠ safe mainnet money  

---

## Track A (Solana entitlement)

Design + program scaffold **0.32.1**. **Not on devnet.** Unblock: [CI-BLOCKER.md](CI-BLOCKER.md).

## Reference environment (PROVEN work)

GrapheneOS + Termux + branch `TheRemoteViewer`, optical + vending + verifier as operator-run.
