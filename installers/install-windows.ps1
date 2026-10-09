$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) { throw "Install Rust from https://rustup.rs first." }
cargo build -p trv-holographic-ui --release
Write-Output "Windows library built. Call trv_hologram_init_win32 from the HWND."
