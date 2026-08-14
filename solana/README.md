# TRV on Solana — SCAFFOLD

**Track A:** Solana is the intended chain for The Remote Viewer on-chain surface.

EVM Foundry work under `contracts/` remains a **parallel experiment** (Governor patterns, tests). It does not run on Solana.

## Status

| Piece | Status |
|-------|--------|
| Anchor workspace | **SCAFFOLD** |
| `trv_governance` program | **SCAFFOLD** (init + placeholder ix) |
| SPL mint scripts | **Documented** — run with Solana CLI |
| Devnet deploy | **Not done** |
| Mainnet | **No** |
| Audit | **None** |

## Prerequisites (laptop recommended)

```bash
# Rust, Solana CLI, Anchor — versions pin in practice
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest && avm use latest
```

Termux: client/RPC possible; **Anchor build is not practical** on-phone.

## Commands

```bash
cd solana
anchor build
anchor test
anchor deploy   # against local validator or devnet
```

### SPL utility mint (CLI, off-program)

```bash
solana-keygen new -o mint-authority.json
spl-token create-token --decimals 9 --mint-authority mint-authority.json
spl-token create-account <MINT>
spl-token mint <MINT> 100 <TOKEN_ACCOUNT>
```

Governance weight later: either Realms or this program’s vote accounts — TBD.

## Values

Does not undercut locked floors in `docs/locked/`. Content policy stays off-chain / client.
