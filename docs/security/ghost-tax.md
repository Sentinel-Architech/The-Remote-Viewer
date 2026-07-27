# Ghost Tax — Definition

**Status:** Draft definition — July 27, 2026  
**Related:** `docs/security/threat-model.md` §6.10, GENIUS Act alignment notes, LiDAR / spatial handshake concepts  
**Not:** Legal advice. Not a claim of PPSI status or regulatory approval.

---

## One-sentence definition

**Ghost Tax** is an **algorithmically tiered fee** charged on **economic activity** by **unverified** (or under-verified) participants — those who have **not** completed the protocol’s **LiDAR Spatial Handshake** (or equivalent verification elevation) — to offset the **extra monitoring and compliance overhead** their anonymity imposes on the network under a GENIUS Act–oriented design.

In plain terms: **you can stay more anonymous; the network charges more for the risk and overhead that creates.**

---

## What it is

| Attribute | Definition |
|-----------|------------|
| **Name** | Ghost Tax |
| **Type** | Protocol / payment-path **fee policy**, not a government tax |
| **Trigger** | Participant has **not** completed verification elevation (default: LiDAR Spatial Handshake) |
| **Object of the fee** | Defined economic actions (e.g. certain transfers, marketplace settlement, DePIN service burns) — **not** reading the vault or sending ordinary E2E messages unless explicitly specified |
| **Payer** | The unverified (“ghost”) participant or the side of the transaction policy assigns |
| **Beneficiary** | Network treasury / monitoring budget as defined in tokenomics — **not** a platform key-escrow fund |
| **Computation** | **Tiered by algorithm** (verification level, volume, risk signals) — exact schedule is a separate parameters doc |
| **Enforcement locus** | Must be enforceable in **consensus, contract, or payment gateway** logic; client-only UI fees are **not** Ghost Tax |

---

## What it is not

| Not this | Why |
|----------|-----|
| A government tax | No sovereign taxing power; protocol fee |
| KYC sold as optional theater | Verification is optional for *use*; fee is the economic consequence of staying unverified on *paid* paths |
| A reason to hold user private keys | Compliance pressure must **not** create platform recovery keys (see locked key-loss model) |
| Decryption of E2E content | Monitoring for fee/risk tiers uses **protocol metadata and verification status**, not vault plaintext |
| A social credit score | Must not score “worthiness” of the person; only **verification tier + action type + volume/risk** for fee calculation |
| Automatic proof of GENIUS compliance | Design intent toward Section 9–style *innovation in detection/friction*; not a license or examination pass |
| A fee on merely existing offline | Offline vault open/burn are **out of scope** for Ghost Tax |

---

## “Ghost” status

A **Ghost** (for fee purposes) is a participant whose identity path has **not** completed the **LiDAR Spatial Handshake** (or successor verification elevation defined by governance).

| Status | Meaning for Ghost Tax |
|--------|------------------------|
| **Ghost** | Unverified / under-verified → **higher** fee tiers on covered economic actions |
| **Elevated** (handshake complete) | Verified under protocol rules → **reduced or zero** Ghost Tax on the same actions |
| **Burned / new path** | New path starts Ghost again until elevation; no carry-over of old verification |

Verification is **user-chosen elevation**, not forced doxxing by the platform. The tax is the alternative to elevation on regulated *payment* and high-risk *economic* surfaces.

---

## Dual purpose (as stated in project doctrine)

1. **Compensatory monitoring** — Resources for increased automated risk monitoring associated with unverified wallets/nodes (GENIUS Act Section 9–oriented design narrative).  
2. **Incentive alignment** — Economic pressure to complete spatial/verification handshake if the user wants lower fees on payment and marketplace paths, without making the platform the custodian of keys.

---

## Relationship to other planes

```
Identity / vault keys     →  never funded or recovered via Ghost Tax
TRV utility token         →  may be the fee unit or burned unit (per tokenomics)
Payment stablecoin (PPSI) →  separate trust boundary; Ghost Tax does not make TRV a PPSI
POSE / social rewards     →  earn path; Ghost Tax is a spend/friction path on ghosts
```

**Split rule:** Collecting Ghost Tax must not require, imply, or enable **platform custody of vault keys or payment stablecoin reserves** unless a separate, counsel-reviewed custody product exists (default: it does not).

---

## Minimal policy requirements (for implementers)

1. **Published schedule** — Tiers, covered actions, fee unit (TRV burn vs stable fee), and max fee.  
2. **Deterministic status** — On-chain or gateway-visible verification flag; no silent discretionary “tax because we dislike you.”  
3. **Fail closed on payment** — If fee cannot be assessed for a covered payment action, **reject** the action rather than “charge zero and pretend.”  
4. **Data minimization** — Fee logic may use verification tier + action class + volume; it must **not** require uploading vault contents or master keys.  
5. **Honest UX** — User sees: status (Ghost / Elevated), estimated fee, and that elevation is optional but affects price.  
6. **No fake compliance claims** — UI must not say “GENIUS certified” solely because Ghost Tax exists.

---

## Open parameters (to be fixed in tokenomics / governance)

- Exact tier table (% or flat amounts)  
- Which actions are in scope (transfers, shop, DePIN burns, governance deposits, etc.)  
- Fee unit: TRV burn, TRV transfer to treasury, or PPSI stable fee  
- Whether elevated users pay a residual base network fee  
- Oracle / authority for “handshake complete” without central KYC database  

Until those are fixed, treat Ghost Tax as **defined in principle** above and **undefined in numbers**.

---

## Canonical short copy (for UI / README)

> **Ghost Tax** is a higher network fee on certain economic actions if you have not completed the optional spatial verification handshake. You can stay unverified; you pay more for the monitoring overhead that creates. It is not a government tax, and it never gives the platform your keys.

---

*Draft. Align numbers with `docs/concepts/tokenomics.md` when schedule is set. Threat context: `docs/security/threat-model.md` §6.10.*
