import { createFileRoute } from "@tanstack/react-router";
import { NATIVE_SENSORS, nativeSensorStatus } from "@/lib/trv/native-sensors";

export const Route = createFileRoute("/hub/telemetry")({ component: TelemetryPage });

function TelemetryPage() {
  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <h1 className="font-display text-3xl">Native sensors</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">{nativeSensorStatus()}</p>
      </div>
      <ul className="space-y-2">
        {NATIVE_SENSORS.map((sensor) => (
          <li key={sensor.name} className="rounded-[var(--radius-md)] border border-border bg-card px-4 py-3 text-sm">
            <span className="font-display text-lg">{sensor.name}</span>
            <span className="mt-1 block font-mono text-xs text-muted-foreground">{sensor.node}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
