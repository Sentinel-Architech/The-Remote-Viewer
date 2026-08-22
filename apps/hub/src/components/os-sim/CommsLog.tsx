import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/os-sim/store";

export function CommsLog() {
  const comms = useGameStore((s) => s.comms);
  const endRef = useRef<HTMLDivElement>(null);
  const latest = comms[comms.length - 1];
  const rest = comms.slice(-4, -1);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [comms.length]);

  return (
    <div className="pointer-events-none max-h-32 w-full max-w-md overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface/80 px-3 py-2 backdrop-blur-sm sm:max-h-40">
      <p className="mb-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-subtle">Comms</p>
      <div className="flex flex-col gap-1.5">
        {rest.map((line) => (
          <p key={line.id} className="text-xs leading-snug text-muted">
            <span className="font-mono text-subtle">{line.from}</span>
            <span className="mx-2 text-subtle">/</span>
            {line.text}
          </p>
        ))}
        {latest && <TypedLine key={latest.id} from={latest.from} text={latest.text} />}
        <div ref={endRef} />
      </div>
    </div>
  );
}

function TypedLine({ from, text }: { from: string; text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setN(text.length);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, 12);
    return () => window.clearInterval(id);
  }, [text]);

  return (
    <p className="text-xs leading-snug text-fg">
      <span className={cn("font-mono", from === "SENTINEL" ? "text-accent" : "text-subtle")}>
        {from}
      </span>
      <span className="mx-2 text-subtle">/</span>
      {text.slice(0, n)}
    </p>
  );
}
