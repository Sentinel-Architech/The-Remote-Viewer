# The Remote Viewer (native social)

> **The Remote Viewer uses the network. The Sentinel (core) does not require this.**

## Run

```bash
cd apps/remote-viewer
python3 -m http.server 8777 --bind 127.0.0.1
# http://127.0.0.1:8777/
```

Messages tab loads `nostr-tools` from the network (esm.sh). That is expected for this labeled network app.

## Status

| Surface | Status |
|---------|--------|
| Directory + draft row | **N2** |
| Persona + proof attach | **N2** |
| Generate/import nsec, npub | **N3** |
| Relays | **N3** |
| Send NIP-04 DM | **N3** |
| Fetch inbox | **N3** |
| Signed notes | **N4** gated |

**nsec** stays in browser `localStorage` only. Never commit it.
