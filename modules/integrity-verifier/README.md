# Integrity Verifier (First Validator Role)

Implements the locked role in `docs/locked/17-Validator-Node-First-Role.md`.

**Path B Founding Members only (option).**  
Offline-first. No custody. No mint. No yield.

## Commands

```bash
# 1. Verify local contribution ledger chain + tip
bash modules/integrity-verifier/verify-contribution.sh

# 2. Verify sales.log sha256 / non-empty frames
bash modules/integrity-verifier/verify-sales.sh
# optional: bash modules/integrity-verifier/verify-sales.sh /path/to/sales.log

# 3. Run both + emit optical-transferable attestation
bash modules/integrity-verifier/attest.sh

# 4. Record verification outcome into contribution ledger (weight)
bash modules/integrity-verifier/record-weight.sh pass "optional note"
bash modules/integrity-verifier/record-weight.sh fail "optional note"
```

## What it checks

| Check | Source |
|-------|--------|
| Contribution hash chain | `~/.local/share/remote-viewer/contribution/events.jsonl` |
| Ledger tip commitment | via `modules/contribution/verify.sh` + tip |
| Sales log integrity | `$HOME/trv-deliver/sales.log` (or override) |
| Empty-frame refusal | sha256 ≠ empty-file digest; bytes > 0 |

## What it never does

- Touch buyer `age1` or private keys
- Decrypt `.trvl` frames
- Mint tokens or lock capital
- Require continuous network or VPS

## Attestation output

Written under:

```text
~/.local/share/remote-viewer/integrity-verifier/attestations/
```

File is a local signed-structure JSON (hash-committed). Transfer by file or optical path. Validity does not require a live RPC.

## Constraints

All 13 non-negotiable constraints in `docs/locked/17-Validator-Node-First-Role.md` apply.
