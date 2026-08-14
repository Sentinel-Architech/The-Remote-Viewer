# Validator Beacon tools

Local, offline liveness signal for Path B Stage 1+.

**Spec:** [`docs/public/BEACON.md`](../../docs/public/BEACON.md)

## Emit

```bash
bash modules/beacon/emit.sh --validator 'age1…your-public-id' --once
```

Writes:

- `$HOME/trv-beacon/latest`
- `$HOME/trv-beacon/history.log`
- `$HOME/trv-beacon/state` (seq counter)

Loop every 5 minutes:

```bash
export TRV_VALIDATOR_ID='age1…'
bash modules/beacon/emit.sh --loop
```

## Check

```bash
bash modules/beacon/check.sh --from $HOME/trv-beacon/latest --allow-dev
```

Production threshold must **not** use `--allow-dev`. `sig=DEV-UNSIGNED` fails without it.

## Optical display

```bash
# from repo root
python -m http.server 8766
# open modules/beacon/show-beacon.html
# paste contents of $HOME/trv-beacon/latest → Show QR
```

## Status

| Piece | Status |
|-------|--------|
| Format + freshness | Implemented |
| Optical QR page | Implemented |
| Real cryptographic signature | Not yet (DEV-UNSIGNED placeholder) |
| Published validator list check | Not yet |

Destroy = Restart applies to any validator keys used for real signatures.
