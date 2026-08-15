# TRV Protocol map

What talks to what. **PROVEN** vs scaffold is in [REALITY.md](REALITY.md).

---

## 1. Transport (PROVEN core)

```text
age encrypt → Robust Soliton LT (TRVL) → optical or file frames → peel → age decrypt
```

- Spec/implementation: `optical-airgap/`  
- Sentinel Standard: **Soliton LT**, not RaptorQ  
- Identity: local **age**; Destroy = Restart  
- Optional path: same frames via QR/camera  

---

## 2. Digital vending (PROVEN Path B)

Authority: [`digital-vending/PROTOCOL.md`](../digital-vending/PROTOCOL.md)

| Rail | Direction | Format |
|------|-----------|--------|
| Payment signal | Buyer → seller | Solana **USDC** + **memo** |
| Recipient | Buyer → seller | `age1…` drop file |
| Delivery | Seller → buyer | `.trvl` (age + Soliton LT) |
| Integrity | Anyone | Verifier over contribution + sales.log |

**Rules:** Payment ≠ delivery · seller never holds buyer private key · catalog.json is SKU truth · no empty packs · local sales.log only  

**Deferred:** SPL TRV mint as required rail · platform custody · cloud identity  

---

## 3. Integrity / first node role (PROVEN)

- `modules/integrity-verifier/` — attestation  
- Contribution weight from verifier output  
- Path B recognition: collect → attest → verify → issue → install  

---

## 4. Entitlement (scaffold — Track A)

```text
Viewer ↔ Solana program trv_governance
  Config · Node · Subscription · Entitlement PDAs
  unlimited_comms ← active sub OR active permanent node
```

- Program: `solana/programs/trv_governance`  
- Client view: `clients/entitlement/`  
- **Not live** until deploy after green build  

Creator BPS (policy → chain when live): digital **9500/500**, NFT **9000/1000**, platform **0**  

---

## 5. Client surfaces (scaffold)

| Layer | Protocol role |
|-------|----------------|
| PWA | Entry + tutorial + signal banner |
| android-cap | Device potential → tier |
| wear-os | Glance + bridge; no keys |
| safety-ui | Integrity report + coarse Area |
| Modalities | Text/voice/sight/search/wake — device-gated |

Entitlement display must not claim chain success without RPC proof.

---

## 6. Explicit non-protocols

- Centralized key assignment — **REJECTED**  
- Cloud custody of TRVL payloads — **REJECTED**  
- Simulated CSAM “detection” theater — **REJECTED**  
- Email as sole destroy factor — **REJECTED** (phone confirm in deep settings; keys still root)  

---

## 7. One diagram

```text
[Buyer device] --USDC+memo--> [Solana] --signal--> [Seller operator]
     ^                                              |
     |              .trvl (age+LT)                  v
     +---------------- offline/optical ------------+

[Viewer device] --(future)--> [trv_governance] --> unlimited_comms
[Viewer device] --TRVL/optical--> peer or self (PROVEN transport)
```
