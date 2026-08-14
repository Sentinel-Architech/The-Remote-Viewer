# Validator Beacon tools

Local, offline liveness signal for Path B Stage 1+.

**Spec:** [`docs/public/BEACON.md`](../../docs/public/BEACON.md)  
**List binding:** [`docs/public/VALIDATOR-LIST.md`](../../docs/public/VALIDATOR-LIST.md)

## One-time keypair

```bash
mkdir -p $HOME/trv-beacon && chmod 700 $HOME/trv-beacon
openssl genpkey -algorithm ed25519 -out $HOME/trv-beacon/validator.pem
openssl pkey -in $HOME/trv-beacon/validator.pem -pubout -out $HOME/trv-beacon/validator.pub
chmod 600 $HOME/trv-beacon/validator.pem
```

Publish only `validator.pub` and your public `id` string (see VALIDATOR-LIST.md). Never share the `.pem`.

## Emit (signed)

```bash
bash modules/beacon/emit.sh \
  --validator 'age1…or-stable-id' \
  --key $HOME/trv-beacon/validator.pem \
  --once
```

## Check (verify)

```bash
bash modules/beacon/check.sh \
  --from $HOME/trv-beacon/latest \
  --pubkey $HOME/trv-beacon/validator.pub
```

## Destroy = Restart

```bash
bash modules/beacon/destroy.sh --yes
```

Wipes local validator key material and beacon state. Generate a new keypair before emitting again. If you were on a published list, publish an updated entry with the new pubkey.

## Optical

Paste `$HOME/trv-beacon/latest` into `modules/beacon/show-beacon.html` (serve from repo root).

## Status

| Piece | Status |
|-------|--------|
| Format + freshness | Proven |
| Optical QR | Proven |
| ed25519 sign / verify | Proven (OpenSSL, file-based) |
| Destroy path | Implemented |
| Published list binding | Spec done; not yet populated |
