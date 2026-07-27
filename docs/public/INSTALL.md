# Install and device acceptance

**Project:** The Remote Viewer / Sentinel direction  
**Updated:** 2026-07-27  
**Status:** Public policy (scaffold clients may lag this intent)  
**Repo:** https://github.com/Sentinel-Archetecht/The-Remote-Viewer

---

## Core rule

**No device is excluded by brand, store certification, Play Integrity, OEM prestige, or OS fashion.**

Anyone who can obtain an official package may install a general-purpose client (sideload, Obtainium, direct APK, or an optional store listing).  
Devices that cannot run that client are still **accepted into the system at the highest tier they can support**—not blacklisted.

> Security guarantees follow **capability**.  
> Inclusion does **not** require every device to be a full vault host.

---

## What we never use to block install or join

| Mechanism | Policy |
|-----------|--------|
| Play Integrity / SafetyNet | **Not required** for core TRV |
| “Certified device” lists | **Not used** |
| Google account | **Not required** for local identity / vault scaffold |
| GrapheneOS-only or Pixel-only install gates | **Not used** (Pixel + GrapheneOS remains *recommended*, not exclusive) |
| Region / carrier as project policy | **Not used** |

Platform OS may still refuse a broken or unsigned package. That is OS integrity, not TRV device blacklisting.

---

## Participation tiers

| Tier | Examples | Accepted role | Not accepted as |
|------|----------|---------------|-----------------|
| **T-full** | Modern phones/tablets (any OEM), GrapheneOS, stock, sideload | Full client: local `did:key`, vault UX, presence UI when implemented | — |
| **T-light** | Older phones, constrained Android, limited storage | Reduced client / subset features; same non-custodial rules if crypto runs | Pretending full StrongBox guarantees |
| **T-edge** | ESP32, MCU, BLE beacons, sensors | Helper under user custody: presence, radio, sensing | Long-term master identity key store |
| **T-signal** | Pager-class, SMS-only, one-way radio, minimal receivers | Signal bearer: alert, page, ACK, out-of-band notify | Root of trust, vault host, sole recovery path |
| **T-human** | Paper, offline ceremony, air-gapped export | User-held recovery / destroy procedures per locked docs | Platform-operated recovery |

**Pager rule:** If it powers on and catches a signal, it can be **accepted as T-signal** (or better if it truly has more capability). It is not excluded for being “not a smartphone.”

---

## Distribution channels

| Channel | Role | Status |
|---------|------|--------|
| **GitHub Releases** | Primary transparent APK + checksums | Intent — attach APK when mobile builds ship |
| **Obtainium** | Sideload updates without a store | Fully specified below |
| **Obtainium crowdsource catalog** | One-click config after APK exists | Template ready — submit only with official APK |
| Manual sideload | Download APK + verify hash | Always allowed |
| Optional store (Play, etc.) | Convenience | Never the only door |
| GrapheneOS App Store | Welcome when client is real enough | Never exclusive |
| F-Droid / IzzyOnDroid / own fdroid repo | Optional later | Not required for install-anywhere |

Release discipline: `docs/public/RELEASE-HYGIENE.md`  
Crowdsource process: `docs/distribution/OBTAINIUM-CROWDSOURCE.md`

---

## Obtainium (recommended for Android updates without a store)

[Obtainium](https://github.com/ImranR98/Obtainium) tracks release pages and installs APKs via the system package installer. No Google services required. Common on GrapheneOS.

### Install Obtainium

1. From [F-Droid](https://f-droid.org/packages/dev.imranr.obtainium.fdroid/), IzzyOnDroid, or [Obtainium GitHub Releases](https://github.com/ImranR98/Obtainium/releases).  
2. Optionally verify Obtainium’s published signing certificate (see Obtainium project docs).

### Add The Remote Viewer

When official APKs are published on GitHub Releases:

1. Open Obtainium → **Add app**.  
2. **App source URL:**  
   `https://github.com/Sentinel-Archetecht/The-Remote-Viewer`  
3. Source should auto-detect as **GitHub**.  
4. Recommended settings for stable users:
   - **Include prereleases:** off  
   - **Verify latest tag:** on (uses the release marked Latest)  
   - **APK filter** (if multiple assets): prefer a clear name, e.g. `arm64` or `universal` / `trv`  
5. Add → install the offered APK.  
6. Enable notifications or auto-update per your preference.

**Signature rule:** Updates only work if every release is signed with the **same** app signing key. Do not mix Play-signed and sideload-signed lineages for the same package id without understanding that Android will refuse the update.

### Crowdsource / one-tap config

- Guide: `docs/distribution/OBTAINIUM-CROWDSOURCE.md`  
- Catalog template: `docs/distribution/obtainium-catalog.example.json`  
- Site: [apps.obtainium.imranr.dev](https://apps.obtainium.imranr.dev)  
- After upstream merge: use their “Add to Obtainium” / redirect links and optional badge  

Until the first public APK exists, Obtainium will not find an installable asset—and a crowdsource PR should not be opened.

### GitHub API rate limits

Users tracking many GitHub apps may need a **Personal Access Token** in Obtainium settings. Documented by Obtainium; not a TRV server dependency.

---

## Manual sideload

1. Open the latest [GitHub Release](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/releases) (when APKs are attached).  
2. Download the APK asset matching your ABI (or universal).  
3. Verify **SHA-256** against the sum published in the release notes (when published).  
4. Install via the system installer (GrapheneOS: allow the install source for that session as required).  
5. Prefer the **same channel** (GitHub vs store) for updates to avoid signature mismatch.

---

## Recommended client path (T-full / T-light)

1. Obtain APK via Obtainium, direct Release download, or optional store.  
2. Verify checksum / signature when published.  
3. Install.  
4. Create local identity on-device; no platform recovery.  

**Enhanced guarantees (optional, not required to install):**

- Pixel + GrapheneOS  
- StrongBox-backed keys when implemented  
- Hardware attestation / Auditor-class checks for peers who opt in  

Lack of those enhancements **must not** block install or basic local use.

---

## Feature detection, not hard exclusion

| Capability missing | Behavior |
|--------------------|----------|
| StrongBox | Fall back to TEE / best available; label residual risk honestly |
| Biometrics | Device credential / knowledge factor |
| GrapheneOS | Run anyway; attestation rules must not demand stock-only `Verified` |
| Network | Offline minimum surface still applies (vault/identity local rules) |
| Crypto too weak for `did:key` | Device stays T-signal / T-edge; do not fake a full identity host |
| No Android APK support | T-signal / T-edge / T-human only — still not blacklisted from the *system* |

---

## Public sentences

> TRV does not blacklist devices. Install is open to sideload and store alike; Play Integrity is not a gate for core use.

> Obtainium + GitHub Releases is a first-class update path for Android clients without a store.

> Crowdsourced Obtainium configs will use the official GitHub source only, after a public APK ships.

> Any device that can power on may participate at the highest tier it can support—from full sovereign client, to edge sensor, to simple signal bearer.

> Pixel + GrapheneOS is recommended for stronger local guarantees, not required to download or join.

---

## Related

- `docs/public/RELEASE-HYGIENE.md` — how we publish APKs so Obtainium works  
- `docs/distribution/OBTAINIUM-CROWDSOURCE.md` — catalog submission process  
- `docs/distribution/obtainium-catalog.example.json` — upstream file shape  
- `docs/distribution/obtainium-config.example.json` — maintainer notes  
- `docs/public/POSTURE.md` — transparency without secrets  
- `docs/security/auth-bound-keys.md` — capability-scaled key protection  
- `docs/security/attestation.md` — optional hardware proofs  
- `docs/locked/03-Destroy-Equals-Restart.md` — identity finality  

This file states **acceptance and install policy**. Shipping every tier and the first APK is incremental; policy rejects exclusion theater from day one.
