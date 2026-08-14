# Validator Beacon tools

Local, offline liveness signal for Path B Stage 1+.

**Spec:** [`docs/public/BEACON.md`](../../docs/public/BEACON.md)

## One-time keypair

```bash
mkdir -p $HOME/trv-beacon
chmod 700 $HOME/trv-beacon
openssl genpkey -algorithm ed25519 -out $HOME/trv-beacon/validator.pem
openssl pkey -in $HOME/trv-beacon/validator.pem -pubout -out $HOME/trv-beacon/validator.pub
chmod 600 $HOME/trv-beacon/validator.pem
```

Publish only `validator.pub` (and your public identity string). Never share the `.pem`.

## Emit (signed)

```bash
bash modules/beacon/emit.sh \
  --validator 'age1…or-npub…' \
  --key $HOME/trv-beacon/validator.pem \
  --once
```

## Check (verify)

```bash
bash modules/beacon/check.sh \
  --from $HOME/trv-beacon/latest \
  --pubkey $HOME/trv-beacon/validator.pub
```

Dry-run without real keys:

```bash
bash modules/beacon/emit.sh --validator 'age1…' --once
bash modules/beacon/check.sh --from $HOME/trv-beacon/latest --allow-dev
```

## Optical

Paste `$HOME/trv-beacon/latest` into `modules/beacon/show-beacon.html` (serve from repo root).

## Status

| Piece | Status |
|-------|--------|
| Format + freshness | Done |
| Optical QR | Done |
| ed25519 sign / verify | **Done** (OpenSSL) |
| Published validator-list binding | Still open |

Destroy = Restart applies to `validator.pem`.
