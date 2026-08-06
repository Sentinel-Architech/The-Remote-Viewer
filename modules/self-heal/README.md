# Self-Heal Module

Real process supervision for Termux / local services.

This replaces the previous Java-style aspirational "Self Heal" concept notes with something that actually runs.

## What it does

- Watches a target process
- Restarts it on failure
- Keeps a simple health log
- Uses Termux wake-lock when available

## Usage (Termux)

```bash
# Make executable once
chmod +x modules/self-heal/watchdog.sh modules/self-heal/healthcheck.sh

# Start supervising a script
./modules/self-heal/watchdog.sh path/to/your-daemon.sh

# Quick health report
./modules/self-heal/healthcheck.sh
```

## Design rules

- No network calls
- No external telemetry
- Logs stay local under `$HOME/.local/share/remote-viewer/`
- Fail closed and restart
