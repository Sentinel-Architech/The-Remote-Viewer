# Viewer keys

The repository holds the master verifying key only. The master private key stays off GitHub, outside the clone, and is never written by these scripts.

Each Remote Viewer receives its own 16-byte member id, a tier mask, and an Ed25519 signature over that payload. The viewer checks the signature locally against the embedded public key. There is no callback, no remote command channel, and no shared API secret in the client.

Set `TRV_MASTER_KEY_FILE` to a 32-byte seed file that is not inside this repository. The issuer refuses a path inside the working tree.

The current embedded public key must match that seed. If it does not, replace the embedded verifier in a local build. Do not commit the seed to make them match.
