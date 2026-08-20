import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { shieldFetch, shieldSearch, type SearchHit } from "@/lib/trv/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CommsRail } from "@/components/comms-rail";

export const Route = createFileRoute("/hub/browser")({ component: BrowserPage });

type Tab = {
  id: string;
  url: string;
  title: string;
  text: string;
  links: { href: string; label: string }[];
  embed: boolean;
};

function BrowserPage() {
  const [bar, setBar] = useState("https://en.wikipedia.org/wiki/Remote_viewing");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [strip, setStrip] = useState(true);
  const [tunnel, setTunnel] = useState(true);
  const [reader, setReader] = useState(true);
  const tab = useMemo(() => tabs.find((t) => t.id === active) ?? null, [tabs, active]);

  function clean(url: string) {
    if (!strip) return url;
    try {
      const u = new URL(url);
      ["utm_source", "utm_medium", "utm_campaign", "fbclid", "gclid"].forEach((k) => u.searchParams.delete(k));
      return u.toString();
    } catch {
      return url;
    }
  }

  async function go(raw: string) {
    if (!tunnel) {
      toast.error("Tunnel off — native browser will not fetch.");
      return;
    }
    const q = raw.trim();
    if (!q) return;
    const asUrl = /^https?:\/\//i.test(q) || /^[\w.-]+\.[a-z]{2,}/i.test(q);
    setBusy(true);
    try {
      if (!asUrl) {
        const r = await shieldSearch({ data: q });
        setHits(r.hits);
        return;
      }
      const url = clean(q.startsWith("http") ? q : `https://${q}`);
      const r = await shieldFetch({ data: url });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      const id = crypto.randomUUID();
      const next: Tab = {
        id,
        url: r.url,
        title: r.title,
        text: r.text,
        links: r.links ?? [],
        embed: true,
      };
      setTabs((t) => [...t, next].slice(-8));
      setActive(id);
      setBar(r.url);
      setHits([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      setBusy(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    void go(bar);
  }

  return (
    <div className="flex min-h-0 flex-col gap-4 p-3 md:min-h-[calc(100dvh-3rem)] md:p-6 lg:flex-row">
      <div className="min-w-0 flex-1 space-y-3">
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-accent">Native browser</p>
          <h1 className="mt-1 font-display text-3xl">Sentinel Shield</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Browse the open web inside The Remote Viewer Network. Comms stay on
            the Network — you do not have to sit on Friends or on this device
            alone. This is TLS via TRV, not a kernel VPN.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 rounded-[var(--radius-xl)] border border-border bg-card px-4 py-3">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={tunnel} onCheckedChange={setTunnel} /> Tunnel
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={strip} onCheckedChange={setStrip} /> Strip trackers
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={reader} onCheckedChange={setReader} /> Reader
          </label>
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`h-9 shrink-0 rounded-[var(--radius-sm)] px-3 text-xs ${active === t.id ? "bg-elevated text-fg" : "text-muted-foreground"}`}
              onClick={() => {
                setActive(t.id);
                setBar(t.url);
              }}
            >
              {t.title.slice(0, 28)}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="flex gap-2">
          <Input
            value={bar}
            onChange={(e) => setBar(e.target.value)}
            aria-label="Address or search"
            placeholder="Search or https://"
            className="flex-1"
          />
          <Button type="submit" disabled={busy || !tunnel}>
            {busy ? "…" : "Go"}
          </Button>
        </form>
        {tab ? (
          <section className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-card">
            <p className="border-b border-border px-4 py-2 text-[11px] text-muted-foreground">{tab.url}</p>
            {reader ? (
              <article className="max-h-[60vh] overflow-y-auto p-5">
                <h2 className="font-display text-2xl">{tab.title}</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{tab.text}</p>
                {tab.links.length > 0 ? (
                  <ul className="mt-4 space-y-1">
                    {tab.links.map((l) => (
                      <li key={l.href}>
                        <button type="button" className="text-left text-sm text-accent underline-offset-2 hover:underline" onClick={() => void go(l.href)}>
                          {l.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ) : (
              <iframe
                title={tab.title}
                src={tab.url}
                className="h-[60vh] w-full bg-bg"
                sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
                referrerPolicy="no-referrer"
              />
            )}
          </section>
        ) : null}
        <ul className="space-y-2">
          {hits.map((h) => (
            <li key={h.url + h.title}>
              <button
                type="button"
                className="w-full rounded-[var(--radius-md)] border border-border bg-card p-4 text-left"
                onClick={() => void go(h.url)}
              >
                <p className="text-xs text-muted-foreground">{h.source}</p>
                <p className="text-sm font-medium">{h.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{h.snippet}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <CommsRail />
    </div>
  );
}
