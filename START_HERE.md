# START HERE — The Remote Viewer / The Sentinel

Welcome.  
This project is for people who want software that stays on *their* device and does not send private data to a company cloud.

You do not need to be an expert.  
If you can copy and paste commands into a terminal, you can try the basic parts.

---

## What this project actually does right now

| What works today | What does **not** work yet |
|------------------|---------------------------|
| Encrypt a short message, turn it into special frames, and decrypt it again (optical air-gap) | A full mobile app you download from an app store |
| Create a private key that never leaves your phone or computer | Live blockchain voting or a running network of nodes |
| Buy a digital pack with USDC and receive an encrypted file you unlock yourself | Automatic recovery of your keys if you lose them |
| Local chat with a small AI model that stays on your device | A public website that holds your identity |

The project follows one hard rule:  
**If you lose or destroy your private key, you start over.** There is no company that can restore it for you. This is intentional.

---

## The absolute simplest way to try it (5–10 minutes)

### On a normal computer (Windows / Mac / Linux)

1. Install the free encryption tool called **age** (you will need it later):
   - **Mac**: open Terminal and run `brew install age`
   - **Ubuntu / Debian**: `sudo apt install age`
   - **Windows**: download the latest release from https://github.com/FiloSottile/age/releases and put the `age.exe` and `age-keygen.exe` somewhere in your PATH

2. Open a terminal and run these commands one by one:

```bash
git clone -b TheRemoteViewer https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
bash modules/defense/integrity-pulse.sh
```

If the last command prints something about “PASS” or “RESULT”, the basic checks worked.

### On an Android phone with Termux (recommended for privacy)

1. Install **Termux** from F-Droid (not the Google Play version).
2. Inside Termux type these commands:

```bash
pkg update && pkg install git python nodejs age -y
git clone -b TheRemoteViewer https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
bash modules/defense/integrity-pulse.sh
```

---

## Next steps if you want to go further

- Want to encrypt and decrypt a real message the “optical” way?  
  Open the file `optical-airgap/INSTALL.md` and follow the steps there.

- Want to understand what is finished and what is still being built?  
  Read `docs/REALITY.md`. That file is the single source of truth.

- Want to buy a digital pack?  
  See the “Buy packs” section in the main [README.md](README.md).

---

## Important words explained simply

- **age** = a free, modern encryption tool (like a lock and key for files).  
  You create a private key (`age-keygen`) that only you should ever see.
- **Optical air-gap** = sending information by QR codes or camera so the two devices never need to be on the internet at the same time.
- **Destroy = Restart** = if you lose your private key, everything protected by that key is gone forever. This is a deliberate design choice for maximum privacy.
- **PROVEN** = the creator actually ran this on a real phone and it worked under real conditions.
- **SCAFFOLD** = the code structure exists but it is not finished or live on a public network yet.

You do not need to understand any of the advanced papers or Solana code to try the basic parts.

Questions? Open an Issue on GitHub and say you are a beginner. The project is still early and the documentation is being improved for people just starting out.
