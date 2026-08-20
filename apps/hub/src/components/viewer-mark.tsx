import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

const SIZE = {
  sm: "size-8 text-xs",
  md: "size-12 text-sm",
  lg: "size-20 text-xl",
  xl: "size-28 text-3xl",
} as const;

export function ViewerMark({
  name,
  src,
  live,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  live?: boolean;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  const letter = (name || "?").charAt(0).toUpperCase();
  const pulse = size === "sm" ? "size-3.5" : "size-5";
  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 rounded-full",
        SIZE[size],
        live && "ring-2 ring-ok ring-offset-2 ring-offset-bg",
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="size-full rounded-full object-cover outline outline-1 -outline-offset-1 outline-fg/15"
        />
      ) : (
        <span className="grid size-full place-items-center rounded-full bg-elevated font-display text-fg outline outline-1 -outline-offset-1 outline-fg/15">
          {letter}
        </span>
      )}
      {live ? (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full border border-bg bg-ok text-bg",
            pulse,
          )}
          title="Live now"
          aria-label="Live now"
        >
          <Radio className="size-2.5 trv-live-dot" aria-hidden />
        </span>
      ) : null}
    </span>
  );
}

export function LiveBadge({ title }: { title?: string | null }) {
  return (
    <Badge variant="native" className="gap-1.5">
      <Radio className="size-3 trv-live-dot" aria-hidden />
      {title ? `Live · ${title}` : "Live"}
    </Badge>
  );
}
