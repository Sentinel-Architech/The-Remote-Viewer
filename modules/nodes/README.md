# Validated Node Counts

**Status:** Local derivation + optional public tip collection — 2026-08-13  
**Rule:** No central registry. Counts are derived from independently verifiable attestations. Weight is per identity path, not per machine.

## What is counted

A validated node (first role) is an identity path that:

1. Holds a Founding Member (Path B) attestation, **and**
2. Has produced at least one successful Integrity Verifier attestation (`overall_ok=1`).

Anti-Sybil rule (locked): multiple machines under the same identity path do not multiply weight or count.

## Local status

```bash
bash modules/nodes/count.sh
```

## Optional public tips

An operator who holds Founding Member status + successful IV attestation can publish a tip:

```bash
bash modules/nodes/publish-tip.sh
```

Transfer the tip file (or optical frame) to other Viewers. They place received tips in their tips directory and run:

```bash
bash modules/nodes/collect-tips.sh
# or: bash modules/nodes/collect-tips.sh /path/to/received-tips
```

This yields a distinct identity-path count from the tips they have actually received. No central service is required.

## Explicit limits

- No custody, no yield, no capital gate.
- Destroy = Restart extinguishes both Founding status and node rights for that identity path.
- Counts are statements of observed attestations / received tips, not a live always-on network claim.
