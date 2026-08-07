# Validator Node — First Role (Locked)

**Status:** Locked — August 07, 2026  
**Classification:** Permanent design boundary for the initial validating-node role  
**Depends on:** `04-Founding-Sovereign-Viewer.md`, `TOKENOMICS.md`, contribution module, digital-vending integrity rules

---

## Purpose

Define the **first** validating-node role that may be offered to Path B Founding Members.

This role exists to strengthen verification without creating custody, capital lock-up, yield promises, or corporate control.

---

## Role Name

**Contribution + Sales Integrity Verifier**

Short form: **Integrity Verifier**

---

## Eligibility

- Only Path B Founding Members (Independent Completion) receive the **option** to operate this role.
- Path A Founding Sovereign Viewers do not automatically receive node rights.
- Operation is opt-in. The operator may stop at any time.
- The node identity is bound to the operator’s active identity path and is extinguished by **Destroy = Restart**.

---

## Role Constraints (Non-Negotiable) + Implementation

These constraints apply to the Integrity Verifier and to every future validator role unless a later locked document explicitly supersedes them.

### 1. No custody
**Rule:** The node never holds buyer `age1` identities, never decrypts TRVL frames, and never takes possession of sale proceeds or private keys.

**Implementation:**
- Verification scripts operate only on public hashes, Merkle tips, and `sales.log` entries.
- No code path accepts or stores an `AGE-SECRET-KEY` or buyer private material.
- Delivery frames (`.trvl`) are never required as input for integrity checks; only their published sha256 is used.
- Any future tooling that would request private keys is forbidden for this role.

### 2. No capital gate
**Rule:** No staking, no locked collateral, no minimum balance, and no “bond” requirement to participate.

**Implementation:**
- Node activation is a local flag / attestation under the operator’s identity path.
- No on-chain lock, no escrow contract, no minimum $AR or USDC balance check.
- Software must not refuse to run verification because of missing funds.

### 3. No yield
**Rule:** No interest, no passive return, no “earn by locking capital.” Reward is contribution weight / attestation power only.

**Implementation:**
- Reward calculation lives only in the contribution module (`modules/contribution/`).
- Weight increases solely from successful, re-verifiable attestations.
- No automatic periodic credit. No “uptime = money” formula.
- Documentation and UI must never describe the role as passive income.

### 4. No mint or supply control
**Rule:** The node has zero ability to mint, burn, or alter any token supply.

**Implementation:**
- Integrity Verifier code contains no mint, burn, or supply-mutation functions.
- Attestations are pure statements of fact about existing logs and Merkle tips.
- Any later token contract must exclude this role from privileged minter sets.

### 5. No censorship power
**Rule:** The node cannot reverse, block, or reorder a completed sale. It can only attest integrity after the fact.

**Implementation:**
- Sales are already logged append-only before verification occurs.
- Verifier output is an attestation file/signature, never a veto or reorder command.
- No API or script is permitted that would delete or rewrite a `sales.log` entry owned by another party.

### 6. No permanent privilege
**Rule:** Node rights die with the operator’s identity path. Destroy = Restart extinguishes the role completely.

**Implementation:**
- Node identity is derived from (or bound to) the same Vault identity path used for Founding status.
- After a confirmed burn, previously emitted attestations remain historically verifiable, but the burned identity can no longer issue new ones.
- No separate “node certificate” that survives the identity path is allowed.

### 7. No platform recovery key
**Rule:** There is no backdoor, escrow, or platform-held recovery mechanism for the node identity.

**Implementation:**
- Keys are generated and stored only under operator control (age / Vault).
- Project infrastructure never receives or stores a recovery share for node identities.
- Loss of keys with no operator-controlled recovery = permanent loss of the node role for that path.

### 8. No free packs
**Rule:** Path B recognition and node rights do not waive catalog prices. Packs remain paid per item.

**Implementation:**
- Catalog and delivery scripts (`digital-vending/`) contain no Path-B free-fulfillment branch.
- Seller-ops and auto-deliver continue to require normal payment confirmation.
- Founding / node status is never accepted as a substitute for USDC memo payment.

### 9. Open-stack preference
**Rule:** Preferred runtime is GrapheneOS + Termux or equivalent open-stack edge. Proprietary locked-down platforms are not required and are not privileged.

**Implementation:**
- Reference scripts and docs target Termux / Linux open tools.
- No dependency on Google Play Services, proprietary SDKs, or closed attestation services is introduced for the first role.
- Operators on other platforms may run the same scripts; they receive no special weight.

### 10. Offline-capable
**Rule:** The first role must be fully operable without continuous internet. Always-on VPS is optional, never mandatory.

**Implementation:**
- Contribution verification and sales-log checks run against local files.
- Attestation signing is local.
- Network is used only if the operator chooses to publish or fetch public tips; it is not required for correctness of a local verification run.

### 11. Optical-transferable attestations
**Rule:** Signed attestations must be transferable via optical air-gap or file; they must not depend on a live network connection to be valid.

**Implementation:**
- Attestation format is a signed file (or TRVL-wrapped payload) that can be moved by QR / optical path or simple file copy.
- Verification of an attestation requires only the public key of the issuer and the attestation content — no live RPC call is required for validity.

### 12. Anti-Sybil weight
**Rule:** Repeated false or negligent attestations reduce or zero the operator’s contribution weight for this role. Weight is earned by correct work, not by number of nodes claimed.

**Implementation:**
- Contribution module records attestation outcomes (pass/fail against later re-checks where available).
- Conflicting or proven-false attestations decrement weight.
- Multiple machines under the same identity path do not multiply weight; weight is per identity path and correct work, not per process.

### 13. No residual records after burn
**Rule:** After a confirmed Destroy = Restart, no platform-side residual record of the former node identity is permitted.

**Implementation:**
- Project servers (if any) must not retain a recoverable mapping from burned identity to node history.
- Local contribution ledgers and public attestation files that were already published may remain as historical artifacts, but they must not allow reconstruction of a live privilege for the burned path.
- Any future registry of active nodes must drop a burned identity immediately and permanently.

---

## What the Role Does

An Integrity Verifier independently performs two classes of verification:

### 1. Contribution Verification
- Re-compute and confirm contribution Merkle tips produced by the offline-first contribution module.
- Verify optical air-gap proofs that claim to carry contribution state.
- Emit a signed attestation of correctness or failure.

### 2. Sales Integrity Verification
- Verify the append-only `sales.log` sha256 chain.
- Confirm that delivered payload hashes match the catalog items claimed in the log.
- Confirm that no empty or missing TRVL frames were logged as successful deliveries.
- Emit a signed attestation of the log’s integrity state.

---

## What the Role Explicitly Does Not Do

All items listed under **Role Constraints** above. In addition:

- No ability to request or receive buyer private keys.
- No ability to act as a payment intermediary.
- No central ban-list authority over other operators.

---

## Reward Model

Consistent with `TOKENOMICS.md`:

- Reward = additional contribution weight / attestation power only.
- Measured solely by verifiable correct work (successful re-verifications, timely integrity attestations).
- Local contribution ledger is the primary record.
- No marketing of the role as an investment or passive-income opportunity.

---

## Operational Requirements (Minimum)

- Ability to run the contribution verification scripts and sales-log checks.
- Ability to produce a signed attestation that can be transferred optically or as a file.
- Node identity must remain fully destroyable with the operator’s Vault path.
- Preferred runtime: GrapheneOS + Termux or equivalent open-stack edge. Always-on VPS is optional, not required for the first role.

---

## Attestation Rules

- Attestations are signed under the operator’s sovereign identity.
- Attestations must be independently re-verifiable.
- False or negligent attestations reduce or zero the operator’s contribution weight for this role.
- No residual platform-side record of a burned node identity is permitted.

---

## Future Roles

Additional validator roles (Optical Relay, Presence Node, Governance Signal Aggregator, Hydra Defense Node, etc.) may be defined later.

They inherit every constraint listed in this document unless a later locked document explicitly supersedes a specific constraint.

This document locks only the **first** role and the permanent constraint set that governs it.

---

## Design Intent

Give Path B Founding Members a concrete, low-custody way to strengthen the network immediately.

Keep the commercial rail (paid packs) separate from recognition and verification power.

Preserve the absolute nature of identity destruction and the prohibition on corporate or capital-gated control of the validation layer.

---

## Final Statement

The first validating node is a verifier, not a banker, not a sequencer, and not a permanent privilege.

Work is measured. Custody is forbidden. Burn is absolute. Constraints are permanent and implementable.
