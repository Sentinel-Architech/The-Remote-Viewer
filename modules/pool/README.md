# Community Pool — Gross Visibility

**Status:** Public-signal only — 2026-08-13  
**Rule:** No custody. Gross volume is derived from public Solana data. Net is not protocol-defined.

## What this is

Anyone can independently compute gross USDC volume received by the published sales address with the known TRV memos. This module provides a local helper that queries public RPC and reports the observable gross.

There is no project-controlled pool wallet. There is no net calculation (operator costs remain private).

## Sales address (public)

```
HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv
```

## Known memos

| Memo | Price |
|------|------:|
| TRV-Posture-Lite | 11 USDC |
| TRV-Posture-Pack | 25 USDC |

## Usage

```bash
bash modules/pool/gross.sh
```

Optional: set `SOLANA_RPC_URL` if you prefer a different public endpoint.

## Explicit limits

- Gross only (public chain data).
- No net, no yield, no custody, no project treasury.
- `$TRV` ticker is not live. Designed token is `$AR` (still design-only).
