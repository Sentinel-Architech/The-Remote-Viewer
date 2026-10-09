# Three steps

1. Clone `https://github.com/Sentinel-Architech/The-Remote-Viewer` and check out `TheRemoteViewer`.
2. Run `sh scripts/enable-hologram.sh` or `powershell -File scripts/enable-hologram.ps1`.
3. Call the native entry the script prints, or install `dist/trv-kaios.zip` on KaiOS.

This does not make the whole repository a native application, and it does not install Android, iOS, or HarmonyOS SDKs. Those SDKs cannot be fetched and configured in 30 seconds. The script checks the host holographic crate only when Cargo is already present.
