# Path B Recognition Package

**Status:** Operational — 2026-08-13  
**Authority:** `docs/public/PATH-B-FINISHED.md` + `docs/public/PATH-B-SUBMISSION.md` + locked docs 04 / 17

This package lets an independent builder produce an optical-transferable or file-based attestation that they have met the Path B “FINISHED” minimum standard, and lets the originator re-verify and issue Founding Member recognition.

## Builder flow

```bash
bash modules/path-b-recognition/collect-proof.sh
bash modules/path-b-recognition/make-attestation.sh
```

Output: `$HOME/.local/share/remote-viewer/path-b-recognition/path-b-attest-*.json`

Transfer the attestation (file or optical) to the originator.

## Originator flow

```bash
bash modules/path-b-recognition/verify-submission.sh /path/to/received-path-b-attest-*.json
bash modules/path-b-recognition/issue-founding.sh /path/to/verified-path-b-attest-*.json
```

Return the issued `founding-member-*.json` to the builder by the same offline channel.

## Explicit limits

- Never requests or stores AGE-SECRET-KEY material.
- Never claims free packs or yield.
- Recognition is extinguished by Destroy = Restart.
- Multiple machines under one identity path do not multiply weight.
- Originator retains sole authority to accept or reject under the published FINISHED standard.

See `docs/public/PATH-B-SUBMISSION.md` for the full defined flow.
