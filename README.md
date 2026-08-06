# The Remote Viewer (TRV) / The Sentinel

Local-first sovereign stack: optical air-gap, device identity, MoE on-device, contribution ledger, Hydra integrity.

**Branch:** `TheRemoteViewer`  
**Reality status:** `docs/REALITY.md`

## Two install tracks

| Track | Who | Doc |
|-------|-----|-----|
| **A Barebones** | Build it yourself | [docs/INSTALL-DESKTOP.md](docs/INSTALL-DESKTOP.md) |
| **B Desktop convenience** | Scripted local setup + optional passphrase unlock + localhost UI | `scripts/desktop-install.sh` |

There is **no cloud login**. “Unlock” = local keys on your machine.

### Phone (GrapheneOS + Termux)

See existing optical / MoE / defense docs under `optical-airgap/`, `modules/`.

### Desktop UI

```bash
bash apps/ui/serve-ui.sh
# http://127.0.0.1:8765/
```

## License

See `LICENSE`.
