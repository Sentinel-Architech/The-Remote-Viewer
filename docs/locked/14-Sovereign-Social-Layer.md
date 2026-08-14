# Sovereign Social Layer (Locked)

**Status:** Locked — 2026-08-14  
**Phase:** Design foundation (implementation follows identity Phase 1 primitives)  
**Depends on:** `01-Identity-Layer.md`, `03-Destroy-Equals-Restart.md`, `09-Wallet-Architecture.md`, `12-Residual-Data-and-Phishing.md`, `13-Burn-Confirmation-Language.md`

---

## 1. Purpose

The Remote Viewer is a social connection of its own.

Social relationships (follows, connections, local contact list, TRV-held private messages) are first-class state belonging to the Viewer identity path. They are not rented from X, not owned by a platform graph, and not recoverable by The Remote Viewer after a confirmed burn.

This document locks the architectural rules so implementation cannot drift into a conventional social network with a central honeypot.

---

## 2. Core Decision

**Hybrid sovereign social:**

| Layer | Role |
|-------|------|
| **On-device connection list** | Source of truth for who this identity path considers a connection. Stored only on the device (or user-controlled encrypted export). |
| **Optional public publication** | Profile metadata and follow events may be published to Nostr relays (or equivalent open protocols) so other clients can discover and interoperate. Publication is user-initiated and optional. |
| **Private messaging** | TRV-held DMs are encrypted to the recipient’s public key and stored locally or delivered via optical / peer / relay paths the user chooses. No project-operated message archive. |
| **External links** | Linking an X (or other) account remains optional and secondary. It does not become the source of truth for TRV connections. |

---

## 3. Non-Negotiable Rules

1. **No central social graph**  
   The project never operates a server that stores the authoritative list of who follows whom across all users.

2. **Social state dies with the identity path**  
   When Destroy = Restart is confirmed (high-friction local gate: typed full DID + final confirmation), all TRV-held social state for that path is destroyed: local connection list, TRV-held DMs, local profile cache tied to the path. Platform recognition of that path’s social presence is dropped.

3. **Keys stay local**  
   Connection and message signing uses the same identity keys already governed by the Identity Layer (`did:key` / compatible key material). No separate platform social key that survives burn.

4. **No email or phone as social or burn factor**  
   Social features and burn confirmation never require or store email or phone number.

5. **Portability**  
   A Viewer must be able to export their local connection list and relevant public keys. They must be able to leave with the cryptographic ability to prove the same relationships elsewhere (e.g. via Nostr follow events they previously published).

6. **Optical / local establishment is first-class**  
   Two Viewers can establish a connection by exchanging public keys via QR / optical air-gap / local channel without any network or relay. That connection is recorded in each party’s on-device list.

---

## 4. Identity Binding

- Primary identifier for social purposes: the TRV identity path’s `did:key` (and, where published, a corresponding npub / Nostr public key derived or associated under user control).
- Existing mobile surfaces (Viewer ID / npub, profile, private message flows, Hub / Talk) are brought under this model rather than replaced wholesale.
- A connection is a signed assertion “this identity path follows / is connected to that public key,” held locally and optionally published.

---

## 5. Destroy = Restart Interaction

| Asset | Outcome on confirmed burn |
|-------|---------------------------|
| Local connection list for the path | Deleted |
| TRV-held private messages for the path | Deleted |
| Local profile / display state for the path | Deleted |
| Previously published Nostr (or similar) events | Remain on relays as historical public data; the path’s ability to continue that social identity ends because the keys are gone |
| External platform accounts (X, etc.) | Unaffected; user manages those separately |
| New identity path created later | Starts with empty social state; no automatic inheritance |

Burn confirmation follows the high-friction local rules in `13-Burn-Confirmation-Language.md`.

---

## 6. Implementation Order (Guidance)

1. On-device connection list (add / remove / list) bound to current `did:key`, wiped on destroy.  
2. Local / optical key exchange to establish a connection without network.  
3. Optional profile + follow event publication (Nostr-compatible) under user control.  
4. Align existing private-message and Talk surfaces with the same identity and burn rules.  
5. Export of connection list for portability.

Full relay infrastructure or global discovery is not required for the first working slice.

---

## 7. Explicit Non-Goals

- Project-operated follow graph or recommendation engine that stores personal social data.  
- Social recovery of a burned path via contacts.  
- Mandatory linking to any external social network.  
- Phone-number or email-based contact discovery as a core feature.  
- Any design that lets the platform restore social state after burn.

---

## 8. Relationship to Other Locked Documents

- `01` / `09` — Social layer uses the same identity and Hybrid wallet boundaries.  
- `03` / `13` — Burn is absolute and high-friction; social state is in scope.  
- `12` — Residual data rules apply; no resurrection via social artifacts the platform holds.  
- Existing demonstrated mobile surfaces (npub, profile, private messages, Hub/Talk) are implementations that must converge on this locked model.

---

## 9. Final Statement

The Remote Viewer is a social connection of its own because the connections belong to the Viewer, live with the identity path, and die with it.

No central graph. No phone. No email. No platform resurrection.

**Connect locally. Publish optionally. Burn completely.**
