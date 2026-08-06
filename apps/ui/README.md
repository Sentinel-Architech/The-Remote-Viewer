# TRV Local Console (browser)

Not a terminal UI. Offline HTML served on **127.0.0.1 only**.

## Start

```bash
cd ~/The-Remote-Viewer
bash apps/ui/serve-ui.sh
```

Open on the phone browser:

`http://127.0.0.1:8765/`

Optional: `TRV_UI_PORT=8080 bash apps/ui/serve-ui.sh`

## Security

- Binds `127.0.0.1` — not `0.0.0.0`
- Does not execute shell
- Does not read age keys
- Copy commands into Termux yourself
