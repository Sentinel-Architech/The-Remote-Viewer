#!/usr/bin/env python3
"""Desktop GUI for host enablement and local Windows/macOS builds.

No remote binary is downloaded. No master private key is read or stored.
Viewer ids are generated locally and are not an API backdoor.
"""

from __future__ import annotations

import platform
import shutil
import subprocess
import threading
import uuid
import webbrowser
import zipfile
from pathlib import Path

try:
    import tkinter as tk
    from tkinter import messagebox, scrolledtext
except ImportError:
    raise SystemExit("Tkinter is required.")

ROOT = Path(__file__).resolve().parents[1]
RELEASE = "https://github.com/Sentinel-Architech/The-Remote-Viewer/releases"


def host_entry() -> str:
    system = platform.system().lower()
    if system == "windows":
        return "trv_hologram_init_win32"
    if system == "darwin":
        return "trv_hologram_init_ios"
    if system == "linux":
        return "trv_hologram_init_wayland"
    return "unsupported host"


class App(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("The Remote Viewer")
        self.geometry("760x520")
        tk.Label(self, text="Master verifier is in the repository. Master seed stays off GitHub.").pack(anchor="w", padx=12, pady=(12, 0))
        tk.Label(self, text=f"This host entry: {host_entry()}").pack(anchor="w", padx=12)
        row = tk.Frame(self)
        row.pack(fill="x", padx=12, pady=8)
        tk.Button(row, text="Build Windows on this PC", command=lambda: self.build("windows")).pack(side="left")
        tk.Button(row, text="Build macOS on this Mac", command=lambda: self.build("darwin")).pack(side="left", padx=8)
        tk.Button(row, text="Open release page", command=lambda: webbrowser.open(RELEASE)).pack(side="left")
        tk.Button(row, text="New viewer id", command=self.new_viewer).pack(side="left", padx=8)
        tk.Button(row, text="Package KaiOS", command=self.package_kaios).pack(side="left")
        self.log = scrolledtext.ScrolledText(self, height=20, state="disabled")
        self.log.pack(fill="both", expand=True, padx=12, pady=12)
        self.write("Download buttons build locally. They do not fetch an executable.")

    def write(self, line: str) -> None:
        self.log.configure(state="normal")
        self.log.insert("end", line + "\n")
        self.log.see("end")
        self.log.configure(state="disabled")

    def build(self, expected: str) -> None:
        system = platform.system().lower()
        if expected == "windows" and system != "windows":
            messagebox.showinfo("Wrong host", "A Windows build must be made on Windows. No cross-binary is downloaded.")
            return
        if expected == "darwin" and system != "darwin":
            messagebox.showinfo("Wrong host", "A macOS build must be made on a Mac. No cross-binary is downloaded.")
            return
        if shutil.which("cargo") is None:
            messagebox.showerror("Rust missing", "Install Rust from https://rustup.rs first.")
            return
        self.write("cargo build -p trv-holographic-ui --release")
        threading.Thread(target=self._build, daemon=True).start()

    def _build(self) -> None:
        result = subprocess.run(
            ["cargo", "build", "-p", "trv-holographic-ui", "--release"],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
        self.after(0, lambda: self.write((result.stdout + result.stderr).strip() or "build finished"))

    def new_viewer(self) -> None:
        member = uuid.uuid4().hex
        self.write(f"viewer id {member}")
        self.write("Sign it with scripts/issue-viewer-license.py and TRV_MASTER_KEY_FILE outside the repo.")

    def package_kaios(self) -> None:
        source = ROOT / "platforms" / "kaios"
        target = ROOT / "dist" / "trv-kaios.zip"
        target.parent.mkdir(exist_ok=True)
        with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as archive:
            for path in source.rglob("*"):
                if path.is_file():
                    archive.write(path, path.relative_to(source))
        self.write(f"KaiOS package: {target}")


if __name__ == "__main__":
    App().mainloop()
