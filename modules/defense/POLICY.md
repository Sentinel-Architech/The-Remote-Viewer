# Hydra / Defense Policy (locked intent)

1. **Local only** — defend the node under user control (GrapheneOS + Termux).
2. **Fail closed** — if integrity of vault modes, seal, or core scripts is wrong, report FAIL; set QUARANTINE; **block deliver**.
3. **No telemetry** — logs stay on device under `~/.local/share/remote-viewer/`.
4. **No offensive modules** in this repository path — active defense ≠ attacking third parties.
5. **Compose with existing core** — optical, age identity, MoE, contribution ledger, integrity-verifier remain authoritative; defense does not replace them.
6. **Destroy = Restart** still applies — defense tooling must not create undeletable backdoors.
7. **Seal is local truth** — `baseline.sha256` is operator-generated on device; refresh after intentional upgrades (`seal-baseline.sh`).
8. **Gate is default-on** — `hydra-gate.sh` protects seller deliver; `HYDRA_GATE=0` is emergency-only and must not become normal ops.
