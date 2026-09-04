import { BrainCircuit, Cpu, Eye, Radio, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOTTO, SPECIALIST_TAG } from "@/lib/trv";
import { isLoopbackNode, isVendorAi, useSpecialist, type SpecialistJob } from "@/lib/specialist";
import { useAffairs } from "@/lib/affairs";

export function SpecialistChip({ onOpen, active }: { onOpen: () => void; active: boolean }) {
  const last = useSpecialist((s) => s.last);
  const busy = useSpecialist((s) => s.busy);
  const source = useSpecialist((s) => s.source);
  const error = useSpecialist((s) => s.error);
  const label = busy
    ? "Specialist · think"
    : error
      ? "Specialist · hold"
      : last
        ? `Specialist · ${last.source}`
        : source === "node"
          ? "Specialist · node"
          : "Specialist · device";
  return (
    <button
      type="button"
      onClick={onOpen}
      className="min-h-11 w-full rounded-lg px-1 py-1 text-right"
      aria-label={`${label}. Open on-device specialist.`}
      aria-pressed={active}
      data-specialist-chip="1"
      data-specialist-source={source}
    >
      <p className={cn("font-mono text-xs tabular-nums", error ? "text-ember" : "text-sage")}>{label}</p>
    </button>
  );
}

export function SpecialistPanel({ onClose }: { onClose: () => void }) {
  const source = useSpecialist((s) => s.source);
  const node = useSpecialist((s) => s.node);
  const gpu = useSpecialist((s) => s.gpu);
  const busy = useSpecialist((s) => s.busy);
  const error = useSpecialist((s) => s.error);
  const last = useSpecialist((s) => s.last);
  const setSource = useSpecialist((s) => s.setSource);
  const setNode = useSpecialist((s) => s.setNode);
  const brief = useSpecialist((s) => s.brief);
  const heldOs = useAffairs((s) => s.held.os || s.held.native || s.held.affairs);
  const nodeOk = isLoopbackNode(node) && !isVendorAi(node);

  async function run(job: SpecialistJob) {
    await brief(job);
  }

  return (
    <div
      role="dialog"
      aria-label="On-device specialist"
      data-specialist="1"
      className="pointer-events-auto absolute top-32 right-3 left-3 z-20 max-h-[min(34rem,68dvh)] overflow-y-auto rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:right-auto sm:left-5 sm:w-80"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-sage uppercase">{MOTTO}</p>
          <p className="font-display mt-1 text-lg text-foreground">Specialist</p>
          <p className="mt-1 font-mono text-xs text-muted">{gpu ? "WebGPU ready" : "On-device reasoner"}</p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Close specialist" onClick={onClose} className="size-11">
          <X className="size-4" strokeWidth={1.75} />
        </Button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{SPECIALIST_TAG}</p>

      <div className="mt-3 flex gap-1 rounded-xl bg-card-2 p-1 shadow-[var(--shadow-border)]">
        <Button
          variant={source === "device" ? "selected" : "ghost"}
          aria-pressed={source === "device"}
          className="flex-1"
          onClick={() => setSource("device")}
        >
          <Cpu className="size-4" strokeWidth={1.75} />
          Device
        </Button>
        <Button
          variant={source === "node" ? "selected" : "ghost"}
          aria-pressed={source === "node"}
          className="flex-1"
          onClick={() => setSource("node")}
        >
          <Radio className="size-4" strokeWidth={1.75} />
          Local node
        </Button>
      </div>

      {source === "node" ? (
        <label className="mt-3 block">
          <span className="text-xs tracking-wide text-muted uppercase">Loopback only</span>
          <input
            value={node}
            onChange={(e) => setNode(e.target.value)}
            aria-label="Local node address. Loopback only."
            className="mt-1 h-11 w-full rounded-md bg-card-2 px-3 font-mono text-sm text-foreground shadow-[var(--shadow-border)] outline-none"
            data-specialist-node="1"
          />
          <span className={cn("mt-1 block text-xs", nodeOk ? "text-sage" : "text-ember")}>
            {nodeOk ? "Loopback accepted. No vendor key." : "Rejected. Loopback only. No vendor keys."}
          </span>
        </label>
      ) : null}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="primary" disabled={busy || heldOs} onClick={() => void run("now")} aria-label="Brief now">
          <BrainCircuit className="size-4" strokeWidth={1.75} />
          Brief now
        </Button>
        <Button variant="ghost" disabled={busy || heldOs} onClick={() => void run("strain")} aria-label="Name the strain">
          Name strain
        </Button>
        <Button variant="ghost" disabled={busy || heldOs} onClick={() => void run("snap")} aria-label="Brief the SNAP lock">
          <Eye className="size-4" strokeWidth={1.75} />
          SNAP
        </Button>
        <Button variant="ghost" disabled={busy || heldOs} onClick={() => void run("affairs")} aria-label="Report Internal Affairs">
          <Shield className="size-4" strokeWidth={1.75} />
          Affairs
        </Button>
      </div>

      {last ? (
        <div className="mt-3 rounded-lg bg-card-2 p-3 shadow-[var(--shadow-border)]" data-specialist-last={last.source}>
          <p className="text-xs tracking-wide text-muted uppercase">
            {last.job} · {last.source}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">{last.text}</p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">Tap Brief now. Same facts as the field. No company in the path.</p>
      )}
      {error ? <p className="mt-2 text-sm text-ember">{error}</p> : null}
    </div>
  );
}
