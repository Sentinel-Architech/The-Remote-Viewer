# Published Validator List

**Status:** Design (public)  
**Last aligned:** 2026-08-13  
**Authority:** This file + `docs/public/BEACON.md` + `docs/public/PATH-B-MULTI-VALIDATOR.md`

Stage 1+ recognition only counts validators that appear in the **current published list** for the active epoch **and** pass liveness (`BEACON.md`).

---

## Hard rules

- List is public and offline-copyable (file, optical, or any non-custodial channel)
- No platform or originator-controlled registry is required to *read* the list
- Changes to the list or epoch are published before they take effect
- A validator’s beacon `validator=` field must match an entry’s `id`
- A validator’s beacon signature must verify under that entry’s `pubkey`

---

## File format (normative)

JSON Lines or a single JSON document. Minimal schema:

```json
{
  "epoch": 1,
  "published_at": "2026-08-13T00:00:00Z",
  "threshold": { "type": "m-of-n", "m": 2, "n": 3 },
  "validators": [
    {
      "id": "age1ywu6paslwltju256eyypa7rz68quzq8v5n0q3vg5h8ez8h2jppusjgkke0",
      "pubkey_pem_sha256": "<sha256 of the PEM public key file>",
      "pubkey_pem": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n",
      "transports": ["optical", "file"],
      "weight": 1,
      "notes": "optional"
    }
  ]
}
```

### Field rules

| Field | Meaning |
|-------|--------|
| `epoch` | Must match beacon `epoch` |
| `id` | Exact string used in beacon `validator=` |
| `pubkey_pem` | OpenSSL ed25519 public key (PEM) used to verify beacon `sig` |
| `pubkey_pem_sha256` | Integrity aid for copies of the list |
| `transports` | Claimed transports (informational; liveness is proven by beacon check) |
| `weight` | Used in Stage 2; Stage 1 may treat all as 1 |
| `threshold` | Recognition rule for this epoch |

---

## Identity binding

1. The operator chooses a public **id** (recommended: the same `age1…` or `npub…` they already use elsewhere, or a dedicated beacon id).
2. They generate an ed25519 keypair (`modules/beacon/README.md`).
3. The **id** string is what appears in every beacon’s `validator=` field.
4. The **pubkey** is what verifiers use with `check.sh --pubkey`.
5. The pair `(id, pubkey)` is what gets published in this list.

There is no requirement that `id` be an age key or a Nostr key — only that it is stable, public, and bound to the signing pubkey in the list.

---

## Verification algorithm (with list)

1. Load list for claimed `epoch`.
2. Find entry where `entry.id == beacon.validator`.
3. Verify beacon signature with `entry.pubkey_pem`.
4. Apply freshness rules from `BEACON.md`.
5. If all pass → validator is **active** for that epoch.

Only active validators count toward `threshold`.

---

## Distribution

Any offline or non-custodial means:

- File in the repo / release artifact
- Optical QR of the list hash + separate file transfer
- Public append-only log the operator controls

No single required URL.

---

## Non-goals

- On-chain registry as a requirement
- Originator-only write access after Stage 1 is live
- Silent list edits
- Binding that requires a platform account
