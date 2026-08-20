import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExternalLink, MapPin, Radio } from "lucide-react";
import { getPublicProfile } from "@/lib/trv/server";
import { STAGE_LABEL, TIER_LABEL } from "@/lib/trv/tiers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FluidRipple } from "@/components/fluid-ripple";
import { ProfileChrome } from "@/components/profile-chrome";
import { ShareBeam } from "@/components/share-beam";
import { parseTheme } from "@/lib/trv/themes";
import { LiveBadge, ViewerMark } from "@/components/viewer-mark";
import { JsonLd } from "@/components/json-ld";
import { pageHead, personJsonLd, breadcrumbJsonLd } from "@/lib/trv/seo";
import { NETWORK_NAME } from "@/lib/trv/network";

export const Route = createFileRoute("/v/$handle")({
  loader: ({ params }) => getPublicProfile({ data: params.handle }),
  head: ({ loaderData, params }) => {
    const p = loaderData?.profile;
    return pageHead({
      title: p ? `${p.displayName} (@${p.handle})` : "Viewer not found",
      description: p?.bio || p?.statusLine || `Public Remote Viewer profile for @${params.handle} on The Remote Viewer Network. Live icon when they are on station.`,
      path: `/v/${params.handle}`,
      index: Boolean(p),
    });
  },
  component: PublicViewer,
});

function PublicViewer() {
  const { handle } = Route.useParams();
  const loaded = Route.useLoaderData();
  const [data, setData] = useState<Awaited<ReturnType<typeof getPublicProfile>> | undefined>(loaded);

  useEffect(() => {
    void getPublicProfile({ data: handle }).then(setData);
    const id = window.setInterval(() => {
      void getPublicProfile({ data: handle }).then(setData);
    }, 8000);
    return () => window.clearInterval(id);
  }, [handle]);

  if (data === undefined) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg text-sm text-muted-foreground">
        Locating Viewer…
      </main>
    );
  }
  if (data === null) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg text-sm text-muted-foreground">
        No Viewer under that handle.
      </main>
    );
  }

  const p = data.profile;
  return (
    <main className="relative min-h-dvh bg-bg text-fg">
      <JsonLd
        data={personJsonLd({
          name: p.displayName || p.handle,
          handle: p.handle,
          description: p.bio || p.statusLine || `Remote Viewer @${p.handle}`,
          path: `/v/${p.handle}`,
          jobTitle: p.craft || undefined,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: NETWORK_NAME, path: "/" },
          { name: "Viewers", path: "/viewers" },
          { name: p.displayName || p.handle, path: `/v/${p.handle}` },
        ])}
      />
      <div className="absolute inset-0 opacity-40">
        <FluidRipple viscosity={0.28} waveStrength={0.45} colorMap="frost" vortex={1.8} />
      </div>
      <div className="relative z-10 mx-auto max-w-lg px-5 py-12">
        <ProfileChrome frame={p.shopFrame} chrome={p.shopChrome} title={p.shopTitle}>
          {p.coverData ? (
            <div className="-mx-4 -mt-4 mb-4 h-36 overflow-hidden rounded-t-[var(--radius-xl)]">
              <img src={p.coverData} alt="" className="size-full object-cover" />
            </div>
          ) : null}
          <div className="flex items-end gap-3">
            <ViewerMark name={p.displayName || p.handle} src={p.avatarData} live={p.liveNow} size="lg" />
            <div className="min-w-0">
              <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">Remote Viewer</p>
              <h1 className="mt-1 font-display text-3xl">{p.displayName}</h1>
              <p className="font-mono text-sm text-muted-foreground">@{p.handle}</p>
            </div>
          </div>
          {p.liveNow ? (
            <div className="mt-3">
              <LiveBadge title={p.liveTitle} />
            </div>
          ) : null}
          {p.statusLine ? <p className="mt-3 text-sm">{p.statusLine}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant={p.nativeSecurity ? "native" : "warn"}>
              {p.nativeSecurity ? "Native TRV" : "Bridged"}
            </Badge>
            <Badge>{TIER_LABEL[p.tier as keyof typeof TIER_LABEL] ?? p.tier}</Badge>
            <Badge variant="muted">{STAGE_LABEL[p.neuronStage]}</Badge>
            {p.citizenSealed ? <Badge variant="native">Citizen</Badge> : null}
          </div>
          {(p.locationLabel || p.craft) && (
            <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {p.locationLabel ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" />
                  {p.locationLabel}
                </span>
              ) : null}
              {p.craft ? <span>{p.craft}</span> : null}
            </p>
          )}
          {p.bio && <p className="mt-5 text-sm leading-relaxed">{p.bio}</p>}
          {p.manifesto && <p className="mt-3 text-sm italic text-muted-foreground">{p.manifesto}</p>}
          {p.website || p.links.length > 0 ? (
            <ul className="mt-4 space-y-1 text-sm">
              {p.website ? (
                <li>
                  <a href={p.website} className="inline-flex items-center gap-1 text-accent hover:underline" rel="noreferrer">
                    <ExternalLink className="size-3" />
                    Website
                  </a>
                </li>
              ) : null}
              {p.links.map((l) => (
                <li key={l.url}>
                  <a href={l.url} className="inline-flex items-center gap-1 text-accent hover:underline" rel="noreferrer">
                    <ExternalLink className="size-3" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-6">
            <ShareBeam
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/v/${p.handle}`}
              label="profile"
              theme={parseTheme(p.uiTheme)}
            />
          </div>
          <div className="mt-6 flex flex-col gap-2">
            {p.liveNow ? (
              <Button asChild>
                <Link to="/login" search={{ trial: "verified" } as never}>
                  <Radio className="size-4" />
                  Live now — try Verified 2 days
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/login" search={{ trial: "verified" } as never}>
                  Register · 2-day Verified trial
                </Link>
              </Button>
            )}
            <Button asChild variant="secondary">
              <Link to="/viewers">Viewer directory</Link>
            </Button>
          </div>
          {data.nfts.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-3">
              {data.nfts.map((n) => (
                <figure key={n.id} className="rounded-[var(--radius-md)] border border-border bg-card/80 p-2">
                  <img src={n.imageData} alt="" className="aspect-square w-full rounded object-cover" />
                  <figcaption className="mt-1 text-xs">{n.title}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </ProfileChrome>
      </div>
    </main>
  );
}
