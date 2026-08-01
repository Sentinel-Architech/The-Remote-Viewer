#!/data/data/com.termux/files/usr/bin/bash
# Sentinel Standard — full age → Soliton LT → peel → decrypt (local only)
# Requires: $HOME/vault-recipient.txt and $HOME/vault-identity.txt
set -euo pipefail
cd "$HOME/The-Remote-Viewer/optical-airgap/rust"
RECIP=$(cat "$HOME/vault-recipient.txt")
MSG="${1:-secret viewer message}"
echo "$MSG" | cargo run --quiet --bin trv-optical -- encrypt "$RECIP" > "$HOME/ct.bin"
cargo run --quiet --bin trv-optical -- frame-stream 32 0 < "$HOME/ct.bin" > "$HOME/trvl.txt"
cargo run --quiet --bin trv-optical -- frame-peel < "$HOME/trvl.txt" > "$HOME/ct2.bin"
cargo run --quiet --bin trv-optical -- decrypt "$HOME/vault-identity.txt" < "$HOME/ct2.bin"
rm -f "$HOME/ct.bin" "$HOME/ct2.bin" "$HOME/trvl.txt"
