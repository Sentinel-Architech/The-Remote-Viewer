# Concept documentation

All concept / design docs live here (kebab-case `.md`).

Moved from the repository root on branch `feature/cleanup-structure`.

## Full-content restore (required for large files)

Several large files were truncated when moved via API. **Original bytes are still in git history** at commit:

`a7947635668eacc57ae40b76bf350e14586bf246`

Run this on a local clone to restore **byte-perfect** content:

```bash
git fetch origin
git checkout feature/cleanup-structure

RESTORE_COMMIT=a7947635668eacc57ae40b76bf350e14586bf246

git show "$RESTORE_COMMIT:Edge Learning"              > docs/concepts/edge-learning.md
git show "$RESTORE_COMMIT:Sentinel Paradigm"          > docs/concepts/sentinel-paradigm.md
git show "$RESTORE_COMMIT:TRV"                        > docs/concepts/trv.md
git show "$RESTORE_COMMIT:presence-based"             > docs/concepts/presence-based.md
git show "$RESTORE_COMMIT:In-app shop"                > docs/concepts/in-app-shop.md
git show "$RESTORE_COMMIT:governance smart contract"  > docs/concepts/governance-smart-contract.md
git show "$RESTORE_COMMIT:Smart Contract"             > docs/concepts/smart-contract.md
git show "$RESTORE_COMMIT:P2P Comm"                   > docs/concepts/p2p-comm.md
git show "$RESTORE_COMMIT:zero-Trust"                 > docs/concepts/zero-trust.md
git show "$RESTORE_COMMIT:Self Heal"                  > docs/concepts/self-heal.md

# Already full on branch (optional re-verify):
# git show "$RESTORE_COMMIT:DApp"           > docs/concepts/dapp.md
# git show "$RESTORE_COMMIT:DApp Frontend"  > docs/concepts/dapp-frontend.md
# git show "$RESTORE_COMMIT:DePIN Flywheel" > docs/concepts/depin-flywheel.md

git add docs/concepts/
git commit -m "docs: restore full concept content from pre-cleanup history"
git push origin feature/cleanup-structure
```

## Index (partial)

| File | Notes |
|------|--------|
| `dapp.md` | Full |
| `dapp-frontend.md` | Full |
| `dapp-development.md` | Full |
| `depin-flywheel.md` | Full |
| `legal-gap-analysis.md` | Full |
| `new-infrastructure.md` | Full |
| `edge-federated-learning.md` | FedAvg / oxicuda example |
| `edge-learning.md` | **Restore from history** |
| `sentinel-paradigm.md` | **Restore from history** |
| `trv.md` | **Restore from history** |
| `presence-based.md` | **Restore from history** |
| `in-app-shop.md` | **Restore from history** |
| `governance-smart-contract.md` | **Restore from history** |
| `smart-contract.md` | **Restore from history** |
| `p2p-comm.md` | **Restore from history** |
| `zero-trust.md` | **Restore from history** |
| `self-heal.md` | **Restore from history** |

## Related examples

- `examples/fedavg_toy/` — minimal Rust FedAvg using `oxicuda-federated`
- `scripts/rename-concepts.sh` — hardened rename/move helper
