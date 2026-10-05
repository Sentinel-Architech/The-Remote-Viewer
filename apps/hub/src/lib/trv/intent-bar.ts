/**
 * Embeddable intent bar.
 *
 * A person types what they want. The bar parses that sentence, shows a
 * simulation, and writes a receipt before any signature. No wallet is
 * connected. No signing key is created. Gas is recorded against the token
 * being moved. There is no solver auction, fee split, or partner.
 */

import { keccak_256 } from "@noble/hashes/sha3.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";

export const INTENT_LINE =
  "Tell it what you want. It handles the rest. No gas popups and no failed trades.";

const SEND =
  /^send\s+(\d+)\s+([A-Za-z]{2,12})\s+to\s+(0x[0-9a-fA-F]{40})\s+slippage\s+(\d+)\s+bps\s*$/i;

export type SendIntent = {
  parsed: true;
  action: "send";
  amount: string;
  asset: string;
  destination: string;
  slippageBps: number;
  sourceText: string;
};

export type UnparsedIntent = {
  parsed: false;
  sourceText: string;
  reason: string;
};

export type ParsedIntent = SendIntent | UnparsedIntent;

export type GasRecord = {
  paidInMovedToken: true;
  asset: string;
  quotedAmount: null;
  personMustBuyEth: false;
  personMustBuyMatic: false;
  personMustBuySol: false;
  auction: null;
  feeSplit: null;
  partner: null;
};

export type Receipt = {
  id: string;
  beforeSigning: true;
  signed: false;
  signature: null;
  summary: string;
};

export type PreparedIntent = {
  parsed: true;
  line: typeof INTENT_LINE;
  intent: SendIntent;
  walletConnected: false;
  signed: false;
  signature: null;
  onChainSettled: false;
  submitted: false;
  gas: GasRecord;
  spend: { asset: string; amount: string };
  slippageBps: number;
  receipt: Receipt;
  sharePath: string;
  typedDigestHex: string;
  settlement: {
    submitted: false;
    reason: string;
  };
};

export type PasskeySignInRequest = {
  method: "passkey";
  seedPhraseAccepted: false;
  google: false;
  rpName: "The Remote Viewer";
  rpId: string;
  userVerification: "required";
  challengeHex: string;
};

export function rejectSeedPhrase(text: string): void {
  if (/\b(seed phrase|mnemonic|passphrase)\b/i.test(text)) {
    throw new Error("A seed phrase is not a sign-in.");
  }
}

export function parseIntent(text: string): ParsedIntent {
  rejectSeedPhrase(text);
  const match = SEND.exec(text.trim());
  if (!match) {
    return {
      parsed: false,
      sourceText: text,
      reason:
        "Use: send <amount> <asset> to <0x address> slippage <bps> bps. Nothing else is guessed.",
    };
  }
  const amount = match[1] ?? "";
  const asset = match[2] ?? "";
  const destination = (match[3] ?? "").toLowerCase();
  const slippageBps = Number(match[4]);
  if (!Number.isSafeInteger(slippageBps)) {
    return {
      parsed: false,
      sourceText: text,
      reason: "The slippage limit is not a whole number of basis points.",
    };
  }
  return {
    parsed: true,
    action: "send",
    amount,
    asset,
    destination,
    slippageBps,
    sourceText: text.trim(),
  };
}

export function intentLink(text: string): string {
  return `/hub/intent?want=${encodeURIComponent(text)}`;
}

export function passkeySignInRequest(host: string, challenge: Uint8Array): PasskeySignInRequest {
  if (!host || host.includes(" ")) {
    throw new Error("Passkey sign-in needs the page host.");
  }
  if (challenge.length < 16) {
    throw new Error("Passkey challenge is too short.");
  }
  return {
    method: "passkey",
    seedPhraseAccepted: false,
    google: false,
    rpName: "The Remote Viewer",
    rpId: host,
    userVerification: "required",
    challengeHex: bytesToHex(challenge),
  };
}

export function prepareIntent(text: string): PreparedIntent | UnparsedIntent {
  const intent = parseIntent(text);
  if (!intent.parsed) return intent;
  const gas: GasRecord = {
    paidInMovedToken: true,
    asset: intent.asset,
    quotedAmount: null,
    personMustBuyEth: false,
    personMustBuyMatic: false,
    personMustBuySol: false,
    auction: null,
    feeSplit: null,
    partner: null,
  };
  const sharePath = intentLink(intent.sourceText);
  const typedDigestHex = bytesToHex(intentDigest(intent));
  const receiptBody = {
    beforeSigning: true as const,
    signed: false as const,
    action: intent.action,
    amount: intent.amount,
    asset: intent.asset,
    destination: intent.destination,
    slippageBps: intent.slippageBps,
    gasAsset: gas.asset,
    typedDigestHex,
  };
  const receipt: Receipt = {
    id: bytesToHex(sha256(new TextEncoder().encode(JSON.stringify(receiptBody)))),
    beforeSigning: true,
    signed: false,
    signature: null,
    summary: `Simulated send of ${intent.amount} ${intent.asset} to ${intent.destination} with slippage ${intent.slippageBps} bps. Not signed.`,
  };
  return {
    parsed: true,
    line: INTENT_LINE,
    intent,
    walletConnected: false,
    signed: false,
    signature: null,
    onChainSettled: false,
    submitted: false,
    gas,
    spend: { asset: intent.asset, amount: intent.amount },
    slippageBps: intent.slippageBps,
    receipt,
    sharePath,
    typedDigestHex,
    settlement: {
      submitted: false,
      reason:
        "No contract is deployed and no signing key is present. The receipt is the simulation, written before a signature.",
    },
  };
}

/** Refuse a proposal that spends more, or slips more, than the person stated. */
export function assertWithinHardLimits(
  stated: SendIntent,
  proposed: { amount: string; slippageBps: number },
): void {
  if (BigInt(proposed.amount) > BigInt(stated.amount)) {
    throw new Error("The spend is above the amount the person allowed.");
  }
  if (proposed.slippageBps > stated.slippageBps) {
    throw new Error("The slippage is above the limit the person stated.");
  }
}

function intentDigest(intent: SendIntent): Uint8Array {
  const domainType = "EIP712Domain(string name,string version)";
  const intentType =
    "Intent(string action,string asset,uint256 amount,address destination,uint256 slippageBps)";
  const domainSeparator = hashStruct(domainType, [
    keccakBytes(utf8("The Remote Viewer")),
    keccakBytes(utf8("1")),
  ]);
  const structHash = hashStruct(intentType, [
    keccakBytes(utf8(intent.action)),
    keccakBytes(utf8(intent.asset)),
    uint256(intent.amount),
    addressWord(intent.destination),
    uint256(String(intent.slippageBps)),
  ]);
  const packed = new Uint8Array(2 + 32 + 32);
  packed[0] = 0x19;
  packed[1] = 0x01;
  packed.set(domainSeparator, 2);
  packed.set(structHash, 34);
  return keccak_256(packed);
}

function hashStruct(type: string, fields: Uint8Array[]): Uint8Array {
  const parts = [keccakBytes(utf8(type)), ...fields];
  const joined = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    joined.set(part, offset);
    offset += part.length;
  }
  return keccak_256(joined);
}

function keccakBytes(bytes: Uint8Array): Uint8Array {
  return keccak_256(bytes);
}

function utf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function uint256(decimal: string): Uint8Array {
  if (!/^\d+$/.test(decimal)) {
    throw new Error("Amount is not a whole number.");
  }
  const word = new Uint8Array(32);
  let value = BigInt(decimal);
  for (let i = 31; i >= 0; i -= 1) {
    word[i] = Number(value & 0xffn);
    value >>= 8n;
  }
  return word;
}

function addressWord(address: string): Uint8Array {
  const hex = address.slice(2);
  const raw = hexToBytes(hex);
  if (raw.length !== 20) throw new Error("Destination is not a 20-byte address.");
  const word = new Uint8Array(32);
  word.set(raw, 12);
  return word;
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}
