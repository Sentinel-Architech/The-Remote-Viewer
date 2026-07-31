# TRV Sovereign Optical Air-Gap Comms

Local-first, zero-trust optical transfer stack for The Remote Viewer.

## Design Goals (locked)
- Fully open-source
- Zero Meta / Google / Microsoft dependencies in core path
- Zero extra monetary cost
- Runs on Pixel 7 (GrapheneOS) + obsolete Acer + tablet
- Destroy = Restart is absolute
- Primary path is pure optical (screen → camera)
- Outside email only ever sees already-encrypted + stego’d blobs

## Pipeline
```
Plaintext
  → age / libsodium encryption          (on-device)
  → Reversible Data Hiding (RDH)        (Histogram Shifting or DE preferred)
  → LT Fountain encoding                (Robust Soliton)
  → Animated QR / multi-QR display
  → Camera capture + quality gate
  → LT peeling decoder
  → RDH extraction (perfect inverse)
  → Decryption
```

## Local Identity
Every Viewer receives a project-native address of the form:
```
anything@sentinel.viewer
```
This is a pure local claim bound to Vault / DID material. Never registered on public DNS.

## Status
- Scaffolding and design locked 2026-07-31
- Implementation begins with identity generation + age encryption + minimal LT/QR path
- WiFi CSI sensing on Pixel 7 + GrapheneOS is out of scope (hardware/OS limitations)

## Directory Layout
- `identity/` — local address generation
- `crypto/` — age / libsodium wrappers
- `rdh/` — reversible data hiding (start with histogram shifting)
- `fountain/` — LT encoder/decoder
- `optical/` — QR display + camera capture helpers
- `loop/` — recursive expert feedback hooks
