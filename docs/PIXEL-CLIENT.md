# Pixel 7 / GrapheneOS

## Required awareness

- Source of truth is **GitHub** until `git pull` works.
- SSH pubkey: `~/.ssh/id_ed25519.pub` (already generated as `pixel7-trv`).
- Private key must never leave the device or be pasted into chat.
- Solana: wallet/devnet client only on phone.
- EVM: forge/anvil experiments OK in Termux.
- Expo Go: **no-go**; mobile UI scaffold parked.

## After GitHub access restored

```bash
ssh -T git@github.com
cd ~/The-Remote-Viewer && git pull origin TheRemoteViewer
ls solana contracts STATUS.md
```

Watch **Actions** on the repo for CI.
