# Desktop install — two tracks

**There is no required cloud account.** “Login” on the easy path means **local unlock** of device-held keys, not Google/GitHub/SSO.

---

## Track A — Barebones (build it yourself)

For people who want the stack plain.

```bash
git clone https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
git checkout TheRemoteViewer

# Optional: age CLI
# Debian/Ubuntu: sudo apt install age
# macOS: brew install age

# Identity (local only)
mkdir -p ~/.local/share/remote-viewer/identity
chmod 700 ~/.local/share/remote-viewer/identity
age-keygen -o ~/.local/share/remote-viewer/identity/identity.agekey
chmod 600 ~/.local/share/remote-viewer/identity/identity.agekey

# Optical e2e needs vault files — see optical-airgap/INSTALL.md
# MoE needs llama.cpp + GGUF — see modules/moe-router/WEIGHTS.md

# Browser UI (localhost only)
bash apps/ui/serve-ui.sh
# open http://127.0.0.1:8765/
```

No installer. No account. You own every step.

---

## Track B — Click-path desktop (optional convenience)

Still **local**. The installer only:

1. Checks git / python3 / age (if present)
2. Clones or updates the repo
3. Offers **local unlock** (passphrase-protected age identity) when you choose it
4. Starts the localhost UI

```bash
curl -fsSL https://raw.githubusercontent.com/Sentinel-Archetecht/The-Remote-Viewer/TheRemoteViewer/scripts/desktop-install.sh -o /tmp/trv-desktop-install.sh
bash /tmp/trv-desktop-install.sh
```

Or from an existing clone:

```bash
bash scripts/desktop-install.sh
```

### What “login” means here

| Word | Meaning in TRV |
|------|----------------|
| Login / unlock | Unlock **local** identity material on this machine |
| Account | **None** required — no TRV cloud user |
| Password | Optional passphrase you set for local key wrap |
| Logout | Lock session / clear agent memory of passphrase |

If you never set a passphrase, identity files stay mode `600` and you use them directly (Track A style).

---

## Non-goals

- Mandatory OAuth / SSO  
- Hosted model API as the core path  
- Phone-home telemetry from the installer  

Barebones remains the reference. Track B is sugar on top of the same tree.
