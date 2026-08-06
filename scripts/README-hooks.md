# Git hooks (local automation)

Tracked under `scripts/hooks/`. Installed with `core.hooksPath` so they travel with the repo without copying into `.git/hooks` by hand.

## Install (once per clone)

```bash
cd ~/The-Remote-Viewer
bash scripts/install-hooks.sh
```

## What runs

| Hook | Action |
|------|--------|
| `pre-commit` | Abort if staged files look like vault keys, age secrets, private keys, or GitHub tokens |
| `post-merge` | `chmod +x` on scripts after pull/merge |
| `post-checkout` | Same after branch switch |

No network. No telemetry.

## Optional: lefthook + gitleaks

Root `lefthook.yml` still offers `gitleaks protect --staged` if you install those tools. Hooks above work with zero extra packages on Termux.

## Disable

```bash
git config --unset core.hooksPath
```
