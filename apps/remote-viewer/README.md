# The Remote Viewer (native social)

> **The Remote Viewer uses the network. The Sentinel (core) does not require this.**

First-party social layer. Parallel to **The Sentinel** (core).

## Run

```bash
cd apps/remote-viewer
python3 -m http.server 8777 --bind 127.0.0.1
# open http://127.0.0.1:8777/
```

For public network use, serve over HTTPS on a host you control (banner still required).

## Status

| Surface | Status |
|---------|--------|
| Shell + tabs | **N1** |
| Directory (+ local draft row) | **N2** |
| Persona profile form | **N2** |
| Proof attach (claim / evidence / date) | **N2** |
| Export markdown + JSON | **N2** |
| Secret rejection heuristics | **N2** |
| In-app E2E send | **N3** (UI gated) |
| Signed notes | **N4** (UI gated) |

Locks: `docs/locked/18` · `19` · `20`
