# Validated Node Counts

**Status:** Defined — 2026-08-13  
**Principle:** Counts are derived from independently verifiable attestations. No central registry.

## Definition

A validated node (first role = Integrity Verifier) is counted once per **identity path** that:

1. Holds a Path B Founding Member attestation, and
2. Has produced at least one successful Integrity Verifier attestation (`overall_ok=1`).

Multiple machines under the same identity path do not increase the count (anti-Sybil rule locked in doc 17).

## How to observe

```bash
bash modules/nodes/count.sh
```

This reports the local identity path status and a network view based on currently observed public tips (currently originator-scale only).

## Public aggregation (future, optional)

Operators may publish signed attestation tips via optical or file transfer. Any Viewer can collect those tips and recompute the number of distinct identity paths. The protocol never requires a central service for the count to be valid.

## Explicit non-claims

- This is not a live always-on DePIN claim.
- No custody, no yield, no capital gate.
- Destroy = Restart extinguishes both Founding status and node rights for that identity path.
- Current external Path B count is zero until independent builders complete the published FINISHED standard and receive recognition.
