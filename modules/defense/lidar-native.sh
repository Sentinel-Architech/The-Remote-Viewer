#!/bin/sh
# Native LiDAR gate. A browser session is not accepted. Fail closed if no depth device exists.
set -eu
if [ -n "${BROWSER:-}" ] || [ -n "${WEBXR:-}" ]; then
  echo "FAIL: browser LiDAR rejected" >&2
  exit 1
fi
found=0
for node in /dev/lidar0 /dev/depth0; do
  if [ -e "$node" ]; then
    found=1
  fi
done
if [ "$found" -ne 1 ]; then
  echo "FAIL: native LiDAR device not present" >&2
  exit 1
fi
echo "native lidar present"
