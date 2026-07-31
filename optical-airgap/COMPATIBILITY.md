# Optical Air-Gap — Device & Platform Compatibility

Public matrix for TRV sovereign optical path: **age → RDH → LT → QR (screen→camera)**.

**Rules:** zero Meta/Google/Microsoft *required* in the core path; encrypt-first; Destroy = Restart; `@sentinel.viewer` is local-only (no public DNS).

| Doc | Role |
|-----|------|
| [README.md](./README.md) | Overview |
| [INSTALL.md](./INSTALL.md) | Install steps |
| **COMPATIBILITY.md** | This matrix |
| [TECHNICAL.md](./TECHNICAL.md) | Architecture |

**Legend**

| Symbol | Meaning |
|--------|---------|
| **Yes** | Supported or straightforward with open tooling |
| **Partial** | Works with caveats (sandbox, missing package, manual glue) |
| **CLI** | Crypto/RDH/LT compute only; no first-class GUI optical |
| **No** | Out of scope, blocked by platform, or violates project constraints |
| **Future** | Portable in principle; not Phase 1 |
| **\*** | See **GrapheneOS source** footnote at end of this file |

---

## GrapheneOS source \*

**Preferred hardened Android\* path for TRV mobile:** [GrapheneOS](https://grapheneos.org/) — install only from the official project:

- Site: **https://grapheneos.org/**
- Install guide: **https://grapheneos.org/install/**
- Releases / factory images: linked from the install guide (verify signatures per project docs)
- Discussion: **https://discuss.grapheneos.org/**

Do **not** sideload “GrapheneOS” builds from third-party mirrors, random Telegram channels, or unofficial images. Pixel hardware only for official GrapheneOS (see their device support list).

Wherever this document writes **Android\***, the sovereign default is GrapheneOS from the links above. Stock Android / GMS is a lesser, Partial path.

---

## 1. Primary TRV targets (locked)

| Device | Core age+RDH+LT | QR send | Camera receive | Notes |
|--------|-----------------|---------|----------------|-------|
| Obsolete Acer (Linux) | Yes | Yes | Partial (webcam) | Best first install host |
| Pixel 7 + GrapheneOS (Android\*) | Yes (Termux) | Yes | Yes when used | F-Droid Termux; no GMS required; OS from [grapheneos.org](https://grapheneos.org/) |
| Generic Android\* tablet | Partial | Yes | Partial | Prefer GrapheneOS-capable Pixel tablet if available, else de-Googled / sideload Termux |
| Termux (on Android\*) | Yes | No | Future | `git`, `nodejs`, optional `age`; host OS preferably GrapheneOS |

---

## 2. Desktop & laptop operating systems

| System | Core | QR send | Receive | How |
|--------|------|---------|---------|-----|
| **Linux x86_64** (Debian, Ubuntu, Fedora, Arch, Mint, openSUSE, …) | Yes | Yes | Partial | Node 20+ or `age`/`rage`; browser or future Rust binary |
| **Linux aarch64** (ARM laptops, some Chromebooks Linux) | Yes | Yes | Partial | Same; confirm Node/age packages for ARM |
| **Windows 10/11** | Yes | Yes | Partial | Node 20+ from nodejs.org; WSL2 Linux path preferred for closer parity; avoid Microsoft account as key custody |
| **Windows via WSL2** | Yes | Partial | Partial | Treat as Linux for CLI; QR in Windows host browser |
| **macOS** (Intel / Apple Silicon) | Yes | Yes | Partial | Node 20+ or Homebrew `age`/`rage`; browser QR; do not use iCloud as Vault |
| **ChromeOS (Linux container)** | Partial | Partial | Partial | Crostini: Node/`age` if available; optical limited |
| **FreeBSD / OpenBSD / NetBSD** | Partial | Partial | Partial | `age` often packaged; Node varies; community effort |
| **Solaris / illumos / obscure UNIX** | Partial | No | No | age may build from source; not a project focus |

**Desktop guidance:** Any machine that runs **Git + Node 20+** or **age CLI** can run the shipped TypeScript crypto/RDH path. Camera receive is always “Partial” until a dedicated capture UI exists.

---

## 3. Mobile & handheld

| System | Core | QR send | Receive | Notes |
|--------|------|---------|---------|-------|
| **Android\* 12+ with GrapheneOS** | Yes | Yes | Yes | **Preferred** mobile class — get OS from [grapheneos.org](https://grapheneos.org/) |
| **Android\* de-Googled (e.g. Calyx) ** | Yes | Yes | Yes | Acceptable; GrapheneOS still preferred for TRV |
| **Android with GMS** | Partial | Yes | Yes | Core can avoid GMS; do not depend on Play for keys |
| **iOS / iPadOS** | Partial | Partial | Partial | No Termux; sandbox limits; **not** a first-class TRV host |
| **HarmonyOS / other OEM Android forks** | Partial | Partial | Partial | Case-by-case; not GrapheneOS |
| **PinePhone / PinePhone Pro (Linux)** | Yes | Yes | Partial | Real Linux handheld |
| **Librem 5 / similar Linux phones** | Yes | Yes | Partial | Same class as PinePhone |
| **Feature phones / KaiOS** | No | No | No | Insufficient runtime |

\* **Android\*** → preferred hardened path is **GrapheneOS**: https://grapheneos.org/ · install: https://grapheneos.org/install/

---

## 4. Single-board computers (SBC) & mini PCs

| Device class | Core | QR send | Receive | Notes |
|--------------|------|---------|---------|-------|
| **Raspberry Pi 4 / 5** (Raspberry Pi OS, Debian) | Yes | Yes | Partial | Node or age; HDMI QR display; USB camera optional |
| **Raspberry Pi Zero 2 W** | Partial | Partial | Partial | OK for encode/CLI; tight on browser + camera |
| **Orange Pi / Rock Pi / Odroid / Khadas** | Yes | Yes | Partial | Any Debian/Ubuntu-class ARM SBC |
| **NVIDIA Jetson (Linux)** | Yes | Yes | Partial | Overkill but fine; keep proprietary CUDA out of *core* path |
| **Intel NUC / mini PCs (Linux/Windows)** | Yes | Yes | Partial | Same as desktop |
| **LattePanda / similar** | Yes | Yes | Partial | Windows or Linux |
| **RISC-V SBCs** (VisionFive, Milk-V, etc.) | Partial | Partial | Partial | When Node/`age` exist for the ISA |
| **TV boxes (Android\*)** | Partial | Partial | Partial | Often locked; only if unlocked + Termux; not official GrapheneOS hardware |

---

## 5. Hobbyist & embedded (Edge)

These are **not** full optical-airgap hosts. They fit **Edge MFA, sensors, secondary channels**, or tiny encode helpers later.

| Device | age | RDH/LT compute | QR | Camera optical | Role |
|--------|-----|----------------|-----|----------------|------|
| **ESP32 / ESP32-S3 / C3** | Partial | Future | Partial | No practical | Edge MFA / local radio — not a GrapheneOS host |
| **ESP8266** | No | Future tiny | No | No | Too tight |
| **Arduino Uno / AVR** | No | No | No | No | Insufficient |
| **Arduino-class Giga / Portenta** | Partial | Future | Partial | No | Co-processor |
| **RP2040 / RP2350 (Pico)** | Partial | Future | Partial | No | Offline helpers |
| **STM32 (Black Pill, Nucleo, …)** | Partial | Future | Partial | No | Bare-metal later |
| **nRF52 / nRF53** | Partial | Future | No | No | BLE-centric Edge |
| **Teensy 4.x** | Partial | Future | Partial | No | Strong MCU if needed |
| **FPGA boards** | No | Future research | No | No | Research only |
| **Old netbooks / Chromebooks (Linux)** | Yes | Yes | Partial | Light Linux laptop class |
| **Retro PCs** | Partial | Partial | No | No | Not worth it |
| **Game handhelds** (Steam Deck, etc.) | Yes | Yes | Partial | Linux Deck = desktop class |
| **E-readers** | No / fragile | No | Partial display | No | Do not depend on |

---

## 6. Virtual machines, containers, cloud

| Environment | Core | Optical | Notes |
|-------------|------|---------|-------|
| **Local VM** | Yes | Poor | Build/test only |
| **Docker / Podman** | Yes | No | CI / reproducible builds |
| **Public cloud VMs** | CLI only | No | No Vault identities on cloud disks |
| **Codespaces / GitHub runners** | CLI | No | Build only; no secrets |

---

## 7. Cross-implementation compatibility (language)

| Layer | Interop contract |
|-------|------------------|
| **age** | age v1 — Go age, rage, TS `age-encryption`, Rust `age` crate |
| **RDH** | Histogram-shifting layout + header (peak, zero, length, SHA-256 prefix) |
| **LT** | Project TRVL framing — same encoder/decoder rules everywhere |
| **Identity** | `local@sentinel.viewer` — not MX/DNS |

---

## 8. Explicit incompatibilities (locked)

| Item | Why |
|------|-----|
| Google Play **required** for core crypto | Violates zero-Google core path |
| Meta / Facebook SDKs | Banned from core |
| Microsoft cloud key custody | Banned from core |
| Pixel WiFi CSI through-wall sensing | Hardware + GrapheneOS isolation |
| iCloud / Google Drive as key store | Breaks Destroy = Restart |
| Public DNS for `sentinel.viewer` | Local claim only |
| Unofficial “GrapheneOS” images | Only [grapheneos.org](https://grapheneos.org/) |
| DRM-only appliances with no user runtime | Cannot run open stack |

---

## 9. Recommended pairs (no new purchases)

1. **Acer Linux ↔ Pixel 7 GrapheneOS (Android\*)** — primary design pair  
2. **Acer ↔ any Linux SBC with HDMI** — lab optical tests  
3. **Steam Deck / Linux mini PC ↔ Android\* receive** — same topology  
4. **Encode on any Yes-core device, transfer ciphertext by USB** — until camera path used  

---

## 10. Checklist before claiming a new device “works”

- [ ] age round-trip on device  
- [ ] RDH embed/extract + checksum OK  
- [ ] No plaintext in shared/cloud storage  
- [ ] Keys only in Vault; wipe procedure documented  
- [ ] Optical (if claimed): quality gate + LT peel on real frames  
- [ ] No Meta/Google/Microsoft required for those steps  
- [ ] If Android\*: OS obtained from **https://grapheneos.org/** when claiming GrapheneOS  

---

## Related

- Install: [INSTALL.md](./INSTALL.md)  
- Security: [rdh/SECURITY.md](./rdh/SECURITY.md)  
- Issue: https://github.com/Sentinel-Archetecht/The-Remote-Viewer/issues/38  
- **GrapheneOS:** https://grapheneos.org/ · https://grapheneos.org/install/  
