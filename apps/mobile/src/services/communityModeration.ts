/**
 * Viewer-controlled mute / report / block.
 * Local-first; network sync when Path B relay exists.
 */

import * as SecureStore from 'expo-secure-store';

const KEY = 'trv_moderation_v1';

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export type ReportEntry = {
  id: string;
  targetDid: string;
  reason: string;
  createdAt: number;
};

export type ModerationState = {
  muted: string[];
  blocked: string[];
  reports: ReportEntry[];
};

const EMPTY: ModerationState = { muted: [], blocked: [], reports: [] };

async function load(): Promise<ModerationState> {
  const raw = await SecureStore.getItemAsync(KEY);
  if (!raw) return { ...EMPTY, muted: [], blocked: [], reports: [] };
  try {
    const p = JSON.parse(raw) as ModerationState;
    return {
      muted: Array.isArray(p.muted) ? p.muted : [],
      blocked: Array.isArray(p.blocked) ? p.blocked : [],
      reports: Array.isArray(p.reports) ? p.reports : [],
    };
  } catch {
    return { muted: [], blocked: [], reports: [] };
  }
}

async function save(state: ModerationState): Promise<ModerationState> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(state), OPTIONS);
  return state;
}

export async function getModeration(): Promise<ModerationState> {
  return load();
}

export async function muteDid(did: string): Promise<ModerationState> {
  const s = await load();
  const id = did.trim();
  if (!id || s.muted.includes(id)) return s;
  s.muted = [...s.muted, id];
  return save(s);
}

export async function unmuteDid(did: string): Promise<ModerationState> {
  const s = await load();
  s.muted = s.muted.filter((d) => d !== did.trim());
  return save(s);
}

export async function blockDid(did: string): Promise<ModerationState> {
  const s = await load();
  const id = did.trim();
  if (!id) return s;
  if (!s.blocked.includes(id)) s.blocked = [...s.blocked, id];
  if (!s.muted.includes(id)) s.muted = [...s.muted, id];
  return save(s);
}

export async function unblockDid(did: string): Promise<ModerationState> {
  const s = await load();
  const id = did.trim();
  s.blocked = s.blocked.filter((d) => d !== id);
  return save(s);
}

export async function reportDid(
  targetDid: string,
  reason: string
): Promise<ModerationState> {
  const s = await load();
  const id = targetDid.trim();
  if (!id) return s;
  const entry: ReportEntry = {
    id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    targetDid: id,
    reason: (reason || 'unspecified').trim().slice(0, 500),
    createdAt: Date.now(),
  };
  s.reports = [entry, ...s.reports].slice(0, 100);
  return save(s);
}

export function isBlocked(state: ModerationState, did: string): boolean {
  return state.blocked.includes(did);
}

export function isMuted(state: ModerationState, did: string): boolean {
  return state.muted.includes(did) || state.blocked.includes(did);
}
