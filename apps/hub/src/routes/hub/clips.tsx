import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { followCreator, listClips, postClip } from "@/lib/trv/server";
import { getMediaUrl } from "@/lib/trv/media";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaStudio } from "@/components/media-studio";

export const Route = createFileRoute("/hub/clips")({ component: ClipsPage });

function ClipCard({
  title,
  handle,
  poster,
  mediaRef,
  durationSec,
}: {
  title: string;
  handle: string;
  poster: string | null;
  mediaRef: string;
  durationSec: number;
}) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    void getMediaUrl(mediaRef).then(setSrc);
  }, [mediaRef]);
  return (
    <article className="rounded-[var(--radius-xl)] border border-border bg-card p-4">
      {src ? (
        <video src={src} poster={poster || undefined} controls className="w-full rounded-[var(--radius-md)]" />
      ) : poster ? (
        <img src={poster} alt="" className="w-full rounded-[var(--radius-md)]" />
      ) : (
        <p className="text-sm text-muted-foreground">Clip lives on the creator’s node.</p>
      )}
      <h2 className="mt-3 font-display text-xl">{title}</h2>
      <p className="text-xs text-muted-foreground">@{handle} · {durationSec}s</p>
      <Button
        className="mt-3"
        size="sm"
        variant="secondary"
        onClick={async () => {
          try {
            await followCreator({ data: handle });
            toast.success(`Viewership: watching @${handle}`);
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Could not subscribe");
          }
        }}
      >
        Gain Viewership
      </Button>
    </article>
  );
}

function ClipsPage() {
  const [clips, setClips] = useState<Awaited<ReturnType<typeof listClips>>>([]);

  async function refresh() {
    setClips(await listClips());
  }
  useEffect(() => {
    void refresh().catch(() => {});
  }, []);

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <h1 className="font-display text-3xl">Viewer clips</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          5–60 second clips. Subscribe for Viewership. Video stays on-device;
          the Network holds the poster and duration.
        </p>
      </div>
      <MediaStudio
        onExport={async (e) => {
          if (e.kind !== "video" || !e.mediaRef) {
            toast.error("Record or upload a 5–60s clip.");
            return;
          }
          await postClip({
            data: {
              title: e.title,
              mediaRef: e.mediaRef,
              poster: e.poster,
              durationSec: e.durationSec || 15,
            },
          });
          toast.success("Clip on the Network");
          await refresh();
        }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {clips.map((c) => (
          <ClipCard key={c.id} title={c.title} handle={c.handle} poster={c.poster} mediaRef={c.mediaRef} durationSec={c.durationSec} />
        ))}
      </div>
      {clips.length === 0 ? <Badge variant="muted">No clips yet</Badge> : null}
    </div>
  );
}
