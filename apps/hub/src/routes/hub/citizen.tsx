import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useViewer } from "@/components/viewer-context";
import { attestCitizen } from "@/lib/trv/server";
import {
  FEDERAL_ID_TYPES,
  STATE_ID_TYPES,
  US_STATES,
  citizenHash,
  motionScore,
} from "@/lib/trv/citizen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/hub/citizen")({ component: CitizenPage });

function CitizenPage() {
  const { profile, setProfile } = useViewer();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stateType, setStateType] = useState("state_dl");
  const [fedType, setFedType] = useState("us_passport");
  const [state, setState] = useState("OH");
  const [stateLast4, setStateLast4] = useState("");
  const [fedLast4, setFedLast4] = useState("");
  const [yob, setYob] = useState("");
  const [stateSnap, setStateSnap] = useState<string | null>(null);
  const [fedSnap, setFedSnap] = useState<string | null>(null);
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

  function snap(which: "state" | "fed") {
    const video = videoRef.current;
    if (!video) return;
    const c = document.createElement("canvas");
    c.width = 480;
    c.height = 300;
    c.getContext("2d")?.drawImage(video, 0, 0, 480, 300);
    const url = c.toDataURL("image/jpeg", 0.7);
    if (which === "state") setStateSnap(url);
    else setFedSnap(url);
    toast.success(`${which === "state" ? "State" : "Federal"} ID held on this device. Not uploaded.`);
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
    if (score < 8) toast.error("Too still. Nod while both documents stay on this device.");
    else toast.success(`Liveness ${score}. Human motion accepted.`);
  }

  async function submit() {
    if (!stateSnap || !fedSnap) {
      toast.error("Photograph both the state ID and the federal ID.");
      return;
    }
    if (liveScore < 8) {
      toast.error("Live selfie with motion is required.");
      return;
    }
    if (!a1 || !a2 || !a3) {
      toast.error("All three attestations are required.");
      return;
    }
    setBusy(true);
    try {
      const hash = await citizenHash({
        stateType,
        state,
        stateLast4,
        fedType,
        fedLast4,
        yob,
      });
      const p = await attestCitizen({
        data: {
          hash,
          idType: `${stateType}+${fedType}`,
          idState: state,
          liveness: liveScore,
          attest: true,
        },
      });
      if (p) setProfile(p);
      toast.success("Citizen lock sealed. Discounts require this dual-ID seal. Images never left this device.");
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
          Dual-document seal · {profile.idType} · {profile.idState}. Shop and plan
          discounts stay off until this lock exists. Images were never uploaded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <h1 className="font-display text-3xl">US Citizen lock</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          American Citizen discounts require <strong>both</strong> a state ID
          (driver license or state card) <strong>and</strong> a federal ID
          (US passport or military / CAC), plus a live selfie. Frames stay on this
          device. The hub stores one combined one-way hash. This is not a DHS determination.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">State document</p>
          <div>
            <Label htmlFor="sidt">State ID type</Label>
            <select
              id="sidt"
              className="mt-1.5 h-11 w-full rounded-[var(--radius-sm)] border border-input bg-elevated px-3 text-sm"
              value={stateType}
              onChange={(e) => setStateType(e.target.value)}
            >
              {STATE_ID_TYPES.map((t) => (
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
          <div>
            <Label htmlFor="sl4">State document last 4</Label>
            <Input
              id="sl4"
              className="mt-1.5"
              maxLength={4}
              value={stateLast4}
              onChange={(e) => setStateLast4(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4))}
              autoComplete="off"
            />
          </div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Federal document</p>
          <div>
            <Label htmlFor="fidt">Federal ID type</Label>
            <select
              id="fidt"
              className="mt-1.5 h-11 w-full rounded-[var(--radius-sm)] border border-input bg-elevated px-3 text-sm"
              value={fedType}
              onChange={(e) => setFedType(e.target.value)}
            >
              {FEDERAL_ID_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="fl4">Federal last 4</Label>
              <Input
                id="fl4"
                className="mt-1.5"
                maxLength={4}
                value={fedLast4}
                onChange={(e) => setFedLast4(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4))}
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
        </div>
        <div className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <video ref={videoRef} autoPlay muted playsInline className="h-48 w-full rounded-[var(--radius-md)] bg-bg object-cover" />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => void armCam()}>
              Arm camera
            </Button>
            <Button type="button" variant="secondary" onClick={() => snap("state")}>
              Photograph state ID
            </Button>
            <Button type="button" variant="secondary" onClick={() => snap("fed")}>
              Photograph federal ID
            </Button>
            <Button type="button" onClick={() => void recordSelfie()} disabled={recording}>
              {recording ? "Hold…" : "Video selfie (4s)"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Liveness score {liveScore} · need 8+ motion</p>
          <div className="mt-2 flex gap-2">
            {stateSnap ? <img src={stateSnap} alt="State ID held locally" className="h-20 rounded object-cover" /> : null}
            {fedSnap ? <img src={fedSnap} alt="Federal ID held locally" className="h-20 rounded object-cover" /> : null}
          </div>
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
          Both documents are mine, unexpired, and the selfie is live — not a still of a photo.
        </label>
        <Button disabled={busy} onClick={() => void submit()}>
          Seal Citizen lock · both IDs
        </Button>
      </section>
    </div>
  );
}
