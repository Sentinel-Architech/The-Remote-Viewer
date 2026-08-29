import { Scale, Shield, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AFFAIRS_NAME, AFFAIRS_TAG } from "@/lib/trv";
import {
  AFFAIR_AGENTS,
  deckVerdict,
  useAffairs,
  verdictOf,
  type AffairTopic,
  type AffairVerdict,
} from "@/lib/affairs";
import { usePlayground } from "./store";

function tone(v: AffairVerdict) {
  if (v === "hold") return "text-ember";
  if (v === "watch") return "text-foreground";
  return "text-sage";
}

export function AffairsPanel({ onClose }: { onClose: () => void }) {
  const selected = useAffairs((s) => s.selected);
  const findings = useAffairs((s) => s.findings);
  const intercepts = useAffairs((s) => s.intercepts);
  const held = useAffairs((s) => s.held);
  const lastAudit = useAffairs((s) => s.lastAudit);
  const select = useAffairs((s) => s.select);
  const audit = useAffairs((s) => s.audit);
  const hold = useAffairs((s) => s.hold);
  const release = useAffairs((s) => s.release);
  const pushBrief = usePlayground((s) => s.pushBrief);
  const agent = AFFAIR_AGENTS.find((a) => a.id === selected) ?? AFFAIR_AGENTS[8]!;
  const mine = findings.filter((f) => f.topic === selected);
  const cuts = intercepts.filter((row) => row.topic === selected).slice(0, 4);
  const v = verdictOf(selected, findings);
  const deck = deckVerdict(findings);
  const metaHeld = held.affairs;

  return (
    <div
      role="dialog"
      aria-label="Internal Affairs"
      className="pointer-events-auto absolute top-32 right-3 left-3 z-20 max-h-[min(36rem,72dvh)] overflow-y-auto rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:left-auto sm:w-96"
      data-affairs="1"
      data-ia-deck={deck}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Scale className="size-4 text-sage" strokeWidth={1.75} />
          <div>
            <p className="text-xs font-medium tracking-widest text-muted uppercase">{AFFAIRS_NAME}</p>
            <p className="mt-1 font-display text-lg text-foreground">Watch the watchers</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="Close Internal Affairs" onClick={onClose} className="size-11">
          <X className="size-4" strokeWidth={1.75} />
        </Button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{AFFAIRS_TAG}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className={cn("font-mono text-xs tabular-nums", tone(deck))} data-ia-verdict={v}>
          Deck {deck}
          {lastAudit ? ` · ${new Date(lastAudit).toLocaleTimeString()}` : " · unaudited"}
        </p>
        <Button
          variant="solid"
          onClick={() => {
            const rows = audit();
            const worst = deckVerdict(rows);
            pushBrief(
              worst === "hold"
                ? "Internal Affairs hold. A topic agent missed a live bound."
                : worst === "watch"
                  ? "Internal Affairs watching. Restore the bound, then Release."
                  : "Internal Affairs clear. Eight agents on the wire.",
            );
          }}
          aria-label="Audit every topic agent"
        >
          <Shield className="size-4" strokeWidth={1.75} />
          Audit
        </Button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1" role="group" aria-label="Topic agents">
        {AFFAIR_AGENTS.map((row) => {
          const status = held[row.id] ? "hold" : verdictOf(row.id, findings);
          return (
            <Button
              key={row.id}
              variant={selected === row.id ? "selected" : row.meta ? "solid" : "ghost"}
              aria-pressed={selected === row.id}
              aria-label={`${row.name} agent. ${status}.`}
              onClick={() => select(row.id)}
              className="h-auto min-h-11 flex-col gap-0 px-1 py-1"
              data-ia-topic={row.id}
              data-ia-status={status}
            >
              <span className="truncate">{row.meta ? "IA²" : row.name}</span>
              <span className={cn("font-mono text-xs tabular-nums", tone(status))}>{status}</span>
            </Button>
          );
        })}
      </div>
      <div className="mt-3 rounded-lg bg-card-2 p-3 shadow-[var(--shadow-border)]">
        <p className="text-xs tracking-wide text-muted uppercase">{agent.meta ? "Internal affairs of internal affairs" : agent.name}</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{agent.line}</p>
        <ul className="mt-2 space-y-1">
          {agent.bounds.map((b) => (
            <li key={b} className="font-mono text-xs leading-relaxed text-muted">
              {b}
            </li>
          ))}
        </ul>
        {mine.length ? (
          <ul className="mt-3 space-y-2">
            {mine.map((f, i) => (
              <li key={`${f.bound}-${i}`}>
                <p className={cn("font-mono text-xs tabular-nums", tone(f.verdict))}>
                  {f.verdict} · {f.bound}
                </p>
                <p className="text-xs leading-relaxed text-muted">{f.detail}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-subtle">Tap Audit. Each agent reports a bound.</p>
        )}
        {cuts.length ? (
          <ul className="mt-3 space-y-1" aria-label="Intercepts">
            {cuts.map((row) => (
              <li key={`${row.at}-${row.action}`} className="font-mono text-xs leading-relaxed text-ember">
                cut · {row.action} · {row.detail}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-3 flex items-center gap-1">
          <Button
            variant={held[selected] ? "selected" : "ghost"}
            className="flex-1"
            aria-label={`Hold ${agent.name}`}
            onClick={() => {
              hold(selected);
              pushBrief(`Internal Affairs held ${agent.name}. That topic is frozen.`);
            }}
          >
            <ShieldAlert className="size-4" strokeWidth={1.75} />
            Hold
          </Button>
          <Button
            variant="ghost"
            className="flex-1"
            aria-label={`Release ${agent.name}`}
            disabled={selected === "affairs" || metaHeld}
            onClick={() => {
              if (release(selected)) pushBrief(`${agent.name} released. Bound restored on the wire.`);
            }}
          >
            Release
          </Button>
        </div>
        {selected === "affairs" ? (
          <p className="mt-2 text-xs leading-relaxed text-subtle">
            Affairs cannot tap Release. Hold freezes the deck. Audit lifts an IA² hold only when every topic agent is
            watching. Topic holds freeze Repair, OS, spawn, seize, Watch, Clear, HUB pair, and Mesh post.
          </p>
        ) : metaHeld ? (
          <p className="mt-2 text-xs text-ember">Affairs is held. Topic releases are locked until Audit is clean.</p>
        ) : null}
      </div>
    </div>
  );
}

export function AffairsChip({ onOpen, active }: { onOpen: () => void; active: boolean }) {
  const findings = useAffairs((s) => s.findings);
  const held = useAffairs((s) => s.held);
  const holds = (Object.keys(held) as AffairTopic[]).filter((k) => held[k]).length;
  const deck = holds ? "hold" : deckVerdict(findings);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="min-h-11 w-full rounded-lg px-1 py-1 text-right"
      aria-label={`Internal Affairs ${deck}. Open topic agents.`}
      aria-pressed={active}
      data-affairs-chip={deck}
    >
      <p className={cn("font-mono text-xs tabular-nums", tone(deck))}>
        {active ? "IA · open" : holds ? `IA · ${holds} hold` : `IA · ${deck || "armed"}`}
      </p>
    </button>
  );
}
