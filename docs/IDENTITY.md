# Viewer identity & recovery (SCAFFOLD)

GrapheneOS-first. Prefer **user-held secrets** over email/SMS (SIM-swap risk already rejected).

## Identity

| Layer | Intent |
|-------|--------|
| Wallet / did:key style key | Signs on-chain actions |
| Local Sentinel profile | On-device; encrypted at rest |
| Entitlement PDA | Sub or node — not the root identity |

## Recovery (required design)

1. **12/24-word backup** (or equivalent) shown **once** at create — user writes offline
2. Optional **social recovery** later (guardians) — not phone number as root
3. Destroy account only with high-friction path you specified (name + associated factor typed in settings)
4. Lost phone + lost backup = **unrecoverable** — say so clearly at onboarding

## Not root factors

- SMS / SIM as sole recovery (swap risk)
- Email as sole recovery (account takeover)
- Platform custodial “reset password” for the root key

## Phone factor (optional second)

If a phone number is used later, it is **second factor or contact channel**, not the only key to the kingdom.

## Optical air-gap

Vault identities in optical path: never reuse demo keys from screenshots/chat (existing Sentinel Standard).
