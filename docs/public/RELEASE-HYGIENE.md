# Release hygiene (APK / Obtainium / sideload)

**Updated:** 2026-07-27  
**Audience:** Maintainers publishing Android builds of The Remote Viewer  
**Related:** `docs/public/INSTALL.md`

---

## Goal

Make every official Android build **installable and updatable** via:

- Manual sideload  
- **Obtainium** (GitHub source)  
- Optional stores **without** becoming the only channel  

No Play Integrity requirement for core use.

---

## Hard rules

1. **One package name** for the public TRV Android app lineage.  
2. **One app signing key** for that package for the life of the lineage (or a documented, deliberate migration).  
3. Every GitHub Release that is meant for users **attaches the APK(s)** as release assets—not only CI artifact links.  
4. Publish **SHA-256** of each APK in the release body.  
5. Publish **signing certificate SHA-256** (or link to a stable VERIFY.md) for first-install verification.  
6. Mark the intended production build as **Latest**; use GitHub pre-release flag for betas.  
7. Align Android `versionName` with the release tag style (e.g. tag `v0.1.0` ↔ versionName `0.1.0` or `v0.1.0`—be consistent).  
8. Never commit keystores, passwords, or upload keys to git (`docs/security/secrets.md`).

---

## GitHub Release checklist

- [ ] Tag created from the intended commit  
- [ ] APK asset(s) uploaded (predictable names, e.g. `trv-0.1.0-arm64-v8a.apk`)  
- [ ] SHA-256 listed in release notes  
- [ ] Changelog / breaking notes  
- [ ] Pre-release checkbox set correctly  
- [ ] Latest points at stable when this is stable  
- [ ] Obtainium smoke-test: Add repo URL → sees version + APK  

### Multiple APKs

If shipping ABI splits:

| Asset example | Obtainium filter hint |
|---------------|------------------------|
| `*-arm64-v8a.apk` | `arm64` |
| `*-armeabi-v7a.apk` | `armeabi` or `v7a` |
| `*-universal.apk` | `universal` |

Prefer one **universal** or primary **arm64** build for early releases to reduce filter confusion.

---

## Obtainium-facing expectations

Obtainium needs from the source:

- A **version** (or changing pseudo-version)  
- At least one **APK download URL** for that version  

GitHub Releases with APK assets satisfy this via the API.  
HTML-only sites are fragile; do not rely on them as primary.

User-facing URL to document everywhere:

```text
https://github.com/Sentinel-Archetecht/The-Remote-Viewer
```

---

## Channel matrix (do not mix blindly)

| Install source | Update source | Result |
|----------------|---------------|--------|
| GitHub APK (key A) | GitHub APK (key A) | OK |
| Play (key B) | GitHub (key A) | **Fail** — signature mismatch |
| F-Droid (key C) | GitHub (key A) | **Fail** unless same key / reproducible story |

If a store listing is added later, either:

- Use the **same** upload/signing strategy users can also sideload, or  
- Document **separate package id** / lineage so Obtainium users are not broken.

---

## First public APK (when mobile leaves pure scaffold)

1. Freeze package name and generate release keystore offline.  
2. Backup keystore under user-controlled secure storage—not the repo.  
3. Build signed release APK.  
4. Create GitHub Release + assets + hashes.  
5. Update `docs/public/INSTALL.md` if URLs or filter names change.  
6. Optionally publish config to apps.obtainium.imranr.dev and add badge to README.  
7. Optionally file GrapheneOS App Store interest when quality bar is met.

---

## Non-goals

- Requiring users to use Obtainium (manual sideload remains valid)  
- Blocking devices that do not use GrapheneOS  
- Attaching debug-signed APKs as “official”  

---

*Scaffold today may have no APK assets. This document is the contract for when they exist.*
