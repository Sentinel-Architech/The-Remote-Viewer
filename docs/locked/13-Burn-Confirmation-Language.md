# Burn Confirmation Language (Locked)

**Status:** Locked — 2026-08-14  
**Phase:** 0 — Foundation & Guardrails  
**Depends on:** `03-Destroy-Equals-Restart.md`, `09-Wallet-Architecture.md`, `10-Threat-Model-Key-Loss.md`, `12-Residual-Data-and-Phishing.md`

---

## 1. Purpose

Exact user-facing language for the Destroy = Restart confirmation flow.  
Language must be plain, irreversible in tone, and free of recovery promises.

---

## 2. Primary Confirmation Screen (Internal TRV Identity Path)

**Title:** Destroy this identity path?

**Body:**

This action is permanent.

- Your TRV identity path will end.
- All TRV-issued credentials and status held in this app for this path will be destroyed.
- Platform recognition of this path (Founding status, membership, discounts tied to it) will be dropped.
- There is no recovery by The Remote Viewer. No one can restore this path for you.

Credentials that exist only in external wallets (for example an official EUDI Wallet) are not deleted by this action. You manage those separately.

If you continue, you start from square one.

**Buttons:**

- [ Cancel ]
- [ I understand — Destroy this path ]  (requires second confirmation or typed acknowledgment where the platform allows)

---

## 3. Second-Step Acknowledgment (Recommended)

**Prompt:** Type DESTROY to confirm.

Or equivalent platform-native irreversible confirmation pattern.

---

## 4. Success / Aftermath

**Message:**

Identity path destroyed.

You may create a new identity path at any time. It will have no continuity with the path you just destroyed.

---

## 5. Key-Loss Distinction (Support / Settings Copy)

If you lose your keys and have no working recovery method that you configured, this identity path ends. The Remote Viewer cannot restore it. That outcome is the same finality as a deliberate destroy, without the confirmation step.

---

## 6. External-Wallet Clarification (Always Visible Near Burn)

Destroying your TRV identity path does not delete credentials stored only in other apps or official wallets. Those remain under the rules of those systems.

---

## 7. Forbidden Language

Do not use:

- “You can always recover later”
- “Contact support to restore your account”
- “We can help you get your identity back”
- Softening phrases that imply the action is reversible by the platform

---

## 8. Implementation Note

Strings above are the locked semantic content. Exact layout, accessibility, and platform idioms may vary; the meaning and irreversibility must not.

**Final statement**  
Say it clearly. Make the user confirm. Then end the path. No silent resurrection.
