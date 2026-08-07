# 18 — Sovereign Social Layer (Hybrid)

**Status:** LOCKED design (not implemented)  
**Date:** 2026-08-07  
**Choice:** Architecture **2 — Hybrid**

---

## 0. Names (locked)

| Layer | Product name | Role |
|-------|--------------|------|
| **A — Node** | **The Sentinel** | Local-first core: optical, Hydra, vending, verifier, MoE, `apps/ui` on 127.0.0.1 |
| **B — Society** | **The Remote Viewer** | Social layer: discovery, persona, E2E messaging, signed notes — **uses the network** |

- Repo may still be monorepo `The-Remote-Viewer`; **product language** must not call the local-only console “The Remote Viewer social.”
- Founding / Path B “Viewer” title refers to membership in **The Remote Viewer** (B), proven via **The Sentinel** (A) artifacts.

---

## 1. Split (non-negotiable)

| Layer | Name | Network | Changes to PROVEN node |
|-------|------|---------|-------------------------|
| **A — Node** | **The Sentinel** | None required | **None** — optical, Hydra, vending, verifier, MoE stay local |
| **B — Society** | **The Remote Viewer** | Explicit, labeled | **New surface** — never silently inside Sentinel `apps/ui` 127.0.0.1 console |

- Layer A remains: fail-closed, Destroy=Restart for **node** secrets, no phone-home.
- Layer B may use network services. It must say so in UI chrome every session.
- Shared bridge: **membership proofs** from A (Path B / Integrity Verifier attestations), not a like-graph.

---

## 2. Goals

1. Viewers can **opt in** to be findable inside **The Remote Viewer**.
2. Viewers can **message** with E2E encryption (server sees ciphertext at most).
3. Founding / Path B / verifier roles are **portable claims**, not feed rank.
4. Non-users never become a shadow profile from Sentinel telemetry (node has none).

## 3. Non-goals (explicit)

- No engagement algorithm or “For You” feed in v1.
- No ads, no data brokerage, no phone-home from Layer A (The Sentinel).
- No requirement to join The Remote Viewer to use The Sentinel or buy packs.
- No seller custody of social private keys.
- No yield / staking / “social token rewards” language (see TOKENOMICS).
- Packs stay paid; Remote Viewer membership ≠ free packs.

---

## 4. Identity model

| Identity | Layer | Lifetime |
|----------|-------|----------|
| **Sentinel / node identity** (age keys, vault) | A | Destroy = Restart; never published as social login |
| **Viewer persona** | B (The Remote Viewer) | Optional, persistent, user-chosen alias |
| **Membership proof** | A → B | Signed/attested artifact (verifier overall_ok, contribution tip, Path B completion note) |

- Persona keys ≠ vault keys. Compromise of social key must not unlock Vault.
- Publishing a persona is voluntary and reversible (leave directory; keys rotated).

---

## 5. Surfaces

### Layer A — The Sentinel (unchanged)
- `apps/ui` on `127.0.0.1` — operator console only
- Termux scripts, Hydra, vending, optical
- May show a **single outbound link**: “The Remote Viewer (network — optional)” with plain warning

### Layer B — The Remote Viewer (new)
- Separate entry: static site and/or small client (not bound to 127.0.0.1-only policy)
- Chrome always visible: **“The Remote Viewer uses the network. The Sentinel does not require this.”**
- Features v1:
  1. Opt-in **directory** (alias, roles, contact, proof link)
  2. **Profile** with membership claims
  3. **E2E messaging** (Matrix, Nostr DMs, or age-addressed drops — pick one in implementation pass)
  4. Optional public **signed notes** (not a ranked feed)

---

## 6. Membership bridge (Sentinel → The Remote Viewer)

Allowed claims (examples):

- Path A originator / Path B finisher (per locked doc 04)
- Integrity Verifier node option exercised (doc 17)
- Contribution ledger tip hash (public, non-secret)
- Hydra pulse / attestation timestamp (no secrets)

Verification: peer or Remote Viewer indexer checks artifacts the user **publishes**. Sentinel never pushes attestations automatically.

---

## 7. Messaging (v1 constraint)

- E2E required for content.
- Metadata minimization: prefer designs where the relay cannot read body text.
- No global read receipt graph requirement.
- Moderation: block/report at client; no secret shadow-ban theater — policy published if any relay is operator-run.

**Implementation choice deferred** to a follow-up locked note (Matrix vs Nostr vs ciphertext drops). This doc only requires E2E + opt-in.

---

## 8. Data & custody

| Data | Where |
|------|--------|
| Vault, age secrets, GGUFs, sales private state | Device only (The Sentinel) |
| Persona profile, public proofs | User-published (The Remote Viewer) |
| Message ciphertext | Relay optional (The Remote Viewer) |
| Message keys | User devices (The Remote Viewer) |

Operator of any Remote Viewer relay: **no** requirement to KYC; **no** packing of Sentinel telemetry.

---

## 9. Phased delivery

| Phase | Deliverable |
|-------|-------------|
| **S0** | This locked doc + names |
| **S1** | Opt-in Viewer directory + template + Sentinel UI link to The Remote Viewer |
| **S2** | Persona profile page + proof attach flow |
| **S3** | E2E messaging path selected + minimal client |
| **S4** | Signed notes / public board (still unranked) |

Phase 4 **vending freeze** is independent. Remote Viewer work does not unfreeze catalog prices.

---

## 10. Labeling law

Any binary or page that uses the network for The Remote Viewer MUST show:

> **The Remote Viewer uses the network. The Sentinel (local node) does not require this.**

Absence of that label on a network-using surface is a bug.

---

## 11. Related

- `docs/locked/04-Founding-Sovereign-Viewer.md`
- `docs/locked/17-Validator-Node-First-Role.md`
- `modules/defense/POLICY.md` (The Sentinel only)
- `docs/REALITY.md` — Remote Viewer features stay DESIGN/SCAFFOLD until exercised under user control with the network label present
