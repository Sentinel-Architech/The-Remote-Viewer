# Optical Air-Gap — Phase 3 (draft scope)

**Phase 2:** code-complete for no-hardware path (exact length, paulmillr/qr wiring, cargo vendor, CLI polish).  
**Field optical (Acer↔phone)** remains blocked on hardware (R10). Acoustic stays deferred.

Phase 3 is **not started**. This file is a decision menu, not a commitment.

---

## Candidate tracks (pick 1–2 primary)

| ID | Track | Why it fits TRV | Hardware need | Rough posture |
|----|--------|-----------------|---------------|---------------|
| P3-A | **Edge / ESP32 integration** | On-device sentinel sensors, optical trigger, local only | ESP32 already in play | High fit |
| P3-B | **Optical field verification** | Close the only real Phase 2 gap | Second screen/camera | Blocked until device access |
| P3-C | **Digital vending ↔ optical delivery** | Automated digital goods via proven air-gap path | None | Product path |
| P3-D | **IA-of-IA / loop policy (one rule)** | Measurable adaptive behavior on CRC/gate metrics | None | Keep tiny |
| P3-E | **Vault UX on GrapheneOS** | Safer keygen / Destroy=Restart flows in Termux | None | Ops hygiene |
| P3-F | **Sovereign stablecoin / Ghost Tax design only** | Docs + threat model; no chain deps in core | None | Design track |

---

## Explicit non-goals (carry forward)

- Cloud Vault / hosted keys  
- Meta / Google / Microsoft runtime in core  
- Always-on mic or acoustic as optical rescue  
- Public DNS for `@sentinel.viewer`  
- Claiming multi-device optical success without trials  

---

## Suggested entry order (if unconstrained)

1. **P3-E** Vault hygiene on phone (cheap, locks Destroy=Restart practice)  
2. **P3-A** ESP32 edge path that consumes or signals optical events  
3. **P3-C** Vending that emits TRVL packages  
4. **P3-B** when second device is available  

---

## Open questions for you

1. Primary objective after optical lock: **edge hardware**, **product/vending**, or **governance/IA**?  
2. Is ESP32 still the next physical surface?  
3. Any hard deadline or public demo target?  

Answer those and Phase 3 becomes a real plan instead of a menu.
