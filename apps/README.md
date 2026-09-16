# Client Applications

**Updated:** 2026-08-20

| Client | Path | Status |
|--------|------|--------|
| **Viewer Hub** | [`hub/`](hub/) | **HOST PARTIAL** — canon the-remote-viewer.grok.me (`/` `/login` up; `/hub*` 404 until Re-Publish) |
| Local operator UI | [`ui/`](ui/) | PROVEN local static UI (`serve-ui.sh`) |
| Vanilla remote-viewer | [`remote-viewer/`](remote-viewer/) | Legacy local HTML |
| Web Vite shell | [`web/`](web/) | **Old scaffold** — not the product UI. Use `hub/` |
| Expo mobile | [`mobile/`](mobile/) | **PARKED / SCAFFOLD** — not an app-store client |
| Shared types | [`shared/`](shared/) | Types / constants for the parked mobile+web shells |
| **Command Deck** | [`command-deck/`](command-deck/) | **LIVE** Synapse + God's Eye, red/blue lens, Mesh Board, HUB |

## Viewer Hub (the real DApp)

Source: [`apps/hub`](hub/).  
Canon (HOST PARTIAL): [the-remote-viewer.grok.me](https://the-remote-viewer.grok.me) — `/hub*` dark until Re-Publish

This is a production Viewer surface (TanStack Start, Better Auth, PGLite/Neon). It is **not** a claim that locked Phase 2 crypto (SD-JWT, OpenID4VCI, hardware Keystore, burn) is implemented. Those remain in [`docs/locked/`](../docs/locked/).

Citizen lock on the hub is an **on-device hash**. Destroy = Restart still applies to age keys on the local path.

## What must not be contradicted

- Do **not** describe “web & mobile clients” as if both were still scaffolds. **Web product = `apps/hub` (LIVE). Mobile Expo = still scaffold.**
- Do **not** run `apps/web` and expect the Sentinel hub. You will get the old notice.
- Do **not** read hub-live as Solana-live. Chain remains SCAFFOLD.

```
apps/
├── hub/            # Viewer Hub DApp (HOST PARTIAL until Re-Publish)
├── ui/             # Local operator UI (PROVEN)
├── remote-viewer/  # Legacy vanilla
├── web/            # Old Vite scaffold (superseded by hub/)
├── mobile/         # Expo scaffold (PARKED)
├── command-deck/   # LIVE Command Deck (Synapse / God's Eye)
└── shared/         # Shared types for web/mobile scaffolds
```

## Command Deck

Synapse + God's Eye field, Mesh Board, HUB, Internal Affairs. Source: [`apps/command-deck`](./command-deck).
