# Defense / Hydra — Local Node Integrity

**Status:** SCAFFOLD (hardened pulse)

Self-defense of **this** device only. No telemetry. No offensive modules.

## Commands

```bash
bash modules/defense/integrity-pulse.sh
bash modules/defense/status.sh
bash modules/defense/check-after-sync.sh

# optional background (every 300s default)
nohup bash modules/defense/supervise-defense.sh >>~/.local/share/remote-viewer/defense.log 2>&1 &
# stop: pkill -f supervise-defense
```

After every sync:

```bash
DEFENSE_AFTER_SYNC=1 bash scripts/git-sync.sh TheRemoteViewer
# or manually:
bash modules/defense/check-after-sync.sh
```

See [POLICY.md](./POLICY.md).
