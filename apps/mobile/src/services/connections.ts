/**
 * On-device connection list — Sovereign Social Layer slice 1.
 * SCAFFOLD / DEMONSTRATED only. No relays. No central graph.
 *
 * Connections are bound to the current identity path and
 * wiped on Destroy = Restart.
 */

import * as SecureStore from 'expo-secure-store';

const STORAGE_CONNECTIONS = 'trv_connections';

const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  requireAuthentication: true,
};

export type Connection = {
  /** did:key or other public identifier of the connected party */
  id: string;
  /** Optional local label set by the user */
  label?: string;
  addedAt: number;
};

async function loadAll(): Promise<Connection[]> {
  const raw = await SecureStore.getItemAsync(STORAGE_CONNECTIONS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Connection[];
  } catch {
    return [];
  }
}

async function saveAll(list: Connection[]): Promise<void> {
  await SecureStore.setItemAsync(
    STORAGE_CONNECTIONS,
    JSON.stringify(list),
    SECURE_OPTIONS
  );
}

/**
 * Add a connection by public identifier (did:key, npub, etc.).
 * Deduplicates on id. Returns the updated list.
 */
export async function addConnection(
  id: string,
  label?: string
): Promise<Connection[]> {
  const trimmed = id.trim();
  if (!trimmed) return loadAll();

  const list = await loadAll();
  if (list.some((c) => c.id === trimmed)) {
    return list;
  }

  list.push({
    id: trimmed,
    label: label?.trim() || undefined,
    addedAt: Date.now(),
  });
  await saveAll(list);
  return list;
}

export async function removeConnection(id: string): Promise<Connection[]> {
  const list = await loadAll();
  const next = list.filter((c) => c.id !== id);
  await saveAll(next);
  return next;
}

export async function listConnections(): Promise<Connection[]> {
  return loadAll();
}

/** Wipe all connections. Called from destroyDidKey. */
export async function destroyAllConnections(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_CONNECTIONS);
}
