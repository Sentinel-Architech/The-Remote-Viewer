import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useViewer } from "@/components/viewer-context";
import { listLive, pulseLive, startLive, stopLive, unlockLive, followViewer } from "@/lib/trv/commons";
import { RATING_COPY, type ContentRating } from "@/lib/trv/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/hub/live")({ component: LivePage });

function LivePage() {
  const { profile } = useViewer();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [title, setTitle] = useState("Watchful live");
  const [kind, setKind] = useState<"camera" | "mic" | "both">("camera");
  const [rating, setRating] = useState<ContentRating>("standard");
  const [minutes, setMinutes] = useState(30);
  const [price, setPrice] = useState(0);
  const [liveId, setLiveId] = useState<number | null>(null);
  const [feed, setFeed] = useState<Awaited<ReturnType<typeof listLive>>>([]);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setFeed(await listLive());
  }

  useEffect(() => {
    void refresh().catch(() => {});
    const t = window.setInterval(() => void refresh().catch(() => {}), 4000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (!liveId) return;
    const tick = window.setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;
      const c = document.createElement("canvas");
      c.width = 480;
      c.height = 270;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, 480, 270);
      const frame = c.toDataURL("image/jpeg", 0.45);
      void pulseLive({ data: { id: liveId, frame } }).catch(() => {});
    }, 2200);
    return () => window.clearInterval(tick);
  }, [liveId]);

  async function goLive() {
    setBusy(true);
    try {
      const constraints: MediaStreamConstraints = {
        video: kind !== "mic",
        audio: kind !== "camera",
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      const r = await startLive({ data: { title, kind, rating, minutes, priceCredits: price } });
      setLiveId(r.id);
      toast.success(`Live for ${minutes} minutes. You choose the duration.`);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not go live");
    } finally {
      setBusy(false);
    }
  }

  async function endLive() {
    if (liveId) await stopLive({ data: liveId }).catch(() => {});
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLiveId(null);
    await refresh();
  }

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <h1 className="font-display text-3xl">Go live</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Camera, mic, or both — duration you set. Adult lives stay blurred until
          a verified Viewer follows you (and pays if you priced it). Cannabis
          garden and civic / 2A education are allowed tags.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <div>
            <Label htmlFor="lt">Title</Label>
            <Input id="lt" className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(["camera", "mic", "both"] as const).map((k) => (
              <button
                key={k}
                type="button"
                className={`h-11 rounded-[var(--radius-sm)] border text-xs capitalize ${kind === k ? "border-accent bg-elevated" : "border-border text-muted-foreground"}`}
                onClick={() => setKind(k)}
              >
                {k}
              </button>
            ))}
          </div>
          <div>
            <Label htmlFor="lr">Tag</Label>
            <select
              id="lr"
              className="mt-1.5 h-11 w-full rounded-[var(--radius-sm)] border border-input bg-elevated px-3 text-sm"
              value={rating}
              onChange={(e) => setRating(e.target.value as ContentRating)}
            >
              {Object.entries(RATING_COPY).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="lm">Minutes</Label>
              <Input
                id="lm"
                className="mt-1.5"
                type="number"
                min={1}
                max={720}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label htmlFor="lp">Price (TRV)</Label>
              <Input
                id="lp"
                className="mt-1.5"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
              />
            </div>
          </div>
          {price > 0 && !profile?.verifiedAt ? (
            <p className="text-xs text-warn">Handshake required to charge.</p>
          ) : null}
          {liveId ? (
            <Button variant="secondary" onClick={() => void endLive()}>
              End live
            </Button>
          ) : (
            <Button disabled={busy} onClick={() => void goLive()}>
              Go live
            </Button>
          )}
        </div>
        <video ref={videoRef} autoPlay muted playsInline className="h-64 w-full rounded-[var(--radius-xl)] bg-bg object-cover" />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl">On air</h2>
        {feed.length === 0 ? (
          <p className="text-sm text-muted-foreground">No lives right now.</p>
        ) : (
          feed.map((l) => (
            <article key={l.id} className="rounded-[var(--radius-xl)] border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg">{l.title}</h3>
                <Badge variant="muted">@{l.handle}</Badge>
                <Badge>{l.rating}</Badge>
              </div>
              {l.sealed ? (
                <div className="relative mt-3">
                  <div className="grid h-40 place-items-center rounded-[var(--radius-md)] bg-elevated blur-sm" />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="rounded-[var(--radius-md)] border border-border bg-card/90 p-3 text-center">
                      <p className="text-xs text-muted-foreground">
                        Adult live. Verify, follow @{l.handle}
                        {l.priceCredits ? `, then ${l.priceCredits} TRV` : ""}.
                      </p>
                      <div className="mt-2 flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={async () => {
                            await followViewer({ data: l.handle });
                            toast.success("Following");
                          }}
                        >
                          Follow
                        </Button>
                        <Button
                          size="sm"
                          onClick={async () => {
                            try {
                              await unlockLive({ data: l.id });
                              await refresh();
                            } catch (e) {
                              toast.error(e instanceof Error ? e.message : "Locked");
                            }
                          }}
                        >
                          Unseal
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : l.frame ? (
                <img src={l.frame} alt="" className="mt-3 w-full rounded-[var(--radius-md)]" />
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">Waiting on first frame…</p>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  );
}
