# Visual Guide — The Remote Viewer

**No jargon required.** Follow the pictures.

---

## The whole project at a glance

```mermaid
flowchart TD
    YOU[You] --> REPO[The Remote Viewer]

    REPO --> P1[Path 1\nOptical Air-Gap]
    REPO --> P2[Path 2\nSentinel AI]
    REPO --> P3[Path 3\nZero-Trust Rules]

    P1 --> SAFE[Private message\nsent with light]
    P2 --> SMART[On-device expert\nanswers questions]
    P3 --> OWN[You keep the keys\nNo company holds them]
```

---

## Path 1 — Optical Air-Gap

**What it does:** Sends a secret message using only light (screen → camera). No internet. No cables.

```mermaid
flowchart LR
    A[Your secret\ntext] --> B[Lock it\nage encrypt]
    B --> C[Break into\nlight frames]
    C --> D[Show on\nscreen as QR]
    D --> E[Other device\ncamera reads]
    E --> F[Put pieces\nback together]
    F --> G[Unlock\ndecrypt]
    G --> H[Secret\nrestored]
```

**In plain words:**
1. You type a secret.
2. It gets locked.
3. The locked secret is turned into flashing QR codes.
4. Another phone or computer watches the screen.
5. It rebuilds the secret and unlocks it.
6. No network was used.

---

## Path 2 — Sentinel AI (the expert system)

**What it does:** Answers questions using different experts. Everything stays on your phone.

```mermaid
flowchart TD
    Q[You ask a question] --> R{Router}

    R -->|bleeding / CPR| FA[First Aid Expert]
    R -->|quantum / entanglement| QU[Quantum Expert]
    R -->|math / calculus| MA[Math Expert]
    R -->|physics / forces| PH[Physics Expert]
    R -->|laws / power| PO[Political Science Expert]
    R -->|bias / thinking| CO[Cognitive Expert]
    R -->|everything else| CD[Coordinator]

    FA --> ANS[Answer on your device]
    QU --> ANS
    MA --> ANS
    PH --> ANS
    PO --> ANS
    CO --> ANS
    CD --> ANS
```

**In plain words:**
1. You ask something.
2. A small router decides which expert should answer.
3. Only that expert’s rules are used.
4. The answer is generated on your phone.
5. Nothing is sent to the cloud.

---

## How the router chooses

```mermaid
flowchart TD
    Q[Your question] --> K{Contains emergency\nwords?}
    K -->|Yes| FA[First Aid]
    K -->|No| K2{Contains quantum\nwords?}
    K2 -->|Yes| QU[Quantum]
    K2 -->|No| K3{Contains math\nwords?}
    K3 -->|Yes| MA[Math]
    K3 -->|No| K4{Other clear\nmatch?}
    K4 -->|Yes| EXP[Matching Expert]
    K4 -->|No| CD[Coordinator]
```

Life-safety questions always win.

---

## Path 3 — Zero-Trust / You own the keys

**What it does:** Makes sure no company, cloud, or platform can control your identity or secrets.

```mermaid
flowchart TD
    YOU[You] --> KEYS[Keys live only\non your device]
    KEYS --> NO[No company\ncan read them]
    NO --> DESTROY[If keys are lost\n= clean restart]
    DESTROY --> SAFE[No backdoor\nNo recovery by others]
```

**In plain words:**
- Your keys never leave your device.
- There is no “forgot password” controlled by someone else.
- If the keys are gone, you start over clean.
- That is intentional. It is called **Destroy = Restart**.

---

## Putting it together

```mermaid
flowchart TD
    subgraph Device[Your Phone or Computer]
        direction TB
        OPT[Optical Air-Gap\nprivate light messages]
        AI[Sentinel AI\nlocal experts]
        KEYS[Your Keys\nnever leave]
    end

    YOU[You] --> Device
    Device --> OUT[Answers & private\nmessages stay local]
```

Nothing required leaves the device. That is the point.

---

## Quick start commands (optional)

Only if you want to try the pieces yourself:

**Optical air-gap**
```bash
cd optical-airgap/rust
bash ../scripts/e2e-age-lt.sh
```

**See which expert would answer**
```bash
cd grok/router
python route.py "how do I control severe bleeding"
```

---

**Digital sovereignty is not a slogan. It is a terminal that never phones home.**
