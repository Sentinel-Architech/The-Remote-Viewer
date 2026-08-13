# Path B Recognition Package

**Status:** Operational end-to-end — 2026-08-13  
**Authority:** `docs/public/PATH-B-FINISHED.md` + `docs/public/PATH-B-SUBMISSION.md` + locked docs 04 / 17

Complete offline loop for Independent Completion → Founding Member recognition → Integrity Verifier option.

## Builder flow

```bash
bash modules/path-b-recognition/collect-proof.sh
bash modules/path-b-recognition/make-attestation.sh
# Transfer path-b-attest-*.json (file or optical) to originator
```

## Originator flow

```bash
bash modules/path-b-recognition/verify-submission.sh /path/to/received-path-b-attest-*.json
bash modules/path-b-recognition/issue-founding.sh /path/to/verified-path-b-attest-*.json
# Return founding-member-*.json to builder
```

## Builder activation (local identity surface)

```bash
bash modules/path-b-recognition/install-founding.sh /path/to/received-founding-member-*.json
bash modules/path-b-recognition/status.sh
```

Once installed, the Integrity Verifier option is available for this identity path:

```bash
bash modules/integrity-verifier/attest.sh
```

## Explicit limits

- Never requests or stores AGE-SECRET-KEY material.
- Never claims free packs or yield.
- Recognition is extinguished by Destroy = Restart.
- Multiple machines under one identity path do not multiply weight.
- Originator retains sole authority to accept or reject under the published FINISHED standard.

See `docs/public/PATH-B-SUBMISSION.md` for the full defined flow.
