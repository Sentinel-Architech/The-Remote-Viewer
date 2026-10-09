# Three-step host enablement for Windows.
# Step 1: clone. Step 2: run this script. Step 3: call the printed entry.
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
Write-Output "Host class: windows"
Write-Output "Native entry: trv_hologram_init_win32"
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
  Write-Output "Rust is not installed. Install it from https://rustup.rs and run this script again."
  exit 1
}
cargo check -p trv-holographic-ui
if (Get-Command Compress-Archive -ErrorAction SilentlyContinue) {
  New-Item -ItemType Directory -Force -Path dist | Out-Null
  Compress-Archive -Path platforms/kaios/* -DestinationPath dist/trv-kaios.zip -Force
  Write-Output "KaiOS package: dist/trv-kaios.zip"
}
Write-Output "Next: link the static library and call trv_hologram_init_win32 from the HWND."
