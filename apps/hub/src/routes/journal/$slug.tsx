import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicChrome } from "@/components/public-chrome";
import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import { JOURNAL, JOURNAL_BY_SLUG } from "@/lib/trv/journal";
import { articleJsonLd, breadcrumbJsonLd, pageHead } from "@/lib/trv/seo";
import { NETWORK_NAME } from "@/lib/trv/network";

export const Route = createFileRoute("/journal/$slug")({
  loader: ({ params }) => {
    const article = JOURNAL_BY_SLUG[params.slug];
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData }) =>
    pageHead({
      title: loaderData?.title ?? "Journal",
      description: loaderData?.dek ?? "Journal of The Remote Viewer Network.",
      path: `/journal/${loaderData?.slug ?? ""}`,
    }),
  component: JournalArticlePage,
});

function JournalArticlePage() {
  const article = Route.useLoaderData();
  const more = JOURNAL.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <PublicChrome>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: NETWORK_NAME, path: "/" },
          { name: "Journal", path: "/journal" },
          { name: article.title, path: `/journal/${article.slug}` },
        ])}
      />
      <JsonLd
        data={articleJsonLd({
          title: article.title,
          description: article.dek,
          path: `/journal/${article.slug}`,
          published: article.published,
          modified: article.modified,
        })}
      />
      <article className="mx-auto max-w-2xl px-5 py-10 md:px-8">
        <Link to="/journal" className="text-xs tracking-[0.22em] uppercase text-muted-foreground">
          Journal
        </Link>
        <time className="mt-8 block font-mono text-[11px] text-muted-foreground" dateTime={article.published}>
          {article.published} · updated {article.modified} · {article.minutes} min
        </time>
        <h1 className="mt-3 font-display text-4xl leading-tight">{article.title}</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{article.dek}</p>
        <div className="mt-8 space-y-5 text-sm leading-relaxed md:text-base">
          {article.body.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link to="/login" search={{ trial: "verified" } as never}>
              Try Verified for 2 days
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/dapp">Self-serve DApp</Link>
          </Button>
        </div>
        <section className="mt-14">
          <h2 className="font-display text-2xl">Keep reading</h2>
          <ul className="mt-4 space-y-3">
            {more.map((a) => (
              <li key={a.slug}>
                <Link to="/journal/$slug" params={{ slug: a.slug }} className="text-accent underline-offset-4 hover:underline">
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </PublicChrome>
  );
}
