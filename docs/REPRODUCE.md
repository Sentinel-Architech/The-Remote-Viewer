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

# 3. Verify Hydra
bash modules/defense/integrity-pulse.sh
# Expected: RESULT: PASS (or clear quarantine instructions)

# 4. Optical air-gap self-test (if age + camera path available)
# Follow optical-airgap/ scripts; expected: full age → LT → peel → decrypt cycle succeeds

# 5. Path B collect-proof
bash modules/path-b-recognition/collect-proof.sh
# Produce attestation offline; do not include private keys
```

## Expected Outcomes
- Hydra pulse returns PASS on a clean reference node.
- Optical pipeline produces a decryptable `.trvl` under user control.
- Integrity Verifier can produce `overall_ok=1` attestation.
- No private keys or vault material leave the device.

## Known Practical Limits (Optical)
- QR Version 40 ≈ 2.9 KB binary per frame.
- Real-world phone camera throughput under normal conditions is typically low (often single-digit KB/s).
- Soliton LT improves reliability against lost frames; it does not remove the physical channel bottleneck.
- Large packs should use hybrid (file + optical) delivery.

## Threat Model
See [`docs/security/threat-model.md`](security/threat-model.md) for residual risks on the proven surfaces (manual delivery channel, originator-gated recognition, optical environmental variance, etc.).

## Notes
- Path B recognition is currently originator-verified.
- External finishers: 0 as of 2026-08-13.
- This file is for verification only. It does not grant Founding status.
