import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useViewer } from "@/components/viewer-context";
import { attestCitizen } from "@/lib/trv/server";
import { ID_TYPES, US_STATES, citizenHash, motionScore } from "@/lib/trv/citizen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/hub/citizen")({ component: CitizenPage });

function CitizenPage() {
  const { profile, setProfile } = useViewer();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [idType, setIdType] = useState("state_dl");
  const [state, setState] = useState("TX");
  const [last4, setLast4] = useState("");
  const [yob, setYob] = useState("");
  const [idSnap, setIdSnap] = useState<string | null>(null);
  const [liveScore, setLiveScore] = useState(0);
  const [recording, setRecording] = useState(false);
  const [a1, setA1] = useState(false);
  const [a2, setA2] = useState(false);
  const [a3, setA3] = useState(false);
  const [busy, setBusy] = useState(false);

  async function armCam() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    const s = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: 640, height: 480 },
      audio: false,
    });
    streamRef.current = s;
    if (videoRef.current) videoRef.current.srcObject = s;
  }

  function snapId() {
    const video = videoRef.current;
    if (!video) return;
    const c = document.createElement("canvas");
    c.width = 480;
    c.height = 300;
    c.getContext("2d")?.drawImage(video, 0, 0, 480, 300);
    setIdSnap(c.toDataURL("image/jpeg", 0.7));
    toast.success("ID frame held on this device. It is not uploaded.");
  }

  async function recordSelfie() {
    const video = videoRef.current;
    if (!video) {
      toast.error("Arm the camera first.");
      return;
    }
    setRecording(true);
    const frames: ImageData[] = [];
    const c = document.createElement("canvas");
    c.width = 160;
    c.height = 90;
    const ctx = c.getContext("2d");
    const started = Date.now();
    await new Promise<void>((resolve) => {
      const tick = () => {
        if (!ctx || Date.now() - started > 4200) {
          resolve();
          return;
        }
        ctx.drawImage(video, 0, 0, 160, 90);
        frames.push(ctx.getImageData(0, 0, 160, 90));
        window.setTimeout(tick, 280);
      };
      tick();
    });
    const score = motionScore(frames);
    setLiveScore(score);
    setRecording(false);
    if (score < 8) toast.error("Too still. Nod and hold the ID beside your face.");
    else toast.success(`Liveness ${score}. Human motion accepted.`);
  }

  async function submit() {
    if (!idSnap) {
      toast.error("Photograph the ID first.");
      return;
    }
    if (last4.length < 4 || yob.length !== 4) {
      toast.error("Last 4 of the document and birth year are required for the one-way seal.");
      return;
    }
    if (!a1 || !a2 || !a3) {
      toast.error("All three attestations are required.");
      return;
    }
    setBusy(true);
    try {
      const hash = await citizenHash({ idType, state, last4, yob });
      const p = await attestCitizen({
        data: { hash, idType, idState: state, liveness: liveScore, attest: true },
      });
      if (p) setProfile(p);
      toast.success("Citizen lock sealed. Discounts are live. ID image never left this device.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lock failed");
    } finally {
      setBusy(false);
    }
  }

  if (profile?.citizenAt) {
    return (
      <div className="space-y-4 p-5 md:p-8">
        <h1 className="font-display text-3xl">US Citizen lock</h1>
        <Badge variant="native">Sealed {new Date(profile.citizenAt).toLocaleDateString()}</Badge>
        <p className="max-w-xl text-sm text-muted-foreground">
          {profile.idType} · {profile.idState}. Shop and plans carry the citizen
          discount. The same ID seal cannot mint a second node. Hydra filings
          still use your chain address — this lock is not a public nameplate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <h1 className="font-display text-3xl">US Citizen lock</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Required for citizen discounts and to stop fake nodes. Photograph a US
          state or federal ID, then a live video selfie. The image stays on this
          device. The hub stores a one-way hash (type + state + last 4 + year) so
          one ID cannot open two accounts. This is not a DHS determination.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <div>
            <Label htmlFor="idt">US ID type</Label>
            <select
              id="idt"
              className="mt-1.5 h-11 w-full rounded-[var(--radius-sm)] border border-input bg-elevated px-3 text-sm"
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
            >
              {ID_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="st">Issuing state / DC</Label>
            <select
              id="st"
              className="mt-1.5 h-11 w-full rounded-[var(--radius-sm)] border border-input bg-elevated px-3 text-sm"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              {US_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="l4">Last 4 of document</Label>
              <Input
                id="l4"
                className="mt-1.5"
                maxLength={4}
                value={last4}
                onChange={(e) => setLast4(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4))}
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="yob">Birth year</Label>
              <Input
                id="yob"
                className="mt-1.5"
                inputMode="numeric"
                maxLength={4}
                value={yob}
                onChange={(e) => setYob(e.target.value.replace(/\D/g, "").slice(0, 4))}
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Last 4 is hashed on this device. It is never stored in plaintext.
          </p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <video ref={videoRef} autoPlay muted playsInline className="h-48 w-full rounded-[var(--radius-md)] bg-bg object-cover" />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => void armCam()}>
              Arm camera
            </Button>
            <Button type="button" variant="secondary" onClick={snapId}>
              Photograph ID
            </Button>
            <Button type="button" onClick={() => void recordSelfie()} disabled={recording}>
              {recording ? "Hold… nod + ID" : "Video selfie (4s)"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Liveness score {liveScore} · need 8+ motion</p>
          {idSnap ? <img src={idSnap} alt="ID held locally" className="mt-2 h-24 rounded object-cover" /> : null}
        </div>
      </section>

      <section className="space-y-3 rounded-[var(--radius-xl)] border border-border bg-card p-5 text-sm">
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1" checked={a1} onChange={(e) => setA1(e.target.checked)} />
          I am a United States citizen.
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1" checked={a2} onChange={(e) => setA2(e.target.checked)} />
          I live in the United States.
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1" checked={a3} onChange={(e) => setA3(e.target.checked)} />
          This is my unexpired government ID and the selfie is me, recorded live — not a still of a photo.
        </label>
        <Button disabled={busy} onClick={() => void submit()}>
          Seal Citizen lock
        </Button>
      </section>
    </div>
  );
}
