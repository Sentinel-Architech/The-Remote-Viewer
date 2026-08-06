# Local reminders (Termux:API)

**Status:** SCAFFOLD  
**Effect:** Real Android notifications via Termux:API — not LLM roleplay.

## Setup (once)

1. Install **Termux:API** from the same source as Termux (F-Droid / GitHub).  
2. In Termux:

```bash
pkg install termux-api -y
```

3. Grant notification permission to Termux:API when Android asks.

## CLI

```bash
bash modules/reminders/notify.sh "Take medicine"
bash modules/reminders/remind-at.sh 18:00 "Take medicine"
bash modules/reminders/list.sh
```

`remind-at` uses a background sleep until local time (best-effort while Termux is allowed to run). For rock-solid daily alarms prefer the system Clock app; this module is the TRV-native bridge.

## Chat

```text
you> /remind Take medicine
you> /remindat 18:00 Take medicine
```
