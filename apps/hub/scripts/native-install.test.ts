import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { assertNativeTelemetry, NATIVE_GPS } from "../src/lib/trv/native-gps.ts";

const root = new URL("../../../android/app/src/main/", import.meta.url);

function read(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

test("the Android install is a native screen, not a website shell", () => {
  const activity = read("java/com/theremoteviewer/MainActivity.kt");
  const manifest = read("AndroidManifest.xml");
  const gradle = readFileSync(new URL("../../../android/app/build.gradle", import.meta.url), "utf8");
  const bundle = `${activity}\n${manifest}\n${gradle}`;
  assert.equal(activity.includes("WebView"), false);
  assert.equal(activity.includes("loadUrl"), false);
  assert.match(activity, /LocationManager\.GPS_PROVIDER/);
  assert.equal(manifest.includes("android.permission.INTERNET"), false);
  assert.equal(/com\.google|firebase|androidx|facebook|play-services/i.test(bundle), false);
  const strings = read("res/values/strings.xml");
  assert.match(strings, /not a website/);
  assert.match(strings, /do not run on this phone/);
  assert.match(read("res/layout/activity_main.xml"), /mimo_phone/);
  assert.match(read("res/layout/activity_main.xml"), /lock_progress/);
  assert.match(strings, /Waiting\. Weight files were not measured/);
  assert.match(activity, /lockProgress\.progress = 1/);
  assert.match(activity, /showInstallTutorial/);
  assert.match(activity, /model\.safetensors/);
  assert.match(activity, /weightProgress\.progress = 1/);
  assert.match(strings, /MiniMind2-Small/);
  assert.match(strings, /GrapheneOS is extra security/);
  assert.match(strings, /Pixel 7/);
  assert.match(strings, /Pixel 6a/);
  assert.match(strings, /sideload/);
  assert.match(strings, /signing key is not available/);
  assert.match(strings, /A fit check is not a run/);
  assert.match(gradle, /minimind2-small/);
  assert.equal(/gemini|google|alphabet/i.test(`${activity}\n${strings}`), false);
  assert.equal(/huggingface|xiaomi\.com|loadUrl/i.test(activity), false);
});

test("telemetry allowlist is native GPS only", () => {
  assert.doesNotThrow(() => assertNativeTelemetry(NATIVE_GPS));
  assert.throws(() => assertNativeTelemetry("google-analytics"));
  assert.throws(() => assertNativeTelemetry("play-services-location"));
  assert.throws(() => assertNativeTelemetry("facebook"));
});
