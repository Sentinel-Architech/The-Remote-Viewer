# Community pool governance (spec)

**Through `trv_governance`. Integer math only. SCAFFOLD until built.**

## Inflows (from VALUE.md)

| Sale type | Creator | Community pool | Platform |
|-----------|---------|----------------|----------|
| Digital content | 95% (9500 bps) | 5% (500 bps) | 0% |
| NFTs minted via TRV | 90% (9000 bps) | 10% (1000 bps) | 0% |

- Amounts in **smallest token unit** (`u64`).
- `checked_mul` / `checked_div` style bps; define remainder → pool.
- Single **pool vault PDA** — no scattered balances.

## Math integrity (“no fucked-up math”)

- No floating point for money
- Overflow → hard error
- One ledger for pool balance
- Every credit/debit logged (amount, bps, memo hash)

**FDIC:** applies only to **USD in an FDIC-insured bank** after a *governed* off-ramp. On-chain SOL/USDC in a PDA is **not** FDIC-insured. Do not claim otherwise.

## Outflow governance (phased)

### Phase 0
- Authority can spend; **public log** of every outflow

### Phase 1 (target scaffold)
- `propose_pool_spend(amount, memo_hash, category)`
- Existing vote / threshold / cancel path
- `execute_pool_spend` only if passed, not cancelled, optional timelock

### Phase 2
- Voters require **Entitlement** (active sub ∨ node) at snapshot
- Optional slight node weight (signal tier) — not monopoly

### Phase 3
- Category caps (infra / grants / security / discretionary)
- Higher threshold to exceed a bucket

**IA of IA:** advisory only (rationale, policy check). **Not** vault signer.

## Account sketch

- `PoolConfig` PDA: authority, mint, balance accounting, timelock, bumps
- Spends are proposals or dedicated ix tied to governance config
- CPI transfer from pool PDA on successful execute

## Capture resistance

1. Public balance + spends
2. No silent mint into pool outside rules
3. Timelock on large spends
4. Category caps
5. Platform fee remains **0%**

*Spec only until `anchor build` is green and ix land in lib.rs.*
