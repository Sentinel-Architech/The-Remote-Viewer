/**
 * Archived sketch. The live path is passkey.ts and passkey-plugin.ts.
 * The rpID below, the-remote-viewer.grok.me, is not used.
 *
 * Phase 2 — Viewer Hub Passkey Primary (starter notes + integration sketch)
 *
 * Current auth: better-auth.
 * Goal: WebAuthn passkey as preferred factor; existing factors remain
 * secondary during transition.
 *
 * This file is documentation + type-safe sketch only.
 * better-auth 1.6.30 does not export a passkey plugin, so the live flow
 * is the native WebAuthn plugin instead of this sketch.
 *
 * Never store biometric templates. Store only credential ID, public key,
 * AAGUID, signCount, transports.
 */

/**
 * Recommended better-auth configuration shape (verify against installed version).
 *
 * import { betterAuth } from "better-auth";
 * import { passkey } from "better-auth/plugins"; // confirm export path
 *
 * export const auth = betterAuth({
 *   // ... existing database, social providers, session config
 *   plugins: [
 *     passkey({
 *       rpID: process.env.PASSKEY_RP_ID ?? "the-remote-viewer.grok.me",
 *       rpName: "The Remote Viewer",
 *       origin: process.env.PASSKEY_ORIGIN ?? "https://the-remote-viewer.grok.me",
 *     }),
 *   ],
 * });
 */

export const PASSKEY_RP = {
  rpID: "the-remote-viewer.grok.me",
  rpName: "The Remote Viewer",
  origin: "https://the-remote-viewer.grok.me",
} as const;

/**
 * Client-side enrollment sketch (run after first successful session).
 * Force userVerification: "required".
 *
 * async function enrollPasskey(optionsFromServer: PublicKeyCredentialCreationOptions) {
 *   const credential = await navigator.credentials.create({
 *     publicKey: {
 *       ...optionsFromServer,
 *       authenticatorSelection: {
 *         authenticatorAttachment: "platform", // prefer platform authenticator
 *         userVerification: "required",
 *         residentKey: "preferred",
 *       },
 *     },
 *   });
 *   // POST attestation response to server for storage
 *   return credential;
 * }
 */

/**
 * Preferred login UX after at least one passkey is registered:
 * 1. Primary button: "Sign in with passkey"
 * 2. Secondary: existing Better Auth factors (email / Google / X)
 *
 * High-assurance Hub actions should request a fresh assertion with
 * userVerification: "required".
 */
export const PASSKEY_UX = {
  primaryLabel: "Sign in with passkey",
  enrollPrompt: "Protect this account with a passkey (Face ID, fingerprint, or security key).",
  requireUV: true,
} as const;
