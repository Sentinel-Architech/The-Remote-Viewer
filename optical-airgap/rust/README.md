# trv-optical-airgap (Rust)

Sentinel Standard optical helpers: **age** · histogram RDH · **Robust Soliton LT** · TRVL frames.

Workspace member of the repo root (`Cargo.toml` includes `optical-airgap/rust`).

## Build

```bash
cd optical-airgap/rust
cargo test
cargo run --quiet --bin trv-optical --
```

## CLI

| Command | Role |
|---------|------|
| `keygen` | recipient on stdout; identity on stderr (Vault) |
| `encrypt <age1…>` | stdin → age ciphertext |
| `decrypt <identity-file>` | stdin → plaintext |
| `frame-stream [block] [count]` | stdin → `TRVL1.` lines (Soliton) |
| `frame-peel` | `TRVL1.` lines → payload |
| `lt-demo` / `rdh-*` / `address` | helpers |

### Verified on Termux (GrapheneOS\*) 2026-07-31

Full chain recovered plaintext after encrypt → frame-stream → peel → decrypt.

Use **`$HOME`** for temp files on Termux (`/tmp` often fails).

```bash
echo hello | cargo run --quiet --bin trv-optical -- frame-stream 16 40 \
  | cargo run --quiet --bin trv-optical -- frame-peel
```

## age 0.11 notes

- `Decryptor` is used as a struct (`Decryptor::new` → `decrypt`), not `Recipients` enum.  
- `Identity` is not `Display`; keygen uses `to_string().expose_secret()`.

## Offline

See [OFFLINE.md](./OFFLINE.md).
