import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { shopById } from "@/lib/trv/shop";

export function ProfileChrome({
  frame,
  chrome,
  title,
  children,
}: {
  frame: string | null;
  chrome: string | null;
  title?: string | null;
  children: ReactNode;
}) {
  const f = frame ? shopById(frame) : null;
  const c = chrome ? shopById(chrome) : null;
  const t = title ? shopById(title) : null;
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border bg-card p-4",
        f?.id === "frame-sentinel" && "border-accent",
        f?.id === "frame-vortex" && "border-ok/50",
        f?.id === "frame-abyss" && "border-fg/40",
        c?.id === "chrome-knight" && "bg-elevated",
        c?.id === "chrome-mesh" && "shadow-[inset_0_0_40px_color-mix(in_oklab,var(--accent)_18%,transparent)]",
      )}
    >
      {children}
      {t ? <p className="mt-2 text-[11px] tracking-[0.18em] uppercase text-accent">{t.name.replace("Title · ", "")}</p> : null}
    </div>
  );
}
