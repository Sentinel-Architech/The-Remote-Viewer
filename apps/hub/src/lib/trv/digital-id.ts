import { ownerInkSwitch, type OwnerInkResult } from "./owner-ink";
import { IN_APP_TOKEN_NAME, SEED_OFF_PHONE } from "./viewer-locks";
import { isCarrySeat, seatLabel, type ViewerSeat } from "./viewer-seat";

export const DIGITAL_ID_NAME = "TRV digital ID" as const;
export const SELFIE_MIN_SECONDS = 15;
export const SELFIE_MAX_SECONDS = 30;

const SECRET_KEY = /seed|passphrase|mnemonic|privatekey|private_key/i;

export type FederalPosture = {
  standard: "NIST SP 800-63-4";
  openSource: true;
  nativeStack: true;
  certified: false;
  federalGuarantee: false;
  google: false;
  meta: false;
  alphabet: false;
  governmentWallet: false;
  implemented: readonly string[];
  notImplemented: readonly string[];
};

export const FEDERAL_POSTURE: FederalPosture = {
  standard: "NIST SP 800-63-4",
  openSource: true,
  nativeStack: true,
  certified: false,
  federalGuarantee: false,
  google: false,
  meta: false,
  alphabet: false,
  governmentWallet: false,
  implemented: [
    "The subject is this Viewer's TRV handle.",
    "Sync starts after the first device unlock and copies no seed and no passphrase.",
    "A fingerprint counts only from a live sensor capture, not from a stored photo.",
    "A selfie counts only as a live camera recording of 15 to 30 seconds, not as a saved clip.",
    "NFC is used only when the device reports an adapter.",
    "If a private tattoo has to be photographed to verify anything, the app raises a system-wide warning that a commercial may be buying an aspect of The Remote Viewer for its own use. No image is stored or uploaded.",
    "If a corporation buys an aspect, all profits from that sale go to the community pool.",
  ],
  notImplemented: [
    "No federal certification, approval, or guarantee.",
    "No IAL2 or IAL3 identity proofing.",
    "No AAL certification and no federation assurance.",
    "No government wallet and no Google, Meta, or Alphabet identity provider.",
  ],
};

export function assertNoSecretRecord(record: Record<string, unknown>): void {
  for (const key of Object.keys(record)) {
    if (SECRET_KEY.test(key)) throw new Error(SEED_OFF_PHONE);
  }
}

export function syncAfterFirstUnlock(input: {
  seat: ViewerSeat;
  unlocked: boolean;
  alreadySynced: boolean;
  handle: string;
  planId: string;
  uiTheme: string | null;
  record: Record<string, unknown>;
}): {
  synced: boolean;
  firstUnlock: boolean;
  handle: string | null;
  planId: string | null;
  uiTheme: string | null;
  seedStored: false;
  reason: string;
} {
  assertNoSecretRecord(input.record);
  if (!input.unlocked) {
    return {
      synced: false,
      firstUnlock: false,
      handle: null,
      planId: null,
      uiTheme: null,
      seedStored: false,
      reason: `Sync waits for the first unlock on this ${seatLabel(input.seat)}. ${SEED_OFF_PHONE}`,
    };
  }
  return {
    synced: true,
    firstUnlock: !input.alreadySynced,
    handle: input.handle,
    planId: input.planId,
    uiTheme: input.uiTheme,
    seedStored: false,
    reason: input.alreadySynced
      ? `This ${seatLabel(input.seat)} already synced after unlock. The seed and the passphrase stayed off.`
      : `The first unlock synced the open TRV profile on this ${seatLabel(input.seat)}. The seed and the passphrase stayed off.`,
  };
}

export function digitalIdReward(): {
  name: typeof IN_APP_TOKEN_NAME;
  amount: null;
  notMoney: true;
  note: string;
} {
  return {
    name: IN_APP_TOKEN_NAME,
    amount: null,
    notMoney: true,
    note: `Enabling the ${DIGITAL_ID_NAME} marks extra ${IN_APP_TOKEN_NAME}. The amount is not set. It is a simulation, not money.`,
  };
}

export function qualifyFingerprint(input: { liveSensor: boolean; storedPhoto: boolean }): {
  counts: boolean;
  reason: string;
} {
  if (input.storedPhoto || !input.liveSensor) {
    return {
      counts: false,
      reason: "A stored photo of a print does not count. The device's own sensor has to capture it live.",
    };
  }
  return {
    counts: true,
    reason: "The device sensor returned a live capture. A stored photo was not used.",
  };
}

export function qualifySelfie(input: { source: "live-camera" | "file"; seconds: number }): {
  counts: boolean;
  reason: string;
} {
  if (input.source !== "live-camera") {
    return { counts: false, reason: "A saved clip does not count. The camera has to record it live." };
  }
  if (input.seconds < SELFIE_MIN_SECONDS || input.seconds > SELFIE_MAX_SECONDS) {
    return {
      counts: false,
      reason: `The live selfie has to run between ${SELFIE_MIN_SECONDS} and ${SELFIE_MAX_SECONDS} seconds.`,
    };
  }
  return { counts: true, reason: "The live camera recording is inside 15 to 30 seconds. A saved clip was not used." };
}

export function qualifyNfc(input: { adapterPresent: boolean; tagRead: boolean }): {
  capable: boolean;
  read: boolean;
  reason: string;
} {
  if (!input.adapterPresent) {
    return {
      capable: false,
      read: false,
      reason: "This device has no NFC. None was faked.",
    };
  }
  if (!input.tagRead) {
    return {
      capable: true,
      read: false,
      reason: "This device has NFC. No tag has been read.",
    };
  }
  return { capable: true, read: true, reason: "A tag was read on this device's own NFC adapter." };
}

export function verifyWithOwnerInk(input: {
  photographRequired: boolean;
  record?: Record<string, unknown>;
}): OwnerInkResult {
  return ownerInkSwitch(input);
}

export function digitalIdSummary(seat: ViewerSeat): string {
  const carry = isCarrySeat(seat) ? ` ${SEED_OFF_PHONE}` : "";
  return `${DIGITAL_ID_NAME} is open source and native to TRV. It is not a Google, Meta, Alphabet, or government wallet. It is built toward ${FEDERAL_POSTURE.standard}. It is not certified and it is not a federal guarantee.${carry}`;
}
