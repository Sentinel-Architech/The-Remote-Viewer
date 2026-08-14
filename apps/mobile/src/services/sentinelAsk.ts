/**
 * Hey Sentinel — wake phrase + question → live internet-backed answer.
 * SCAFFOLD: OS STT + DuckDuckGo Instant Answer. Not the full MoE Sentinel.
 * User must start listen; no silent cloud always-on by TRV.
 */

import { instantSearch, SearchResult } from './search';

export const WAKE_PHRASES = [
  'hey sentinel',
  'hi sentinel',
  'ok sentinel',
  'oye sentinel',
  'hola sentinel',
] as const;

export type SentinelReply = {
  question: string;
  spoken: string;
  sources: { title: string; url?: string }[];
  search: SearchResult;
  answeredAt: number;
};

/** Detect wake phrase; return remaining text after the phrase if any. */
export function extractAfterWake(transcript: string): {
  woke: boolean;
  remainder: string;
} {
  const normalized = transcript
    .toLowerCase()
    .replace(/[.,!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  for (const phrase of WAKE_PHRASES) {
    const idx = normalized.indexOf(phrase);
    if (idx !== -1) {
      const remainder = normalized.slice(idx + phrase.length).trim();
      return { woke: true, remainder };
    }
  }
  return { woke: false, remainder: '' };
}

/**
 * Build an answer from live internet Instant Answer data.
 * Prefer direct Answer → Abstract → Definition → Related snippets.
 */
export async function answerFromInternet(question: string): Promise<SentinelReply> {
  const q = question.trim();
  if (!q) {
    throw new Error('Empty question');
  }

  const search = await instantSearch(q);
  const parts: string[] = [];
  const sources: { title: string; url?: string }[] = [];

  if (search.answer) parts.push(search.answer);
  if (search.abstract) parts.push(search.abstract);
  if (search.definition) parts.push(search.definition);
  if (search.heading && parts.length === 0) parts.push(search.heading);

  for (const r of search.related.slice(0, 3)) {
    if (r.text) {
      parts.push(r.text);
      sources.push({ title: r.text.slice(0, 80), url: r.url });
    }
  }

  if (search.abstractUrl) {
    sources.unshift({
      title: search.heading || search.query,
      url: search.abstractUrl,
    });
  }

  let spoken: string;
  if (parts.length > 0) {
    spoken = parts.join(' ').replace(/\s+/g, ' ').trim();
    if (spoken.length > 600) spoken = spoken.slice(0, 597) + '…';
  } else {
    spoken =
      'I did not find an instant answer for that. You can open full web results for a deeper search on the open internet.';
  }

  return {
    question: q,
    spoken,
    sources,
    search,
    answeredAt: Date.now(),
  };
}
