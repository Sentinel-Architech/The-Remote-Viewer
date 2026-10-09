#!/usr/bin/env python3
"""GUI enablement for the holographic host crate.

Works on Windows, macOS, and desktop Linux where Python 3 includes Tk.
Android, iOS, HarmonyOS, and KaiOS do not run this window. KaiOS receives
a zip package. Mobile SDKs are not downloaded.
"""

from __future__ import annotations

import os
import platform
import shutil
import subprocess
import sys
import threading
import zipfile
from pathlib import Path

try:
    import tkinter as tk
    from tkinter import messagebox, scrolledtext
except ImportError:
    sys.stderr.write("Tkinter is not available in this Python install.\n")
    raise SystemExit(1)

ROOT = Path(__file__).resolve().parents[1]
KAIOS = ROOT / "platforms" / "kaios"
DIST = ROOT / "dist"


def detect() -> tuple[str, str]:
    if os.environ.get("OHOS_SDK_HOME"):
        return "harmonyos", "trv_hologram_init_harmonyos"
    if os.environ.get("ANDROID_NDK_HOME") or os.environ.get("ANDROID_NDK_ROOT"):
        return "android", "trv_hologram_init_android"
    system = platform.system().lower()
    if system == "windows":
        return "windows", "trv_hologram_init_win32"
    if system == "darwin":
        return "apple", "trv_hologram_init_ios"
    if system == "linux":
        return "linux", "trv_hologram_init_wayland"
    return "unknown", "see PLATFORM-SUPPORT.md"


class Installer(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("The Remote Viewer — holographic enablement")
        self.geometry("720x480")
        self.host, self.entry = detect()
        tk.Label(self, text="Step 1 of 3: this window is the installer.").pack(anchor="w", padx=12, pady=(12, 0))
        tk.Label(self, text=f"Host class: {self.host}").pack(anchor="w", padx=12)
        tk.Label(self, text=f"Native entry: {self.entry}").pack(anchor="w", padx=12)
        tk.Label(
            self,
            text="Step 2: check the host crate. Step 3: package KaiOS, then call the native entry from the device window.",
        ).pack(anchor="w", padx=12, pady=(0, 8))
        buttons = tk.Frame(self)
        buttons.pack(fill="x", padx=12)
        tk.Button(buttons, text="Check native crate", command=self.check_crate).pack(side="left")
        tk.Button(buttons, text="Package KaiOS", command=self.package_kaios).pack(side="left", padx=8)
        self.log = scrolledtext.ScrolledText(self, height=18, state="disabled")
        self.log.pack(fill="both", expand=True, padx=12, pady=12)
        self.write("Ready. Rust must already be installed for the crate check.")

    def write(self, line: str) -> None:
        self.log.configure(state="normal")
        self.log.insert("end", line + "\n")
        self.log.see("end")
        self.log.configure(state="disabled")

    def check_crate(self) -> None:
        if shutil.which("cargo") is None:
            messagebox.showerror("Rust missing", "Install Rust from https://rustup.rs, then run this check again.")
            return
        self.write("Running cargo check -p trv-holographic-ui")
        threading.Thread(target=self._run_check, daemon=True).start()

    def _run_check(self) -> None:
        result = subprocess.run(
            ["cargo", "check", "-p", "trv-holographic-ui"],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
        text = (result.stdout + result.stderr).strip() or "(no output)"
        self.after(0, lambda: self.write(text))
        if result.returncode == 0:
            self.after(0, lambda: self.write(f"Check passed. Next call: {self.entry}"))
        else:
            self.after(0, lambda: self.write(f"Check failed with status {result.returncode}."))

    def package_kaios(self) -> None:
        if not KAIOS.is_dir():
            messagebox.showerror("Missing package", f"KaiOS sources not found at {KAIOS}")
            return
        DIST.mkdir(exist_ok=True)
        target = DIST / "trv-kaios.zip"
        with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as archive:
            for path in KAIOS.rglob("*"):
                if path.is_file():
                    archive.write(path, path.relative_to(KAIOS))
        self.write(f"KaiOS package: {target}")
        self.write("Install that zip on KaiOS. It is Canvas 2D, not the native crate.")


if __name__ == "__main__":
    Installer().mainloop()
