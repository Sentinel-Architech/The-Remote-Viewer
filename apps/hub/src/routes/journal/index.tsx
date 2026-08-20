import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicChrome } from "@/components/public-chrome";
import { JsonLd } from "@/components/json-ld";
import { JOURNAL } from "@/lib/trv/journal";
import { articleJsonLd, breadcrumbJsonLd, pageHead, SEO_DEFAULT_DESC } from "@/lib/trv/seo";
import { NETWORK_NAME } from "@/lib/trv/network";

export const Route = createFileRoute("/journal/")({
  head: () =>
    pageHead({
      title: "Journal",
      description:
        "Original writing from The Remote Viewer Network: daily watch, the 1983 Gateway assessment, the self-serve DApp, and the 2-day Verified trial for outside viewership.",
      path: "/journal",
    }),
  component: JournalIndex,
});

function JournalIndex() {
  return (
    <PublicChrome>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: NETWORK_NAME, path: "/" },
          { name: "Journal", path: "/journal" },
        ])}
      />
      <article className="mx-auto max-w-3xl px-5 py-10 md:px-8">
        <p className="text-[11px] tracking-[0.28em] uppercase text-accent">Organic record</p>
        <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">Journal</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {SEO_DEFAULT_DESC} These essays are the crawlable layer — not a blog farm. Each one
          links a public Viewer card, the DApp steps, or the two-day trial.
        </p>
        <ol className="mt-10 space-y-4">
          {JOURNAL.map((a) => (
            <li key={a.slug}>
              <JsonLd
                data={articleJsonLd({
                  title: a.title,
                  description: a.dek,
                  path: `/journal/${a.slug}`,
                  published: a.published,
                  modified: a.modified,
                })}
              />
              <Link
                to="/journal/$slug"
                params={{ slug: a.slug }}
                className="block rounded-[var(--radius-xl)] border border-border bg-card/90 p-5 hover:border-accent/40"
              >
                <time className="font-mono text-[11px] text-muted-foreground" dateTime={a.published}>
                  {a.published} · {a.minutes} min
                </time>
                <h2 className="mt-2 font-display text-2xl">{a.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.dek}</p>
                <p className="mt-3 text-xs uppercase tracking-wide text-accent">{a.tags.join(" · ")}</p>
              </Link>
            </li>
          ))}
        </ol>
      </article>
    </PublicChrome>
  );
}
