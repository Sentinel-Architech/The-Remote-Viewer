# Self-Heal Module

Real process supervision for Termux / local services.

## Scripts

| Script | Purpose |
|--------|---------|
| `watchdog.sh` | Generic supervisor — restart target on death |
| `healthcheck.sh` | Local status report |
| `supervise-optical.sh` | Wrapper for optical-related long-runners |
| `supervise-specialist.sh` | Wrapper for llama/router specialist path |
| `install-hooks.sh` | chmod + create log dir |

## Integration (GrapheneOS + Termux)

```bash
cd $HOME/The-Remote-Viewer   # or your clone path
bash modules/self-heal/install-hooks.sh

# Optical is mostly on-demand; only supervise if you run a lab loop/receiver:
bash modules/self-heal/supervise-optical.sh 'your-optical-loop-command'

# Specialist / local model server:
bash modules/self-heal/supervise-specialist.sh 'llama-server -m $HOME/models/model.gguf --port 8080'
```

Logs: `$HOME/.local/share/remote-viewer/self-heal.log`

## Design rules

- No network calls
- No external telemetry
- Fail closed and restart
- Optical e2e script remains the proven on-demand path (`optical-airgap/scripts/e2e-age-lt.sh`)
