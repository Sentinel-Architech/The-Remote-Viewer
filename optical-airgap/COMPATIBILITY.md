# Optical Air-Gap — Device Compatibility

Target hardware for TRV sovereign optical path. **No Meta / Google / Microsoft stacks required** for the core crypto + RDH + LT path.

| Device | Role | Core (age + RDH + LT) | QR send | Camera receive | Notes |
|--------|------|----------------------|---------|----------------|-------|
| **Obsolete Acer (Linux)** | Primary build + sender | Yes | Yes (local browser or Rust CLI later) | Optional (webcam) | Node 20+ or `age` CLI; best first install target |
| **Pixel 7 + GrapheneOS** | Vault / receive / Termux | Yes (Termux) | Limited | Yes (when used) | Use F-Droid Termux; no Play Services dependency |
| **Tablet (generic)** | Secondary display / receive | Yes if Linux/Termux-class | Yes | Yes if camera API available | Wife’s tablet was used historically for ESP32 flashing only |
| **Termux (on Pixel or tablet)** | CLI crypto + scripts | Yes | No (no GUI QR unless browser) | Via Android intents later | `pkg install git nodejs age` |
| **ESP32 (Edge)** | Future Edge MFA / sensor | Partial (RDH/LT logic portable) | No | No | Firmware path separate; not required for Phase 1 optical |

---

## Compatible by design

### 1. Acer (obsolete Linux laptop)
**Status: fully supported for install and non-camera work.**

- Git + Node 20+ → `optical-airgap/crypto` + pipeline
- Optional: native `age` / `rage` CLI
- QR sender: open `optical/qr-sender.html` in a local browser (CDN QR until vendored)
- Future Rust binary: single static target `x86_64-unknown-linux-gnu`

### 2. Pixel 7 + GrapheneOS
**Status: supported for on-device Vault and Termux crypto; camera path when you choose to use the device.**

| Feature | Compatible? | Detail |
|---------|-------------|--------|
| age encrypt/decrypt | Yes | Termux Node or `pkg install age` |
| RDH / LT (compute) | Yes | Same pure logic; no Google APIs |
| Local `@sentinel.viewer` | Yes | Vault-bound claim |
| Screen QR display | Yes | Any local viewer / browser without Google account |
| Camera capture for receive | Yes when used | Platform camera; quality gate is software |
| WiFi CSI / through-wall | **No** | Broadcom + GrapheneOS isolation; locked out of scope |
| Google Play / GMS | **Not required** | Prefer F-Droid Termux |

Hardened profile fits Destroy = Restart: no cloud backup of Vault keys.

### 3. Tablet
**Status: compatible as second screen or Termux host if the OS allows sideload/F-Droid.**

- Same rules as Pixel if Android + Termux
- If locked OEM tablet with only Play Store: do **not** depend on it for core path
- Optical: can show QR from files generated on Acer

### 4. Cross-device optical pair (design target)

```
Acer (encode + display QR stream)
        │  light only
        ▼
Pixel 7 / tablet (camera → LT peel → RDH → age decrypt)
```

Or reverse: Pixel encodes, Acer webcam receives. Both directions are compatible once QR framing + receive UI exist (roadmap).

Wire format compatibility rules:

- **age** ciphertext interoperable across Go age, rage, TS `age-encryption`, Rust `age` crate
- **RDH** bit layout must stay identical if multiple languages implement it
- **LT** symbol framing must stay identical across encoder/decoder implementations

---

## Software stack compatibility

| Component | Acer Linux | Termux Node | Termux age CLI | Browser (local) | Future Rust binary |
|-----------|------------|-------------|----------------|-----------------|--------------------|
| `age-interface` / age | Yes | Yes | Yes | Via WASM later | Yes (`age` crate) |
| histogram RDH | Yes | Yes | N/A (needs host) | Yes | Yes |
| LT skeleton | Yes | Yes | N/A | Yes | Yes |
| encrypt-then-rdh | Yes | Yes | Partial | Yes | Yes |
| qr-sender.html | Yes | No | No | Yes* | Replace with CLI |
| Camera receive | Optional | Optional | No | Optional | Platform glue |

\*Temporary CDN for QR library — not air-gap pure until vendored.

---

## Explicitly incompatible / out of scope

- Devices that **require** Google account, Play Services, or Meta runtime for basic crypto
- Relying on Microsoft cloud identity for key storage
- Pixel 7 WiFi CSI sensing (hardware + GrapheneOS)
- Assuming public DNS for `@sentinel.viewer`

---

## Minimum viable compatible pair (no new purchases)

1. **Acer** — install per [INSTALL.md](./INSTALL.md) (Node 20+ or age CLI)
2. **Pixel 7 GrapheneOS + Termux** — same crypto path; camera later for receive
3. Optional **tablet** — QR display only if needed

You do **not** need both devices online at once for development. Encode offline on Acer; transfer test vectors by USB/SD if you refuse optical until receive UI exists.

---

## Checklist before claiming “works on device X”

- [ ] age round-trip on that device
- [ ] RDH embed/extract + `checksumOk` on that device
- [ ] No plaintext written to shared storage
- [ ] Keys only in Vault; Destroy = Restart documented for that OS
- [ ] For optical: fixed/manual exposure if available; quality gate rejects garbage frames

---

## Related docs

- [INSTALL.md](./INSTALL.md) — install steps per environment
- [README.md](./README.md) — overview + prerequisites
- [TECHNICAL.md](./TECHNICAL.md) — architecture and threat model
