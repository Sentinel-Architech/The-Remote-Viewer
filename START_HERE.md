# START HERE — The Remote Viewer / The Sentinel

Welcome.  
This project has two surfaces that both exist **right now**:

1. **Local-first tools** on *your* device (optical air-gap, age keys, Path B packs). Private data does not have to leave your machine.
2. **The Viewer Hub** — a hosted DApp Remote Viewers sign into to defend The Sentinel, keep a profile, and run Command.

You do not need to be an expert.  
If you can open a browser, you can use the hub. If you can paste commands into a terminal, you can try the local tools.

---

## What this project actually does right now

| What works today | What does **not** work yet |
|------------------|---------------------------|
| **Viewer Hub** — sign-in, age/OFAC gate, daily watch (intercept + claim), optional briefing, profile vault, public card | A full mobile app you download from an app store |
| Encrypt a short message, turn it into special frames, and decrypt it again (optical air-gap) | Live blockchain voting or a running Solana governance network |
| Create a private key that never leaves your phone or computer | Automatic recovery of your keys if you lose them (this will never be a company service) |
| Buy a digital pack with USDC and receive an encrypted file you unlock yourself | SD-JWT / hardware Keystore / OpenID4VCI (locked design, not shipped) |
| Local chat with a small AI model that stays on your device | |

The project follows one hard rule on the **local** path:  
**If you lose or destroy your private key, you start over.** There is no company that can restore it for you. This is intentional.

The hub **does** keep a Viewer session and a profile vault in Postgres. That is not the same as recovering an age secret. Do not mix the two.

---

## Fastest way in: the Viewer Hub (browser)

Open **[sentinelsecurityprotocol.grok.me](https://sentinelsecurityprotocol.grok.me)**

1. Create an account (email + password, or Google / X).
2. Confirm age / OFAC (two checkboxes).
3. On **Command**, tap **Intercept now**, then **Claim** the watch. That is the first win.
4. The 12-station briefing is optional after that first watch — open it from Command when you want the map.
5. Come back tomorrow. Miss a day and The Sentinel takes damage.

Source for the hub: [`apps/hub`](apps/hub).  
`apps/web` is an old scaffold. Ignore it if you want the real UI.

---

## The local-first way (5–10 minutes)

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

- Want the hosted command surface?  
  [`apps/hub/README.md`](apps/hub/README.md) and the live site above.

- Want to encrypt and decrypt a real message the “optical” way?  
  Open the file `optical-airgap/INSTALL.md` and follow the steps there.

- Want to understand what is finished and what is still being built?  
  Read `docs/REALITY.md`. That file is the single source of truth.

- Want to buy a digital pack?  
  See the “Buy packs” section in the main [README.md](README.md).

---

## Important words explained simply

- **Viewer Hub** = the hosted DApp at `apps/hub`. Sign-in, briefing, daily watch, profile. **LIVE.**
- **age** = a free, modern encryption tool (like a lock and key for files).  
  You create a private key (`age-keygen`) that only you should ever see.
- **Optical air-gap** = sending information by QR codes or camera so the two devices never need to be on the internet at the same time.
- **Destroy = Restart** = if you lose your private key, everything protected by that key is gone forever. This is a deliberate design choice for maximum privacy.
- **PROVEN** = the creator actually ran this on a real phone and it worked under real conditions.
- **LIVE** = a hosted product surface that is running now (the Viewer Hub). Not the same as PROVEN-on-device.
- **SCAFFOLD** = the code structure exists but it is not finished or live on a public network yet (Solana governance, Expo mobile).

You do not need to understand any of the advanced papers or Solana code to try the hub or the basic local parts.

Questions? Open an Issue on GitHub and say you are a beginner.
