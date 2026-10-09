import { X_HANDLE, X_STATION_LABEL, X_STATION_NOTE, X_URL } from "@/lib/trv/x-surface";

export function XStationLink({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href={X_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 text-sm text-white/80 underline-offset-4 hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      {compact ? `@${X_HANDLE}` : `${X_STATION_LABEL} · @${X_HANDLE}`}
      <span className="sr-only"> Opens X in a new tab. {X_STATION_NOTE}</span>
    </a>
  );
}
