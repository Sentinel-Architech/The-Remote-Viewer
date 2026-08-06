# Android automation with TRV

## Reliable stack (recommended)

1. **Clock app** — exact daily alarm (primary).
2. **Termux:API** — `pkg install termux-api` + Termux:API app.
3. **TRV** — `/remind`, `/remindat HH:MM`, `daily-med.sh`.

## Commands

```bash
pkg install termux-api -y
bash modules/reminders/notify.sh "Take medicine"
bash modules/reminders/remind-at.sh 18:00 "Take medicine"
bash modules/reminders/install-daily-job.sh   # ~24h job nudge
bash modules/reminders/daily-med.sh          # test notification now
```

In **chat.sh** at `you>` (not inside llama.cpp `>`):

```text
/remind Take medicine
/remindat 18:00 Take medicine
```

## GrapheneOS notes

- Disable battery optimization for Termux / Termux:API if jobs never fire.
- Exact wall-clock times belong in **Clock**, not in a sleeping script.
- Avoid Accessibility-based macro apps unless you accept that privilege model.

## Not in scope

Cloud automation, Google Assistant routines as the core path, or giving the LLM control of the whole phone.
