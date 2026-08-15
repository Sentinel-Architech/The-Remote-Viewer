# Wear OS companion (scaffold)

Thin client. **Phone holds keys.** Watch shows access + signal.

## Surfaces

| Surface | Purpose |
|---------|---------|
| Glance / tile | Free · $96 · Node · stale if offline |
| Haptic | weak / standard / strong pattern |
| Voice | Route to phone mic/speaker when session open |
| Wake affirm | Confirm “Hey Sentinel” attention on phone |

## Rules

1. No root key generation on watch  
2. Entitlement **cached** from phone; label **STALE** when bridge down  
3. No always-on mic  
4. Pairing via system BT only  

Policy: `docs/locked/WEARABLES.md`

## Layout

```text
clients/wear-os/
  README.md
  glance.md      # UI copy + states
  bridge.md      # phone ↔ watch messages
```
