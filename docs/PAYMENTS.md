# Payments → entitlement (SCAFFOLD)

## Product rule

**Unlimited human comms** if yearly sub **or** active permanent node (`refresh_entitlement`).

## Flow (phase 1 — honest minimal)

```text
Viewer pays (off-chain)
    → merchant/ops verifies settlement
    → authority wallet calls grant_subscription(expires_at)
    → Viewer calls refresh_entitlement
    → unlimited_comms = true until expiry (or node path)
```

- **On-chain does not collect card/SOL in v1.** Payment is off-chain; chain records **entitlement**.
- `expires_at` = unix seconds; must be **> now** at grant time.
- Platform fee on sub: product choice (VALUE.md focuses creator store splits; sub price is separate).

## Phase 2 (later)

- USDC pay ix or Stripe webhook → relayer with authority (rate-limited, audited)
- Or trustless pay-to-PDA with oracle; higher complexity

## Nodes

- `register_node` is not a payment ix; operator bears hardware cost
- Comms free while `node.active` — do not double-charge nodes for the same unlock

## Non-goals (v1)

- Per-message billing
- Automatic card charge on-chain
- Mixing pool inflows with sub treasury without separate accounts

## Ops checklist

1. Publish yearly price (VALUE band $48–96 — pick one)
2. Payment receipt log (off-chain)
3. Authority grant with correct `expires_at`
4. Viewer verifies via `refresh_entitlement` / account read
