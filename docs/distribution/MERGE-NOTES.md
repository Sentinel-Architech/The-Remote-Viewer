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

## Terminal output examples (illustrative)

Outputs below match a typical local/Termux session. SHAs and dates will differ on your machine.

### 1–2. Fetch, checkout default, cut slim branch

```text
$ git fetch origin
From github.com:Sentinel-Archetecht/The-Remote-Viewer
 * [new branch]      feature/cleanup-structure -> origin/feature/cleanup-structure
   1e897c1..2af5b57  TheRemoteViewer          -> origin/TheRemoteViewer

$ git checkout TheRemoteViewer
Switched to branch 'TheRemoteViewer'
Your branch is behind 'origin/TheRemoteViewer' by 1 commit, and can be fast-forwarded.
  (use "git pull" to update your local branch)

$ git pull origin TheRemoteViewer
From github.com:Sentinel-Archetecht/The-Remote-Viewer
 * branch            TheRemoteViewer -> FETCH_HEAD
Updating 1e897c1..2af5b57
Fast-forward
 README.md                                         | 120 +++++++++++++++-----
 docs/distribution/ANDROID-IDENTITY.md             |  46 ++++
 docs/distribution/OBTAINIUM-CROWDSOURCE.md        | 120 ++++++++++
 docs/distribution/obtainium-catalog.example.json  |  22 ++
 docs/distribution/obtainium-config.example.json   |  41 ++++
 docs/public/INSTALL.md                            | 173 ++++++++++++++
 docs/public/POSTURE.md                            | 101 +++++++++
 docs/public/RELEASE-HYGIENE.md                    | 124 ++++++++++
 8 files changed, 746 insertions(+), 35 deletions(-)
 create mode 100644 docs/distribution/ANDROID-IDENTITY.md
 ...

$ git checkout -B docs/install-anywhere-identity origin/TheRemoteViewer
Switched to a new branch 'docs/install-anywhere-identity'
branch 'docs/install-anywhere-identity' set up to track 'origin/TheRemoteViewer'.
```

### 3. Path-scoped checkout from the dirty branch (no merge)

```text
$ git checkout origin/feature/cleanup-structure -- \
    docs/public/INSTALL.md \
    docs/public/POSTURE.md \
    docs/public/RELEASE-HYGIENE.md \
    docs/distribution/ANDROID-IDENTITY.md \
    docs/distribution/OBTAINIUM-CROWDSOURCE.md \
    docs/distribution/obtainium-catalog.example.json \
    docs/distribution/obtainium-config.example.json \
    README.md

$ git status
On branch docs/install-anywhere-identity
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   docs/distribution/ANDROID-IDENTITY.md
	new file:   docs/distribution/OBTAINIUM-CROWDSOURCE.md
	new file:   docs/distribution/obtainium-catalog.example.json
	new file:   docs/distribution/obtainium-config.example.json
	new file:   docs/public/INSTALL.md
	new file:   docs/public/POSTURE.md
	new file:   docs/public/RELEASE-HYGIENE.md
	modified:   README.md
```

### 4. Commit and push

```text
$ git add docs/public docs/distribution README.md
$ git commit -m "docs: install-anywhere policy, Obtainium path, frozen Android identity"
[docs/install-anywhere-identity f67debe] docs: install-anywhere policy, Obtainium path, frozen Android identity
 8 files changed, 746 insertions(+), 35 deletions(-)
 create mode 100644 docs/distribution/ANDROID-IDENTITY.md
 create mode 100644 docs/distribution/OBTAINIUM-CROWDSOURCE.md
 create mode 100644 docs/distribution/obtainium-catalog.example.json
 create mode 100644 docs/distribution/obtainium-config.example.json
 create mode 100644 docs/public/INSTALL.md
 create mode 100644 docs/public/POSTURE.md
 create mode 100644 docs/public/RELEASE-HYGIENE.md

$ git push -u origin docs/install-anywhere-identity
Enumerating objects: 18, done.
Counting objects: 100% (18/18), done.
Delta compression using up to 8 threads
Compressing objects: 100% (14/14), done.
Writing objects: 100% (14/14), 12.40 KiB | 12.40 MiB/s, done.
Total 14 (delta 3), reused 0 (delta 0), pack-reused 0
to github.com:Sentinel-Archetecht/The-Remote-Viewer.git
 * [new branch]      docs/install-anywhere-identity -> docs/install-anywhere-identity
branch 'docs/install-anywhere-identity' set up to track 'origin/docs/install-anywhere-identity'.
```

### 5–7. PR create, merge, close dirty PR

```text
$ gh pr create --base TheRemoteViewer --head docs/install-anywhere-identity \
    --title "docs: install-anywhere, Obtainium path, Android identity freeze" \
    --body "Conflict-free replacement for PR #4. Install-anywhere + Obtainium + frozen applicationId only."
https://github.com/Sentinel-Archetecht/The-Remote-Viewer/pull/5

$ gh pr merge 5 --squash \
    --subject "docs: install-anywhere, Obtainium path, Android identity freeze" \
    --body "Public install policy, Obtainium optional path, frozen applicationId, release hygiene, README."
✓ Squashed and merged pull request #5 (docs: install-anywhere, Obtainium path, Android identity freeze)

$ gh pr close 4 --comment "Closed in favor of slim conflict-free PR."
✓ Closed pull request Sentinel-Archetecht/The-Remote-Viewer#4 (docs: install-anywhere, Obtainium path, Android identity freeze)
```

---

## What not to do while dirty

```bash
git checkout feature/cleanup-structure
git merge TheRemoteViewer   # → many conflicts
gh pr merge 4               # → rejected while mergeable_state is dirty
```

### Example failure output

```text
$ git checkout feature/cleanup-structure
Switched to branch 'feature/cleanup-structure'

$ git merge TheRemoteViewer
Auto-merging README.md
CONFLICT (content): Merge conflict in README.md
Auto-merging .gitignore
CONFLICT (content): Merge conflict in .gitignore
CONFLICT (modify/delete): AR Token deleted in HEAD and modified in TheRemoteViewer...
... (many paths) ...
Automatic merge failed; fix conflicts and then commit the result.

$ git status
On branch feature/cleanup-structure
You have unmerged paths.
  (fix conflicts and run "git commit")
Unmerged paths:
  (use "git add/rm <file>..." as appropriate to mark resolution)
	both modified:   README.md
	both modified:   .gitignore
	deleted by us:   AR Token
	...

$ gh pr merge 4
X Pull request Sentinel-Archetecht/The-Remote-Viewer#4 is not mergeable: the merge commit cannot be cleanly created.
```

GitHub API equivalent when calling update-branch on a dirty PR:

```text
422 merge conflict between base and head
```

---

## After merge (device / Termux)

```bash
git checkout TheRemoteViewer
git pull origin TheRemoteViewer
```

### Example output

```text
$ git checkout TheRemoteViewer
Switched to branch 'TheRemoteViewer'
Your branch is behind 'origin/TheRemoteViewer' by 2 commits, and can be fast-forwarded.

$ git pull origin TheRemoteViewer
From github.com:Sentinel-Archetecht/The-Remote-Viewer
 * branch            TheRemoteViewer -> FETCH_HEAD
Updating 1e897c1..ba8b283
Fast-forward
 docs/distribution/MERGE-NOTES.md | 120 ++++++++++++++++++++
 ...
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
