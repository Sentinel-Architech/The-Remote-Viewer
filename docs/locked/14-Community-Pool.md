# Community Pool (Locked)

**Status:** Locked — July 25, 2026  
**Public pool identity revised:** 2026-08-31  
**Public TRV_POOL:** X Money [@Archtecht](https://x.com/Archtecht)  
**Chain (legacy on-chain sink):** Solana  
**Control model:** Single admin (originator-controlled) for this generation  
**Depends on:** Membership / NFT product rules; does **not** alter Identity Layer, Vault, or Destroy = Restart  
**Shop routing detail:** See `15-TRV-Shop-Token-Converter-Treasury.md`

---

## 1. Purpose

The Community Pool / **TRV_POOL** is the operational treasury for The Remote Viewer community functions, including:

- Forum / community maintenance
- Native NFT mint gas support and highest-tier gas-fee waiver funding
- Net TRV Shop proceeds routed to the pool share
- Voluntary 100% pool donations / tips
- Other explicitly approved community or protocol costs

It is **not**:

- A user identity wallet  
- Part of the Hybrid DID/VC stack  
- Subject to user **Destroy = Restart**  
- The creator’s private receive wallet

Identity burn never moves or empties this pool.

---

## 2. Public TRV_POOL (X Money)

```
@Archtecht
https://x.com/Archtecht
```

- **Rail:** X Money on X (handle is the address)
- **Display:** Safe to show in-app, docs, QR (X “My code”), and Sponsor / FUNDING.yml
- **QR:** Originator X profile QR for Sentinel Architech · @Archtecht
- **Secrets:** Seed phrase / private keys are **never** committed to the repository, logs, or client bundles
- **Fulfillment:** Operator confirms payment in the X app, then Path B / pack delivery as in `digital-vending/XMONEY.md`

This handle **replaces** the Solana pubkey as the public pool identity.

### 2.1 Legacy on-chain sink (not the public name)

Existing SOL shop split code still needs a base58 `PublicKey`. That sink remains:

```
555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt
```

Do **not** label this string TRV_POOL in UI. Label it “legacy Solana sink” if shown at all.

---

## 3. Control Model — Single Admin

| Item | Rule |
|------|------|
| Authority | Single admin (project originator) controls spending and key material for this generation |
| Public identity | X Money @Archtecht |
| Future multi-sig / DAO | Allowed as a later locked revision |
| User burn | Has **no** effect on pool keys or balances |
| Support claims | Users cannot demand pool funds via identity recovery or burn |

---

## 4. Automatic Wire (Product Logic)

### 4.1 Inflows

1. **Public / human rail:** X Money to `@Archtecht` (preferred TRV_POOL).  
2. **Legacy SOL shop split:** remaining on-chain 50% still lands on the Solana sink until that path is retired.  
3. Voluntary “support the pool” items → **100%** TRV_POOL (`@Archtecht`).  
4. Failed transfers must not fall back to storing user funds on TRV servers.

### 4.2 Outflows

| Use | Mechanism |
|-----|-----------|
| Highest-tier mint gas waiver | From pool; admin or designated relayer — not user identity keys |
| Forum / infra maintenance | Admin payouts from pool |

TRV **never** signs pool transactions with a server-held copy of the admin seed.

### 4.3 Identity discounts

Enforced via Identity Layer before the creator/pool split. Not implemented by rewriting pool balances after burn.

---

## 5. Disclosure (User-Facing)

**Short:**  
“TRV_POOL is X Money @Archtecht. Separate from your identity wallet. Destroy = Restart does not move these funds.”

**Checkout:**  
“Pay @Archtecht on X Money for pack / pool support. Any leftover SOL shop path is a legacy sink, not the public pool name.”

**Donate:**  
Use only `@Archtecht` on X. Support will never ask for your seed phrase.

**Pool:**  
`@Archtecht` · https://x.com/Archtecht

---

## 6. Security & Compliance Boundaries

1. Class A identity data never lands in the pool wallet.  
2. No seed in git, CI, or app binary.  
3. Public pool identity is the X handle. The Solana sink is implementation residue.  
4. Legal/tax of pool and creator inflows: project/ops responsibility with counsel as needed.

---

## 7. Config Surface

```json
{
  "communityPool": {
    "publicIdentity": "@Archtecht",
    "rail": "x_money",
    "url": "https://x.com/Archtecht",
    "legacySolanaSink": "555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt",
    "controlModel": "single_admin",
    "identityBurnAffectsPool": false
  }
}
```

---

## 8. Final Statement

**Public TRV_POOL is @Archtecht on X Money.**  
**The Solana string is a leftover on-chain sink, not the pool name.**  
**Treasury is not identity. Burn the path, not the pool.**
