# Pipeline — wired open-source path

## Modules

| File | Role |
|------|------|
| `encrypt-then-rdh.ts` | age → RDH only |
| **`full-path.ts`** | age → optional RDH → **Soliton LT** → `TRVL1.` lines |
| **`peel-path.ts`** | `TRVL1.` → peel → optional RDH extract → age decrypt |

## Required OSS

See [../OPEN-SOURCE.md](../OPEN-SOURCE.md).

```bash
cd optical-airgap && npm install   # pulls age-encryption only for crypto
```

Fountain modules need **no** npm packages.

## Rust equivalent

```bash
cd rust
# encrypt then stream:
#   trv-optical encrypt age1... < plain.bin | trv-optical frame-stream 32
# peel:
#   trv-optical frame-peel < frames.txt | trv-optical decrypt identity.txt
```

(Compose with shell; age ciphertext is the LT payload when RDH is skipped.)

## Policy

[SENTINEL-STANDARD.md](../SENTINEL-STANDARD.md) — Soliton LT, no RaptorQ default.
