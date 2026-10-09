# Platform support

This repository is not one binary that runs unchanged on every operating system. The holographic surface is the shared native core. Each host supplies its own window.

| Platform | Status | Enable |
| --- | --- | --- |
| Android, GrapheneOS | Native crate, Vulkan then OpenGL ES | `trv_hologram_init_android` |
| iOS, iPadOS, tvOS | Native crate, Metal | `trv_hologram_init_ios` |
| Mobile Linux | Native crate, Wayland | `trv_hologram_init_wayland` |
| Windows, including Windows on ARM | Native crate, DirectX 12 then Vulkan | `trv_hologram_init_win32` |
| macOS | Native crate, Metal | same iOS/UIView or AppKit path via the host build |
| HarmonyOS / OpenHarmony | Native window entry | `trv_hologram_init_harmonyos` with `OHNativeWindow` from an XComponent |
| KaiOS 2.5 and 3.0 | Local Canvas 2D package, no WebGL | `platforms/kaios` |

HarmonyOS NEXT does not accept an Android `ANativeWindow`. The entry point expects the `OHNativeWindow` pointer delivered to `OnSurfaceCreatedCB`. Surface creation still depends on the device exposing Vulkan `VK_OHOS_surface` and on wgpu accepting that handle.

KaiOS applications are web packages. They have no Vulkan, Metal, or wgpu surface. The KaiOS package reproduces the same palette locally on Canvas 2D and does not use WebGL or a network fetch.

Feature phones outside KaiOS, and hosts with no native window and no Canvas, are not supported.
