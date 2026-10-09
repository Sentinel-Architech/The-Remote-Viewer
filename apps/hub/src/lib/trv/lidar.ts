/** Device LiDAR only. A camera estimate is not LiDAR. Nothing leaves the device. */

export async function readLidar(): Promise<{ available: boolean; reason: string }> {
  const xr = navigator.xr;
  if (!xr) return { available: false, reason: "This device does not expose LiDAR." };
  try {
    const supported = await xr.isSessionSupported("immersive-ar");
    if (!supported) return { available: false, reason: "This device does not expose LiDAR." };
    return { available: true, reason: "Depth session is available. No frame is stored." };
  } catch {
    return { available: false, reason: "LiDAR permission denied or sensor missing." };
  }
}
