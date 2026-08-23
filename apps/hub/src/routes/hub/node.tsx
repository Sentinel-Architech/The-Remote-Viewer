import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Cpu, Fingerprint, Lock, Play, Radio, Send, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useViewer } from "@/components/viewer-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { askSentinel } from "@/lib/trv/sentinel-ai";
import {
  attestNode,
  destroyNode,
  executeInference,
  executeNodeAttestation,
  identityFingerprint,
  isProvisioned,
  MODEL_ID,
  onNodeChange,
  parseTensor,
  peekIdentity,
  provisionNode,
  restoreIdentity,
  samplePacket,
  type AttestationReceipt,
  type InferenceReceipt,
  type NodeIdentity,
} from "@/lib/trv/node-runtime";

export const Route = createFileRoute("/hub/node")({ component: NodePage });

type LogKind = "ok" | "warn" | "threat" | "info";
type LogEntry = { id: number; at: string; kind: LogKind; line: string };

let logSeq = 0;

function short(hex: string, n = 8) {
  if (hex.length <= n * 2 + 1) return hex;
  return `${hex.slice(0, n)}…${hex.slice(-n)}`;
}

function stamp() {
  return new Date().toLocaleTimeString([], { hour12: false });
}

function NodePage() {
  const { profile } = useViewer();
  const [identity, setIdentity] = useState<NodeIdentity | null>(null);
  const [fp, setFp] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<AttestationReceipt | null>(null);
  const [prompt, setPrompt] = useState(
    "Attest this node and state what stays on-device versus what the hub may see.",
  );
  const [generation, setGeneration] = useState("");
  const [tensor, setTensor] = useState("0.90 0.10 0.85 0.70 0.05 0.80 0.60 0.20");
  const [inference, setInference] = useState<InferenceReceipt | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);

  const live = isProvisioned();

  function push(kind: LogKind, line: string) {
    setLog((prev) => [{ id: ++logSeq, at: stamp(), kind, line }, ...prev].slice(0, 48));
  }

  useEffect(() => {
    push("info", "Unified sovereign node runtime ready · IndexedDB identity · xAI on press · linear zkML twin");
    const off = onNodeChange(() => setIdentity(peekIdentity()));
    void restoreIdentity().then(async (id) => {
      setIdentity(id);
      if (id) {
        setFp(await identityFingerprint());
        push("ok", `Restored node ${short(id.pubkeyHex)}`);
      }
    });
    return off;
  }, []);

  async function onProvision() {
    setBusy("provision");
    try {
      const id = await provisionNode();
      setIdentity(id);
      setReceipt(null);
      setFp(await identityFingerprint());
      push("ok", `Provisioned Ed25519 node ${short(id.pubkeyHex)}`);
      toast.success("Node provisioned on this device");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Provision failed";
      push("threat", msg);
      toast.error(msg);
    } finally {
      setBusy(null);
    }
  }

  async function onDestroy() {
    setBusy("destroy");
    try {
      await destroyNode();
      setIdentity(null);
      setReceipt(null);
      setFp(null);
      push("warn", "Destroy = Restart · identity wiped from this device");
      toast.success("Identity destroyed");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Destroy failed";
      push("threat", msg);
      toast.error(msg);
    } finally {
      setBusy(null);
    }
  }

  async function onAttest() {
    setBusy("attest");
    try {
      const r = await attestNode();
      setReceipt(r);
      const verify = await executeNodeAttestation(r.pubkeyHex);
      push(r.verified ? "ok" : "threat", `${verify} · nonce ${short(r.nonce, 6)}`);
      toast.success(r.verified ? "Node verified" : "Attestation rejected");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Attestation failed";
      push("threat", msg);
      toast.error(msg);
    } finally {
      setBusy(null);
    }
  }

  async function onGenerate() {
    setBusy("generate");
    setGeneration("");
    try {
      const res = await askSentinel({ data: { prompt } });
      if (!res.ok) {
        push("warn", res.error);
        toast.error(res.error);
        return;
      }
      setGeneration(res.text);
      push("ok", `Orchestrator grok-4.5 · ${res.text.length} chars`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generate failed";
      push("threat", msg);
      toast.error(msg);
    } finally {
      setBusy(null);
    }
  }

  async function onInfer(kind?: "clear" | "hostile") {
    setBusy("infer");
    try {
      const input = kind ? samplePacket(kind) : parseTensor(tensor);
      if (kind) setTensor(input.join(" "));
      const r = await executeInference(input);
      setInference(r);
      push(
        r.label === "hostile" ? "threat" : "ok",
        `zkML ${r.label} · score ${r.score.toFixed(3)} · ${short(r.commitment)}`,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Inference failed";
      push("threat", msg);
      toast.error(msg);
    } finally {
      setBusy(null);
    }
  }

  const subsystems = useMemo(
    () => [
      { id: "sled", label: "Identity store", on: Boolean(identity), note: "IndexedDB · desktop uses sled" },
      { id: "attestation", label: "Attestation", on: Boolean(receipt?.verified), note: "Ed25519 challenge + nonce" },
      { id: "ollama", label: "Orchestrator", on: Boolean(generation), note: "hub: grok-4.5 · node: ollama-rs" },
      { id: "zkml", label: "zkML", on: Boolean(inference), note: MODEL_ID },
    ],
    [identity, receipt, generation, inference],
  );

  if (!profile) {
    return <div className="p-8 text-sm text-muted-foreground">Binding node…</div>;
  }

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <p className="text-[11px] tracking-[0.2em] uppercase text-accent">Sovereign node</p>
        <h1 className="mt-1 font-display text-3xl">Unified runtime</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Local-first identity, attestation, model orchestration, verifiable inference.
          The seed stays in this browser (IndexedDB). Desktop sled / ollama-rs / tract-onnx
          is the proving twin — not a cloud custody path. Destroy = Restart.
          {live ? " Bound." : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {subsystems.map((s) => (
          <div key={s.id} className="rounded-[var(--radius-xl)] border border-border bg-card px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <Badge variant={s.on ? "native" : "muted"}>{s.on ? "hot" : "idle"}</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{s.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="size-4 text-accent" />
              Identity store
            </CardTitle>
            <CardDescription>
              sled key <span className="font-mono">{"identity:<pubkey>"}</span>. Secret seed stays on this node.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Public key</Label>
              <p className="mt-1 break-all font-mono text-xs">{identity ? identity.pubkeyHex : "— not provisioned —"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Base58</Label>
                <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                  {identity ? identity.pubkeyB58 : "—"}
                </p>
              </div>
              <div>
                <Label>Fingerprint</Label>
                <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">{fp ?? "—"}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void onProvision()} disabled={busy !== null}>
                {identity ? "Rotate node" : "Provision node"}
              </Button>
              <Button variant="secondary" onClick={() => void onAttest()} disabled={!identity || busy !== null}>
                <Shield className="size-4" />
                Attest
              </Button>
              <Button
                variant="outline"
                onClick={() => void onDestroy()}
                disabled={!identity || busy !== null}
                aria-label="Destroy identity"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            {receipt ? (
              <div className="rounded-[var(--radius-md)] border border-border bg-elevated p-3">
                <div className="flex items-center justify-between">
                  <Label>Last attestation</Label>
                  <Badge variant={receipt.verified ? "native" : "warn"}>
                    {receipt.verified ? "verified" : "rejected"}
                  </Badge>
                </div>
                <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">nonce {receipt.nonce}</p>
                <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">
                  sig {short(receipt.signatureHex, 12)}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="size-4 text-accent" />
              Model orchestrator
            </CardTitle>
            <CardDescription>
              Desktop binds ollama-rs at 127.0.0.1:11434. This hub station generates only when you press the button.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="node-prompt">Prompt</Label>
            <Textarea
              id="node-prompt"
              value={prompt}
              maxLength={800}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-28"
            />
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[11px] tabular-nums text-muted-foreground">{prompt.length}/800</p>
              <Button onClick={() => void onGenerate()} disabled={busy !== null || !prompt.trim()}>
                <Send className="size-4" />
                {busy === "generate" ? "Generating…" : "Generate"}
              </Button>
            </div>
            <div className="min-h-32 rounded-[var(--radius-md)] border border-border bg-elevated p-3">
              {generation ? (
                <>
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                    grok-4.5 · hub fallback
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{generation}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No generation this session.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="size-4 text-accent" />
              Verifiable inference
            </CardTitle>
            <CardDescription>
              Browser runs the published linear twin. Desktop loads the ONNX graph via tract-onnx and hashes the same commitment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="node-tensor">Input tensor · 8 floats</Label>
            <Input
              id="node-tensor"
              value={tensor}
              onChange={(e) => setTensor(e.target.value)}
              className="font-mono text-xs"
              spellCheck={false}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void onInfer()} disabled={busy !== null}>
                <Play className="size-4" />
                Execute
              </Button>
              <Button variant="secondary" onClick={() => void onInfer("hostile")} disabled={busy !== null}>
                Hostile packet
              </Button>
              <Button variant="outline" onClick={() => void onInfer("clear")} disabled={busy !== null}>
                Clear packet
              </Button>
            </div>
            {inference ? (
              <div className="space-y-3 rounded-[var(--radius-md)] border border-border bg-elevated p-3">
                <div className="flex items-center justify-between">
                  <Badge variant={inference.label === "hostile" ? "warn" : "native"}>{inference.label}</Badge>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {inference.score.toFixed(3)}
                  </span>
                </div>
                <Progress value={inference.score * 100} />
                <p className="break-all font-mono text-[11px] text-muted-foreground">{inference.commitment}</p>
                <p className="text-[11px] text-muted-foreground">
                  SHA-256 commitment of model id, canonical input, and output. Not a SNARK — the desktop node is the proving runtime.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No receipt yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="size-4 text-accent" />
            Event ring
          </CardTitle>
          <CardDescription>Local only. Nothing here is shipped to a vendor log.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="max-h-56 space-y-2 overflow-y-auto font-mono text-xs">
            {log.map((entry) => (
              <li key={entry.id} className="flex gap-3">
                <span className="shrink-0 tabular-nums text-muted-foreground">{entry.at}</span>
                <span
                  className={
                    entry.kind === "ok"
                      ? "shrink-0 uppercase text-ok"
                      : entry.kind === "warn" || entry.kind === "threat"
                        ? "shrink-0 uppercase text-warn"
                        : "shrink-0 uppercase text-muted-foreground"
                  }
                >
                  {entry.kind}
                </span>
                <span className="min-w-0 break-all">{entry.line}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
