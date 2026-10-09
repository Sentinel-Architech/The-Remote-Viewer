#!/usr/bin/env python3
"""Standalone GUI for Windows, macOS, Linux, Android, and iOS builds.

HarmonyOS and KaiOS are not offered. Buttons build locally and do not download binaries.
"""

from __future__ import annotations

import os
import platform
import shutil
import subprocess
import threading
from pathlib import Path

try:
    import tkinter as tk
    from tkinter import messagebox, scrolledtext
except ImportError:
    raise SystemExit("Tkinter is required.")

ROOT = Path(__file__).resolve().parents[1]


class App(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("The Remote Viewer installer")
        self.geometry("720x460")
        tk.Label(self, text="Supported: Windows, macOS, Linux, Android, iOS.").pack(anchor="w", padx=12, pady=(12, 0))
        row = tk.Frame(self)
        row.pack(fill="x", padx=12, pady=8)
        for label, script in (
            ("Windows", "install-windows.ps1"),
            ("macOS", "install-macos.command"),
            ("Linux", "install-linux.sh"),
            ("Android", "install-android.sh"),
            ("iOS", "install-ios.sh"),
        ):
            tk.Button(row, text=label, command=lambda s=script: self.run(s)).pack(side="left", padx=4)
        self.log = scrolledtext.ScrolledText(self, height=18, state="disabled")
        self.log.pack(fill="both", expand=True, padx=12, pady=12)
        self.write("Each button runs the matching local installer.")

    def write(self, line: str) -> None:
        self.log.configure(state="normal")
        self.log.insert("end", line + "\n")
        self.log.see("end")
        self.log.configure(state="disabled")

    def run(self, script: str) -> None:
        system = platform.system().lower()
        if script.endswith(".ps1") and system != "windows":
            messagebox.showinfo("Wrong host", "Run the Windows installer on Windows.")
            return
        if script.endswith(".command") and system != "darwin":
            messagebox.showinfo("Wrong host", "Run the macOS installer on a Mac.")
            return
        if script == "install-ios.sh" and system != "darwin":
            messagebox.showinfo("Wrong host", "The iOS installer must run on a Mac.")
            return
        if script == "install-android.sh" and not (os.environ.get("ANDROID_NDK_HOME") or os.environ.get("ANDROID_NDK_ROOT")):
            messagebox.showerror("NDK missing", "Set ANDROID_NDK_HOME. The NDK is not downloaded.")
            return
        if shutil.which("cargo") is None:
            messagebox.showerror("Rust missing", "Install Rust from https://rustup.rs first.")
            return
        path = ROOT / "installers" / script
        self.write(f"Running {path.name}")
        threading.Thread(target=self._run, args=(path,), daemon=True).start()

    def _run(self, path: Path) -> None:
        if path.suffix == ".ps1":
            command = ["powershell", "-File", str(path)]
        else:
            command = ["sh", str(path)]
        result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
        self.after(0, lambda: self.write((result.stdout + result.stderr).strip() or f"status {result.returncode}"))


if __name__ == "__main__":
    App().mainloop()
