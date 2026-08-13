# Validated Node Counts

**Status:** Defined + tip collection ready — 2026-08-13  
**Principle:** Counts are derived from independently verifiable attestations. No central registry.

## Definition

A validated node (first role = Integrity Verifier) is counted once per **identity path** that:

1. Holds a Path B Founding Member attestation, and
2. Has produced at least one successful Integrity Verifier attestation (`overall_ok=1`).

Multiple machines under the same identity path do not increase the count (anti-Sybil rule locked in doc 17).

## How to observe (local)

```bash
bash modules/nodes/count.sh
```

## Optional public tip flow

```bash
# Operator with Founding + IV ok
bash modules/nodes/publish-tip.sh
# Transfer tip-*.json (file or optical) to other Viewers

# Any Viewer
bash modules/nodes/collect-tips.sh /path/to/received-tips
```

The resulting count is the number of distinct identity paths represented by the tips that Viewer has actually received. Anyone can recompute it from the same set of tips.

## Explicit non-claims

- This is not a live always-on DePIN claim.
- No custody, no yield, no capital gate.
- Destroy = Restart extinguishes both Founding status and node rights for that identity path.
- Current external Path B count is zero until independent builders complete the published FINISHED standard and receive recognition.
