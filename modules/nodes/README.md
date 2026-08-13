# Validated Node Counts

**Status:** Local derivation + public-signal ready — 2026-08-13  
**Rule:** No central registry. Counts are derived from independently verifiable attestations. Weight is per identity path, not per machine.

## What is counted

A validated node (first role) is an identity path that:

1. Holds a Founding Member (Path B) attestation, **and**
2. Has produced at least one successful Integrity Verifier attestation (`overall_ok=1`).

Anti-Sybil rule (locked): multiple machines under the same identity path do not multiply weight or count.

## Current reality

Until external Path B operators exist and optionally publish tips, the observable count is originator-scale only.

## Usage

```bash
bash modules/nodes/count.sh
```

This reports:
- Local Founding Member status
- Local Integrity Verifier activity
- A public-signal note for future tip aggregation

## Future public aggregation (optional)

Operators may publish signed attestation tips (optical or file). Any Viewer can collect those tips and re-derive the count of distinct identity paths. No central service is required or created by this module.

## Explicit limits

- No custody, no yield, no capital gate.
- Destroy = Restart extinguishes both Founding status and node rights for that identity path.
- Counts are statements of observed attestations, not a live always-on network claim.
