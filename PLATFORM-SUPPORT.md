# Platform support

HarmonyOS and KaiOS are not supported.

| Platform | Installer | Native entry |
| --- | --- | --- |
| Windows | `installers/install-windows.ps1` | `trv_hologram_init_win32` |
| macOS | `installers/install-macos.command` | Metal via the host build |
| Linux | `installers/install-linux.sh` | `trv_hologram_init_wayland` |
| Android, including GrapheneOS | `installers/install-android.sh` | `trv_hologram_init_android` |
| iOS and iPadOS | `installers/install-ios.sh` | `trv_hologram_init_ios` |

Each installer builds on the machine where it is run. None of them downloads an executable.
