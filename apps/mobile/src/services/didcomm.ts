import * as ed from '@noble/ed25519';
import { base58btc } from 'multiformats/bases/base58';
import {
  getCurrentDidKey,
  signWithDidKey,
} from './presence';

export type DidCommBasicMessage = {
  type: 'https://didcomm.org/basicmessage/2.0/message';
  id: string;
  from?: string;
  to?: string[];
  created_time?: number;
  body: {
    content: string;
  };
  trv_signature?: string;
};

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function publicKeyFromDidKey(did: string): Uint8Array | null {
  try {
    if (!did.startsWith('did:key:')) return null;
    const multibase = did.replace('did:key:', '');
    const decoded = base58btc.decode(multibase);
    if (decoded.length < 34) return null;
    return decoded.slice(2);
  } catch {
    return null;
  }
}

export async function createBasicMessage(
  content: string,
  toDid?: string
): Promise<DidCommBasicMessage | null> {
  const identity = await getCurrentDidKey();
  if (!identity) return null;

  const msg: DidCommBasicMessage = {
    type: 'https://didcomm.org/basicmessage/2.0/message',
    id: uuid(),
    from: identity.did,
    to: toDid ? [toDid] : undefined,
    created_time: Math.floor(Date.now() / 1000),
    body: { content },
  };

  const sig = await signWithDidKey(JSON.stringify(msg.body));
  if (sig) msg.trv_signature = sig;

  return msg;
}

export async function verifyBasicMessage(
  msg: DidCommBasicMessage
): Promise<boolean> {
  if (!msg.from || !msg.trv_signature || !msg.body?.content) return false;

  const publicKey = publicKeyFromDidKey(msg.from);
  if (!publicKey) return false;

  try {
    const messageBytes = new TextEncoder().encode(JSON.stringify(msg.body));
    const signature = Buffer.from(msg.trv_signature, 'hex');
    return await ed.verifyAsync(signature, messageBytes, publicKey);
  } catch {
    return false;
  }
}

const inbox: DidCommBasicMessage[] = [];

export function storeMessage(msg: DidCommBasicMessage) {
  inbox.unshift(msg);
}

export function getInbox(): DidCommBasicMessage[] {
  return [...inbox];
}

export function clearInbox() {
  inbox.length = 0;
}

export function destroyDidCommState() {
  clearInbox();
}