#!/bin/sh
# Native sensor gate. Browser sensors are rejected. Missing nodes fail closed.
set -eu
if [ -n "${BROWSER:-}" ] || [ -n "${WEBXR:-}" ]; then
  echo "FAIL: browser sensor rejected" >&2
  exit 1
fi
missing=0
for pair in \
  accelerometer:/dev/accel0 \
  gyroscope:/dev/gyro0 \
  magnetometer:/dev/mag0 \
  barometer:/dev/baro0 \
  proximity:/dev/prox0 \
  ambient-light:/dev/light0 \
  gps:/dev/gps0 \
  camera-depth:/dev/depth0 \
  lidar:/dev/lidar0
do
  name=${pair%%:*}
  node=${pair#*:}
  if [ -e "$node" ]; then
    echo "present $name"
  else
    echo "FAIL: $name device not present" >&2
    missing=1
  fi
done
exit "$missing"
