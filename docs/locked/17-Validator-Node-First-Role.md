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

## Role Constraints (Non-Negotiable)

These constraints apply to the Integrity Verifier and to every future validator role unless a later locked document explicitly supersedes them.

1. **No custody**  
   The node never holds buyer `age1` identities, never decrypts TRVL frames, and never takes possession of sale proceeds or private keys.

2. **No capital gate**  
   No staking, no locked collateral, no minimum balance, and no “bond” requirement to participate.

3. **No yield**  
   No interest, no passive return, no “earn by locking capital.” Reward is contribution weight / attestation power only.

4. **No mint or supply control**  
   The node has zero ability to mint, burn, or alter any token supply.

5. **No censorship power**  
   The node cannot reverse, block, or reorder a completed sale. It can only attest integrity after the fact.

6. **No permanent privilege**  
   Node rights die with the operator’s identity path. Destroy = Restart extinguishes the role completely.

7. **No platform recovery key**  
   There is no backdoor, escrow, or platform-held recovery mechanism for the node identity.

8. **No free packs**  
   Path B recognition and node rights do not waive catalog prices. Packs remain paid per item.

9. **Open-stack preference**  
   Preferred runtime is GrapheneOS + Termux or equivalent open-stack edge. Proprietary locked-down platforms are not required and are not privileged.

10. **Offline-capable**  
    The first role must be fully operable without continuous internet. Always-on VPS is optional, never mandatory.

11. **Optical-transferable attestations**  
    Signed attestations must be transferable via optical air-gap or file; they must not depend on a live network connection to be valid.

12. **Anti-Sybil weight**  
    Repeated false or negligent attestations reduce or zero the operator’s contribution weight for this role. Weight is earned by correct work, not by number of nodes claimed.

13. **No residual records after burn**  
    After a confirmed Destroy = Restart, no platform-side residual record of the former node identity is permitted.

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

Work is measured. Custody is forbidden. Burn is absolute. Constraints are permanent.
