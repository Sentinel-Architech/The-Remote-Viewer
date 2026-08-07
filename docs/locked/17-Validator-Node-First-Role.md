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

The verifier never holds buyer age identities, never decrypts frames, and never takes custody of sale proceeds.

---

## What the Role Explicitly Does Not Do

- No capital staking or locked collateral.
- No yield, interest, or “earn by locking” mechanism.
- No mint authority and no ability to alter supply.
- No ability to reverse or censor a sale after the fact.
- No central ban-list authority.
- No platform-held recovery key for the node identity.
- No right to free catalog packs (packs remain paid per item).

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

They must obey the same non-negotiable constraints:
- No capital lock-up as a condition of participation.
- No yield promises.
- No custody of user keys or plaintext.
- Full compatibility with Destroy = Restart.

This document locks only the **first** role.

---

## Design Intent

Give Path B Founding Members a concrete, low-custody way to strengthen the network immediately.

Keep the commercial rail (paid packs) separate from recognition and verification power.

Preserve the absolute nature of identity destruction and the prohibition on corporate or capital-gated control of the validation layer.

---

## Final Statement

The first validating node is a verifier, not a banker, not a sequencer, and not a permanent privilege.

Work is measured. Custody is forbidden. Burn is absolute.
