import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useViewer } from "@/components/viewer-context";
import {
  followViewer,
  listNearby,
  listRtc,
  listSocial,
  listThread,
  sendMessage,
  setWatchPresence,
} from "@/lib/trv/commons";
import { WATCH_MILES } from "@/lib/trv/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ViewerMark } from "@/components/viewer-mark";

export const Route = createFileRoute("/hub/friends")({ component: FriendsPage });

function FriendsPage() {
  const { profile, setProfile } = useViewer();
  const [handle, setHandle] = useState("");
  const [social, setSocial] = useState<Awaited<ReturnType<typeof listSocial>> | null>(null);
  const [nearby, setNearby] = useState<Awaited<ReturnType<typeof listNearby>> | null>(null);
  const [peer, setPeer] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [thread, setThread] = useState<{ id: number; mine: boolean; body: string }[]>([]);
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  async function refresh() {
    const [s, n] = await Promise.all([listSocial(), listNearby()]);
    setSocial(s);
    setNearby(n);
  }

  useEffect(() => {
    void refresh().catch(() => {});
  }, []);

  useEffect(() => {
    if (!peer) return;
    void listThread({ data: peer }).then(setThread).catch(() => setThread([]));
    const t = window.setInterval(() => {
      void listThread({ data: peer }).then(setThread).catch(() => {});
      void drainRtc(peer);
    }, 1500);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peer]);

  async function drainRtc(h: string) {
    const payloads = await listRtc({ data: h }).catch(() => []);
    for (const raw of payloads) {
      let msg: { type?: string; sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit };
      try {
        msg = JSON.parse(raw) as typeof msg;
      } catch {
        continue;
      }
      const pc = pcRef.current;
      if (!pc) continue;
      if (msg.type === "offer" && msg.sdp) {
        await pc.setRemoteDescription(msg.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendMessage({ data: { handle: h, kind: "rtc", body: JSON.stringify({ type: "answer", sdp: answer }) } });
      } else if (msg.type === "answer" && msg.sdp) {
        await pc.setRemoteDescription(msg.sdp);
      } else if (msg.candidate) {
        await pc.addIceCandidate(msg.candidate).catch(() => {});
      }
    }
  }

  async function ensurePc(h: string) {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pcRef.current = pc;
    pc.onicecandidate = (e) => {
      if (!e.candidate) return;
      void sendMessage({
        data: { handle: h, kind: "rtc", body: JSON.stringify({ candidate: e.candidate }) },
      });
    };
    pc.ontrack = (e) => {
      if (remoteRef.current) remoteRef.current.srcObject = e.streams[0] ?? null;
    };
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    if (localRef.current) localRef.current.srcObject = stream;
    return pc;
  }

  async function call() {
    if (!peer) return;
    try {
      const pc = await ensurePc(peer);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendMessage({ data: { handle: peer, kind: "rtc", body: JSON.stringify({ type: "offer", sdp: offer }) } });
      toast.success("Calling…");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Call failed");
    }
  }

  async function locate() {
    if (!navigator.geolocation) {
      toast.error("No geolocation on this device");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const p = await setWatchPresence({
          data: { radiusOptIn: true, public: true, lat: pos.coords.latitude, lng: pos.coords.longitude },
        });
        if (p) setProfile(p);
        await refresh();
        toast.success(`Sentinel watch armed inside ${WATCH_MILES} miles. Coords are coarsened.`);
      },
      () => toast.error("Location permission denied"),
    );
  }

  const verified = Boolean(profile?.verifiedAt);

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <h1 className="font-display text-3xl">Friends & watch</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Follow anyone. Mutual follow + handshake unlocks unlimited text and
          video. Public nodes that opt into radius can be found within {WATCH_MILES}{" "}
          miles — Sentinel keeps watch, exact coordinates stay coarsened.
        </p>
      </div>

      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <h2 className="font-display text-xl">100-mile Sentinel watch</h2>
        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          <span>Profile public</span>
          <Switch
            checked={profile?.isPublic ?? true}
            onCheckedChange={async (v) => {
              const p = await setWatchPresence({ data: { public: v } });
              if (p) setProfile(p);
            }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          <span>Opt into {WATCH_MILES}-mile radius</span>
          <Switch
            checked={profile?.radiusOptIn ?? false}
            onCheckedChange={async (v) => {
              const p = await setWatchPresence({ data: { radiusOptIn: v } });
              if (p) setProfile(p);
            }}
          />
        </div>
        <Button className="mt-4" variant="secondary" onClick={() => void locate()}>
          Share coarsened location
        </Button>
        <ul className="mt-4 space-y-1 text-sm">
          {nearby?.ready === false ? (
            <li className="text-muted-foreground">Opt in and share location to see the mesh around you.</li>
          ) : nearby?.nodes.length === 0 ? (
            <li className="text-muted-foreground">No public Viewers in range.</li>
          ) : (
            nearby?.nodes.map((n) => (
              <li key={n.handle} className="flex justify-between gap-2">
                <span>@{n.handle}</span>
                <span className="font-mono text-xs text-muted-foreground">~{n.miles} mi</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <h2 className="font-display text-xl">Follow</h2>
        <form
          className="mt-3 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await followViewer({ data: handle });
              setHandle("");
              await refresh();
              toast.success("Following");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Follow failed");
            }
          }}
        >
          <Input placeholder="handle" value={handle} onChange={(e) => setHandle(e.target.value)} />
          <Button type="submit">Follow</Button>
        </form>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <List title="Following" rows={social?.following ?? []} onOpen={setPeer} />
          <List title="Followers" rows={social?.followers ?? []} onOpen={setPeer} />
          <List title="Friends (mutual)" rows={social?.friends ?? []} onOpen={setPeer} />
        </div>
      </section>

      {peer ? (
        <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl">@{peer}</h2>
            <div className="flex gap-2">
              <Badge variant={verified ? "native" : "warn"}>{verified ? "You verified" : "Handshake to talk"}</Badge>
              <Button size="sm" variant="secondary" onClick={() => void call()} disabled={!verified}>
                Video
              </Button>
            </div>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <video ref={localRef} autoPlay muted playsInline className="h-40 w-full rounded-[var(--radius-md)] bg-bg object-cover" />
            <video ref={remoteRef} autoPlay playsInline className="h-40 w-full rounded-[var(--radius-md)] bg-bg object-cover" />
          </div>
          <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
            {thread.map((m) => (
              <p key={m.id} className={`text-sm ${m.mine ? "text-right" : "text-muted-foreground"}`}>
                {m.body}
              </p>
            ))}
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await sendMessage({ data: { handle: peer, body: text } });
                setText("");
                setThread(await listThread({ data: peer }));
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Not sent");
              }
            }}
          >
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Unlimited text after mutual verify" />
            <Button type="submit">Send</Button>
          </form>
        </section>
      ) : null}
    </div>
  );
}

function List({
  title,
  rows,
  onOpen,
}: {
  title: string;
  rows: { handle: string; displayName: string; avatarData?: string | null; liveNow?: boolean }[];
  onOpen: (h: string) => void;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="mt-2 space-y-1">
        {rows.length === 0 ? (
          <li className="text-sm text-muted-foreground">None yet</li>
        ) : (
          rows.map((r) => (
            <li key={r.handle}>
              <button
                type="button"
                className="flex min-h-11 w-full items-center gap-2 text-left text-sm hover:underline"
                onClick={() => onOpen(r.handle)}
              >
                <ViewerMark name={r.displayName || r.handle} src={r.avatarData} live={r.liveNow} size="sm" />
                <span className="min-w-0 truncate">@{r.handle}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
