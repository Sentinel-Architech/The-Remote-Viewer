# Payments → entitlement (SCAFFOLD)

## Product rule

**Unlimited human comms** if a paid Viewer plan **or** an active permanent node (`refresh_entitlement`).

Prices live only in [`VALUE.md`](VALUE.md):

- Human monthly: **$10**
- Human yearly: **$96** (default)
- Company grant: **$1,200 / year** per org
- Node: no sub fee while `node.active`

## Flow (phase 1 — honest minimal)

```text
Viewer pays (off-chain: Stripe rail or invoice)
    → merchant/ops verifies settlement
    → authority wallet calls grant_subscription(expires_at)
    → Viewer calls refresh_entitlement
    → unlimited_comms = true until expiry (or node path)
```

- **On-chain does not collect card/SOL in v1.** Payment is off-chain; chain records **entitlement**.
- Yearly `expires_at` = now + 365 days.
- Monthly `expires_at` = now + 31 days.
- Company grant `expires_at` = now + 365 days, tied to the org tenant, not a personal $96 SKU.
- `expires_at` must be **> now** at grant time.

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
- Giving a Commercial Entity the $96 human SKU (LICENSE + VALUE.md)

## Ops checklist

1. Publish the VALUE.md sheet (picked: $10 / $96 / $1,200)
2. Payment receipt log (off-chain)
3. Authority grant with correct `expires_at`
4. Viewer verifies via `refresh_entitlement` / account read
