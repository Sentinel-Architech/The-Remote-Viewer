import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { readCameraDepth, readProximity } from "@/lib/trv/native-telemetry";
import { readLidar } from "@/lib/trv/lidar";

export const Route = createFileRoute("/hub/telemetry")({ component: TelemetryPage });

function TelemetryPage() {
  const [proximity, setProximity] = useState("Not read");
  const [depth, setDepth] = useState("Not read");
  const [lidar, setLidar] = useState("Not read");

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <h1 className="font-display text-3xl">On-device sensors</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Proximity, camera focus, and LiDAR stay on this device. A missing sensor fails closed. No frame is stored or sent.
        </p>
      </div>
      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <h2 className="font-display text-xl">Proximity</h2>
        <p className="mt-2 text-sm">{proximity}</p>
        <Button className="mt-4" variant="secondary" onClick={() => void readProximity().then((reading) => setProximity(reading.available ? (reading.near ? "Near" : "Not near") : "Sensor not available"))}>
          Read proximity
        </Button>
      </section>
      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <h2 className="font-display text-xl">Camera depth</h2>
        <p className="mt-2 text-sm">{depth}</p>
        <Button className="mt-4" variant="secondary" onClick={() => void readCameraDepth().then((reading) => setDepth(reading.available ? `Focus range ${reading.min ?? "?"} to ${reading.max ?? "?"}` : "Depth sensor not available")).catch(() => setDepth("Camera permission denied"))}>
          Read depth
        </Button>
      </section>
      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <h2 className="font-display text-xl">LiDAR</h2>
        <p className="mt-2 text-sm">{lidar}</p>
        <Button className="mt-4" variant="secondary" onClick={() => void readLidar().then((reading) => setLidar(reading.reason))}>
          Check LiDAR
        </Button>
      </section>
    </div>
  );
}
