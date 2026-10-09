/** Native device nodes only. A browser sensor is not accepted. */

export const NATIVE_SENSORS = [
  { name: "accelerometer", node: "/dev/accel0" },
  { name: "gyroscope", node: "/dev/gyro0" },
  { name: "magnetometer", node: "/dev/mag0" },
  { name: "barometer", node: "/dev/baro0" },
  { name: "proximity", node: "/dev/prox0" },
  { name: "ambient-light", node: "/dev/light0" },
  { name: "gps", node: "/dev/gps0" },
  { name: "camera-depth", node: "/dev/depth0" },
  { name: "lidar", node: "/dev/lidar0" },
] as const;

export function nativeSensorStatus(): string {
  return "Browser sensors are rejected. Run modules/defense/sensors-native.sh on the device. A missing node fails closed.";
}
