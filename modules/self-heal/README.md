# Self-Heal

**Status:** SCAFFOLD (optical pulse exercised on-device)

Local process / readiness supervision for GrapheneOS + Termux. No network. No telemetry.

## Optical path

Full e2e (`optical-airgap/scripts/e2e-age-lt.sh`) is **on-demand**.
Self-heal does **not** spam e2e. It runs an **optical pulse**: vault files present, modes sane, tools detectable.

| Script | Role |
|--------|------|
| `optical-pulse.sh` | One-shot readiness check |
| `supervise-optical.sh` | Loop: pulse every `WATCHDOG_INTERVAL` (default 60s) |
| `watchdog.sh` | Generic restart supervisor for a long-running command |
| `healthcheck.sh` | Human-readable status + last log lines |
| `install-hooks.sh` | chmod +x + log dir |

## Start optical supervision

```bash
cd ~/The-Remote-Viewer
bash modules/self-heal/install-hooks.sh
# foreground test
bash modules/self-heal/optical-pulse.sh
bash modules/self-heal/healthcheck.sh
# background loop (optional)
nohup bash modules/self-heal/supervise-optical.sh >>~/.local/share/remote-viewer/self-heal.log 2>&1 &
```

Stop: `pkill -f supervise-optical` (or kill the job).

## Specialist

`supervise-specialist.sh` / `watchdog.sh` still accept any local command for Stage A MoE experts.
