# IA-of-IA MoE

**Parallel** to The Sentinel’s MoE (`modules/moe-router/`).  
Does not share vault weights. Service plane only.

Mission: education · research · finances — as accurate as globally possible in **real time**, under Service guidelines.

See: `docs/locked/24-IA-of-IA-MoE-Parallel.md`

## Layout

| Path | Role |
|------|------|
| `route-domain.sh` | Tag query → education / research / finances / general |
| `experts/` | Expert policy stubs (prompts / future heads) |
| `realtime/` | Timestamped fetch adapters (M3) |

## vs Sentinel MoE

| | Sentinel MoE | IA-of-IA MoE |
|--|--------------|--------------|
| Home | Core device | Service / Remote Viewer plane |
| Network | Optional / offline-first | Real-time sources expected |
| Install coupling | None | Learns per Viewer when Service learning is on |
