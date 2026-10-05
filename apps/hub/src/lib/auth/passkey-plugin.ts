/**
 * Native WebAuthn passkey flow on this app's Better Auth handler.
 *
 * better-auth 1.6.30 does not ship a passkey plugin. This endpoint pair
 * registers a credential, stores the public key, and opens a session.
 * Email and password stay available on /login. No Google provider is added.
 */

import { createAuthEndpoint } from "@better-auth/core/api";
import { setSessionCookie } from "better-auth/cookies";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { randomBytes, randomUUID } from "node:crypto";
import * as z from "zod";
import { getSql } from "../db";
import { passkeyRelyingParty, rejectPasskeySeedPhrase } from "./passkey";

type StoredPasskey = {
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number;
};

const registerOptionsBody = z.object({
  name: z.string().min(1).max(40),
});

const registerVerifyBody = z.object({
  name: z.string().min(1).max(40),
  response: z.custom<RegistrationResponseJSON>(),
});

const loginVerifyBody = z.object({
  response: z.custom<AuthenticationResponseJSON>(),
});

function partyFrom(request: Request | undefined) {
  const origin = request?.headers.get("origin") ?? null;
  return passkeyRelyingParty(origin);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const source = Buffer.from(value, "base64url");
  const copy = new ArrayBuffer(source.byteLength);
  new Uint8Array(copy).set(source);
  return new Uint8Array(copy);
}

async function savePasskey(row: StoredPasskey & { id: string }): Promise<void> {
  const sql = await getSql();
  await sql.query(
    `insert into viewer_passkey (id, user_id, credential_id, public_key, counter)
     values ($1, $2, $3, $4, $5)`,
    [row.id, row.user_id, row.credential_id, row.public_key, row.counter],
  );
}

async function findPasskey(credentialId: string): Promise<StoredPasskey | null> {
  const sql = await getSql();
  const rows = await sql.query<StoredPasskey>(
    `select user_id, credential_id, public_key, counter
     from viewer_passkey where credential_id = $1 limit 1`,
    [credentialId],
  );
  return rows[0] ?? null;
}

async function setCounter(credentialId: string, counter: number): Promise<void> {
  const sql = await getSql();
  await sql.query(`update viewer_passkey set counter = $2 where credential_id = $1`, [
    credentialId,
    counter,
  ]);
}

export function passkeyPlugin() {
  return {
    id: "trv-passkey",
    endpoints: {
      passkeyRegisterOptions: createAuthEndpoint(
        "/passkey/register/options",
        { method: "POST", body: registerOptionsBody },
        async (ctx) => {
          const party = partyFrom(ctx.request);
          rejectPasskeySeedPhrase(ctx.body.name);
          const options = await generateRegistrationOptions({
            rpName: party.rpName,
            rpID: party.rpID,
            userName: ctx.body.name,
            userDisplayName: ctx.body.name,
            attestationType: "none",
            authenticatorSelection: {
              residentKey: "required",
              userVerification: "required",
            },
          });
          await ctx.context.internalAdapter.createVerificationValue({
            identifier: `passkey-register:${options.challenge}`,
            value: ctx.body.name,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          });
          return ctx.json({
            options,
            google: false,
            seedPhraseAccepted: false,
            emailFallback: "/login",
          });
        },
      ),
      passkeyRegisterVerify: createAuthEndpoint(
        "/passkey/register/verify",
        { method: "POST", body: registerVerifyBody },
        async (ctx) => {
          const party = partyFrom(ctx.request);
          rejectPasskeySeedPhrase(ctx.body.name);
          const challenge = ctx.body.response.response.clientDataJSON;
          const clientData = JSON.parse(
            Buffer.from(challenge, "base64url").toString("utf8"),
          ) as { challenge?: string };
          const expected = clientData.challenge;
          if (!expected) throw ctx.error("BAD_REQUEST", { message: "The passkey challenge is missing." });
          const stored = await ctx.context.internalAdapter.consumeVerificationValue(
            `passkey-register:${expected}`,
          );
          if (!stored || stored.value !== ctx.body.name) {
            throw ctx.error("BAD_REQUEST", { message: "The passkey challenge was not issued for this name." });
          }
          const verified = await verifyRegistrationResponse({
            response: ctx.body.response,
            expectedChallenge: expected,
            expectedOrigin: party.origin,
            expectedRPID: party.rpID,
            requireUserVerification: true,
          });
          if (!verified.verified) {
            throw ctx.error("BAD_REQUEST", { message: "The passkey registration was not verified." });
          }
          const credential = verified.registrationInfo.credential;
          const email = `passkey-${randomBytes(8).toString("hex")}@passkey.invalid`;
          const user = await ctx.context.internalAdapter.createUser({
            email,
            name: ctx.body.name,
            emailVerified: false,
          });
          await ctx.context.internalAdapter.createAccount({
            userId: user.id,
            providerId: "passkey",
            accountId: credential.id,
          });
          await savePasskey({
            id: randomUUID(),
            user_id: user.id,
            credential_id: credential.id,
            public_key: bytesToBase64Url(credential.publicKey),
            counter: credential.counter,
          });
          const session = await ctx.context.internalAdapter.createSession(user.id);
          await setSessionCookie(ctx, { session, user });
          return ctx.json({
            signedIn: true,
            method: "passkey",
            name: user.name,
            google: false,
            seedPhraseAccepted: false,
            intentSigned: false,
          });
        },
      ),
      passkeyLoginOptions: createAuthEndpoint(
        "/passkey/login/options",
        { method: "POST" },
        async (ctx) => {
          const party = partyFrom(ctx.request);
          const options = await generateAuthenticationOptions({
            rpID: party.rpID,
            userVerification: "required",
          });
          await ctx.context.internalAdapter.createVerificationValue({
            identifier: `passkey-login:${options.challenge}`,
            value: "login",
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          });
          return ctx.json({
            options,
            google: false,
            seedPhraseAccepted: false,
            emailFallback: "/login",
          });
        },
      ),
      passkeyLoginVerify: createAuthEndpoint(
        "/passkey/login/verify",
        { method: "POST", body: loginVerifyBody },
        async (ctx) => {
          const party = partyFrom(ctx.request);
          const clientData = JSON.parse(
            Buffer.from(ctx.body.response.response.clientDataJSON, "base64url").toString("utf8"),
          ) as { challenge?: string };
          const expected = clientData.challenge;
          if (!expected) throw ctx.error("BAD_REQUEST", { message: "The passkey challenge is missing." });
          const storedChallenge = await ctx.context.internalAdapter.consumeVerificationValue(
            `passkey-login:${expected}`,
          );
          if (!storedChallenge) {
            throw ctx.error("BAD_REQUEST", { message: "The passkey challenge was not issued." });
          }
          const row = await findPasskey(ctx.body.response.id);
          if (!row) throw ctx.error("BAD_REQUEST", { message: "This passkey is not registered." });
          const verified = await verifyAuthenticationResponse({
            response: ctx.body.response,
            expectedChallenge: expected,
            expectedOrigin: party.origin,
            expectedRPID: party.rpID,
            requireUserVerification: true,
            credential: {
              id: row.credential_id,
              publicKey: base64UrlToBytes(row.public_key),
              counter: row.counter,
            },
          });
          if (!verified.verified) {
            throw ctx.error("BAD_REQUEST", { message: "The passkey sign-in was not verified." });
          }
          await setCounter(row.credential_id, verified.authenticationInfo.newCounter);
          const user = await ctx.context.internalAdapter.findUserById(row.user_id);
          if (!user) throw ctx.error("BAD_REQUEST", { message: "The passkey user is missing." });
          const session = await ctx.context.internalAdapter.createSession(user.id);
          await setSessionCookie(ctx, { session, user });
          return ctx.json({
            signedIn: true,
            method: "passkey",
            name: user.name,
            google: false,
            seedPhraseAccepted: false,
            intentSigned: false,
          });
        },
      ),
    },
  };
}
