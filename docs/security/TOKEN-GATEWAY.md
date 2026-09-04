# Token Gateway — teaching ledger

**Status:** IN SOURCE (this branch). Not LIVE. Not PROVEN-on-device. Not mainnet.
**SIM only.** No real names, no DX, no Neuralink feed, no cash rail.

Remote Viewers train to **defend the TRV network**. A public drop is a network resource. Reprinting it is a replay wound.

Companion: [threat-model.md](threat-model.md) · [REALITY.md](../REALITY.md)

---

## Doctrine

1. The blinking Eye is a hint. The claim is a signed body + Hub once-keys.
2. **Compensate holds. Retry deliveries. Never compensate a public spend.**
3. Pivot = `gateway_drops.status = spent` plus ledger `+Δ` in **one SQL statement**.
4. Devices are not XA resource managers. 2PC is forbidden on the sidewalk.
5. Paxos/Raft is for Hub replicas you operate. Viewers are not acceptors.
6. Destroy = Restart has no company compensation.
7. Payment ≠ delivery. Stripe / Solana are later saga steps with their own once-keys.
8. Hub credits here are SIM collectibles, not $AR, not a bank deposit.

---

## State machine

```
open
  → reserve (Alice, ~30s)     T_hold     C_hold = reserved → open
      → spent                 T_pivot    NO compensation
           → receipt_pending  T_fwd      retry outbox by drop_id
                 → sent | dead           still spent
  → expired                   sweeper    no credit
```

Credits move **only** on the `open|reserved → spent` edge.

---

## Refuse codes (exam HUD)

| Code | Meaning |
|------|--------|
| `CREST_COPY` | Challenge missing / consumed / wrong Viewer |
| `STALE_PULSE` | Challenge or drop past `exp` |
| `NOT_PRESENT` | Geo outside `radius_m` |
| `SPENT` | Drop already pivoted |
| `REPLAY` | Same `drop_id` or `nonce` presented again by someone else |
| `SELF` | Same Viewer retried the same seize — no second credit |
| `FRAMED` | Reserved by someone else, still inside hold |
| `EXPIRED` | Drop window closed |

---

## Protocols in play

| Layer | Protocol |
|-------|----------|
| Drop + credit + seize + outbox row | **Local ACID** — one Postgres statement (CTE). Hub `Sql` has no `BEGIN` helper yet; the CTE is the transaction. |
| Device receipt | **Saga, forward-only** after pivot. Outbox + idempotent inbox keyed by `drop_id`. |
| Reservation timeout | **Backward compensation** on hold only (`reserved → open`). |
| Multi-Hub later | Raft/Paxos on the seize **log**. Apply remains idempotent on `drop_id`. |
| Phone / Stripe / Solana | Not in a 2PC cohort. |

---

## What this file is not

- Not a live AR camera stack.
- Not a GPS-spoof cookbook.
- Not an XA how-to for attaching a handset as an RM.
- Not a promotion of Track A governance.

Wire: `apps/hub/migrations/0018_gateway.sql` · `apps/hub/src/lib/trv/token-gateway.ts`
