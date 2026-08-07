# 18 — Sovereign Social Layer (Hybrid)

**Status:** LOCKED design (not implemented)  
**Date:** 2026-08-07  
**Choice:** Architecture **2 — Hybrid**

---

## 0. Names (locked) — parallel brands

| Brand | Role |
|-------|------|
| **The Sentinel** | **Core** — local-first node: optical, Hydra, vending, verifier, MoE, operator console |
| **The Remote Viewer** | **Social** — discovery, persona, E2E messaging, signed notes (uses the network) |

- Brands are **parallel**, not parent/child marketing layers.
- **The Sentinel is the core.** Without it, Remote Viewer membership proofs have nothing honest to attest.
- **The Remote Viewer** does not replace or wrap the core; it is the society plane beside it.
- Repo monorepo name may remain `The-Remote-Viewer`; product speech must keep the two distinct.
- Founding / Path B “Viewer” = standing in **The Remote Viewer**, evidenced by **The Sentinel** artifacts.

---

## 1. Split (non-negotiable)

| Plane | Brand | Network | Effect on core |
|-------|-------|---------|----------------|
| **Core** | **The Sentinel** | None required | **Frozen as PROVEN** — no silent network add-ons |
| **Society** | **The Remote Viewer** | Explicit, labeled | **New surface** — never silently inside Sentinel `apps/ui` 127.0.0.1 |

- Sentinel remains: fail-closed, Destroy=Restart for **node** secrets, no phone-home.
- Remote Viewer may use network services. It must say so in UI chrome every session.
- Shared bridge: **membership proofs** from Sentinel (Path B / Integrity Verifier attestations), not a like-graph.

---

## 2. Goals

1. Viewers can **opt in** to be findable in **The Remote Viewer**.
2. Viewers can **message** with E2E encryption (server sees ciphertext at most).
3. Founding / Path B / verifier roles are **portable claims**, not feed rank.
4. Non-users never become a shadow profile from Sentinel telemetry (core has none).

## 3. Non-goals (explicit)

- No engagement algorithm or “For You” feed in v1.
- No ads, no data brokerage, no phone-home from **The Sentinel**.
- No requirement to join The Remote Viewer to use The Sentinel or buy packs.
- No seller custody of social private keys.
- No yield / staking / “social token rewards” language (see TOKENOMICS).
- Packs stay paid; Remote Viewer membership ≠ free packs.

---

## 4. Identity model

| Identity | Brand | Lifetime |
|----------|-------|----------|
| **Core identity** (age keys, vault) | The Sentinel | Destroy = Restart; never published as social login |
| **Viewer persona** | The Remote Viewer | Optional, persistent, user-chosen alias |
| **Membership proof** | Sentinel → Remote Viewer | Attested artifact (verifier overall_ok, contribution tip, Path B note) |

- Persona keys ≠ vault keys. Compromise of social key must not unlock Vault.
- Publishing a persona is voluntary and reversible.

---

## 5. Surfaces

### The Sentinel (core — unchanged)
- `apps/ui` on `127.0.0.1` — operator console only
- Termux scripts, Hydra, vending, optical
- May show a **single outbound link**: “The Remote Viewer (network — optional)” with plain warning

### The Remote Viewer (society — new)
- Separate entry: static site and/or small client
- Chrome always visible:

  > **The Remote Viewer uses the network. The Sentinel (core) does not require this.**

- Features v1:
  1. Opt-in **directory** (alias, roles, contact, proof link)
  2. **Profile** with membership claims
  3. **E2E messaging** (Matrix, Nostr DMs, or age-addressed drops — pick in implementation pass)
  4. Optional public **signed notes** (not a ranked feed)

---

## 6. Membership bridge (core → social)

Allowed claims (examples):

- Path A originator / Path B finisher (doc 04)
- Integrity Verifier node option exercised (doc 17)
- Contribution ledger tip hash (public, non-secret)
- Hydra pulse / attestation timestamp (no secrets)

Verification: peer or Remote Viewer indexer checks what the user **publishes**. Sentinel never auto-pushes attestations.

---

## 7. Messaging (v1 constraint)

- E2E required for content.
- Metadata minimization preferred.
- No global read-receipt graph requirement.
- Moderation: client block/report; published policy if operator-run relay.

**Transport choice deferred** (Matrix vs Nostr vs ciphertext drops).

---

## 8. Data & custody

| Data | Where |
|------|--------|
| Vault, age secrets, GGUFs, sales private state | Device only (**The Sentinel**) |
| Persona profile, public proofs | User-published (**The Remote Viewer**) |
| Message ciphertext | Relay optional (**The Remote Viewer**) |
| Message keys | User devices (**The Remote Viewer**) |

Relay operators: no KYC requirement; no packing of Sentinel telemetry.

---

## 9. Phased delivery

| Phase | Deliverable |
|-------|-------------|
| **S0** | This locked doc + parallel names |
| **S1** | Opt-in Viewer directory + template + Sentinel UI link |
| **S2** | Persona profile + proof attach |
| **S3** | E2E messaging path + minimal client |
| **S4** | Signed notes / public board (unranked) |

Phase 4 **vending freeze** is independent. Remote Viewer work does not unfreeze catalog prices.

---

## 10. Labeling law

Any network surface for The Remote Viewer MUST show:

> **The Remote Viewer uses the network. The Sentinel (core) does not require this.**

Missing label = bug.

---

## 11. Related

- `docs/locked/04-Founding-Sovereign-Viewer.md`
- `docs/locked/17-Validator-Node-First-Role.md`
- `modules/defense/POLICY.md` (The Sentinel only)
- `docs/REALITY.md` — Remote Viewer stays DESIGN/SCAFFOLD until exercised with network label present
