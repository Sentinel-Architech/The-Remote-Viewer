# The Remote Viewer — Messaging

> **The Remote Viewer uses the network. The Sentinel (core) does not require this.**

## Transport (locked)

| Mode | Use |
|------|-----|
| **Nostr E2E DM** | Default peer messaging |
| **age-addressed drop** | Offline / optical fallback |

Design lock: [`docs/locked/19-Messaging-Transport.md`](../locked/19-Messaging-Transport.md)

---

## 1. Nostr (primary)

### Keys

- Generate in a **Nostr client** you trust (not inside The Sentinel vault).
- Publish **npub** on your [persona](personas/) only.
- **nsec** stays on your device. Never put it in git, chat with the seller, or VIEWERS.md.

### Find someone

1. Open [`VIEWERS.md`](VIEWERS.md) or their `docs/public/personas/<alias>.md`
2. Copy their **npub** if listed
3. In your Nostr client: start DM to that npub

### Client notes (GrapheneOS)

- Prefer clients that support encrypted DMs and do not require Google services
- Obtainium / F-Droid / direct APK from project you verify — your threat model
- Relay list is yours to choose; public relays see metadata (who talks timing), not your nsec

### Persona field

Add to your persona table:

```markdown
| **npub** | npub1… |
```

---

## 2. age-drop (fallback)

When you will not use relays:

1. Agree out-of-band on a **social** age recipient (`age1…`) — separate from Sentinel vault identity when possible
2. Encrypt the message file to that recipient
3. Deliver via any path you both accept (file, TRVL frames, optical)

```bash
# example — adjust paths
age -r age1peerpubkey -o msg.age msg.txt
# peer:
age -d -i social-identity.txt msg.age
```

Optional: wrap with TRVL using Sentinel optical tools for air-gap transfer.

---

## 3. What this is not

- Not a global feed or algorithm
- Not required to run The Sentinel or buy packs
- Not a place for vault keys or seed phrases
- Not operator-mediated support chat (peer-to-peer)

## Related

- [`personas/README.md`](personas/README.md)
- [`VIEWERS.md`](VIEWERS.md)
- [`docs/locked/18-Sovereign-Social-Layer.md`](../locked/18-Sovereign-Social-Layer.md)
