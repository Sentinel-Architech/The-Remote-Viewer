/** Native LiDAR only. A browser session is not a sensor. */

export function readLidar(): { available: false; reason: string } {
  return {
    available: false,
    reason: "Browser LiDAR is rejected. Native sensor required, and this host has no native depth device.",
  };
}
