# Community Pool (Locked)

**Status:** Locked — July 25, 2026  
**Chain:** Solana  
**Wallet surface:** Phantom (receive any Solana token)  
**Control model:** Single admin (originator-controlled) for this generation  
**Depends on:** Membership / NFT product rules; does **not** alter Identity Layer, Vault, or Destroy = Restart  
**Shop routing detail:** See `15-TRV-Shop-Token-Converter-Treasury.md`

---

## 1. Purpose

The Community Pool is the **on-chain operational treasury** for The Remote Viewer community functions, including:

- Forum / community maintenance
- Native NFT mint gas support and highest-tier gas-fee waiver funding
- **90% of net TRV Shop crypto proceeds** (after identity discounts) via the Token Converter
- Voluntary 100% pool donations / tips
- Other explicitly approved community or protocol costs

It is **not**:

- A user identity wallet  
- Part of the Hybrid DID/VC stack  
- Subject to user **Destroy = Restart**  
- The creator’s private receive wallet (creator share is separate and not published here)  

Identity burn never moves or empties this pool.

---

## 2. Public Pool Address (Solana)

```
555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt
```

- **Network:** Solana mainnet (unless a separate devnet address is published later)
- **Receive:** Any Solana token (SOL and SPL as supported)
- **Display:** Safe to show in-app, docs, and QR receive flows
- **Secrets:** Seed phrase / private keys are **never** committed to the repository, logs, or client bundles

---

## 3. Control Model — Single Admin

| Item | Rule |
|------|------|
| Authority | Single admin (project originator) controls spending and key material for this generation |
| Future multi-sig / DAO | Allowed as a later locked revision |
| User burn | Has **no** effect on pool keys or balances |
| Support claims | Users cannot demand pool funds via identity recovery or burn |

---

## 4. Automatic Wire (Product Logic)

### 4.1 Inflows

From `15-TRV-Shop-Token-Converter-Treasury.md`:

1. **90% of net shop crypto** (after locked discounts) → this Community Pool address.  
2. **10% of net shop crypto** → creator address in **private** deploy config (not listed in this file).  
3. Voluntary “support the pool” items → **100%** here.  
4. Failed transfers must not fall back to storing user funds on TRV servers.

### 4.2 Outflows

| Use | Mechanism |
|-----|-----------|
| Highest-tier mint gas waiver | From pool; admin or designated relayer — not user identity keys |
| Forum / infra maintenance | Admin payouts from pool |

TRV **never** signs pool transactions with a server-held copy of the admin seed.

### 4.3 Identity discounts

Enforced via Identity Layer before the 10/90 split. Not implemented by rewriting pool balances after burn.

---

## 5. Disclosure (User-Facing)

**Short:**  
“Community Pool (Solana): operational treasury for forum maintenance and NFT mint support. Separate from your identity wallet. Destroy = Restart does not move these funds.”

**Checkout:**  
“90% of net eligible shop crypto (after discounts) goes to the Community Pool; 10% to the creator. TRV never holds your seed.”

**Donate:**  
Use only the published Community Pool address below. Support will never ask for your seed phrase.

**Pool:**  
`555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt`

---

## 6. Security & Compliance Boundaries

1. Class A identity data never lands in the pool wallet.  
2. No seed in git, CI, or app binary.  
3. Creator address stays out of public docs; pool address is the public treasury endpoint.  
4. Legal/tax of pool and creator inflows: project/ops responsibility with counsel as needed.

---

## 7. Config Surface

```json
{
  "communityPool": {
    "chain": "solana",
    "address": "555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt",
    "walletLabel": "Phantom",
    "controlModel": "single_admin",
    "identityBurnAffectsPool": false
  },
  "trvShop": {
    "treasurySplit": {
      "creatorPercent": 10,
      "communityPoolPercent": 90,
      "creatorAddressEnvVar": "TRV_CREATOR_SOLANA_ADDRESS",
      "creatorAddressPublic": false
    }
  }
}
```

---

## 8. Final Statement

**Public Community Pool for the commons. Private creator receive for the 10% share.**  
**90% pool · 10% creator on net shop proceeds.**  
**Treasury is not identity. Burn the path, not the pool.**
