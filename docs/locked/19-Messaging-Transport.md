# 19 — Messaging Transport (S3)

**Status:** LOCKED  
**Date:** 2026-08-07  
**Parent:** `docs/locked/18-Sovereign-Social-Layer.md`

---

## Choice

| Priority | Transport | Role |
|----------|-----------|------|
| **Primary** | **Nostr** (E2E DMs) | Default Remote Viewer messaging |
| **Fallback** | **age-addressed drops** | Offline / optical-compatible, non-real-time |

**Not chosen for v1:** Matrix (homeserver ops + account UX heavier for parallel launch).

---

## Why Nostr

- Keypair identity aligns with Viewer persona (npub public, nsec never in git)
- No required self-hosted homeserver to start
- E2E DM capability (prefer NIP-44 / modern DM NIPs as clients support; avoid cleartext)
- Relays are replaceable; user can switch relays

## Rules

1. Messaging is **The Remote Viewer** (network). Not The Sentinel core.
2. Label required on any messaging surface (doc 18 §10).
3. **nsec** never committed, never pasted into VIEWERS/personas, never into Sentinel vault path.
4. Persona may publish **npub** only.
5. The Sentinel does not auto-broadcast presence or DMs.
6. Packs stay paid; messaging access ≠ free packs.

## Age-drop fallback

When relays are unacceptable or offline:

- Encrypt payload to peer `age1…` (social age key ≠ vault key recommended)
- Carry via TRVL / file / optical path already PROVEN on Sentinel
- Not a substitute for real-time DM; documented for continuity

## Client policy (v1)

- **No first-party full relay operator required** to declare S3 complete
- Users pick any reputable Nostr client that supports DMs + GrapheneOS constraints
- Optional later: thin Remote Viewer web helper (still labeled network)

## Related

- `docs/public/MESSAGING.md` — user guide
- Personas: optional `npub` field
