#!/usr/bin/env bash
# Native Android package path for The Remote Viewer.
# Requires ANDROID_HOME (platform android-34), kotlinc, d8, aapt2, zipalign, apksigner on PATH.
# Signing password is read from TRV_KEYSTORE_PASS. Do not commit the keystore.
set -euo pipefail

: "${ANDROID_HOME:?ANDROID_HOME is required}"
: "${TRV_KEYSTORE_PASS:?TRV_KEYSTORE_PASS is required}"

mkdir -p ./build/classes ./build/dex ./build/gen ./keystore

kotlinc -cp "$ANDROID_HOME/platforms/android-34/android.jar" \
  -d ./build/classes $(find src/main -name "*.kt")
d8 --output ./build/dex/ ./build/classes/*.class
aapt2 compile --dir ./src/main/res -o ./build/compiled_res.zip
aapt2 link -o ./build/unsigned.apk \
  -I "$ANDROID_HOME/platforms/android-34/android.jar" \
  --manifest ./src/main/AndroidManifest.xml \
  ./build/compiled_res.zip --java ./build/gen
zip -uj ./build/unsigned.apk ./build/dex/classes.dex
zipalign -p 4 ./build/unsigned.apk ./build/aligned.apk
apksigner sign --ks ./keystore/release.jks \
  --ks-pass "env:TRV_KEYSTORE_PASS" \
  --out ./build/TheRemoteViewer-signed.apk \
  ./build/aligned.apk
