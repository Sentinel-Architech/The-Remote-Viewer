#!/data/data/com.termux/files/usr/bin/bash
cd "$(dirname "$0")"
while true; do
    cargo run --bin sentinel-daemon >> server.log 2>&1
    sleep 2
done
