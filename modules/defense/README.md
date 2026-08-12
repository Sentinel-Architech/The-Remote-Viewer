# Defense / Hydra — Local Node Integrity

**Status:** Multi-head implementation (run on device to confirm PROVEN)

Self-defense of **this** device only. No telemetry. No offensive modules.

## Heads

| Head | Script / behavior |
|------|-------------------|
| Structure | Critical paths + vault modes |
| **Seal** | `seal-baseline.sh` / `verify-seal.sh` sha256 of critical files |
| Contribution | `modules/contribution/verify.sh` |
| Sales / verifier | integrity-verifier on contribution + sales.log |
| **Alert** | Termux notification on FAIL |
| **Quarantine** | `QUARANTINE` flag + `hydra-gate.sh` blocks deliver |
| **Adaptive (new)** | Hash-chained local incident log — learn from failures on this device |

## Adaptive Learning (local only)

Incidents are recorded as an append-only, hash-chained JSONL under:
`~/.local/share/remote-viewer/defense/incidents/events.jsonl`

```bash
# Record an incident (normally called by the pulse on FAIL)
bash modules/defense/record-incident.sh "integrity_fail" "seal,structure" "optional details"

# Verify the chain
bash modules/defense/verify-incidents.sh
```

Same pattern as the contribution ledger. Stays on-device. No mesh export.

## First-time setup

```bash
bash modules/defense/seal-baseline.sh
bash modules/defense/integrity-pulse.sh
# expect RESULT: PASS
```

After you intentionally change sealed scripts/catalog:

```bash
bash modules/defense/seal-baseline.sh   # refresh baseline
```

## Commands

```bash
bash modules/defense/integrity-pulse.sh
bash modules/defense/verify-seal.sh
bash modules/defense/hydra-gate.sh      # exit 11 if quarantined
bash modules/defense/status.sh
bash modules/defense/check-after-sync.sh
bash modules/defense/record-incident.sh
bash modules/defense/verify-incidents.sh

# optional background (every 300s default)
nohup bash modules/defense/supervise-defense.sh >>~/.local/share/remote-viewer/defense.log 2>&1 &
# stop: pkill -f supervise-defense
```

## Deliver gate

`digital-vending/auto-deliver.sh` and `seller-ops.sh deliver` call `hydra-gate.sh`.
On integrity FAIL, deliver exits **11** until pulse PASSes (clears `QUARANTINE`).

Bypass (emergency only): `HYDRA_GATE=0`

## After every sync

```bash
DEFENSE_AFTER_SYNC=1 bash scripts/git-sync.sh TheRemoteViewer
# or:
bash modules/defense/check-after-sync.sh
```

See [POLICY.md](./POLICY.md).
