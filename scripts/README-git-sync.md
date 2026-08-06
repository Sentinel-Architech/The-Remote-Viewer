# Git sync (phone / Termux)

Automates fetch + fast-forward for this repo. Does **not** force-push. Does **not** contact anything except your configured `origin`.

## One-time

```bash
cd ~/The-Remote-Viewer   # your clone path
chmod +x scripts/git-sync.sh
```

Auth: HTTPS token or SSH key already set up for GitHub. Script will not store credentials.

## Sync now

```bash
# Current branch (or TRV_BRANCH / TheRemoteViewer)
bash scripts/git-sync.sh

# Pin branch
bash scripts/git-sync.sh TheRemoteViewer

# Local edits present
bash scripts/git-sync.sh TheRemoteViewer --allow-dirty
```

## Optional: run on open / schedule

**Alias (recommended)** — add to `~/.bashrc`:

```bash
alias trv-sync='bash $HOME/The-Remote-Viewer/scripts/git-sync.sh TheRemoteViewer'
```

**Termux:Widget / shortcut** — point a widget at:

```bash
bash $HOME/The-Remote-Viewer/scripts/git-sync.sh TheRemoteViewer
```

**Cron-style (Termux `cronie` or `termux-job-scheduler`)** — only if you accept periodic network use to GitHub:

```bash
# example: every 6 hours via job scheduler docs for your Termux setup
bash $HOME/The-Remote-Viewer/scripts/git-sync.sh TheRemoteViewer
```

## Safety

| Behavior | Default |
|----------|---------|
| Force push | Never |
| Auto-push | Off (needs `--push`) |
| Dirty tree | Abort unless `--allow-dirty` |
| Diverged history | Abort (manual merge) |

After a GitHub merge (like PR #41), run `trv-sync` or the script once on the phone.
