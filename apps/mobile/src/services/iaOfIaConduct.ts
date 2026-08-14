/**
 * IA of IA conduct loop — scaffold.
 * Anonymous formal private community inquiry → steer Sentinel conduct.
 * Full multi-agent convening is DESIGN until Stage D.
 */

import * as SecureStore from 'expo-secure-store';
import { getModeration } from './communityModeration';

const KEY = 'trv_ia_conduct_log_v1';

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export type CommunityInquiryDraft = {
  id: string;
  createdAt: number;
  /** Anonymous formal questions for private community */
  questions: string[];
  reportCount: number;
  status: 'draft' | 'sent_scaffold' | 'feedback_recorded';
  feedbackNotes: string[];
};

export type ConductSteerEvent = {
  id: string;
  createdAt: number;
  source: 'community_feedback' | 'locked_rules';
  summary: string;
};

type Store = {
  inquiries: CommunityInquiryDraft[];
  steerLog: ConductSteerEvent[];
};

const EMPTY: Store = { inquiries: [], steerLog: [] };

async function load(): Promise<Store> {
  const raw = await SecureStore.getItemAsync(KEY);
  if (!raw) return { inquiries: [], steerLog: [] };
  try {
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return { inquiries: [], steerLog: [] };
  }
}

async function save(s: Store): Promise<Store> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(s), OPTIONS);
  return s;
}

/** Build anonymous formal private inquiry from local report pressure. */
export async function draftCommunityInquiry(): Promise<CommunityInquiryDraft> {
  const mod = await getModeration();
  const reportCount = mod.reports.length;
  const draft: CommunityInquiryDraft = {
    id: `inq_${Date.now()}`,
    createdAt: Date.now(),
    reportCount,
    status: 'draft',
    feedbackNotes: [],
    questions: [
      'In private: what specifically was wrong with the reported conduct?',
      'How did it affect Viewers or trust on the network?',
      'What boundary should the Sentinel enforce more clearly going forward?',
      'Was the issue adult content without XXX marking, harassment, or prohibited deepfake/impersonation?',
    ],
  };
  const s = await load();
  s.inquiries = [draft, ...s.inquiries].slice(0, 30);
  await save(s);
  return draft;
}

/** Scaffold: mark inquiry as “sent” (no live network ballot yet). */
export async function markInquirySentScaffold(
  inquiryId: string
): Promise<CommunityInquiryDraft | null> {
  const s = await load();
  const i = s.inquiries.find((x) => x.id === inquiryId);
  if (!i) return null;
  i.status = 'sent_scaffold';
  await save(s);
  return i;
}

/** Record private community-style feedback and emit a conduct steer event. */
export async function recordFeedbackAndSteer(
  inquiryId: string,
  note: string
): Promise<{ inquiry: CommunityInquiryDraft; steer: ConductSteerEvent } | null> {
  const s = await load();
  const i = s.inquiries.find((x) => x.id === inquiryId);
  if (!i) return null;
  const cleaned = note.trim().slice(0, 1000);
  if (cleaned) i.feedbackNotes.push(cleaned);
  i.status = 'feedback_recorded';

  const steer: ConductSteerEvent = {
    id: `steer_${Date.now()}`,
    createdAt: Date.now(),
    source: 'community_feedback',
    summary: cleaned || 'Community feedback recorded for Sentinel conduct priors.',
  };
  s.steerLog = [steer, ...s.steerLog].slice(0, 50);
  await save(s);
  return { inquiry: i, steer };
}

export async function listConductStore(): Promise<Store> {
  return load();
}
