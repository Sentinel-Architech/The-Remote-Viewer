import { getCurrentDidKey, signWithDidKey, DidKeyIdentity } from './presence';

export type DidCommBasicMessage = {
  type: 'https://didcomm.org/basicmessage/2.0/message';
  id: string;
  from?: string;
  to?: string[];
  created_time?: number;
  body: {
    content: string;
  };
  // TRV extension: signature over the content
  trv_signature?: string;
};

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Create a signed DIDComm Basic Message 2.0
 * (plaintext + signature — not yet encrypted)
 */
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

/**
 * Verify a message was signed by the claimed `from` DID
 * (simplified — full verification needs public key extraction from did:key)
 */
export function verifyBasicMessage(msg: DidCommBasicMessage): boolean {
  // Placeholder: full verify needs extracting Ed25519 pubkey from did:key
  // and calling ed.verify. Add in next iteration.
  return !!(msg.from && msg.trv_signature && msg.body?.content);
}

/**
 * Local inbox (in-memory for scaffold — later: SecureStore / SQLite)
 */
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
