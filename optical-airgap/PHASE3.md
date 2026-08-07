# Optical Air-Gap — Phase 3

**Status:** active 2026-08-07  
**Primary done (code):** P3-D control loop + P3-E Vault hygiene  
**Access:** all open-stack devices; GrapheneOS = hardened reference only  
**Deferred:** P3-A ESP32 (~weeks)

---

## Shipped

| Track | Item |
|-------|------|
| **P3-D** | Hysteresis + debounce controller; receiver UI; paste smoke `ctrl=complete` |
| **P3-E** | `scripts/vault-setup.sh` · `vault-destroy.sh` · [VAULT.md](./VAULT.md) |

---

## Parked

| ID | Track | When |
|----|--------|------|
| P3-A | ESP32 edge | ~weeks (hardware window) |
| P3-B | Multi-device optical field | second device |
| P3-C | Vending → TRVL delivery | product push |
| P3-F | Ghost Tax design only | docs |

---

## Operator checklist

1. Camera smoke on receiver (gate rejects → `ctrl` movement)  
2. `bash scripts/vault-setup.sh` → `e2e-age-lt.sh` → `vault-destroy.sh`  
3. ESP32 when board time returns  
