/**
 * Local profile + Nostr-shaped event export — Social Layer slice 4.
 * On-device only. Optional. Wiped on Destroy.
 * Events are NIP-01 shaped for compatibility; signatures use did:key (Ed25519).
 * Full secp256k1 Nostr relay publish is a later step.
 */

import * as SecureStore from 'expo-secure-store';
import { getCurrentDidKey, signWithDidKey } from './presence';
import { listConnections } from './connections';

const STORAGE_PROFILE = 'trv_local_profile';

const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  requireAuthentication: true,
};

export type LocalProfile = {
  displayName: string;
  about: string;
  updatedAt: number;
};

export type NostrShapedEvent = {
  kind: number;
  created_at: number;
  tags: string[][];
  content: string;
  pubkey?: string;
  id?: string;
  /** TRV local authenticity (Ed25519 over canonical body) */
  trv_signature?: string;
  trv_from_did?: string;
};

export async function getLocalProfile(): Promise<LocalProfile | null> {
  const raw = await SecureStore.getItemAsync(STORAGE_PROFILE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalProfile;
  } catch {
    return null;
  }
}

export async function setLocalProfile(
  displayName: string,
  about: string
): Promise<LocalProfile> {
  const profile: LocalProfile = {
    displayName: displayName.trim(),
    about: about.trim(),
    updatedAt: Date.now(),
  };
  await SecureStore.setItemAsync(
    STORAGE_PROFILE,
    JSON.stringify(profile),
    SECURE_OPTIONS
  );
  return profile;
}

export async function destroyLocalProfile(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_PROFILE);
}

/** kind 0 — profile metadata (NIP-01 shaped) */
export async function buildProfileEvent(): Promise<NostrShapedEvent | null> {
  const identity = await getCurrentDidKey();
  if (!identity) return null;

  const profile = (await getLocalProfile()) || {
    displayName: '',
    about: '',
    updatedAt: Date.now(),
  };

  const content = JSON.stringify({
    name: profile.displayName || undefined,
    about: profile.about || undefined,
    // TRV marker — not a Nostr replacement for secp256k1 npub
    trv_did: identity.did,
  });

  const event: NostrShapedEvent = {
    kind: 0,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content,
    trv_from_did: identity.did,
  };

  const sig = await signWithDidKey(
    JSON.stringify({
      kind: event.kind,
      created_at: event.created_at,
      tags: event.tags,
      content: event.content,
    })
  );
  if (sig) event.trv_signature = sig;

  return event;
}

/** kind 3 — follow list from on-device connections (NIP-01 shaped) */
export async function buildFollowListEvent(): Promise<NostrShapedEvent | null> {
  const identity = await getCurrentDidKey();
  if (!identity) return null;

  const connections = await listConnections();
  const tags: string[][] = connections.map((c) => {
    // Standard follow tag shape; value is the connection id (did:key or other)
    return ['p', c.id, c.label || ''];
  });

  const event: NostrShapedEvent = {
    kind: 3,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    content: '',
    trv_from_did: identity.did,
  };

  const sig = await signWithDidKey(
    JSON.stringify({
      kind: event.kind,
      created_at: event.created_at,
      tags: event.tags,
      content: event.content,
    })
  );
  if (sig) event.trv_signature = sig;

  return event;
}
