# Scaffold → PROVEN (what still must be proven)

**Rule:** PROVEN = ran under *your* control on a real device/machine. Git alone never promotes.

Authority: [REALITY.md](REALITY.md). Already PROVEN ends are not listed as work.

---

## Already PROVEN (do not re-litigate)

Optical TRVL · Path B USDC→`.trvl` · Integrity Verifier · Path B recognition · operator local models/UI/defense pulse

---

## A — Solana entitlement (blocks money + unlimited comms product)

| Step | Proof |
|------|--------|
| A1 | Build host: `anchor build` produces `.so` + IDL |
| A2 | `anchor test` (or equivalent) green on that host |
| A3 | Devnet deploy + `initialize` + `grant_subscription` + `refresh_entitlement` |
| A4 | Read `unlimited_comms == true` for test Viewer from a client |
| A5 | Log program id + tx in operator notes; then REALITY line |

**Blocker today:** [CI-BLOCKER.md](CI-BLOCKER.md) (SBF Cargo). Phone cannot complete A1.

---

## B — PWA baseline (`clients/pwa`)

| Step | Proof |
|------|--------|
| B1 | Serve `index.html` over **https** on a phone browser you control |
| B2 | Tutorial once · signal line · learning card visible |
| B3 | `TRV.clearLearning()` clears prefs |
| B4 | Screenshot + short note in operator log → optional REALITY “DEMONSTRATED” |

Does **not** prove chain entitlement.

---

## C — Android capability (`clients/android-cap`)

| Step | Proof |
|------|--------|
| C1 | Native shell or instrumentation feeds real `ProbeResult` |
| C2 | `mapTier()` matches camera/mic/keystore reality |
| C3 | Deny mic → voice features off in UI |
| C4 | Graphene device shows higher tier only when `localRuntime` true |

---

## D — Wear OS (`clients/wear-os`)

| Step | Proof |
|------|--------|
| D1 | Install glance on Wear OS paired to your phone |
| D2 | `entitlement.snapshot` shows STALE when phone bridge killed |
| D3 | No private keys on watch (inspect bridge payloads) |

---

## E — Entitlement client (`clients/entitlement`)

| Step | Proof |
|------|--------|
| E1 | Depends on **A4** |
| E2 | `source: "chain"` only when RPC succeeds |
| E3 | Disconnect RPC → UI falls back to unknown/weak |

---

## F — Safety UI (`clients/safety-ui`)

| Step | Proof |
|------|--------|
| F1 | Submit Integrity compose → real handoff path (not a mock that claims NCMEC) |
| F2 | Area bulletin shows **region only**, never subject lat/lng |
| F3 | Operator attestation that path is non-simulated |

---

## G — Creator splits (`clients/creator`)

| Step | Proof |
|------|--------|
| G1 | Unit checks: 95/5, 90/10, secondary 5%, platform 0, dust to pool |
| G2 | When payments live: one real settlement matches BPS |

Math helpers alone ≠ PROVEN payouts.

---

## H — Continuous learning (`clients/shared/learning.ts`)

| Step | Proof |
|------|--------|
| H1 | Prefs persist on device across restart |
| H2 | Destroy / clear wipes L0 |
| H3 | Network capture shows **no** preference/chat upload when conductOptIn false |

---

## Promotion rule

1. Complete checklist on hardware you control  
2. Keep a dated operator note (local)  
3. Only then edit **REALITY.md** status cells  
4. Never mark PROVEN from CI green alone for money paths  

## Priority order (practical)

1. **A** (build host) — unlocks E and $96 product  
2. **B** (PWA on phone) — fast DEMONSTRATED  
3. **H** (learning wipe + no-exfil)  
4. **C → D → F → G**  
