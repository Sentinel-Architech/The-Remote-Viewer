# Community Pool (Locked)

**Status:** Locked — July 25, 2026  
**Chain:** Solana  
**Wallet surface:** Phantom (receive any Solana token)  
**Control model:** Single admin (originator-controlled) for this generation  
**Depends on:** Membership / NFT product rules; does **not** alter Identity Layer, Vault, or Destroy = Restart

---

## 1. Purpose

The Community Pool is the **on-chain operational treasury** for The Remote Viewer community functions, including (as product rules allow):

- Forum / community maintenance
- Native NFT mint gas support and highest-tier gas-fee waiver funding
- Other explicitly approved community or protocol costs

It is **not**:

- A user identity wallet  
- Part of the Hybrid DID/VC stack  
- Subject to user **Destroy = Restart**  
- A place to store identity keys, Vault data, or credentials  

Identity burn never moves or empties this pool.

---

## 2. Public Pool Address (Solana)

```
555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt
```

- **Network:** Solana mainnet (unless a separate devnet address is published later)
- **Receive:** Any Solana token (SOL and SPL tokens supported by the wallet)
- **Display:** Safe to show in-app, in docs, and in QR receive flows
- **Secrets:** Seed phrase / private keys are **never** committed to the repository, logs, or client bundles

If this address is rotated, this document must be revised and the old address marked retired.

---

## 3. Control Model — Single Admin

| Item | Rule |
|------|------|
| Authority | Single admin (project originator) controls spending and key material for this generation |
| Future multi-sig / DAO | Allowed as a later locked revision; not required now |
| User burn | Has **no** effect on pool keys or balances |
| Support claims | Users cannot demand pool funds via identity recovery or burn flows |

Operational security (offline seed, hardware wallet, limited device exposure) is the admin’s responsibility. Product code must not embed admin private keys.

---

## 4. Automatic Phantom / Solana Wire (Product Logic)

“Automatic wire” means **application-level routing and UX**, not custody of the admin key inside TRV servers.

### 4.1 Inflows (automated where implemented)

When native NFT or shop flows are live:

1. **Configured percentage** of eligible on-chain proceeds is directed to the Community Pool address above (exact % set in product/commerce config; membership docs may define policy targets such as maintenance + mint gas).
2. Client or checkout messaging states that a portion supports community maintenance and mint infrastructure.
3. Failed transfers surface a clear error; they must not fall back to storing user funds on TRV servers.

### 4.2 Outflows (policy-gated, admin-executed)

| Use | Mechanism |
|-----|-----------|
| Highest paid tier gas waiver | Pool sponsors mint gas per loyalty rules; execution is admin or designated relayer using pool funds — not user identity keys |
| Forum / infra maintenance | Manual or scripted admin payouts from pool |
| Other | Only if added by locked policy update |

TRV **never** signs pool transactions with a server-held copy of the admin seed. Signing stays in Phantom / hardware under admin control, or a future dedicated relayer key documented separately.

### 4.3 Identity discounts stay off-chain

- **17.76% American citizen membership discount** and **Founding Sovereign** benefits are enforced via the Identity Layer (ZK / attestations), not by rewriting Solana transfer amounts inside Phantom unless a later explicit on-chain program is locked.
- **2.50% Founding discount on native TRV shop** is a commerce rule; settlement may still route the community share to this pool.

---

## 5. Disclosure (User-Facing)

Use clear, non-alarmist copy along these lines:

**Short (settings / about):**  
“Community Pool (Solana): operational treasury for forum maintenance and NFT mint support. Separate from your identity wallet. Your Destroy = Restart action does not move these funds.”

**Receive / donate:**  
“This address receives SOL and Solana tokens for the TRV Community Pool. Only send assets you intend as pool support. TRV does not hold your personal wallet keys.”

**NFT / checkout:**  
“A portion of eligible purchases may be routed to the Community Pool to fund maintenance and mint infrastructure.”

**Admin transparency (recommended):**  
Publish the public address and, when practical, point to a Solana explorer link. Do not publish seed material.

---

## 6. Security & Compliance Boundaries

1. **Class A identity data** never lands in the pool wallet by design.  
2. **No seed in git, CI, or mobile app binary.**  
3. **Single admin** accepts concentration risk; document upgrade path to multi-sig when ready.  
4. **Legal / tax:** Pool activity is operational finance of the project entity — counsel as needed; not solved by identity docs.  
5. **Scam surface:** Official address is only the one in this file (and UI that reads from the same config). Warn users that support will never ask for seed phrases.

---

## 7. Config Surface (Implementation)

Suggested single source of truth for clients:

```json
{
  "communityPool": {
    "chain": "solana",
    "address": "555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt",
    "walletLabel": "Phantom",
    "controlModel": "single_admin",
    "identityBurnAffectsPool": false
  }
}
```

Wire NFT/shop fee routing to this address in commerce modules when those modules ship. Until then, the address is the declared receive destination for voluntary and future automated inflows.

---

## 8. Final Statement

**Solana Community Pool, Phantom-compatible, single-admin controlled.**

Public address is publishable. Keys stay with the admin. Identity and Vault stay separate. Automation routes value to the pool — it does not custody the pool’s private key inside TRV.

**Treasury is not identity. Burn the path, not the pool.**
