# Path B Recognition Package

**Status:** Operational end-to-end — 2026-08-13  
**Authority:** `docs/public/PATH-B-FINISHED.md` + `docs/public/PATH-B-SUBMISSION.md` + locked docs 04 / 17  
**Liveness:** `docs/public/BEACON.md` + `docs/public/VALIDATOR-LIST.md`

Complete offline loop for Independent Completion → Founding Member recognition → Integrity Verifier option.

## Builder flow

```bash
bash modules/path-b-recognition/collect-proof.sh
bash modules/path-b-recognition/make-attestation.sh
# Transfer path-b-attest-*.json (file or optical) to originator / validators
```

## Issuer flow

### Stage 0 (escape hatch)

```bash
export TRV_PATH_B_STAGE0=1
bash modules/path-b-recognition/verify-submission.sh /path/to/path-b-attest-*.json
bash modules/path-b-recognition/issue-founding.sh /path/to/verified-path-b-attest-*.json
```

### Stage 1 (list + live beacon required)

Once a published validator list exists (epoch-1 bootstrap or later):

```bash
# Issuer must be beaconing
bash modules/beacon/emit.sh --validator '<id>' --key $HOME/trv-beacon/validator.pem --once

bash modules/path-b-recognition/verify-submission.sh /path/to/path-b-attest-*.json
bash modules/path-b-recognition/issue-founding.sh /path/to/verified-path-b-attest-*.json
# require-active runs automatically when list is present
```

Force Stage 1 even without auto-detect:

```bash
export TRV_PATH_B_REQUIRE_LIVENESS=1
export TRV_VALIDATOR_LIST=$HOME/The-Remote-Viewer/docs/public/validator-list-epoch-1.json
```

## Builder activation

```bash
bash modules/path-b-recognition/install-founding.sh /path/to/received-founding-member-*.json
bash modules/path-b-recognition/status.sh
```

## Explicit limits

- Never requests or stores AGE-SECRET-KEY material.
- Never claims free packs or yield.
- Recognition is extinguished by Destroy = Restart.
- Multiple machines under one identity path do not multiply weight.
- Bootstrap list is 1-of-1 (Stage 0 equivalent) until additional validators publish and threshold rises.

See `docs/public/PATH-B-SUBMISSION.md` for the full defined flow.
