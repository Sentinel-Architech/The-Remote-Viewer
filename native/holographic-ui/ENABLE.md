# Enable the holographic feature

The desktop flag only links the crate. It does not open a surface by itself.

```bash
cargo build -p desktop --features hologram
cargo build -p trv-holographic-ui
```

Host builds:

```bash
cargo build -p trv-holographic-ui --target aarch64-linux-android
cargo build -p trv-holographic-ui --target aarch64-apple-ios
cargo build -p trv-holographic-ui --target aarch64-unknown-linux-gnu
cargo build -p trv-holographic-ui --target aarch64-pc-windows-msvc
cargo build -p trv-holographic-ui --target aarch64-unknown-linux-ohos
```

Android and HarmonyOS need the platform NDK on the build machine. iOS needs the Apple SDK. The OpenHarmony target is `aarch64-unknown-linux-ohos`.

From C or ArkUI, call `trv_hologram_init_harmonyos(oh_native_window, width, height, license, license_len, signature)`. A null return means failure; read `trv_hologram_last_error`.

KaiOS does not use this crate. Package `platforms/kaios` and install that package on the device.
