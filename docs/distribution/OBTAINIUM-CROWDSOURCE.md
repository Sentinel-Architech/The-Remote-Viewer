# Obtainium crowdsource (apps.obtainium.imranr.dev)

**Updated:** 2026-07-27  
**Status:** Ready when a public APK exists on official GitHub Releases  
**Catalog:** https://apps.obtainium.imranr.dev  
**Upstream repo:** https://github.com/ImranR98/apps.obtainium.imranr.dev

---

## What “crowdsource” means here

The Obtainium community maintains **one-click app configs** so users do not hand-tune GitHub filters.  
TRV’s official source for that catalog must be **our GitHub Releases** (not APKPure/APKMirror mirrors).

---

## Upstream acceptance criteria (summary)

From [APP_CRITERIA.md](https://github.com/ImranR98/apps.obtainium.imranr.dev/blob/main/APP_CRITERIA.md):

| Rule | TRV implication |
|------|-----------------|
| Official source only | `url` = `https://github.com/Sentinel-Archetecht/The-Remote-Viewer` |
| No reupload sites | Never point config at APKMirror/APKPure as primary |
| Forks need distinct package + display name | We ship our own applicationId and name |
| Minimize non-default settings | Only set filters that are required |
| Prefer stable over prereleases | `includePrereleases: false` unless beta channel |
| Search existing issues/PRs first | Avoid duplicate requests |

**Blocker today:** no public APK asset on Releases yet. Do **not** open an upstream PR until an official APK is downloadable from that repo.

---

## Two JSON layers

### A. Catalog file (`data/apps/<packageId>.json`)

```json
{
  "configs": [ { /* app config */ } ],
  "icon": "https://…",
  "categories": ["security"],
  "description": { "en": "…" }
}
```

### B. App config (inside `configs[]` or `obtainium://app/…`)

**Required:** `id`, `url`, `author`, `name`  
**Optional:** `additionalSettings` (often a **JSON string**), `preferredApkIndex`, `altLabel`

See `docs/distribution/obtainium-catalog.example.json` for a TRV-shaped catalog file.

---

## Recommended TRV settings (stable channel)

Change only what is needed:

| Setting | Value | Why |
|---------|--------|-----|
| `includePrereleases` | `false` | Stable users |
| `verifyLatestTag` | `true` | Honor GitHub “Latest” |
| `fallbackToOlderReleases` | `true` | If a tag lacks APK |
| `autoApkFilterByArch` | `true` | Prefer matching ABI |
| `apkFilterRegEx` | e.g. `arm64\|universal\|trv` | Only if multiple assets need disambiguation |
| Everything else | **omit / default** | Upstream preference |

---

## Submission checklist (when APK ships)

1. [ ] Signed release APK attached to GitHub Release  
2. [ ] SHA-256 in release notes (`docs/public/RELEASE-HYGIENE.md`)  
3. [ ] Final `applicationId` frozen → replace placeholders in catalog example  
4. [ ] Smoke-test in Obtainium: Add repo URL → install → update path  
5. [ ] Export config from Obtainium **or** fill `obtainium-catalog.example.json`  
6. [ ] Optional: generate upstream file via their `generate_from_export.js` / `generate_from_url.py`  
7. [ ] Search open/closed issues & PRs on apps.obtainium.imranr.dev  
8. [ ] Open **PR** (preferred) or **app request** issue with APK link + working config  
9. [ ] After merge: add “Get it on Obtainium” badge + redirect link to README / INSTALL.md  

---

## Deep links (after config exists)

```text
obtainium://add/https://github.com/Sentinel-Archetecht/The-Remote-Viewer

obtainium://app/<url-encoded-app-config-json>

https://apps.obtainium.imranr.dev/redirect.html?r=obtainium://app/<urlencoded>
```

`/add` = user reviews settings.  
`/app` = full config applied.  
Redirect page makes links clickable in GitHub/Markdown/chat.

Badge graphic (upstream):
`https://raw.githubusercontent.com/ImranR98/Obtainium/main/assets/graphics/badge_obtainium.png`

---

## What we will not crowdsource

- Mirror-site configs  
- Debug-signed or unofficial fork builds under a confusing name  
- Pre-release-only configs as the sole catalog entry  
- Configs before an official APK exists  

---

## Related in-repo

| File | Role |
|------|------|
| `docs/distribution/obtainium-catalog.example.json` | Catalog-shaped template |
| `docs/distribution/obtainium-config.example.json` | Maintainer-oriented notes |
| `docs/public/INSTALL.md` | User install path |
| `docs/public/RELEASE-HYGIENE.md` | How Releases must look |
