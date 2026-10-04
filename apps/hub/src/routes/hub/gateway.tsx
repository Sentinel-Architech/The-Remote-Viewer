import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DECLASSIFIED_TITLES, type DeclassifiedAgency } from "@/lib/trv/declassified-titles";
import { ELECTION_CATALOG, ELECTION_CATALOG_MARK } from "@/lib/trv/election-index";
import { EPSTEIN_INDEX, type EpsteinIndexGroup } from "@/lib/trv/epstein-index";
import { GATEWAY_DOCS } from "@/lib/trv/gateway";
import { localDeclassifiedSearch } from "@/lib/trv/local-search";
import { useViewer } from "@/components/viewer-context";
import { verifyViewer } from "@/lib/trv/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/hub/gateway")({ component: GatewayPage });

const FLASH = [0, 2, 3, 1];

function indexNote(mark: "third-party" | "gemini-canvas"): string {
  switch (mark) {
    case "third-party":
      return "Third-party index. Not verified government text. Title only.";
    case "gemini-canvas":
      return ELECTION_CATALOG_MARK;
    default: {
      const unseen: never = mark;
      return unseen;
    }
  }
}

function GatewayPage() {
  const { profile, setProfile } = useViewer();
  const verified = Boolean(profile?.verifiedAt);
  const [hover, setHover] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [handshake, setHandshake] = useState(false);
  const [seq, setSeq] = useState<number[]>([]);
  const [flash, setFlash] = useState<number | null>(null);

  const docs = GATEWAY_DOCS;
  const active = useMemo(() => docs.find((d) => d.id === open), [docs, open]);
  const [query, setQuery] = useState("");
  const found = useMemo(
    () => localDeclassifiedSearch({ query, verified }),
    [query, verified],
  );

  async function playFlash() {
    setSeq([]);
    for (const n of FLASH) {
      setFlash(n);
      await new Promise((r) => setTimeout(r, 420));
      setFlash(null);
      await new Promise((r) => setTimeout(r, 180));
    }
  }

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <h1 className="font-display text-3xl">The Gateway Process</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Documents and sources are free. Methods — the how of each activity —
          stay sealed until a Viewer passes the robot handshake and leaves
          Initiate. Search runs on this device over the texts already here. It
          does not send the query off the device. Named programs below are titles
          only. This install does not store a document body for them.
        </p>
        <label className="mt-4 block text-sm">
          Local search
          <input
            className="mt-1.5 w-full rounded-[var(--radius-md)] border border-input bg-elevated px-3 py-2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the texts on this device"
          />
        </label>
        {query.trim() ? (
          <div className="mt-3 text-sm text-muted-foreground">
            <p>{found.reason}</p>
            <ul className="mt-2 space-y-2">
              {found.hits.map((hit) => (
                <li key={hit.id}>
                  <span className="text-fg">
                    {hit.kind === "title"
                      ? `${hit.agency}: ${hit.title} ${hit.years}`
                      : hit.kind === "index"
                        ? `${hit.group}: ${hit.title}${hit.years ? `. ${hit.years}` : ""}${hit.agency ? `. ${hit.agency}` : ""}`
                        : hit.title}
                  </span>
                  {hit.locked ? " · sealed" : ""}
                  {hit.kind === "title" ? <span className="block text-xs">Title only.</span> : null}
                  {hit.kind === "index" && hit.indexMark ? (
                    <span className="block text-xs">{indexNote(hit.indexMark)}</span>
                  ) : null}
                  {hit.excerpt ? <span className="block text-xs">{hit.excerpt}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="mt-3">
          <Badge variant={verified ? "native" : "warn"}>
            {verified ? "Verified Viewer · methods open" : "Initiate · methods sealed"}
          </Badge>
        </div>
      </div>

      {!verified && (
        <div className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <h2 className="font-display text-xl">Robot handshake</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Watch the four-node flash, then tap the same order. This is how TRV
            verifies a Viewer is not a script.
          </p>
          <Button className="mt-3" onClick={() => { setHandshake(true); void playFlash(); }}>
            Begin handshake
          </Button>
          {handshake && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    const next = [...seq, n];
                    setSeq(next);
                    if (next.length === 4) {
                      void verifyViewer({ data: { sequence: next } }).then((r) => {
                        if (r.ok && r.profile) {
                          setProfile(r.profile);
                          toast.success("Verified Viewer. Methods unsealed.");
                          setHandshake(false);
                        } else {
                          toast.error("Handshake rejected");
                          setSeq([]);
                          void playFlash();
                        }
                      });
                    }
                  }}
                  className="h-14 rounded-[var(--radius-sm)] border border-border"
                  style={{ background: flash === n ? "#ecece8" : "#181b22" }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <h2 className="font-display text-xl">Declassified programs</h2>
        <p className="mt-2 text-sm text-muted-foreground">Titles only. No document body is stored. Search stays on this device.</p>
        {(["CIA", "NSA", "FBI", "NRO", "DIA and DOD"] as DeclassifiedAgency[]).map((agency) => (
          <div key={agency} className="mt-4">
            <h3 className="text-sm font-medium">{agency}</h3>
            <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
              {DECLASSIFIED_TITLES.filter((item) => item.agency === agency).map((item) => (
                <li key={item.title}>
                  {item.title} {item.years}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <h2 className="font-display text-xl">Epstein files index</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Third-party index. Not verified government text. Titles only. No document body is stored. Search stays on this device.
        </p>
        {(["DOJ data sets", "Media", "Dockets", "Official doors"] as EpsteinIndexGroup[]).map((group) => (
          <div key={group} className="mt-4">
            <h3 className="text-sm font-medium">{group}</h3>
            <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
              {EPSTEIN_INDEX.filter((item) => item.group === group).map((item) => (
                <li key={item.title}>{item.title}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <h2 className="font-display text-xl">{ELECTION_CATALOG.documentTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{ELECTION_CATALOG_MARK} Search stays on this device.</p>
        <p className="mt-2 text-sm text-muted-foreground">Source page, plain text: {ELECTION_CATALOG.sourcePage}</p>
        <p className="mt-2 text-sm">{ELECTION_CATALOG.subtitle}</p>
        <p className="mt-2 text-sm text-muted-foreground">{ELECTION_CATALOG.archiveScope}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          On-screen text only: {ELECTION_CATALOG.footer} {ELECTION_CATALOG.pageMarkers.join(" ")}
        </p>
        <ol className="mt-4 space-y-4 text-sm">
          {ELECTION_CATALOG.entries.map((item, index) => (
            <li key={item.title}>
              <p className="font-medium">
                {index + 1}. {item.title}. {item.when}. {item.agency}.
              </p>
              <p className="mt-1 text-muted-foreground">{item.blurb}</p>
              <p className="mt-1 text-xs text-muted-foreground">{ELECTION_CATALOG_MARK}</p>
            </li>
          ))}
        </ol>
        <div className="mt-4">
          <h3 className="text-sm font-medium">Doors, plain text</h3>
          <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
            {ELECTION_CATALOG.doors.map((door) => (
              <li key={door}>{door}</li>
            ))}
          </ul>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {docs.map((d) => {
          const locked = d.kind === "method" && !verified;
          return (
            <button
              key={d.id}
              type="button"
              onMouseEnter={() => setHover(d.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(d.id)}
              onClick={() => setOpen(d.id)}
              className="rounded-[var(--radius-xl)] border border-border bg-card p-5 text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{d.kind}</span>
                {locked && <Badge variant="warn">Paywalled method</Badge>}
              </div>
              <h2 className="mt-2 font-display text-xl">{d.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{d.summary}</p>
              {hover === d.id && (
                <p className="mt-3 text-xs leading-relaxed text-fg">
                  {locked
                    ? "Method locked. Complete the robot handshake to read the steps."
                    : d.body.slice(0, 180) + "…"}
                </p>
              )}
            </button>
          );
        })}
      </div>

      <Dialog open={Boolean(open)} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{active?.title}</DialogTitle>
            <DialogDescription>{active?.kind}</DialogDescription>
          </DialogHeader>
          {active?.kind === "method" && !verified ? (
            <p className="text-sm text-muted-foreground">
              This method is sealed. Documents remain free. Upgrade via the
              handshake above — it is a Viewer check, not a payment processor.
            </p>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{active?.body}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
