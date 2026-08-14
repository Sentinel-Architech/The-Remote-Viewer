# Reproduce Proven Claims

**Authority:** This file + `docs/REALITY.md`  
**Reference environment:** GrapheneOS + Termux (or desktop Linux/macOS)  
**Last aligned:** 2026-08-13

## Goal
Any independent builder should be able to verify the PROVEN surfaces without private coordination.

## Minimal Bootstrap (desktop Linux or Termux)

```bash
# 1. Clone
git clone -b TheRemoteViewer https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer

# 2. Core tools
# age (https://github.com/FiloSottile/age)
# llama.cpp (optional, for MoE stages)
# jq, sha256sum, basic shell utilities
# Rust / cargo (Termux: `pkg install rust`)

# 3. Verify Hydra
bash modules/defense/integrity-pulse.sh
# Expected: RESULT: PASS (or clear quarantine instructions)

# 4. Optical air-gap self-test
bash optical-airgap/scripts/vault-setup.sh
bash optical-airgap/scripts/e2e-age-lt.sh "hello-sentinel-test"
# Expected: ==> e2e-age-lt OK
bash optical-airgap/scripts/vault-destroy.sh   # Destroy = Restart after test

# 5. Path B collect-proof
bash modules/path-b-recognition/collect-proof.sh
# Produce attestation offline; do not include private keys
```

## Expected Outcomes
- Hydra pulse returns PASS on a clean reference node.
- Optical pipeline produces a decryptable result under user control.
- Integrity Verifier can produce `overall_ok=1` attestation.
- No private keys or vault material leave the device.

## Measured Optical Result (Reference Hardware)

**Device:** GrapheneOS + Termux (Pixel-class)  
**Date:** 2026-08-13  
**Command:** `bash optical-airgap/scripts/e2e-age-lt.sh "hello-sentinel-test"`

```
==> keygen
==> encrypt
==> frame-stream (Soliton, exact-len)
frame-stream: k=11 block_size=32 symbols=55 mode=soliton exact-len
==> frame-peel
peel ok ingested=35 errors=0 exact_len=320
==> decrypt
hello-sentinel-test
==> e2e-age-lt OK
```

**Summary of this run**
- Full age → Robust Soliton LT → peel → decrypt succeeded.
- 0 decode errors.
- Local pipeline (no camera) is confirmed working on the reference device.

## Known Practical Limits (Optical)
- QR Version 40 ≈ 2.9 KB binary per frame (theoretical).
- Real-world phone camera throughput under normal conditions is typically low (often single-digit KB/s).
- Soliton LT improves reliability against lost frames; it does not remove the physical channel bottleneck.
- Large packs should use hybrid (file + optical) delivery.
- Camera-based transfer numbers are still to be measured under controlled lighting conditions.

## Threat Model
See [`docs/security/threat-model.md`](security/threat-model.md) for residual risks on the proven surfaces (manual delivery channel, originator-gated recognition, optical environmental variance, etc.).

## Notes
- Path B recognition is currently originator-verified.
- External finishers: 0 as of 2026-08-13.
- This file is for verification only. It does not grant Founding status.
