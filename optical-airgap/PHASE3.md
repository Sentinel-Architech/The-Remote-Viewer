# Optical Air-Gap — Phase 3

**Status:** started 2026-08-07  
**Primary:** governance / IA — **one measurable adaptive rule**  
**Access posture:** **all devices** that can run the open stack (Git + Node 20+ or Rust/`age`), not GrapheneOS-only. GrapheneOS remains the **verified hardened reference**.

Phase 2: code-complete for no-hardware path. Field optical (Acer↔phone) still blocked on hardware (R10).

---

## Locked decisions

1. **Primary track = P3-D** — one IA-of-IA rule, not a full policy engine.  
2. **Access = universal open-stack** — Linux, Windows, macOS, Android (GMS or de-Googled), SBCs, Termux. GrapheneOS is preferred when available, never required.  
3. **No cloud Vault, no Big Tech runtime in core.**  

---

## P3-D first slice (in progress)

| Item | State |
|------|--------|
| `decideOpticalAction(metrics)` pure function | **shipped** in `loop/hooks.ts` |
| Actions: lower_fps / check_optics / send_more / complete / none | **shipped** |
| Wire into QR receiver status line | next |
| On-device smoke (any host) | next |

Rule priority: complete → CRC → gate rejects → slow peel → nominal.

---

## Other tracks (parked)

| ID | Track | When |
|----|--------|------|
| P3-A | ESP32 edge | after one-rule proven |
| P3-B | Multi-device optical field | hardware available |
| P3-C | Vending → optical delivery | product push |
| P3-E | Vault UX hygiene | anytime, cheap |
| P3-F | Ghost Tax design only | docs track |

---

## Non-goals

- GrapheneOS as exclusive gate  
- Multi-agent policy debate loops  
- Always-on mic / acoustic rescue  
- Hosted keys  
