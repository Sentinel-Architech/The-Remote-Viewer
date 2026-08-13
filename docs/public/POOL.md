# Community Pool — Public Gross Visibility

**Status:** Defined — 2026-08-13  
**Principle:** Architecture can be transparent. Secrets cannot.

## Gross

Gross volume is the sum of confirmed USDC transfers to the published sales address that carry the known TRV memos.

- Sales address: `HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv`
- Memos: `TRV-Posture-Lite` (11 USDC), `TRV-Posture-Pack` (25 USDC)

Anyone can recompute this from public Solana data. No trust in a project dashboard is required.

Helper:

```bash
bash modules/pool/gross.sh
```

## Net

Net is **not** protocol-defined. Operator costs, fees, and local accounting remain private. The protocol never claims a shared net balance.

## What does not exist

- No project-controlled pool wallet
- No custodial treasury
- No live `$TRV` token (designed utility token is `$AR`, still design-only)
- No yield or staking claims against pool volume

## Relation to Path B / nodes

Pool gross is independent of Founding Member recognition and Integrity Verifier attestations. Both can be shown side-by-side for transparency without linking custody to either.
