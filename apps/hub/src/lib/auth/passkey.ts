/**
 * Relying party for passkey sign-in.
 *
 * WebAuthn refuses a raw IP address. The page host is the rpID.
 * The archived sketch in passkey-notes.ts is not used.
 */

export type PasskeyRelyingParty = {
  method: "passkey";
  rpID: string;
  origin: string;
  rpName: "The Remote Viewer";
  userVerification: "required";
  seedPhraseAccepted: false;
  google: false;
  emailFallback: "/login";
};

export function rejectPasskeySeedPhrase(text: string): void {
  if (/\b(seed phrase|mnemonic|passphrase)\b/i.test(text)) {
    throw new Error("A seed phrase is not a sign-in.");
  }
}

export function passkeyRelyingParty(originHeader: string | null): PasskeyRelyingParty {
  if (!originHeader) {
    throw new Error("Passkey sign-in needs the page origin. Open http://localhost:8080.");
  }
  let url: URL;
  try {
    url = new URL(originHeader);
  } catch {
    throw new Error("Passkey sign-in needs a valid page origin.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Passkey sign-in needs http or https.");
  }
  const host = url.hostname;
  const ipv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  const ipv6 = host.includes(":");
  if (ipv4 || ipv6) {
    throw new Error("WebAuthn rejects an IP address. Open http://localhost:8080.");
  }
  return {
    method: "passkey",
    rpID: host,
    origin: url.origin,
    rpName: "The Remote Viewer",
    userVerification: "required",
    seedPhraseAccepted: false,
    google: false,
    emailFallback: "/login",
  };
}
