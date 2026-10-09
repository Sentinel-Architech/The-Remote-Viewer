# trv-holographic-ui

Native holographic surface for The Remote Viewer. One Rust core, one platform adapter per operating system. Browser backends are not compiled in.

| Operating system | GPU backend | Native surface |
| --- | --- | --- |
| Android, including GrapheneOS | Vulkan, then OpenGL ES | `ANativeWindow` |
| iOS and iPadOS | Metal | `UIView` |
| Mobile Linux (PinePhone, Librem, postmarketOS) | Vulkan, then OpenGL ES | Wayland `wl_display` + `wl_surface` |
| Windows on ARM and desktop Windows | DirectX 12, then Vulkan | `HWND` |
| Desktop Linux and macOS | Vulkan or Metal | Same raw handles as the mobile targets |

HarmonyOS without an Android-compatible native window, KaiOS, and feature-phone runtimes are not wgpu targets.

## Build

```bash
cargo build -p trv-holographic-ui --target aarch64-linux-android
cargo build -p trv-holographic-ui --target aarch64-apple-ios
cargo build -p trv-holographic-ui --target aarch64-unknown-linux-gnu
cargo build -p trv-holographic-ui --target aarch64-pc-windows-msvc
```

The desktop orchestrator can link this crate with `--features hologram`. That feature is off by default so existing desktop builds do not pull a GPU stack.

## C entry points

`init_holographic_engine_native` selects the host operating system at compile time. Explicit constructors are also exported: `trv_hologram_init_android`, `trv_hologram_init_ios`, `trv_hologram_init_wayland`, and `trv_hologram_init_win32`. Release the engine with `trv_hologram_destroy`.
