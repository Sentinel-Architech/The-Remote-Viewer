# Data Sovereignty Module

**Code enforcement** of locked posture:

- `docs/locked/11-Legal-Hold-Data-Minimization.md`
- `docs/locked/12-Retention-Schedules.md`
- `docs/locked/03-Destroy-Equals-Restart.md` (referenced)

## Principle

> If the platform does not hold it, it cannot produce it and need not preserve it.

Local device is the only vault. These scripts operate **only on local paths** under `$HOME/.local/share/remote-viewer/` and optional clone-relative caches. No network. No server assumption.

## Scripts

| Script | Purpose |
|--------|---------|
| `destroy-restart.sh` | Wipe path-scoped local identity + contribution + self-heal state (Destroy = Restart) |
| `minimize-check.sh` | Detect forbidden patterns (secrets in logs, long-lived plaintext, etc.) |
| `retention-status.sh` | Show age of local artifacts vs locked TTLs |

## FOIA / primary-source alignment

FOIA and federal records practice turn on what an agency *possesses*. Architecture that never centralizes keys or credential bodies is the strongest lawful posture: production requests cannot compel what does not exist. Same logic applies to a sovereign local system — minimize first.

NIST SP 800-53 (CM / SI / AU families) and privacy control catalogs emphasize data minimization and retention limits. This module enforces the local side of that discipline.

## Usage

```bash
bash modules/data-sovereignty/minimize-check.sh
bash modules/data-sovereignty/retention-status.sh
# Irreversible local burn of path state:
bash modules/data-sovereignty/destroy-restart.sh --confirm
```
