import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicChrome } from "@/components/public-chrome";
import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import { FAQ_ITEMS } from "@/lib/trv/journal";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/trv/seo";
import { NETWORK_NAME } from "@/lib/trv/network";

export const Route = createFileRoute("/faq")({
  head: () =>
    pageHead({
      title: "FAQ",
      description:
        "What The Remote Viewer Network is, how the 2-day Verified trial works, why daily watch retains Viewers, and how the self-serve DApp issues wallets without a ticket.",
      path: "/faq",
    }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <PublicChrome>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: NETWORK_NAME, path: "/" },
          { name: "FAQ", path: "/faq" },
        ])}
      />
      <JsonLd data={faqJsonLd(FAQ_ITEMS)} />
      <article className="mx-auto max-w-3xl px-5 py-10 md:px-8">
        <p className="text-[11px] tracking-[0.28em] uppercase text-accent">Featured answers</p>
        <h1 className="mt-3 font-display text-4xl leading-tight">Questions the crawler should rank</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Same answers in JSON-LD as on the page. No bait, no hidden asterisks. Handshake still
          gates methods. Trial is forty-eight hours, once.
        </p>
        <dl className="mt-10 space-y-4">
          {FAQ_ITEMS.map((item) => (
            <div key={item.q} className="rounded-[var(--radius-xl)] border border-border bg-card/90 p-5">
              <dt className="font-display text-xl">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link to="/login" search={{ trial: "verified" } as never}>
              Start 2-day trial
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/journal">Read the journal</Link>
          </Button>
        </div>
      </article>
    </PublicChrome>
  );
}
