# Optical Air-Gap — Phase 3

**Status:** active 2026-08-07  
**Shipped:** P3-D control loop · P3-E Vault · P3-C vending optical e2e  
**Access:** all open-stack devices  
**Deferred:** P3-A ESP32 (~weeks)

---

## Shipped

| Track | Item |
|-------|------|
| **P3-D** | Hysteresis + debounce; receiver UI; paste `ctrl=complete` |
| **P3-E** | vault-setup / destroy + VAULT.md |
| **P3-C** | `digital-vending/e2e-optical-demo.sh` + optical path docs |

## P3-C path

```
catalog item → seller-deliver (age + TRVL) → frames.trvl
  → buyer-receive (peel + decrypt)
  → or qr-receiver.html paste (peel ciphertext) + CLI decrypt
```

## Parked

| ID | When |
|----|------|
| P3-A ESP32 | ~weeks |
| P3-B multi-device optical | second device |
| P3-F Ghost Tax design | docs |
