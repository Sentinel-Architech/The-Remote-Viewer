# Path B — Builder Guide (Independent Completion)

**Status:** Ready for first external builder — 2026-08-13  
**Authority:** `docs/public/PATH-B-FINISHED.md` + locked docs 04 / 17

This is the practical path for anyone who wants to become a **Founding Member** by independent work and receive the option to operate the Integrity Verifier.

---

## 0. Prerequisites

- GrapheneOS + Termux (preferred) or desktop Linux/macOS
- Ability to run bash scripts and install `age` / basic tools
- Willingness to keep private keys on-device only (Destroy = Restart)

```bash
git clone -b TheRemoteViewer https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
```

---

## 1. Meet the FINISHED checklist

You must demonstrate **all five** items on your own device (see `docs/public/PATH-B-FINISHED.md`):

1. Optical air-gap end-to-end (age → Soliton LT → peel → decrypt)
2. Local age identity used in a Path B USDC-memo → TRVL delivery cycle
3. Integrity Verifier produces `overall_ok=1` + recorded weight
4. Hydra integrity-pulse returns PASS
5. Local operator surface (UI or equivalent) operational

Helper that collects evidence:

```bash
bash modules/path-b-recognition/collect-proof.sh
```

If all five pass it will say so. Fix any failures and re-run.

---

## 2. Produce the attestation

```bash
bash modules/path-b-recognition/make-attestation.sh
```

Output: `$HOME/.local/share/remote-viewer/path-b-recognition/path-b-attest-*.json`

This file (or an optical frame of it) is what you transfer to the originator.

---

## 3. Submit

Transfer the attestation by any offline / out-of-band method you choose:

- File copy / USB / optical air-gap
- Encrypted channel of your choice

Do **not** send private keys. The originator only needs the attestation (and optionally the companion proof file).

---

## 4. Originator re-verification & issuance

The originator runs:

```bash
bash modules/path-b-recognition/verify-submission.sh /path/to/your-attest.json
bash modules/path-b-recognition/issue-founding.sh /path/to/verified-attest.json
```

and returns a `founding-member-*.json` to you by the same offline channel.

---

## 5. Activate on your device

```bash
bash modules/path-b-recognition/install-founding.sh /path/to/received-founding-member-*.json
bash modules/path-b-recognition/status.sh
```

You now hold Founding Member status and the Integrity Verifier option for this identity path.

```bash
bash modules/integrity-verifier/attest.sh
bash modules/nodes/count.sh
```

---

## Explicit limits

- No free packs. Catalog items remain paid.
- No yield, no custody, no permanent privilege beyond the identity path.
- Destroy = Restart extinguishes Founding status and the node option.
- Multiple machines under one identity path do not multiply weight or count.

---

## References

- Checklist: `docs/public/PATH-B-FINISHED.md`
- Full flow: `docs/public/PATH-B-SUBMISSION.md`
- Role constraints: `docs/locked/17-Validator-Node-First-Role.md`
- Recognition package: `modules/path-b-recognition/`
