# Published Validator List

**Status:** Design + bootstrap tooling (public)  
**Last aligned:** 2026-08-13  
**Authority:** This file + `docs/public/BEACON.md` + `docs/public/PATH-B-MULTI-VALIDATOR.md`

Stage 1+ recognition only counts validators that appear in the **current published list** for the active epoch **and** pass liveness (`BEACON.md`).

---

## Hard rules

- List is public and offline-copyable (file, optical, or any non-custodial channel)
- No platform or originator-controlled registry is required to *read* the list
- Changes to the list or epoch are published before they take effect
- A validator’s beacon `validator=` field must match an entry’s `id`
- A validator’s beacon signature must verify under that entry’s public key

---

## Bootstrap (current reality)

External Path B finishers: **0** (as of 2026-08-13).

The first published list is therefore a **1-of-1 bootstrap** containing only the originator. That is Stage 0 in practice. It exists so the list format, beacon binding, and tooling are real before additional validators exist.

**Escalation rule:** when `n >= 3` independent validators are published, republish with a real threshold (example: 2-of-3). Do not claim multi-validator recognition while `n == 1`.

### Generate local bootstrap list

```bash
export TRV_VALIDATOR_ID='age1…your-id'
bash modules/beacon/make-list.sh
# → $HOME/trv-beacon/validator-list.json
```

Optional: copy into the repo for public distribution:

```bash
cp $HOME/trv-beacon/validator-list.json docs/public/validator-list-epoch-1.json
```

---

## File format (normative)

```json
{
  "epoch": 1,
  "published_at": "2026-08-13T00:00:00Z",
  "threshold": { "type": "m-of-n", "m": 1, "n": 1 },
  "notes": "optional",
  "validators": [
    {
      "id": "age1…",
      "pubkey_pem_sha256": "<sha256 of PEM file>",
      "pubkey_pem_b64": "<base64 of PEM file>",
      "transports": ["optical", "file"],
      "weight": 1
    }
  ]
}
```

| Field | Meaning |
|-------|--------|
| `epoch` | Must match beacon `epoch` |
| `id` | Exact string used in beacon `validator=` |
| `pubkey_pem_b64` | Base64 of the OpenSSL ed25519 public key PEM |
| `pubkey_pem_sha256` | Integrity aid for copies |
| `transports` | Claimed transports (informational) |
| `weight` | Stage 2; Stage 1 may treat all as 1 |
| `threshold` | Recognition rule for this epoch |

---

## Identity binding

1. Choose a stable public **id** (age1…, npub…, or dedicated beacon id).
2. Generate ed25519 keypair (`modules/beacon/README.md`).
3. Beacon `validator=` **must** equal list `id`.
4. Beacon `sig` **must** verify with list public key.
5. Publish the `(id, pubkey)` pair in this list.

---

## Verification algorithm (with list)

1. Load list for claimed `epoch`.
2. Find entry where `entry.id == beacon.validator`.
3. Decode pubkey; verify beacon signature.
4. Apply freshness rules from `BEACON.md`.
5. If all pass → validator is **active** for that epoch.

Only active validators count toward `threshold`.

---

## Distribution

- File in the repo / release artifact
- Optical / air-gap copy
- Any public append-only surface the operator controls

No single required URL.

---

## Non-goals

- On-chain registry as a requirement
- Claiming multi-validator security while n=1
- Silent list edits
- Binding that requires a platform account
