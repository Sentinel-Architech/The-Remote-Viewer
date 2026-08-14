/**
 * On-device connection list — Sovereign Social Layer slices 1 + 5.
 * SCAFFOLD / DEMONSTRATED only. No relays. No central graph.
 *
 * Connections are bound to the current identity path and
 * wiped on Destroy = Restart.
 *
 * Slice 5: portable export / import of the list.
 */

import * as SecureStore from 'expo-secure-store';
import { getCurrentDidKey } from './presence';

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

/** Portable export format (slice 5). */
export type ConnectionListExport = {
  format: 'trv-connections-v1';
  exportedAt: number;
  exporterDid: string | null;
  connections: Connection[];
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

/**
 * Portable export of the full connection list (slice 5).
 * Share or save the JSON; import on another path/device as needed.
 */
export async function exportConnectionList(): Promise<ConnectionListExport> {
  const identity = await getCurrentDidKey();
  const connections = await loadAll();
  return {
    format: 'trv-connections-v1',
    exportedAt: Date.now(),
    exporterDid: identity?.did ?? null,
    connections,
  };
}

/**
 * Import connections from a portable export (or a plain array of {id, label?}).
 * Merges by id: existing entries are kept; new ids are added.
 * Returns the updated list.
 */
export async function importConnectionList(
  payload: string | ConnectionListExport | Connection[]
): Promise<{ list: Connection[]; added: number; skipped: number }> {
  let incoming: Connection[] = [];

  if (typeof payload === 'string') {
    const parsed = JSON.parse(payload) as ConnectionListExport | Connection[];
    if (Array.isArray(parsed)) {
      incoming = parsed;
    } else if (parsed && Array.isArray((parsed as ConnectionListExport).connections)) {
      incoming = (parsed as ConnectionListExport).connections;
    } else {
      throw new Error('Unrecognized connection export format');
    }
  } else if (Array.isArray(payload)) {
    incoming = payload;
  } else if (payload && Array.isArray(payload.connections)) {
    incoming = payload.connections;
  } else {
    throw new Error('Unrecognized connection export format');
  }

  const list = await loadAll();
  const existing = new Set(list.map((c) => c.id));
  let added = 0;
  let skipped = 0;

  for (const item of incoming) {
    const id = typeof item?.id === 'string' ? item.id.trim() : '';
    if (!id) {
      skipped += 1;
      continue;
    }
    if (existing.has(id)) {
      skipped += 1;
      continue;
    }
    list.push({
      id,
      label: item.label?.trim() || undefined,
      addedAt: typeof item.addedAt === 'number' ? item.addedAt : Date.now(),
    });
    existing.add(id);
    added += 1;
  }

  await saveAll(list);
  return { list, added, skipped };
}
