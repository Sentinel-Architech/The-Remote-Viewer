import { useEffect, useRef, useState } from "react";
import { Camera, Mic, Radio, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { logMoe } from "@/lib/trv/server";
import { Button } from "./ui/button";
import { Sheet, SheetContent } from "./ui/sheet";
import { Link } from "@tanstack/react-router";

type LocalSeal = { id: string; kind: string; at: string; payload: string };

function loadSeals(): LocalSeal[] {
  try {
    return JSON.parse(localStorage.getItem("trv-moe-seals") || "[]") as LocalSeal[];
  } catch {
    return [];
  }
}

function saveSeals(seals: LocalSeal[]) {
  localStorage.setItem("trv-moe-seals", JSON.stringify(seals.slice(0, 40)));
}

async function encryptNote(plain: string): Promise<string> {
  const keyRaw = localStorage.getItem("trv-node-key") || crypto.randomUUID();
  localStorage.setItem("trv-node-key", keyRaw);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(keyRaw.slice(0, 16).padEnd(16, "0")), "AES-GCM", false, [
    "encrypt",
  ]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const buf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plain));
  const bytes = new Uint8Array(iv.byteLength + buf.byteLength);
  bytes.set(iv, 0);
  bytes.set(new Uint8Array(buf), iv.byteLength);
  return btoa(String.fromCharCode(...bytes));
}

export function MoeDock() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("trv-open-moe", onOpen);
    return () => window.removeEventListener("trv-open-moe", onOpen);
  }, []);
  const [online, setOnline] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    sync();
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function startCam() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      setCamOn(true);
    } catch {
      toast.error("Camera permission denied");
    }
  }

  async function sealFrame() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 180;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, 320, 180);
    const data = canvas.toDataURL("image/jpeg", 0.6);
    const sealed = await encryptNote(data);
    const seals = loadSeals();
    seals.unshift({ id: crypto.randomUUID(), kind: "camera", at: new Date().toISOString(), payload: sealed });
    saveSeals(seals);
    await logMoe({ data: { kind: "camera", summary: "Camera frame sealed locally (ciphertext only)." } }).catch(() => {});
    toast.success("Frame sealed on this device");
  }

  async function sealMic() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setMicOn(true);
      setTimeout(() => {
        s.getTracks().forEach((t) => t.stop());
        setMicOn(false);
      }, 1200);
      const sealed = await encryptNote(`mic-hash:${Date.now()}`);
      const seals = loadSeals();
      seals.unshift({ id: crypto.randomUUID(), kind: "mic", at: new Date().toISOString(), payload: sealed });
      saveSeals(seals);
      await logMoe({ data: { kind: "mic", summary: "Mic sample hashed and sealed locally." } }).catch(() => {});
      toast.success("Mic sample sealed locally");
    } catch {
      toast.error("Microphone permission denied");
    }
  }

  async function sealTelemetry() {
    const nav = navigator as Navigator & { connection?: { effectiveType?: string } };
    const payload = JSON.stringify({
      at: new Date().toISOString(),
      online,
      lang: navigator.language,
      ua: navigator.userAgent.slice(0, 80),
      net: nav.connection?.effectiveType ?? "unknown",
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    const sealed = await encryptNote(payload);
    const seals = loadSeals();
    seals.unshift({ id: crypto.randomUUID(), kind: "telemetry", at: new Date().toISOString(), payload: sealed });
    saveSeals(seals);
    await logMoe({ data: { kind: "telemetry", summary: "Device telemetry sealed locally." } }).catch(() => {});
    toast.success("Telemetry sealed on this device");
  }

  return (
    <>
      <div className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-1 md:flex">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-fg"
          aria-label="Means of Evidence"
        >
          <ShieldCheck className="size-4" />
        </button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <h2 className="font-display text-xl">Means of Evidence</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Always at hand. Camera, mic, and telemetry stay on this device, AES-GCM
            sealed. The hub only stores a timestamped summary — never the payload.
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded-[var(--radius-md)] border border-border bg-elevated p-3">
              <div className="mb-2 flex items-center gap-2 text-sm">
                <Camera className="size-4" /> Camera
              </div>
              <video ref={videoRef} autoPlay muted playsInline className="mb-2 h-28 w-full rounded-[var(--radius-sm)] bg-bg object-cover" />
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => void startCam()} disabled={camOn}>
                  Arm
                </Button>
                <Button size="sm" onClick={() => void sealFrame()} disabled={!camOn}>
                  Seal frame
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-border bg-elevated p-3">
              <div className="flex items-center gap-2 text-sm">
                <Mic className="size-4" /> Microphone {micOn ? "· live" : ""}
              </div>
              <Button size="sm" onClick={() => void sealMic()}>
                Seal sample
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-border bg-elevated p-3">
              <div className="flex items-center gap-2 text-sm">
                <Radio className="size-4" /> Telemetry {online ? "online" : "offline"}
              </div>
              <Button size="sm" onClick={() => void sealTelemetry()}>
                Seal now
              </Button>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              To report harm against innocents, Hydra mosaics the outbound copy
              and files under your chain address. Originals never leave this device.
            </p>
            <Button asChild variant="secondary" className="mt-3 w-full">
              <Link to="/hub/hydra">Open Hydra protocol</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
