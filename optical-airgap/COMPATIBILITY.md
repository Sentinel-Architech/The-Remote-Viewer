# Optical Air-Gap — Device & Platform Compatibility

Public matrix for TRV sovereign optical path: **age → RDH → LT → QR (screen→camera)**.

**Access rule (Phase 3):** **Any device that can run the open stack gets access.**  
Requirement is capability (Git + Node 20+ **or** Rust/`age` CLI), not a specific OS brand.  
**GrapheneOS is the verified hardened reference** for Android — preferred when available, **never required** to use TRV.

**Rules:** zero Meta/Google/Microsoft *required* in the core path; encrypt-first; Destroy = Restart; `@sentinel.viewer` is local-only (no public DNS).

| Doc | Role |
|-----|------|
| [README.md](./README.md) | Overview |
| [INSTALL.md](./INSTALL.md) | Install steps |
| **COMPATIBILITY.md** | This matrix |
| [TECHNICAL.md](./TECHNICAL.md) | Architecture |
| [PHASE3.md](./PHASE3.md) | Governance / IA + access posture |

**Legend**

| Symbol | Meaning |
|--------|---------|
| **Yes** | Supported or straightforward with open tooling |
| **Partial** | Works with caveats (sandbox, missing package, manual glue) |
| **CLI** | Crypto/RDH/LT compute only; no first-class GUI optical |
| **No** | Out of scope, blocked by platform, or violates project constraints |
| **Future** | Portable in principle; not yet first-class |
| **\*** | See **GrapheneOS source** section — reference path, not exclusive gate |

---

## GrapheneOS source \* (reference, not gate)

**Preferred hardened Android path when you want maximum mobile lockdown:** [GrapheneOS](https://grapheneos.org/) — install only from the official project:

- Site: **https://grapheneos.org/**
- Install guide: **https://grapheneos.org/install/**
- Releases / factory images: linked from the install guide (verify signatures per project docs)
- Discussion: **https://discuss.grapheneos.org/**

Do **not** sideload “GrapheneOS” builds from third-party mirrors or unofficial images.

Stock Android / GMS, Calyx, other de-Googled builds, Linux phones, desktops, and SBCs remain valid TRV hosts for core age+LT as long as they meet the open-stack bar. GrapheneOS is where mobile optical was **proven**; it is not a license to exclude other devices.

---

## 1. Primary TRV targets

| Device | Core age+RDH+LT | QR send | Camera receive | Notes |
|--------|-----------------|---------|----------------|-------|
| Obsolete Acer (Linux) | Yes | Yes | Partial (webcam) | Strong first install host |
| Pixel 7 + GrapheneOS (Android\*) | Yes (Termux) | Yes | Yes when used | Verified path; OS from [grapheneos.org](https://grapheneos.org/) |
| Generic Android tablet / phone | Partial–Yes | Yes | Partial–Yes | Termux or browser; GMS optional, not required for core |
| Termux (on Android\*) | Yes | No | Future | `git`, `nodejs`, optional `rust`/`age` |
| Any Linux desktop/SBC with Node or age | Yes | Yes | Partial | Universal CLI + browser QR |

---

## 2. Desktop & laptop operating systems

| System | Core | QR send | Receive | How |
|--------|------|---------|---------|-----|
| **Linux x86_64** (Debian, Ubuntu, Fedora, Arch, Mint, openSUSE, …) | Yes | Yes | Partial | Node 20+ or `age`/`rage`; browser |
| **Linux aarch64** | Yes | Yes | Partial | Same; confirm packages for ARM |
| **Windows 10/11** | Yes | Yes | Partial | Node from nodejs.org; WSL2 fine; no MSA as key custody |
| **Windows via WSL2** | Yes | Partial | Partial | CLI in WSL; QR in host browser |
| **macOS** (Intel / Apple Silicon) | Yes | Yes | Partial | Node or Homebrew `age`; no iCloud as Vault |
| **ChromeOS (Linux container)** | Partial | Partial | Partial | Crostini if Node/`age` available |
| **FreeBSD / OpenBSD / NetBSD** | Partial | Partial | Partial | Community effort |

**Desktop guidance:** Any machine with **Git + Node 20+** or **age CLI** runs the core path.

---

## 3. Mobile & handheld

| System | Core | QR send | Receive | Notes |
|--------|------|---------|---------|-------|
| **Android 12+ GrapheneOS** | Yes | Yes | Yes | Hardened reference — [grapheneos.org](https://grapheneos.org/) |
| **Android de-Googled (e.g. Calyx)** | Yes | Yes | Yes | Valid; GrapheneOS still preferred for max lockdown |
| **Android with GMS** | Partial | Yes | Yes | Core must not require Play/GMS for keys |
| **iOS / iPadOS** | Partial | Partial | Partial | Sandbox limits; not first-class |
| **PinePhone / Librem 5 (Linux)** | Yes | Yes | Partial | Real Linux handhelds |
| **Feature phones / KaiOS** | No | No | No | Insufficient runtime |

---

## 4. Single-board computers (SBC) & mini PCs

| Device class | Core | QR send | Receive | Notes |
|--------------|------|---------|---------|-------|
| **Raspberry Pi 4 / 5** | Yes | Yes | Partial | Node or age; HDMI QR |
| **Raspberry Pi Zero 2 W** | Partial | Partial | Partial | Encode/CLI OK |
| **Orange Pi / Rock Pi / Odroid / Khadas** | Yes | Yes | Partial | Debian/Ubuntu-class ARM |
| **Intel NUC / mini PCs** | Yes | Yes | Partial | Same as desktop |
| **RISC-V SBCs** | Partial | Partial | Partial | When Node/`age` exist |
| **Steam Deck (Linux)** | Yes | Yes | Partial | Desktop class |

---

## 5. Hobbyist & embedded (Edge)

Not full optical hosts. Fit Edge MFA, sensors, secondary channels later.

| Device | Role |
|--------|------|
| **ESP32 / ESP32-S3 / C3** | Edge MFA / local radio |
| **RP2040 / STM32 / nRF52** | Offline helpers / co-processors |
| **Arduino Uno / AVR** | Out of scope |

---

## 6. Virtual machines, containers, cloud

| Environment | Core | Optical | Notes |
|-------------|------|---------|-------|
| **Local VM / Docker** | Yes | Poor / No | Build and test |
| **Public cloud** | CLI only | No | No Vault identities on cloud disks |

---

## 7. Cross-implementation compatibility

| Layer | Interop contract |
|-------|------------------|
| **age** | age v1 — Go age, rage, TS `age-encryption`, Rust `age` |
| **RDH** | Histogram-shifting layout + header |
| **LT** | TRVL framing — same rules everywhere |
| **Identity** | `local@sentinel.viewer` — not public DNS |

---

## 8. Explicit incompatibilities

| Item | Why |
|------|-----|
| Google Play **required** for core crypto | Violates zero-Google core |
| Meta / Facebook SDKs | Banned from core |
| Microsoft cloud key custody | Banned from core |
| iCloud / Google Drive as key store | Breaks Destroy = Restart |
| Public DNS for `sentinel.viewer` | Local claim only |
| Unofficial “GrapheneOS” images | Only [grapheneos.org](https://grapheneos.org/) |
| DRM-only appliances with no user runtime | Cannot run open stack |

---

## 9. Recommended pairs (no new purchases)

1. **Any Linux desktop ↔ any Android with Termux/browser**  
2. **Acer Linux ↔ Pixel GrapheneOS** — verified design pair  
3. **Encode anywhere Yes-core, move ciphertext by USB** — until camera path used  

---

## 10. Checklist before claiming a new device “works”

- [ ] age round-trip on device  
- [ ] LT stream/peel (and RDH if claimed)  
- [ ] No plaintext in shared/cloud storage  
- [ ] Keys only in Vault; wipe procedure documented  
- [ ] Optical (if claimed): quality gate + LT peel on real frames  
- [ ] No Meta/Google/Microsoft **required** for those steps  
- [ ] If claiming GrapheneOS: OS from **https://grapheneos.org/** only  

---

## Related

- Install: [INSTALL.md](./INSTALL.md)  
- Phase 3: [PHASE3.md](./PHASE3.md)  
- **GrapheneOS (reference):** https://grapheneos.org/ · https://grapheneos.org/install/  
