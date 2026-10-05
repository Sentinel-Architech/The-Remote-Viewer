import { useState } from "react";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/browser";

type OptionsEnvelope<T> = {
  options: T;
  google: false;
  seedPhraseAccepted: false;
  emailFallback: "/login";
};

export function PasskeyPanel() {
  const [name, setName] = useState("Viewer");
  const [note, setNote] = useState("Passkey sign-in has not completed. Email and password remain on the sign-in page.");

  async function registerPasskey() {
    setNote("Waiting for the passkey authenticator.");
    if (isIp(window.location.hostname)) {
      setNote("WebAuthn rejects an IP address. Open http://localhost:8080. The intent stays unsigned.");
      return;
    }
    try {
      const optionsResponse = await fetch("/api/auth/passkey/register/options", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!optionsResponse.ok) {
        setNote(`${await readError(optionsResponse)} The intent stays unsigned.`);
        return;
      }
      const options = (await optionsResponse.json()) as OptionsEnvelope<PublicKeyCredentialCreationOptionsJSON>;
      const attestation: RegistrationResponseJSON = await startRegistration({ optionsJSON: options.options });
      const verified = await fetch("/api/auth/passkey/register/verify", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, response: attestation }),
      });
      if (!verified.ok) {
        setNote(`${await readError(verified)} The intent stays unsigned.`);
        return;
      }
      setNote("Passkey registration completed and the session is open. The intent receipt is still unsigned. Google: false. Seed phrase accepted: false.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "The passkey ceremony stopped.";
      setNote(`${message} The intent stays unsigned.`);
    }
  }

  async function signInPasskey() {
    setNote("Waiting for the passkey authenticator.");
    if (isIp(window.location.hostname)) {
      setNote("WebAuthn rejects an IP address. Open http://localhost:8080. The intent stays unsigned.");
      return;
    }
    try {
      const optionsResponse = await fetch("/api/auth/passkey/login/options", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: "{}",
      });
      if (!optionsResponse.ok) {
        setNote(`${await readError(optionsResponse)} The intent stays unsigned.`);
        return;
      }
      const options = (await optionsResponse.json()) as OptionsEnvelope<PublicKeyCredentialRequestOptionsJSON>;
      const assertion: AuthenticationResponseJSON = await startAuthentication({ optionsJSON: options.options });
      const verified = await fetch("/api/auth/passkey/login/verify", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ response: assertion }),
      });
      if (!verified.ok) {
        setNote(`${await readError(verified)} The intent stays unsigned.`);
        return;
      }
      setNote("Passkey sign-in completed. The intent receipt is still unsigned. Google: false. Seed phrase accepted: false.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "The passkey ceremony stopped.";
      setNote(`${message} The intent stays unsigned.`);
    }
  }

  return (
    <section className="space-y-3 rounded-[var(--radius-xl)] border border-border bg-card p-5">
      <h2 className="font-display text-2xl">Passkey</h2>
      <p className="text-sm text-muted-foreground">
        Register or sign in with a passkey. Email and password on the sign-in page are the fallback. A seed phrase is not accepted. Google is not offered here.
      </p>
      <label className="block text-sm" htmlFor="passkey-name">
        Viewer name
        <input
          id="passkey-name"
          className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="nickname"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded-md border border-border px-3 py-2 text-sm" onClick={() => void registerPasskey()}>
          Register with a passkey
        </button>
        <button type="button" className="rounded-md border border-border px-3 py-2 text-sm" onClick={() => void signInPasskey()}>
          Sign in with a passkey
        </button>
      </div>
      <p className="text-sm text-muted-foreground" data-passkey-note="">
        {note}
      </p>
    </section>
  );
}

function isIp(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":");
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message || `Passkey request failed (${response.status}).`;
  } catch {
    return `Passkey request failed (${response.status}).`;
  }
}
