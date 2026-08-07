# The Remote Viewer (native social)

> **The Remote Viewer uses the network. The Sentinel (core) does not require this.**

## Run

```bash
cd apps/remote-viewer
python3 -m http.server 8777 --bind 127.0.0.1
# http://127.0.0.1:8777/
```

Loads `nostr-tools` from the network for N3/N4 (expected).

## Status

| Surface | Status |
|---------|--------|
| Directory + draft | **N2** |
| Persona + proof attach | **N2** |
| Keys / relays / E2E DM / inbox | **N3** |
| Signed notes publish (kind:1) | **N4** |
| Local note drafts | **N4** |
| Following list | **N4** |
| Unranked chronological feed | **N4** |
| Optional hashtags on notes | **N4** |

**nsec** browser-local only. Never commit.

Locks: `docs/locked/18` · `19` · `20`
