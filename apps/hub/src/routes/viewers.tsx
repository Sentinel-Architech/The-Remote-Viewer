import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin, Radio, Search } from "lucide-react";
import { PublicChrome } from "@/components/public-chrome";
import { JsonLd } from "@/components/json-ld";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiveBadge, ViewerMark } from "@/components/viewer-mark";
import { listPublicViewers } from "@/lib/trv/server";
import { breadcrumbJsonLd, pageHead, personJsonLd } from "@/lib/trv/seo";
import { NETWORK_NAME } from "@/lib/trv/network";
import { TIER_LABEL } from "@/lib/trv/tiers";

type ViewersSearch = { q?: string };

export const Route = createFileRoute("/viewers")({
  validateSearch: (s: Record<string, unknown>): ViewersSearch => ({
    q: typeof s.q === "string" ? s.q.slice(0, 64) : undefined,
  }),
  loader: () => listPublicViewers(),
  head: () =>
    pageHead({
      title: "Public Remote Viewers",
      description:
        "Directory of public Remote Viewer profiles on The Remote Viewer Network. Live icons, craft, location, and crawlable cards. Start a 2-day Verified trial from any node.",
      path: "/viewers",
    }),
  component: ViewersPage,
});

function ViewersPage() {
  const cards = Route.useLoaderData();
  const search = Route.useSearch();
  const [q, setQ] = useState(search.q ?? "");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return cards;
    return cards.filter((c) =>
      [c.handle, c.displayName, c.craft, c.locationLabel, c.statusLine, c.bio]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [cards, q]);

  return (
    <PublicChrome>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: NETWORK_NAME, path: "/" },
          { name: "Viewers", path: "/viewers" },
        ])}
      />
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
        <p className="text-[11px] tracking-[0.28em] uppercase text-accent">Public mesh</p>
        <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">Remote Viewers</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Crawlable cards. A live icon means they are on station. Outside viewership can open a
          profile and start two days of Verified without a ticket.
        </p>
        <label className="relative mt-6 block max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 pl-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search handle, craft, city"
            aria-label="Search Viewers"
          />
        </label>
        {filtered.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            No public cards match.{" "}
            <Link to="/login" search={{ trial: "verified" } as never} className="text-accent underline-offset-4 hover:underline">
              Be the first — start the 2-day trial
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <li key={c.handle}>
                <JsonLd
                  data={personJsonLd({
                    name: c.displayName || c.handle,
                    handle: c.handle,
                    description: c.bio || c.statusLine || `Remote Viewer @${c.handle}`,
                    path: `/v/${c.handle}`,
                    jobTitle: c.craft || undefined,
                  })}
                />
                <Link
                  to="/v/$handle"
                  params={{ handle: c.handle }}
                  className="flex h-full flex-col rounded-[var(--radius-xl)] border border-border bg-card/90 p-4 hover:border-accent/40"
                >
                  <div className="flex items-center gap-3">
                    <ViewerMark name={c.displayName || c.handle} src={c.avatarData} live={c.liveNow} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-display text-lg">{c.displayName || c.handle}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">@{c.handle}</p>
                    </div>
                  </div>
                  {c.liveNow ? (
                    <div className="mt-3">
                      <LiveBadge title={c.liveTitle} />
                    </div>
                  ) : null}
                  <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">
                    {c.statusLine || c.bio || "Public Remote Viewer node."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="muted">{TIER_LABEL[c.tier as keyof typeof TIER_LABEL] ?? c.tier}</Badge>
                    {c.craft ? <Badge variant="muted">{c.craft}</Badge> : null}
                    {c.locationLabel ? (
                      <Badge variant="muted">
                        <MapPin className="size-3" /> {c.locationLabel}
                      </Badge>
                    ) : null}
                    {c.liveNow ? (
                      <Badge variant="native">
                        <Radio className="size-3" /> Live
                      </Badge>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-10">
          <Button asChild>
            <Link to="/login" search={{ trial: "verified" } as never}>
              Publish your card · 2-day Verified trial
            </Link>
          </Button>
        </div>
      </div>
    </PublicChrome>
  );
}
