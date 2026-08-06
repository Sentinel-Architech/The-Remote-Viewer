# Defense / Hydra — Local Node Integrity

**Status:** SCAFFOLD  
**Posture:** Active **self-defense of this device** — not a platform for attacking others.

Hydra (in TRV framing) means resilient local defense: detect integrity failures on *your* Sentinel stack and fail closed. No cloud SOC, no phone-home, no offensive exploit modules in this tree.

## What ships

| Script | Role |
|--------|------|
| `integrity-pulse.sh` | Check critical paths, modes, git dirty tracked files |
| `status.sh` | Human summary + last log lines |
| `POLICY.md` | Hard boundaries |

## What does **not** ship here

- Remote exploit tooling  
- Scanning third-party networks  
- Credential harvesting  
- Anything that requires weakening optical or age custody  

## Usage

```bash
cd ~/The-Remote-Viewer
bash modules/defense/integrity-pulse.sh
bash modules/defense/status.sh
```

Log: `~/.local/share/remote-viewer/defense.log`
