# Burn Confirmation Language (Locked)

**Status:** Locked — 2026-08-14 (high-friction local gate added same day)  
**Phase:** 0 — Foundation & Guardrails  
**Depends on:** `03-Destroy-Equals-Restart.md`, `09-Wallet-Architecture.md`, `10-Threat-Model-Key-Loss.md`, `12-Residual-Data-and-Phishing.md`

---

## 1. Purpose

Exact user-facing language and friction requirements for the Destroy = Restart confirmation flow.  
Language must be plain, irreversible in tone, and free of recovery promises.  
Confirmation must be local-only: no email, no phone number, no carrier or external verification service.

---

## 2. Friction Requirements (Mandatory)

Destroy of an internal TRV identity path MUST satisfy all of the following:

1. **Deep / deliberate placement** — The action is not a one-tap primary button on the main identity screen without further steps. It must require explicit navigation into a danger zone or equivalent multi-step confirmation.
2. **Typed local identity material** — The user must type the full current DID (or a user-chosen local burn phrase set at identity creation) exactly. Partial matches or truncated IDs are insufficient.
3. **Final irreversible acknowledgment** — After the typed match, a final confirmation that states the path will end with no platform recovery.
4. **No external factors** — Phone number, SMS, voice call, email, or any third-party verification must never be required or used as a gate.

Optional (platform-dependent): device biometric / screen-lock re-authentication immediately before the final step.

---

## 3. Primary Confirmation Content

**Title:** Destroy this identity path?

**Body:**

This action is permanent.

- Your TRV identity path will end.
- All TRV-issued credentials and status held in this app for this path will be destroyed.
- Platform recognition of this path (Founding status, membership, discounts tied to it) will be dropped.
- There is no recovery by The Remote Viewer. No one can restore this path for you.

Credentials that exist only in external wallets (for example an official EUDI Wallet) are not deleted by this action. You manage those separately.

If you continue, you start from square one.

**Typed gate prompt:**

Type the full DID of this identity path to enable destruction:

`[text input — must match the current DID exactly]`

**Buttons (after match):**

- [ Cancel ]
- [ I understand — Destroy this path ]

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

## 7. Forbidden Language and Mechanisms

Do not use:

- “You can always recover later”
- “Contact support to restore your account”
- “We can help you get your identity back”
- Softening phrases that imply the action is reversible by the platform
- Email, phone number, SMS, or voice verification as a required gate
- Any server-side challenge that could later be used to restore the path

---

## 8. Implementation Note

Strings and friction rules above are the locked semantic content. Exact layout, accessibility, and platform idioms may vary; the meaning, local-only nature, and irreversibility must not.

Programmatic / test paths (e.g. automated smoke tests) may call the destroy primitive directly; user-facing UI must enforce the typed local gate.

**Final statement**  
Make the user go deep, type the identity they are about to end, confirm once more, then end the path.  
No phone. No email. No silent resurrection.
