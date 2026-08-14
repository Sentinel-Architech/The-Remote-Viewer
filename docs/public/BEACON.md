# Validator Beacon Specification

**Status:** Design (public)  
**Last aligned:** 2026-08-13  
**Authority:** This file + `docs/public/PATH-B-MULTI-VALIDATOR.md` + locked docs 04 & 17

Every active Path B validator must emit a continuous, independently verifiable beacon. Only validators that currently pass liveness checks are counted toward recognition thresholds.

---

## Hard constraints

- Zero centralization — no required platform, server, or single party
- Beacon must be independently verifiable
- No originator-controlled or proprietary endpoint may be required
- Multiple transports allowed; at least one must be active
- Private keys never appear in the beacon
- Destroy = Restart remains absolute for validator keys

---

## Beacon format

A beacon is a small signed statement:

```text
TRV-BEACON/1
validator=<public identity of validator>
seq=<monotonic counter>
ts=<unix timestamp>
epoch=<current recognition epoch>
sig=<signature over the canonical fields above>
```

### Field rules

| Field | Meaning |
|-------|--------|
| `validator` | Public identity used for Path B signing (npub, age1, or did:key as published in the validator list) |
| `seq` | Monotonic counter; increases on every emission. Detects stalls and replays. |
| `ts` | Unix timestamp of emission |
| `epoch` | Identifier of the current validator-set / recognition rules (hash or published epoch id) |
| `sig` | Signature by the validator’s long-term recognition key over the canonical concatenation of the fields |

Canonical signing string (example):

```text
TRV-BEACON/1|validator=<id>|seq=<n>|ts=<t>|epoch=<e>
```

No private payload. No buyer data. No sales data. No recovery material.

---

## Liveness parameters (Stage 1 defaults)

| Parameter | Default | Notes |
|-----------|---------|-------|
| Emission interval | 5 minutes | Must fit comfortably inside the freshness window |
| Freshness window | 30 minutes | Beacon older than this is stale |
| Required transports | ≥ 1 | No single transport is mandatory |
| Minimum active set | Threshold-dependent | System continues if any single validator goes silent once the set is large enough |

These defaults may be tightened or published per epoch; changes must be public before they take effect.

---

## Transports

A validator is active if **at least one** of the following yields a valid, fresh beacon:

| Transport | Description | Verifier action |
|-----------|-------------|-----------------|
| Local / LAN | Beacon written to a local path or offered on a local-only endpoint | Other parties on the same network fetch or listen |
| Optical | Latest beacon rendered as QR or short TRVL frame | Scan offline |
| Public non-custodial log | Beacon appended to any public append-only surface the validator controls (e.g. Nostr note, Solana memo, personal static page they update) | Fetch and verify signature + freshness |
| File / air-gap drop | Beacon written to a known path that can be copied by optical or physical means | Offline verification |

No transport is privileged. A validator may use only optical, only local, only a public log, or any combination.

---

## Verification algorithm (normative)

Given a candidate beacon and the published validator list for the current epoch:

1. Parse fields; reject if format is not `TRV-BEACON/1` or required fields are missing.
2. Confirm `validator` is in the current published validator list for `epoch`.
3. Verify `sig` against the published public key for that validator.
4. Reject if `ts` is outside the freshness window relative to the verifier’s clock (allow small skew).
5. Reject if `seq` is not greater than the last accepted seq for that validator (when the verifier maintains history).
6. If all checks pass → validator is **active**.

Only active validators count toward the recognition threshold.

---

## Implementation sketch (non-normative)

**Emit**

```bash
trv-beacon emit --key <validator-key> --interval 300
# writes $HOME/trv-beacon/latest and optionally displays QR
```

**Check**

```bash
trv-beacon check --from <path-or-scan> --max-age 1800
# exit 0 = active, non-zero = stale/invalid
```

Path B Stage 1 verification only accepts signatures from validators that currently pass the check.

---

## Explicit non-goals

- Required central relay or originator-controlled beacon endpoint
- Mandatory always-on internet for every validator (optical + local remain valid)
- Beacon that carries private keys, recovery material, or buyer data
- Single-validator veto after Stage 1 is live
- Silent changes to freshness rules or validator list

---

## Relationship to other documents

- `docs/public/PATH-B-MULTI-VALIDATOR.md` — trajectory and stage rules
- Locked docs 04 & 17 — Founding rights and first validator role
- Integrity Verifier / contribution weight — source of *weight*; beacon is only *liveness*
- Path B attestation itself remains an offline proof produced on the builder’s hardware

---

## Final statement

Validators must remain on.  
Their signal must be independently verifiable.  
No single party and no platform may be the required path for that signal.
