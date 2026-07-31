# R6 — Acoustic secondary channel · Risk contingency (detail)

**Parent:** [PHASE2.md](./PHASE2.md) · **Work item:** P2-5 (optional)  
**Default posture:** optical is primary; acoustic is **optional**. Prefer **defer** over burning core Phase 2 budget.

---

## 1. Risk statement

P2-5 adds a speaker→mic path for the **same** opaque payloads as optical (age ciphertext and/or TRVL-framed bytes). Failure modes cluster into three families:

| Family | Code | Failure |
|--------|------|--------|
| **Legal / license** | R6-L | Codec or deps not clearly MIT/Apache/BSD-compatible, or copyleft that contaminates core |
| **Platform / UX** | R6-P | GrapheneOS / browser / OS blocks mic, forces bad permission UX, or forbids background capture |
| **Physics / environment** | R6-E | Ambient noise, frequency response, or distance makes reliable decode impractical |

Any one family can kill the feature. Contingency must not silently fund endless codec research.

---

## 2. Hours model (P2-5 only)

| Bucket | Hours | When |
|--------|-------|------|
| **Base** | 16–28 h | Clean path if codec is obvious and quiet-room demo works |
| **Buffer** | +8–12 h | Routine integration, docs, one noisy-room retry |
| **Planned** | **24–40 h** | Only if P2-5 is **explicitly started** |
| **R6 contingency** | **+12–24 h** | Only after mid-stream **go** criteria (below) |
| **Else** | **0 h more** | Defer / cancel — do not raid core P2-1…P2-4/7/8 budget |

**Core Phase 2 budget is ring-fenced.** R6 hours never pay for optical, Soliton, or vendor work.

---

## 3. Pre-start gate (before any P2-5 coding)

Do **not** open planned hours until all pass:

| # | Gate | Pass criteria |
|---|------|----------------|
| G1 | Optical still primary in docs | README/STATUS say acoustic is secondary |
| G2 | Payload rule | Spec: audio carries **only** already-encrypted or TRVL opaque bytes — no plaintext modem |
| G3 | License shortlist | ≥1 candidate codec/stack with written license note in `NOTICE` draft |
| G4 | No Big Tech core | Candidate pulls no Meta/Google/Microsoft required runtime |
| G5 | Explicit start | STATUS or issue: `P2-5 STARTED <date>` |

If G3 fails → **do not start**; mark P2-5 `blocked: license`.

---

## 4. Phased burn (with kill points)

### Phase A — License & spike · **max 4 h** (from Planned)

| Task | Cap |
|------|-----|
| Confirm license text for top candidate | 2 h |
| Hello-world tone/modulate in browser or Termux | 2 h |

**Kill A:** License ambiguous after 2 h **or** cannot emit/detect a known bit pattern in 2 h quiet room.  
→ **Defer P2-5**. Contingency = 0. Log `R6-L` or `R6-E-spike`.

### Phase B — Payload path · **max 8 h**

| Task | Cap |
|------|-----|
| Map age/TRVL bytes → frames/packets | 3 h |
| Explicit user gesture start/stop (no always-on mic) | 3 h |
| Destroy = Restart note for audio buffers | 1 h |
| GrapheneOS permission draft | 1 h |

**Kill B:** Cannot meet gesture-only mic rule on target profile **or** payload path requires network.  
→ **Defer**. Log `R6-P`.

### Phase C — Quiet-room demo · **max 12 h** (remainder of Planned toward demo)

| Task | Cap |
|------|-----|
| End-to-end short age blob speaker→mic same device or Acer↔phone | 8–10 h |
| Doc + threat note draft | 2 h |

**Go criteria for R6 contingency** (all required):

1. License file committed and acceptable  
2. One successful offline transfer of a **known** age ciphertext (≥32 bytes)  
3. Gesture-only capture verified  

If go criteria **fail** at end of Planned → **Hard cut / cancel**. No contingency.

### Phase D — Contingency only · **+12–24 h max**

Unlocked **only** if go criteria pass and STATUS notes `R6 contingency OPEN`.

Allowed uses:

| Use | Hours (from contingency) |
|-----|---------------------------|
| Mild ambient-noise hardening | 4–8 h |
| Second-device trial (Acer speaker ↔ Pixel mic) | 4–8 h |
| UX polish + INSTALL section | 2–4 h |
| One alternate open codec if first hits a wall **after** demo | 6–10 h |

**Forbidden uses of contingency:**

- Redesigning core crypto  
- Always-on listening  
- Cloud relay “fallback”  
- Funding P2-4 optical debt  
- Second research codec before first demo exists  

**Kill D:** Contingency hours exhausted without stable second-device demo → ship as **experimental quiet-room only** or cancel. No further hours.

---

## 5. Trigger matrix (detailed)

| ID | Trigger (observable) | Immediate response | Charge | Outcome |
|----|----------------------|--------------------|--------|--------|
| R6-L1 | SPDX/license text missing or conflicting after 2 h review | Stop coding; document block | Planned A | Defer |
| R6-L2 | Dependency pulls forbidden vendor runtime | Reject stack; try one alternate ≤2 h | Planned A | Defer if none |
| R6-P1 | Browser/OS denies mic without unacceptable prompt loop | Document; paste/optical only | Planned B | Defer audio UX |
| R6-P2 | GrapheneOS profile cannot grant mic to chosen shell | Termux/cli-only experiment **or** defer | +0–4 h Planned | Defer app-level |
| R6-P3 | Feature requires always-on mic | **Reject design**; redesign gesture or cut | — | Hard cut that design |
| R6-E1 | Quiet-room BER too high for 32-byte blob in Phase C cap | One parameter pass (baud/freq); else kill | Planned C | Defer |
| R6-E2 | Works quiet, fails any realistic room after contingency noise work | Label `experimental quiet-room` | Contingency | Soft ship or cut |
| R6-E3 | Distance <30 cm required and unstable | Document range limit; no more range research | Contingency ≤2 h | Soft ship |
| R6-X | Scope talk expands to “ultrasonic MFA product” | Refuse; P2-5 is transfer pipe only | 0 | Park |

---

## 6. Decision tree

```
Start P2-5?
  ├─ G1–G5 pass? ──No──► STATUS: P2-5 blocked (gate)
  └─Yes
      Phase A (≤4 h)
        ├─ Kill A? ──Yes──► DEFER (R6-L / spike)
        └─No
            Phase B (≤8 h)
              ├─ Kill B? ──Yes──► DEFER (R6-P)
              └─No
                  Phase C (≤12 h toward demo)
                    ├─ Go criteria fail? ──Yes──► CANCEL/DEFER (0 contingency)
                    └─Pass
                        STATUS: R6 contingency OPEN
                        Phase D (≤12–24 h)
                          ├─ Second-device OK? ──Yes──► P2-5 DONE (secondary channel)
                          └─No / hours empty ──► experimental quiet-room OR cancel
```

---

## 7. Security & product constraints (non-negotiable)

| Rule | Detail |
|------|--------|
| Encrypt-first | Audio never carries plaintext secrets |
| Same trust as optical | Compromise of acoustic path = compromise of ciphertext exposure only |
| No always-on | User gesture to TX and RX |
| Buffer hygiene | PCM/encoded buffers wiped on stop and on Destroy = Restart |
| Threat honesty | Docs must state: acoustic is eavesdroppable in-room; optical is shoulder-surfable; neither is magic |
| Primary channel | Optical remains default in UX and docs |

---

## 8. STATUS labels for R6 / P2-5

| Label | Meaning |
|-------|--------|
| `P2-5 not started` | Default |
| `P2-5 blocked: license` | G3/R6-L |
| `P2-5 blocked: platform` | R6-P |
| `P2-5 in progress A/B/C` | Phase tag |
| `R6 contingency OPEN` | Go criteria met |
| `P2-5 experimental quiet-room` | Soft ship |
| `P2-5 DONE secondary` | Quiet + second-device |
| `P2-5 DEFERRED` | Explicit park; hours returned to unallocated |
| `P2-5 CANCELLED` | Hard cut; do not restart without new issue |

---

## 9. What “defer” means operationally

1. STATUS + PHASE2 checkbox: deferred, with risk id (R6-L/P/E).  
2. No half-merged codec tree on `main`/`TheRemoteViewer` without `experimental/` path.  
3. Open issues titled acoustic closed as `not_planned` or left as milestone Phase 3.  
4. Core optical path documentation must not claim acoustic availability.  
5. Contingency hours **not** reassigned unless a new written plan says so.

---

## 10. Relationship to other risks

| Interaction | Rule |
|-------------|------|
| R4 optical field fail | Does **not** auto-start P2-5; acoustic is not a free rescue |
| R10 no device | Acoustic field tests also blocked; code spikes only if host has speaker/mic |
| R9 toolchain | Fix Phase 1 before acoustic deps |

---

## 11. Quick reference

| Question | Answer |
|----------|--------|
| Must we do P2-5 in Phase 2? | **No** |
| When is contingency allowed? | After license + gesture + one quiet-room age-blob demo |
| Max contingency | **+12–24 h**, then stop |
| Preferred exit under stress | **Defer / cancel** |
| Primary air-gap | **Optical** |
