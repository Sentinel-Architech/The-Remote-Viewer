# Install and device acceptance

**Project:** The Remote Viewer / Sentinel direction  
**Updated:** 2026-07-27  
**Status:** Public policy (scaffold clients may lag this intent)

---

## Core rule

**No device is excluded by brand, store certification, Play Integrity, OEM prestige, or OS fashion.**

Anyone who can obtain an official package may install a general-purpose client (sideload, Obtainium-style repo, direct APK, or an optional store listing).  
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

## Recommended client path (T-full / T-light)

1. Download the official APK (or store build) from a published project source.  
2. Verify checksum / signature when published.  
3. Install via sideload, Obtainium, or store—user’s choice.  
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

---

## Distribution channels (intent)

| Channel | Role |
|---------|------|
| GitHub Releases (or successor) | Primary transparent APK + sums |
| Obtainium-compatible URL | Easy updates for sideloaders |
| Optional store (Play, etc.) | Convenience—not the only door |
| GrapheneOS App Store | Welcome when the client is real enough—never exclusive |

---

## Public sentences

> TRV does not blacklist devices. Install is open to sideload and store alike; Play Integrity is not a gate for core use.

> Any device that can power on may participate at the highest tier it can support—from full sovereign client, to edge sensor, to simple signal bearer.

> Pixel + GrapheneOS is recommended for stronger local guarantees, not required to download or join.

---

## Related

- `docs/public/POSTURE.md` — transparency without secrets  
- `docs/security/auth-bound-keys.md` — capability-scaled key protection  
- `docs/security/attestation.md` — optional hardware proofs  
- `docs/locked/03-Destroy-Equals-Restart.md` — identity finality  

This file states **acceptance policy**. Shipping every tier is incremental; policy rejects exclusion theater from day one.
