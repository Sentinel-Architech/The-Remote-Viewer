import * as ed from '@noble/ed25519';
import * as SecureStore from 'expo-secure-store';
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

const INBOX_KEY = 'didcomm_inbox';

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

async function loadInbox(): Promise<DidCommBasicMessage[]> {
  try {
    const raw = await SecureStore.getItemAsync(INBOX_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DidCommBasicMessage[];
  } catch {
    return [];
  }
}

async function saveInbox(messages: DidCommBasicMessage[]): Promise<void> {
  await SecureStore.setItemAsync(INBOX_KEY, JSON.stringify(messages));
}

export async function storeMessage(msg: DidCommBasicMessage): Promise<void> {
  const inbox = await loadInbox();
  inbox.unshift(msg);
  await saveInbox(inbox);
}

export async function getInbox(): Promise<DidCommBasicMessage[]> {
  return loadInbox();
}

export async function clearInbox(): Promise<void> {
  await SecureStore.deleteItemAsync(INBOX_KEY);
}

export async function destroyDidCommState(): Promise<void> {
  await clearInbox();
}
