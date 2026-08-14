/**
 * Live internet search — user-initiated only.
 * DuckDuckGo Instant Answer API (no key). Not full SERP; abstracts + related topics.
 * Attribution: Results from DuckDuckGo.
 */

export type SearchResult = {
  query: string;
  heading?: string;
  abstract?: string;
  abstractUrl?: string;
  answer?: string;
  definition?: string;
  related: { text: string; url?: string }[];
  rawType?: string;
};

export async function instantSearch(query: string): Promise<SearchResult> {
  const q = query.trim();
  if (!q) {
    throw new Error('Empty query');
  }

  const url =
    'https://api.duckduckgo.com/?' +
    new URLSearchParams({
      q,
      format: 'json',
      no_html: '1',
      skip_disambig: '1',
      t: 'the-remote-viewer-scaffold',
    }).toString();

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Search failed (${res.status})`);
  }

  const data = (await res.json()) as {
    Heading?: string;
    AbstractText?: string;
    AbstractURL?: string;
    Answer?: string;
    Definition?: string;
    Type?: string;
    RelatedTopics?: Array<
      | { Text?: string; FirstURL?: string }
      | { Name?: string; Topics?: Array<{ Text?: string; FirstURL?: string }> }
    >;
  };

  const related: { text: string; url?: string }[] = [];
  for (const item of data.RelatedTopics || []) {
    if ('Text' in item && item.Text) {
      related.push({ text: item.Text, url: item.FirstURL });
    } else if ('Topics' in item && item.Topics) {
      for (const t of item.Topics) {
        if (t.Text) related.push({ text: t.Text, url: t.FirstURL });
      }
    }
    if (related.length >= 8) break;
  }

  return {
    query: q,
    heading: data.Heading || undefined,
    abstract: data.AbstractText || undefined,
    abstractUrl: data.AbstractURL || undefined,
    answer: data.Answer || undefined,
    definition: data.Definition || undefined,
    related,
    rawType: data.Type || undefined,
  };
}

/** Full web results page (user opens in browser / system handler). */
export function webSearchUrl(query: string): string {
  return (
    'https://duckduckgo.com/?' +
    new URLSearchParams({ q: query.trim() }).toString()
  );
}
