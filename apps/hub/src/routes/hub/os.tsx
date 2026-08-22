import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Radio } from "lucide-react";
import { toast } from "sonner";
import { dispatchAgent } from "@/lib/trv/sentinel-ai";
import {
  AGENTS,
  addLesson,
  edgeVitals,
  loadLessons,
  mosaicFrame,
  rememberLessonCount,
  sampleMotion,
  ordersFor,
  routeField,
  type AgentId,
  type EdgeLesson,
  type EdgeVitals,
} from "@/lib/trv/edge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useViewer } from "@/components/viewer-context";
import { JackInSession } from "@/components/os-sim/JackInSession";

export const Route = createFileRoute("/hub/os")({ component: OsPage });

function OsPage() {
  const { profile } = useViewer();
  const videoRef = useRef<HTMLVideoElement>(null);
  const framesRef = useRef<ImageData[]>([]);
  const [vitals, setVitals] = useState<EdgeVitals | null>(null);
  const [lessons, setLessons] = useState<EdgeLesson[]>([]);
  const [agent, setAgent] = useState<AgentId>("sentinel");
  const [order, setOrder] = useState(ordersFor("sentinel"));
  const [reply, setReply] = useState("");
  const [spoke, setSpoke] = useState<AgentId>("sentinel");
  const [busy, setBusy] = useState(false);
  const [cam, setCam] = useState(false);
  const [motion, setMotion] = useState(0);
  const [mosaic, setMosaic] = useState<string | null>(null);
  const [jacked, setJacked] = useState(false);

  async function refreshEdge() {
    const v = edgeVitals();
    const ls = await loadLessons();
    rememberLessonCount(ls.length);
    v.lessons = ls.length;
    setVitals(v);
    setLessons(ls);
  }

  useEffect(() => {
    void refreshEdge();
    const id = window.setInterval(() => setVitals(edgeVitals()), 4000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!cam) return;
    const id = window.setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;
      setMotion(sampleMotion(video, framesRef.current));
    }, 400);
    return () => window.clearInterval(id);
  }, [cam]);

  async function armCam() {
    const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640 }, audio: false });
    if (videoRef.current) videoRef.current.srcObject = s;
    setCam(true);
  }

  async function brief() {
    setBusy(true);
    try {
      const v = edgeVitals();
      const field = agent === "sentinel" ? routeField(order) : agent;
      const r = await dispatchAgent({
        data: {
          agent: field,
          prompt:
            agent === "sentinel"
              ? `[Super Sentinel speaking through ${AGENTS[field].name}, super of ${AGENTS[field].field}]\n${order}`
              : order,
          image: field === "watcher" ? mosaic : null,
          vitals: JSON.stringify(v),
        },
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      setSpoke(field);
      setReply(r.text);
      const at = new Date().toISOString();
      await addLesson({ at, agent: field, pattern: order.slice(0, 80), counsel: "Viewer briefed the Super.", dir: "h2m" });
      await addLesson({ at, agent: field, pattern: order.slice(0, 80), counsel: r.text.slice(0, 240), dir: "m2h" });
      await refreshEdge();
      toast.success(`${AGENTS[field].name} taught back. Lesson sealed on-edge.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Helm closed");
    } finally {
      setBusy(false);
    }
  }

  const v = vitals;
  if (jacked) return <JackInSession onClose={() => setJacked(false)} />;

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <p className="text-[11px] tracking-[0.2em] uppercase text-accent">Sentinel OS</p>
        <h1 className="mt-1 font-display text-3xl">Sentinel Super</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          One Super agent. Five domain supers — each sovereign in their field.
          You train the machine (intercepts, briefs). It trains you back (one
          practice per answer). Human → machine and machine → human, encrypted
          on this node. {profile?.federatedOptIn ? "Federated lessons on (identity-stripped)." : "Federated share is off."}
        </p>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-xl)] border border-accent/40 bg-card p-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-accent">Jack in</p>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Fly the tissue as a guided neuron. Scan unknown signatures with Sentinel on comms.
            Named classes auto-heal. A landed pulse counts as today's watch intercept.
          </p>
        </div>
        <Button onClick={() => setJacked(true)}>
          <Radio />
          Jack into SENTINEL OS
        </Button>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-xl)] border border-border bg-card p-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Skill audit</p>
          <p className="mt-1 text-sm">
            {profile?.lastSkillAuditScore != null
              ? `Last overall ${profile.lastSkillAuditScore} · par 70`
              : "Doctrine, edge, and live helm — not yet scored on this node."}
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link to="/hub/audit">Open audit</Link>
        </Button>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["HTTPS / preview", v?.https],
          ["WebCrypto AES-GCM", v?.webcrypto],
          ["Node key", v?.nodeKey],
          ["GPC honored", v?.gpc],
        ].map(([label, on]) => (
          <div key={String(label)} className="rounded-[var(--radius-xl)] border border-border bg-card p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-2xl">{on ? "Live" : "Dark"}</p>
          </div>
        ))}
      </section>
      <p className="text-xs text-muted-foreground">
        M-o-E seals {v?.moeSeals ?? 0} · encrypted lessons {v?.lessons ?? 0} · {v?.online ? "online" : "offline"}
      </p>

      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {(Object.keys(AGENTS) as AgentId[]).map((id) => (
          <button
            key={id}
            type="button"
            className={`rounded-[var(--radius-md)] border p-3 text-left ${agent === id ? "border-accent bg-elevated" : "border-border bg-card"} ${id === "sentinel" ? "sm:col-span-3 lg:col-span-6" : ""}`}
            onClick={() => {
              setAgent(id);
              setOrder(ordersFor(id));
            }}
          >
            <p className="font-display text-lg">{AGENTS[id].name}</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-accent">
              {AGENTS[id].rank === "super" ? "Super agent" : `Super of ${AGENTS[id].field}`}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{AGENTS[id].senses}</p>
          </button>
        ))}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{AGENTS[agent].duty}</p>

      {agent === "watcher" ? (
        <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <h2 className="font-display text-xl">Watcher gate</h2>
          <video ref={videoRef} autoPlay muted playsInline className="mt-3 h-40 w-full rounded-[var(--radius-md)] bg-bg object-cover" />
          <p className="mt-2 text-xs text-muted-foreground">Local motion {motion} · mosaic is what the helm may see</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => void armCam()}>
              Arm camera
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const video = videoRef.current;
                if (!video) return;
                const m = mosaicFrame(video);
                setMosaic(m);
                toast.success("Mosaic held on-device");
              }}
            >
              Mosaic still
            </Button>
          </div>
          {mosaic ? <img src={mosaic} alt="Mosaiced gate" className="mt-3 h-24 rounded object-cover" /> : null}
        </section>
      ) : null}

      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <Textarea value={order} onChange={(e) => setOrder(e.target.value)} />
        <Button className="mt-3" disabled={busy} onClick={() => void brief()}>
          {busy ? "Helm…" : `Brief ${AGENTS[agent].name}`}
        </Button>
        {reply ? (
          <p className="mt-4 text-sm leading-relaxed">
            <Badge variant="native">
              AI · {AGENTS[spoke].name} · super of {AGENTS[spoke].field}
            </Badge>
            <span className="mt-2 block">{reply}</span>
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="font-display text-xl">Human → machine</h2>
          <p className="mt-1 text-xs text-muted-foreground">What you taught the OS (briefs, intercepts).</p>
          <ul className="mt-3 space-y-2">
            {lessons.filter((l) => l.dir === "h2m").slice(0, 6).map((l, i) => (
              <li key={`h${i}`} className="rounded-[var(--radius-md)] border border-border bg-card p-3 text-sm">
                <p className="text-[11px] uppercase tracking-wide text-accent">{l.agent}</p>
                <p className="mt-1 text-muted-foreground">{l.pattern}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-xl">Machine → human</h2>
          <p className="mt-1 text-xs text-muted-foreground">What the domain super taught back.</p>
          <ul className="mt-3 space-y-2">
            {lessons.filter((l) => l.dir === "m2h").slice(0, 6).map((l, i) => (
              <li key={`m${i}`} className="rounded-[var(--radius-md)] border border-border bg-card p-3 text-sm">
                <p className="text-[11px] uppercase tracking-wide text-accent">{l.agent}</p>
                <p className="mt-1 text-muted-foreground">{l.counsel}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
