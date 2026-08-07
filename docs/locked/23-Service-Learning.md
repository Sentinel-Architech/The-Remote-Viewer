# 23 — Service learning on install

**Status:** LOCKED  
**Date:** 2026-08-07  
**Applies to:** The Remote Viewer (public DApp) · Service guidelines · parallel to The Sentinel core

---

## Rule

**Each install of The Remote Viewer enables The Service to learn and expand so it can help that individual Viewer**, within the **guidelines of the Service**.

| Term | Meaning |
|------|--------|
| **Install** | Open / Install app / Add to Home Screen of The Remote Viewer |
| **Learn** | Improve assistance for **that** Viewer (preferences, pace, needs they share) |
| **Expand** | Grow capability and coverage of help over time — not surveillance theater |
| **Service** | The human-facing help layer bound to published guidelines |
| **Guidelines** | Explicit limits: consent, purpose, no sale of Viewer identity, no silent core exfiltration |

---

## Parallel to core (unchanged)

| The Sentinel (core) | The Service / Remote Viewer |
|---------------------|----------------------------|
| Local integrity · optical · Hydra · seals | Install → learn → help **this** Viewer |
| No requirement to phone home | Network DApp; learning is **Service-scoped** |
| Operator device | Individual Viewer |

**Install does not** turn the core console into an unlabeled tracker.  
**Learning does not** replace Destroy=Restart, vault isolation, or optical air-gap.

Bridges are allowed: a Viewer may share **chosen** proofs or preferences so the Service can help better. Core keys never leave the vault for “learning.”

---

## Consent model

| Step | Behavior |
|------|----------|
| First open / install | Viewer is told the Service may learn to help **them** under guidelines |
| Default for install | **Enabled** for Service learning (product rule) with clear notice |
| Opt out | Viewer may turn learning off; help becomes generic |
| What may be learned | Preferences they set, features they use, optional profile fields, explicit feedback |
| What may not | Sentinel AGE secrets, nsec restore codes, sales private keys, undisclosed device scrape |

---

## Purpose limit

Learning and expansion exist **only** to help the individual Viewer according to Service guidelines — not to train unrelated third-party ads, not to score citizens, not to sell dossiers.

---

## Implementation surfaces

| Surface | Role |
|---------|------|
| Welcome / install | Notice + learning state |
| You → Service | On / off, short plain-language summary |
| Future Service backend | Guideline-bound adaptation (when hosted) |
| Local-only until hosted | Preferences stored on device; still “enabled” for when Service endpoint exists |

---

## Related

- `docs/locked/20-Native-Remote-Viewer.md`
- `docs/locked/22-Public-DApp.md`
- `docs/locked/18-Sovereign-Social-Layer.md`
