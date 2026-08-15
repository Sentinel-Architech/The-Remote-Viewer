# Phone ↔ watch bridge

Message types (payloads small, no secrets):

| Type | Direction | Body |
|------|-----------|------|
| `entitlement.snapshot` | phone → watch | path, unlimited, expiresAt?, stale |
| `signal.hint` | phone → watch | weak \| standard \| strong |
| `session.voice_open` | either | session id |
| `session.voice_close` | either | session id |
| `wake.affirm` | watch → phone | timestamp |

**Never** send seed phrases, private keys, or raw recovery codes over the bridge.
