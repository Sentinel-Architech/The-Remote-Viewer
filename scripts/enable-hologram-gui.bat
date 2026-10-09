@echo off
cd /d "%~dp0\.."
py -3 scripts\enable-hologram-gui.py
if errorlevel 1 python scripts\enable-hologram-gui.py
