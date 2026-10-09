# Standalone installers

Run the installer for the machine you are on. Android requires `ANDROID_NDK_HOME`. iOS requires a Mac with Xcode. These scripts do not produce a signed store package by themselves.

- Windows: `powershell -File installers/install-windows.ps1`
- macOS: `sh installers/install-macos.command`
- Linux: `sh installers/install-linux.sh`
- Android: `sh installers/install-android.sh`
- iOS: `sh installers/install-ios.sh`
