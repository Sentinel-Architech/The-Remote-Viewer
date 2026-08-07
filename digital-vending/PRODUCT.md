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

Mint does **not** block sales. Catalog prices stay USDC/manual until an x86 host creates a mint.

## Seller checklist (one sale)

1. Buyer pays (USDC memo / cash / XMR) — you verify.  
2. Buyer sends **`age1…` only** (never their identity).  
3. Deliver:

```bash
cd $HOME/The-Remote-Viewer/digital-vending
mkdir -p $HOME/trv-deliver
./seller-deliver.sh trv-posture-lite 'age1...' > $HOME/trv-deliver/sale.trvl
```

4. Send `sale.trvl` (or optical paste path).  
5. Buyer: `./buyer-receive.sh $HOME/vault-identity.txt < sale.trvl`  
6. You: no buyer identity stored; optional `bash status.sh`

## Demo vs production payloads

| ID | Use |
|----|-----|
| `hello-sentinel-demo` | Test only — price 0 |
| `trv-posture-lite` / `pack` | Real catalog text — replace files under `payloads/` before charging |
| `sentinel-skill-zk-01` | Same — put real content in payload file |

**Never** ship Vault identities or mint authorities inside payloads.

## Ops helpers

```bash
bash seller-ops.sh list          # catalog ids
bash seller-ops.sh status        # chute inventory
bash seller-ops.sh deliver <id> <age1...> [outfile]
bash e2e-optical-demo.sh         # dry run + wipe demo keys after
```

## Non-goals (Phase 4 product)

- On-phone Solana mint  
- Platform custody of buyer keys  
- Auto-posting secrets to chat  
