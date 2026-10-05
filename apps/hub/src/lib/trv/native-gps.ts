/** The only telemetry TRV reads: the device's own GPS. No other provider. */

export const NATIVE_GPS = "trv-native-gps" as const;

const BANNED_TELEMETRY = /google|gstatic|googleapis|alphabet|firebase|facebook|meta\.com|play-services|analytics|gtag/i;

export function assertNativeTelemetry(source: string): void {
  if (BANNED_TELEMETRY.test(source) || source !== NATIVE_GPS) {
    throw new Error("The only telemetry is this device's own GPS, exclusive to TRV.");
  }
}

export function readNativeGps(): Promise<{ lat: number; lng: number; source: typeof NATIVE_GPS }> {
  assertNativeTelemetry(NATIVE_GPS);
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("This device has no native GPS."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          source: NATIVE_GPS,
        });
      },
      () => reject(new Error("Location permission denied")),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 },
    );
  });
}
