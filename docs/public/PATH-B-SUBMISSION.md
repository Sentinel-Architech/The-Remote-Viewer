# Path B Submission & Recognition Flow

**Status:** Defined — 2026-08-13  
**Depends on:** `docs/public/PATH-B-FINISHED.md` + `modules/path-b-recognition/`

This document defines the minimal, offline-capable path from Independent Completion to Founding Member recognition and Integrity Verifier option.

---

## 1. Builder Side (Independent Completion)

```bash
# On the builder device
bash modules/path-b-recognition/collect-proof.sh
bash modules/path-b-recognition/make-attestation.sh
```

Result: `$HOME/.local/share/remote-viewer/path-b-recognition/path-b-attest-*.json`

The attestation is bound to the builder’s local identity path (recipient_hint when present). Private keys never leave the device.

---

## 2. Submission

Transfer the `path-b-attest-*.json` file (or an optical frame / QR of it) to the originator by any offline or out-of-band method the builder chooses:

- File copy / USB / air-gap optical path
- Encrypted channel of the builder’s choice
- Any method that does not require the originator to hold builder private keys

No platform custody. No mandatory network service.

---

## 3. Originator Re-verification

```bash
# On the originator device
bash modules/path-b-recognition/verify-submission.sh /path/to/received-path-b-attest-*.json
```

The script checks:
- overall_ok == 1
- required fields present
- proof_sha256 consistency (when the companion proof file is also supplied)
- basic structural integrity

If the attestation passes, the originator may issue recognition.

---

## 4. Issuance of Founding Member Attestation

```bash
bash modules/path-b-recognition/issue-founding.sh /path/to/verified-path-b-attest-*.json
```

Produces a signed (hash-committed) Founding Member attestation that:
- References the original Path B attestation
- Records the builder’s recipient_hint (public only)
- Explicitly grants the Integrity Verifier option
- States that Destroy = Restart extinguishes the status
- Contains no private material

The originator returns this file (or optical frame) to the builder by the same offline/out-of-band channel.

---

## 5. Explicit Limits

- Recognition does **not** waive pack prices or grant free catalog items.
- No yield, no custody, no permanent privilege beyond the identity path.
- Multiple machines under one identity path do not multiply weight.
- The originator retains sole authority to accept or reject any submission under the published FINISHED standard.

---

## 6. After Recognition

The builder places the returned Founding Member attestation in their local identity surface.  
The Integrity Verifier option then becomes available under the permanent constraints of `docs/locked/17-Validator-Node-First-Role.md`.

Wiring of the returned attestation into the local UI is the next sequential step.
