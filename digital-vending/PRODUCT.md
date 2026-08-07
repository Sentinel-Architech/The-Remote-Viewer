# TRV Digital Vending — Product (Phase 4)

**Phone-first.** Pixel/GrapheneOS + Termux is a full seller station for **encrypt → TRVL → deliver**.

## Rails (locked for now)

| Rail | Role |
|------|------|
| **USDC / manual / XMR note** | Payment signal (human-verified or watcher) |
| **age recipient (`age1…`)** | Buyer public key — required before encrypt |
| **Soliton LT (TRVL)** | Delivery framing |
| **Optical or file** | Handoff |
| **SPL TRV mint** | **Deferred** — no official aarch64 Solana CLI |

## Seller checklist (one sale)

1. Buyer pays — you verify.  
2. Buyer sends **`age1…` only**.  
3. Deliver:

```bash
cd $HOME/The-Remote-Viewer/digital-vending
bash seller-ops.sh deliver trv-posture-lite 'age1...'
```

4. Send the `.trvl` file (or optical paste).  
5. Buyer: `./buyer-receive.sh $HOME/vault-identity.txt < sale.trvl`

## Payloads (content)

| ID | File | Notes |
|----|------|--------|
| trv-posture-lite | payloads/trv-posture-lite.txt | Core rules — sellable |
| trv-posture-pack | payloads/trv-posture-pack.txt | Extended operator pack |
| sentinel-skill-zk-01 | payloads/sentinel-zk-01.txt | ZK membership notes |
| hello-sentinel-demo | payloads/hello-sentinel.txt | Test only — price 0 |

Edit those files to revise what buyers receive. Re-run deliver after edits.

## Ops

```bash
bash seller-ops.sh list
bash seller-ops.sh status
bash e2e-optical-demo.sh hello-sentinel-demo   # dry run
```

## Non-goals

- On-phone Solana mint  
- Platform custody of buyer keys  
- Yield / investment framing  
