# The Remote Viewer (native social)

> **The Remote Viewer uses the network. The Sentinel (core) does not require this.**

First-party social layer. **Not** “install a third-party client and call it the product.”

## Run

```bash
cd apps/remote-viewer
python3 -m http.server 8777 --bind 127.0.0.1
# open http://127.0.0.1:8777/
```

For real network use, serve this app over HTTPS on a host you control (still show the banner).

## Status

| Surface | Status |
|---------|--------|
| Shell + tabs | **N1** |
| Directory render | **N1** bootstrap |
| Persona draft + markdown export | **N1/N2 start** |
| In-app E2E send | **N3** (UI gated) |
| Signed notes | **N4** (UI gated) |

Locks: `docs/locked/18` · `19` · `20`

## Relation to The Sentinel

| | The Sentinel | The Remote Viewer |
|--|--------------|---------------------|
| Path | `apps/ui` | `apps/remote-viewer` |
| Network | No | Yes (labeled) |
| Role | Core | Social |
