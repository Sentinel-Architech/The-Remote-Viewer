# 20 — Native Remote Viewer (social layer)

**Status:** LOCKED  
**Date:** 2026-08-07  
**Supersedes (in part):** external-client-first reading of doc 19  
**Parent:** docs 18 (hybrid) · 19 (transport still valid under the hood)

---

## Rule

**All Remote Viewer social surfaces are native first-party software in this project.**

| Must be native | Meaning |
|----------------|---------|
| Directory | RV app UI, not “go read GitHub markdown only” |
| Personas / proofs | RV app UI + data model |
| Messaging | RV app UI; E2E; not “install a random Nostr client” as the product |
| Signed notes (S4) | RV app UI |

GitHub docs remain **source/backup/export**, not the primary social UX.

---

## Parallel brands (unchanged)

| Brand | Role | Native surface |
|-------|------|----------------|
| **The Sentinel** | Core (local) | `apps/ui` · 127.0.0.1 · no phone-home |
| **The Remote Viewer** | Social (network) | **`apps/remote-viewer/`** · labeled network |

Sentinel does not embed an unlabeled social stack. RV does not replace core integrity.

---

## Native app requirements

1. **First-party UI** under `apps/remote-viewer/` (web client v1; mobile shell later OK).
2. **Always-visible label:**  
   `The Remote Viewer uses the network. The Sentinel (core) does not require this.`
3. **Identity:** Viewer persona keys managed in RV (exportable); never the Sentinel vault age key.
4. **Messaging:** In-app E2E. Transport may be Nostr relays or self-hosted relay **behind** RV UI — users are not told “the product is someone else’s client.”
5. **Directory / personas:** Loaded and rendered in RV; markdown in `docs/public/` is import/export format.
6. **No dependency on GitHub login** to read directory or send DM in steady state (publish/contribute via git remains optional for OSS workflow).

---

## Transport (doc 19, reframed)

- **Nostr** remains an allowed **wire** for DMs and events.
- **age-drops** remain offline fallback.
- Product claim is **native RV**, not “we recommend Amethyst.”

---

## Phased native delivery

| Phase | Deliverable |
|-------|-------------|
| **N0** | This lock |
| **N1** | `apps/remote-viewer/` shell — label, directory render, persona view |
| **N2** | In-app persona edit + proof attach forms (export to markdown/json) |
| **N3** | In-app E2E messaging (Nostr wire or equivalent) |
| **N4** | Signed notes board (unranked) |

S1–S3 markdown artifacts stay as **data/bootstrap** until N-phases absorb them.

---

## Non-goals

- Building social into Sentinel `apps/ui` without network label
- Replacing Sentinel PROVEN local features with accounts
- Yield / engagement ranking

---

## Related

- `apps/remote-viewer/` (implementation)
- `docs/locked/18-Sovereign-Social-Layer.md`
- `docs/locked/19-Messaging-Transport.md`
