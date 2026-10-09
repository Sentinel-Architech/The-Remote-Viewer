/** On-device sensors only. Nothing in this module sends a reading off the device. */

export const TELEMETRY_RULE = "on-device";
const BANNED = /google|gstatic|googleapis|alphabet|firebase|facebook|meta\.com|analytics|gtag/i;

export function assertOnDevice(source: string): void {
  if (BANNED.test(source)) throw new Error("Off-device telemetry is rejected.");
}

export function coarsen(value: number): number {
  return Math.round(value * 10) / 10;
}

type ProximityReading = { near: boolean | null; available: boolean };

export async function readProximity(): Promise<ProximityReading> {
  assertOnDevice(TELEMETRY_RULE);
  const Sensor = (globalThis as { ProximitySensor?: new (opts: { frequency: number }) => {
    start: () => void;
    stop: () => void;
    near?: boolean;
    addEventListener: (name: string, fn: () => void) => void;
  } }).ProximitySensor;
  if (!Sensor) return { near: null, available: false };
  return new Promise((resolve) => {
    try {
      const sensor = new Sensor({ frequency: 1 });
      const finish = () => {
        sensor.stop();
        resolve({ near: typeof sensor.near === "boolean" ? sensor.near : null, available: true });
      };
      sensor.addEventListener("reading", finish);
      sensor.addEventListener("error", () => resolve({ near: null, available: false }));
      sensor.start();
      window.setTimeout(finish, 1500);
    } catch {
      resolve({ near: null, available: false });
    }
  });
}

export async function readCameraDepth(): Promise<{ available: boolean; min: number | null; max: number | null }> {
  assertOnDevice(TELEMETRY_RULE);
  if (!navigator.mediaDevices?.getUserMedia) return { available: false, min: null, max: null };
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
  try {
    const track = stream.getVideoTracks()[0];
    const caps = track?.getCapabilities?.() as { focusDistance?: { min?: number; max?: number } } | undefined;
    const focus = caps?.focusDistance;
    if (!focus) return { available: false, min: null, max: null };
    return { available: true, min: focus.min ?? null, max: focus.max ?? null };
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
}
