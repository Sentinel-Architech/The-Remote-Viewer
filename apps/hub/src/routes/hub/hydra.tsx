import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { useViewer } from "@/components/viewer-context";
import { fileHydra, listMyHydra } from "@/lib/trv/sentinel-ai";
import {
  HYDRA_CATEGORIES,
  censorDataUrl,
  emergencyForRegion,
  hashText,
  packetText,
  type HydraCategory,
} from "@/lib/trv/hydra";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/hub/hydra")({ component: HydraPage });

function HydraPage() {
  const { profile } = useViewer();
  const [category, setCategory] = useState<HydraCategory>("sa");
  const [summary, setSummary] = useState("");
  const [includeCoords, setIncludeCoords] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [filed, setFiled] = useState<Awaited<ReturnType<typeof fileHydra>> | null>(null);
  const [mine, setMine] = useState<Awaited<ReturnType<typeof listMyHydra>> | null>(null);

  useEffect(() => {
    void listMyHydra().then(setMine).catch(() => {});
  }, []);

  const help = emergencyForRegion(filed?.region ?? null);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const raw = String(reader.result || "");
      try {
        const censored = raw.startsWith("data:image") ? await censorDataUrl(raw) : raw.slice(0, 200);
        setPreview(censored.startsWith("data:image") ? censored : null);
        setHash(await hashText(censored));
        toast.success("Outbound copy mosaiced. Original is not uploaded.");
      } catch {
        toast.error("Could not censor that file");
      }
    };
    reader.readAsDataURL(f);
  }

  function locate() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        toast.message("Location held for this report only.");
      },
      () => toast.error("Location denied"),
    );
  }

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <p className="text-[11px] tracking-[0.2em] uppercase text-accent">Hydra protocol</p>
        <h1 className="mt-1 font-display text-3xl">Report harm against innocents</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The mesh knows you as a chain address
          {mine?.address ? ` (${mine.address.slice(0, 12)}…)` : profile?.hydraAddress ? ` (${profile.hydraAddress.slice(0, 12)}…)` : ""}.
          Coordinates reach local authorities only if you opt in on this filing.
          Pictures and calls are mosaiced; the original stays in local M-o-E.
          TRV routes the packet — it cannot dial 911 for you.
        </p>
      </div>

      <section className="rounded-[var(--radius-xl)] border border-warn/40 bg-card p-5">
        <h2 className="font-display text-xl">If someone is in danger now</h2>
        <p className="mt-2 text-sm text-muted-foreground">{help.note}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild>
            <a href={`tel:${help.emergencyTel}`}>Call {help.emergency}</a>
          </Button>
          <Button asChild variant="secondary">
            <a href={`tel:${help.saTel}`}>{help.saName} · {help.saDisplay}</a>
          </Button>
        </div>
      </section>

      <form
        className="space-y-3 rounded-[var(--radius-xl)] border border-border bg-card p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const r = await fileHydra({
              data: {
                category,
                summary,
                evidenceHash: hash,
                includeCoords,
                lat,
                lng,
              },
            });
            setFiled(r);
            setMine(await listMyHydra());
            toast.success("Hydra packet routed. Call the numbers — we cannot place 911.");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "File failed");
          } finally {
            setBusy(false);
          }
        }}
      >
        <Label>Category</Label>
        <div className="grid gap-1 sm:grid-cols-2">
          {HYDRA_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`h-11 rounded-[var(--radius-sm)] border px-3 text-left text-sm ${category === c.id ? "border-accent bg-elevated" : "border-border text-muted-foreground"}`}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div>
          <Label htmlFor="hs">What you suspect (no original media)</Label>
          <Textarea id="hs" className="mt-1.5" value={summary} onChange={(e) => setSummary(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="he">Evidence — censored on this device</Label>
          <input id="he" type="file" accept="image/*" className="mt-1.5 block text-sm" onChange={(e) => void onFile(e)} />
          {preview ? <img src={preview} alt="Censored outbound" className="mt-2 h-32 rounded-[var(--radius-md)]" /> : null}
          {hash ? <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">{hash}</p> : null}
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span>Give coarsened coordinates to authorities</span>
          <Switch
            checked={includeCoords}
            onCheckedChange={(v) => {
              setIncludeCoords(v);
              if (v) locate();
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Off = anonymous chain address only. On = this report carries location
          for local authorities, not the public mesh.
        </p>
        <Button type="submit" disabled={busy}>
          Seal and route Hydra packet
        </Button>
      </form>

      {filed ? (
        <section className="rounded-[var(--radius-xl)] border border-border bg-elevated p-5">
          <h2 className="font-display text-xl">In route</h2>
          <p className="mt-1 font-mono text-xs">{filed.address}</p>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs text-muted-foreground">
            {packetText({
              address: filed.address,
              category,
              summary,
              hash,
              includeCoords: filed.includeCoords,
              lat: filed.lat,
              lng: filed.lng,
              region: filed.region,
              at: new Date().toISOString(),
            })}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild>
              <a href={`tel:${filed.help.emergencyTel}`}>Call {filed.help.emergency}</a>
            </Button>
            <Button asChild variant="secondary">
              <a href={`tel:${filed.help.saTel}`}>{filed.help.saDisplay}</a>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                void navigator.clipboard.writeText(
                  packetText({
                    address: filed.address,
                    category,
                    summary,
                    hash,
                    includeCoords: filed.includeCoords,
                    lat: filed.lat,
                    lng: filed.lng,
                    region: filed.region,
                    at: new Date().toISOString(),
                  }),
                );
                toast.success("Packet copied");
              }}
            >
              Copy packet
            </Button>
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="font-display text-xl">Your filings</h2>
        <p className="mt-1 text-xs text-muted-foreground">Receipts stay on your node. The public row is the address only.</p>
        <ul className="mt-3 space-y-2">
          {(mine?.reports ?? []).map((r) => (
            <li key={r.id} className="rounded-[var(--radius-md)] border border-border bg-card p-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge>{r.category}</Badge>
                <Badge variant="muted">{r.status}</Badge>
                {r.includeCoords ? <Badge variant="warn">coords sent</Badge> : <Badge variant="native">address only</Badge>}
              </div>
              <p className="mt-2 text-muted-foreground">{r.summary}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
