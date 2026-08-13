# Path B Recognition Package

**Status:** Operational scaffold — 2026-08-13  
**Authority:** `docs/public/PATH-B-FINISHED.md` + locked docs 04 / 17

This package lets an independent builder produce an optical-transferable or file-based attestation that they have met the Path B “FINISHED” minimum standard.

## What it does

1. `collect-proof.sh` — runs the five required checks and gathers local evidence.
2. `make-attestation.sh` — packages the evidence into a signed, transferable attestation file.

The resulting attestation can be moved by file copy or optical air-gap (QR / camera path). No continuous network and no platform custody are required for validity.

## Usage (on the builder device)

```bash
# From repo root
bash modules/path-b-recognition/collect-proof.sh
bash modules/path-b-recognition/make-attestation.sh
```

Output lands in:
`$HOME/.local/share/remote-viewer/path-b-recognition/`

Transfer the final `path-b-attest-*.json` (or its optical frame) to the originator for re-verification.

## Explicit limits

- This package never requests or stores AGE-SECRET-KEY material.
- It never claims free packs or yield.
- Recognition is extinguished by Destroy = Restart.
- Multiple machines under one identity path do not multiply weight.
