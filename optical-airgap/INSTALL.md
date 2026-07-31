# Optical Air-Gap — Step-by-step install

Get the module running on a normal Linux/Acer box or Termux. **No phone required** for steps 1–6.

| Doc | Purpose |
|-----|---------|
| [README.md](./README.md) | Overview + roadmap |
| [TECHNICAL.md](./TECHNICAL.md) | Deep architecture |
| **INSTALL.md** (this file) | Install and first run |
| [STATUS.md](./STATUS.md) | Shipped checklist |

**Repo:** https://github.com/Sentinel-Archetecht/The-Remote-Viewer  
**Branch:** `TheRemoteViewer`  
**License:** MIT

---

## Prerequisites

Pick one environment:

### Option A — Desktop / Acer (recommended for first install)
- Git
- Node.js **20+** (for `age-encryption`)
- Optional: a TypeScript runner (`npx tsx`, or compile with `tsc`)

Check:

```bash
git --version
node -v    # should be v20 or higher
npm -v
```

### Option B — Termux (GrapheneOS / Android, no GUI IDE required)
- Termux from a trusted source (F-Droid recommended on de-Googled devices)
- `pkg install git nodejs` (and optionally `age` for the CLI path)

```bash
pkg update
pkg install git nodejs
# optional native age CLI:
pkg install age
```

### Option C — age CLI only (no npm)
If you only want encrypt/decrypt with the Go `age` binary and will wire RDH later:

```bash
# Debian/Ubuntu example
sudo apt install age
# or Termux:
pkg install age
age --version
```

You can skip Node for pure CLI experiments; the TypeScript pipeline needs Option A or B with Node 20+.

---

## Step 1 — Clone the repo

```bash
git clone https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
```

---

## Step 2 — Check out the branch that has optical-airgap

```bash
git checkout TheRemoteViewer
ls optical-airgap
```

You should see `README.md`, `INSTALL.md`, `TECHNICAL.md`, `crypto/`, `rdh/`, `pipeline/`, `fountain/`, etc.

---

## Step 3 — Install the age TypeScript dependency

```bash
cd optical-airgap/crypto
npm install
```

This installs **`age-encryption`** (FiloSottile typage) per `package.json`.

Confirm the package is present:

```bash
ls node_modules/age-encryption
```

If `npm install` fails on an old Node, upgrade to Node 20+ and retry.

---

## Step 4 — (Optional) Native age CLI side-by-side

Useful for interoperability checks and offline encrypt without Node:

```bash
age-keygen -o /tmp/trv-test-identity.txt
# Public recipient line is printed; private key is in the file — treat as Vault material

echo "TRV install test" | age -r age1... > /tmp/trv-test.age
age -d -i /tmp/trv-test-identity.txt /tmp/trv-test.age

# Clean up test keys when done
shred -u /tmp/trv-test-identity.txt 2>/dev/null || rm -f /tmp/trv-test-identity.txt
rm -f /tmp/trv-test.age
```

Same age format as the TypeScript API.

---

## Step 5 — Read the security rules (do not skip)

```bash
cd ../..   # back to optical-airgap/ if you were in crypto/
# or from repo root:
less optical-airgap/rdh/SECURITY.md
less optical-airgap/crypto/age-notes.md
```

Hard rules:

1. **Encrypt first** — never feed plaintext into RDH.
2. **Identity stays in the Vault** — never commit `AGE-SECRET-KEY-...` material.
3. **Destroy = Restart** — test keys must be wiped after experiments.
4. RDH checksum failure (`checksumOk === false`) means **do not decrypt**.

---

## Step 6 — First programmatic smoke (age + RDH pipeline)

From `optical-airgap/crypto` after `npm install`, you need a small runner that can resolve the TS modules. Minimal approach with `tsx`:

```bash
cd optical-airgap/crypto
npm install   # if not already
npx --yes tsx -e "
import { generateAgeKeyPair, encryptForRecipient, decryptBlob, secureZero } from './age-interface.ts';

const { identity, recipient } = await generateAgeKeyPair();
console.log('recipient', recipient.slice(0, 20) + '...');

const pt = new TextEncoder().encode('TRV optical install smoke');
const blob = await encryptForRecipient(pt, recipient);
secureZero(pt);

const out = await decryptBlob(blob, identity);
console.log('roundtrip', new TextDecoder().decode(out));
"
```

Expected: `roundtrip TRV optical install smoke`.

**Pipeline (age → RDH)** needs a cover buffer large enough for header + ciphertext. Example pattern (run from a context that can import both modules):

```ts
import { generateAgeKeyPair } from "./crypto/age-interface.ts";
import { encryptTextThenRdh, extractRdh } from "./pipeline/encrypt-then-rdh.ts";

const { identity, recipient } = await generateAgeKeyPair();
// Synthetic cover: many repeated mid-gray bytes → tall peak → more capacity
const cover = new Uint8Array(200_000).fill(128);

const result = await encryptTextThenRdh("TRV RDH smoke", recipient, cover);
console.log("embeddedBits", result.embeddedBits, "capacity", result.capacityBits);

const extracted = await extractRdh(result.rdh.stego);
console.log("checksumOk", extracted.checksumOk);
// Then decrypt extracted.secret with identity via decryptBlob
```

If capacity throws, increase cover size or use a real grayscale image’s raw bytes.

---

## Step 7 — QR sender demo (visual only)

```bash
# From repo, open in any local browser:
# optical-airgap/optical/qr-sender.html
```

- Works offline for the page logic; **temporary CDN** loads a QR library until roadmap item “vendor pure-JS QR” lands.
- For a strict air-gap machine, skip this step until the CDN is removed, or vendor a QR lib yourself and point the script tag at a local file.

Paste a short test string → **Start Fountain Stream** → QR should animate. This does **not** yet send real LT symbols (roadmap).

---

## Step 8 — Local identity helper

No install beyond reading/using the TS:

```ts
import { generateLocalAddress, isValidLocalAddress } from "./identity/local-address.ts";

const addr = generateLocalAddress("ops", "did:example:vault-fingerprint");
console.log(addr.full);  // ops@sentinel.viewer
console.log(isValidLocalAddress(addr.full));
```

Also exported from shared identity types under `apps/shared/src/identity.ts` on the same branch.

---

## Step 9 — Stay current

```bash
cd The-Remote-Viewer
git checkout TheRemoteViewer
git pull origin TheRemoteViewer
cd optical-airgap/crypto && npm install
```

Track remaining work: https://github.com/Sentinel-Archetecht/The-Remote-Viewer/issues/38

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `age-encryption package not found` | Run `npm install` inside `optical-airgap/crypto`; use Node 20+ |
| `RDH capacity … < required` | Larger cover (more pixels / taller peak); synthetic `fill(128)` buffers work for tests |
| `peak and zero collide` | Try a different cover image or buffer pattern |
| QR page blank / no codes | Network blocked CDN — expected on full air-gap until QR is vendored |
| GrapheneOS / Play-free Termux | Use F-Droid Termux; avoid Play-only node builds if they pull Google services |
| Accidentally committed a key | Rotate: destroy that identity, purge git history if it was real key material, generate new keys only in Vault |

---

## What you have after a successful install

- [x] Repo on branch `TheRemoteViewer`
- [x] `age-encryption` under `optical-airgap/crypto/node_modules`
- [x] Ability to generate age key pairs and round-trip ciphertext
- [x] Path to encrypt-then-RDH with capacity + checksum
- [ ] Full optical LT→QR→camera path (not shipped yet — see README roadmap)

**Share:** point people at `optical-airgap/INSTALL.md` + `TECHNICAL.md`.  
**Do not share:** age identities, Vault material, or real payloads.
