import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { newMediaId, putMedia } from "@/lib/trv/media";

export type StudioExport = {
  title: string;
  kind: "photo" | "gif" | "video";
  poster: string;
  mediaRef?: string;
  durationSec?: number;
  inspiration?: string;
};

export function MediaStudio({ onExport }: { onExport: (art: StudioExport) => void }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [kind, setKind] = useState<"photo" | "gif" | "video">("photo");
  const [filter, setFilter] = useState("none");
  const [title, setTitle] = useState("Untitled");
  const [inspiration, setInspiration] = useState("");
  const [dur, setDur] = useState(0);
  const [mediaRef, setMediaRef] = useState<string | undefined>();
  const [recording, setRecording] = useState(false);

  function loadFile(file: File) {
    const url = URL.createObjectURL(file);
    if (file.type.startsWith("video/")) {
      setKind("video");
      setSrc(url);
    } else if (file.type === "image/gif") {
      setKind("gif");
      setSrc(url);
    } else {
      setKind("photo");
      setSrc(url);
    }
  }

  function bakePhoto(): string {
    const img = imgRef.current;
    if (!img) return src || "";
    const c = document.createElement("canvas");
    c.width = Math.min(960, img.naturalWidth || 640);
    c.height = Math.round((c.width / (img.naturalWidth || 1)) * (img.naturalHeight || 360));
    const ctx = c.getContext("2d");
    if (!ctx) return src || "";
    ctx.filter = filter === "none" ? "none" : filter;
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.82);
  }

  async function startRec() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
    const rec = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: rec.mimeType || "video/webm" });
      const id = newMediaId("video");
      await putMedia(id, blob);
      setMediaRef(id);
      setKind("video");
      setSrc(URL.createObjectURL(blob));
      toast.success("Clip sealed on this device");
    };
    recRef.current = rec;
    rec.start();
    setRecording(true);
    window.setTimeout(() => {
      if (rec.state === "recording") rec.stop();
      setRecording(false);
    }, 60_000);
  }

  return (
    <div className="space-y-3 rounded-[var(--radius-xl)] border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">
        Edit a photo or a 5–60s Viewer clip on this device. Video stays in local
        media — the mint holds a poster. Inspiration can ride as a paid bundle.
      </p>
      <Input
        type="file"
        accept="image/*,video/*,image/gif"
        aria-label="Upload photo, gif, or video"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) loadFile(f);
        }}
      />
      {kind !== "video" && src ? (
        <img ref={imgRef} src={src} alt="Edit source" className="max-h-56 rounded-[var(--radius-md)]" style={{ filter }} />
      ) : (
        <video ref={videoRef} src={kind === "video" ? src || undefined : undefined} autoPlay muted playsInline className="max-h-56 w-full rounded-[var(--radius-md)] bg-bg" onLoadedMetadata={(e) => setDur(Math.round(e.currentTarget.duration || 0))} />
      )}
      {kind === "photo" ? (
        <div className="flex flex-wrap gap-2">
          {[
            ["none", "Clear"],
            ["grayscale(1)", "Bone"],
            ["contrast(1.25)", "Punch"],
            ["sepia(0.35)", "Warm"],
          ].map(([f, n]) => (
            <Button key={f} type="button" size="sm" variant={filter === f ? "default" : "secondary"} onClick={() => setFilter(f)}>
              {n}
            </Button>
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => void startRec()} disabled={recording}>
          {recording ? "Recording (max 60s)" : "Record 5–60s clip"}
        </Button>
        {recording ? (
          <Button
            type="button"
            onClick={() => {
              recRef.current?.stop();
              setRecording(false);
            }}
          >
            Stop
          </Button>
        ) : null}
      </div>
      <div>
        <Label htmlFor="mt">Title</Label>
        <Input id="mt" className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="ins">Inspiration (optional bundle)</Label>
        <Input id="ins" className="mt-1.5" value={inspiration} onChange={(e) => setInspiration(e.target.value)} placeholder="Sketch note, prompt, or source line" />
      </div>
      <Button
        type="button"
        onClick={() => {
          if (kind === "video" && dur && (dur < 5 || dur > 60)) {
            toast.error("Viewer clips must be 5–60 seconds.");
            return;
          }
          const poster =
            kind === "video" && videoRef.current && videoRef.current.videoWidth
              ? (() => {
                  const c = document.createElement("canvas");
                  c.width = 480;
                  c.height = 270;
                  c.getContext("2d")?.drawImage(videoRef.current!, 0, 0, 480, 270);
                  return c.toDataURL("image/jpeg", 0.72);
                })()
              : kind === "photo" || kind === "gif"
                ? bakePhoto()
                : src || "";
          if (!poster && !mediaRef) {
            toast.error("Add a photo or clip first.");
            return;
          }
          onExport({
            title,
            kind,
            poster: poster.startsWith("data:") ? poster : bakePhoto() || poster,
            mediaRef,
            durationSec: dur,
            inspiration: inspiration.trim() || undefined,
          });
          toast.success("Ready to mint");
        }}
      >
        Use in mint
      </Button>
    </div>
  );
}
