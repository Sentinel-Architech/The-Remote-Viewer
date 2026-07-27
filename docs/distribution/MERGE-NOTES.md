# Merge notes — conflict-free slim PR

**Updated:** 2026-07-27  
**Context:** PR #4 (`feature/cleanup-structure`) was **dirty** against `TheRemoteViewer` (bulk concept moves, ~100 files). Policy docs shipped via slim PR #5 instead.

---

## What landed

| Item | Result |
|------|--------|
| PR #4 | Closed (conflicts; bulk cleanup left on branch) |
| PR #5 | Squash-merged into `TheRemoteViewer` |
| Branch used | `docs/install-anywhere-identity` |
| Merge commit (squash) | `2af5b57` |

**Files shipped:** install / posture / release hygiene, Android identity freeze, Obtainium templates, README update.  
**Not shipped:** bulk concept renames/deletes on `feature/cleanup-structure` (resolve later with a full worktree).

---

## Equivalent local git commands

```bash
# 1. Start from current default
git fetch origin
git checkout TheRemoteViewer
git pull origin TheRemoteViewer

# 2. Slim branch from default (no merge of the dirty branch)
git checkout -B docs/install-anywhere-identity origin/TheRemoteViewer

# 3. Take only distribution / public docs from the conflicted branch
git checkout origin/feature/cleanup-structure -- \
  docs/public/INSTALL.md \
  docs/public/POSTURE.md \
  docs/public/RELEASE-HYGIENE.md \
  docs/distribution/ANDROID-IDENTITY.md \
  docs/distribution/OBTAINIUM-CROWDSOURCE.md \
  docs/distribution/obtainium-catalog.example.json \
  docs/distribution/obtainium-config.example.json \
  README.md

# 4. Commit and push
git add docs/public docs/distribution README.md
git commit -m "docs: install-anywhere policy, Obtainium path, frozen Android identity"
git push -u origin docs/install-anywhere-identity

# 5. Open PR (or use GitHub UI)
gh pr create --base TheRemoteViewer --head docs/install-anywhere-identity \
  --title "docs: install-anywhere, Obtainium path, Android identity freeze" \
  --body "Conflict-free replacement for PR #4. Install-anywhere + Obtainium + frozen applicationId only."

# 6. Merge (squash)
gh pr merge <PR_NUMBER> --squash \
  --subject "docs: install-anywhere, Obtainium path, Android identity freeze" \
  --body "Public install policy, Obtainium optional path, frozen applicationId, release hygiene, README."

# 7. Close the dirty PR
gh pr close 4 --comment "Closed in favor of slim conflict-free PR."
```

Actual ship: PR **#5** merged; PR **#4** closed.

---

## What not to do while dirty

```bash
git checkout feature/cleanup-structure
git merge TheRemoteViewer   # → many conflicts
gh pr merge 4               # → rejected while mergeable_state is dirty
```

---

## After merge (device / Termux)

```bash
git checkout TheRemoteViewer
git pull origin TheRemoteViewer
```

---

## Later: bulk cleanup

When a laptop or full worktree is available:

```bash
git fetch origin
git checkout feature/cleanup-structure
git merge origin/TheRemoteViewer   # resolve remaining paths, or re-cut a slim concept-move PR
```

Prefer another **path-scoped** PR over forcing the entire historical cleanup in one merge if conflicts remain large.

---

## Related

- `docs/public/INSTALL.md`
- `docs/public/RELEASE-HYGIENE.md`
- `docs/distribution/ANDROID-IDENTITY.md`
- `docs/distribution/OBTAINIUM-CROWDSOURCE.md`
