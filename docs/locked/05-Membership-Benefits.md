# Membership Benefits (Locked)

**Status:** Locked — July 25, 2026  
**Classification:** Permanent benefit structure

---

## American Citizen Discount

American citizens receive a **17.76% discount** on any membership tier for any duration (monthly, yearly, or other billing periods that may be offered).

### How the Benefit Is Claimed

The discount is claimed through a **privacy-preserving zero-knowledge proof of U.S. citizenship**.

- The Viewer proves the attribute “is a U.S. citizen” without submitting passport images, full legal name, address, or other unnecessary personal data to the platform.
- The platform receives only the cryptographic proof that the attribute is true, not the underlying documents or biometrics.
- No additional personal data is required or retained by the platform solely for the purpose of granting this discount.

This approach keeps the benefit aligned with the Identity Layer’s non-negotiable rules against centralized personal data stores and forced disclosure.

---

## Founding Sovereign Viewer Benefits

(See the dedicated document: `04-Founding-Sovereign-Viewer.md`)

Summary of benefits:

- Highest Paid Tier for Life
- Permanent title: Founding Sovereign Viewer
- Additional 2.50% discount on any native TRV in-app shop purchase

These benefits are granted only to individuals personally invited by the project originator and are not available for general purchase.

---

## Design Principle

Membership benefits exist to recognize two distinct forms of participation:

1. **Broad participation** — The 17.76% American citizen discount acknowledges a specific national relationship to the project’s origin and goals, while still requiring a privacy-preserving proof rather than open self-declaration.
2. **Founding support** — Founding Sovereign Viewer status recognizes the personal trust and early support of those the originator chose to share the project with directly.

Both forms of recognition are implemented through the sovereign Identity Layer so that they remain consistent with the project’s core privacy and control guarantees.

---

## Interaction with Other Locked Principles

- **Identity Layer** — Both the citizenship discount and Founding status depend on high-assurance, user-controlled credentials and zero-knowledge where applicable.
- **Vault Principles & Destroy Rule** — All membership status and discounts are tied to the active identity path. A confirmed burn extinguishes every benefit associated with that path.
- **No exceptions for convenience** — Benefits cannot be granted by bypassing the identity proofs or by creating residual records that would survive a burn.

---

## Implementation Notes

- Discounts are applied at the point of membership purchase or renewal.
- Stacking rules (if any future discounts are introduced) must be explicitly defined so that pricing never becomes negative or ambiguous.
- The system must be able to verify the relevant attestations without retaining unnecessary personal data after the proof has been accepted.

All benefits remain subordinate to the higher principles of user sovereignty, Vault integrity, and the absolute nature of Destroy = Restart from Square One.
