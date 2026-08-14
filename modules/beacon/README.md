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

## Emit once (signed)

```bash
bash modules/beacon/emit.sh \
  --validator 'age1…or-stable-id' \
  --key $HOME/trv-beacon/validator.pem \
  --once
```

## Check

```bash
bash modules/beacon/check.sh \
  --from $HOME/trv-beacon/latest \
  --pubkey $HOME/trv-beacon/validator.pub
```

## Continuous (must remain on)

Termux-friendly background loop (default every 300s). Uses `termux-wake-lock` when available.

```bash
export TRV_VALIDATOR_ID='age1…'
export TRV_BEACON_INTERVAL=300   # optional
bash modules/beacon/termux-start.sh

# status
cat $HOME/trv-beacon/latest
tail $HOME/trv-beacon/loop.log

# stop
bash modules/beacon/termux-stop.sh
```

Foreground (debug):

```bash
export TRV_VALIDATOR_ID='age1…'
bash modules/beacon/run-loop.sh
```

## Require active (Path B Stage 1 gate)

```bash
bash modules/beacon/require-active.sh
```

## Destroy = Restart

```bash
bash modules/beacon/destroy.sh --yes
```

## Optical

Paste `$HOME/trv-beacon/latest` into `modules/beacon/show-beacon.html` (serve from repo root).

## Status

| Piece | Status |
|-------|--------|
| Format + freshness | Proven |
| Optical QR | Proven |
| ed25519 sign / verify | Proven |
| require-active + list | Proven |
| Continuous Termux loop | Implemented |
| Destroy path | Implemented |
