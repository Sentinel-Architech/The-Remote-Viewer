import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UHD_HEIGHT, UHD_WIDTH, capPixelRatio, displayCapable, textureDir } from "./platform.ts";
import { captureName, pickRecorderMime, bufferIsUhd } from "./capture.ts";
import { physicsBand, physicsLine, physicsProfile } from "./physics.ts";

describe("4K field", () => {
  it("caps the backing store at 3840 on the long edge", () => {
    assert.equal(UHD_WIDTH, 3840);
    assert.equal(UHD_HEIGHT, 2160);
    const on1080 = capPixelRatio(1920, 1080, 1, true);
    assert.equal(on1080, 2);
    assert.equal(1920 * on1080, 3840);
    const on1280 = capPixelRatio(1280, 720, 1, true);
    assert.ok(Math.abs(1280 * on1280 - 3840) < 1);
    const native4k = capPixelRatio(3840, 2160, 1, true);
    assert.equal(native4k, 1);
    const phone = capPixelRatio(390, 844, 3, false);
    assert.ok(phone <= 1.75);
  });

  it("treats a 2560-class display as 4K-capable and keeps phones on field maps", () => {
    assert.equal(displayCapable(3840, 2160, 1), true);
    assert.equal(displayCapable(1920, 1080, 2), true);
    assert.equal(displayCapable(390, 844, 3), false);
    assert.equal(textureDir(true), "/textures/uhd");
    assert.equal(textureDir(false), "/textures");
  });

  it("raises Rapier to the uhd band without leaving 1/60", () => {
    const uhd = physicsProfile({ power: "high-performance", coarse: false, uhd: true });
    assert.equal(physicsBand({ power: "low-power", coarse: true, uhd: true }), "uhd");
    assert.equal(uhd.band, "uhd");
    assert.equal(uhd.timeStep, 1 / 60);
    assert.equal(uhd.solver, 6);
    assert.equal(uhd.aniso, 16);
    assert.ok(uhd.earth[0] > 64);
    assert.match(physicsLine(uhd), /4K/);
  });

  it("names 4K captures and picks a native recorder mime", () => {
    assert.equal(captureName("neural", true), "the-remote-viewer-neural-link-4k.webm");
    assert.equal(captureName("orbit", false), "the-remote-viewer-gods-eye-field.webm");
    assert.equal(pickRecorderMime(() => false), "");
    assert.equal(pickRecorderMime((t) => t === "video/webm"), "video/webm");
    assert.equal(bufferIsUhd({ width: 3840, height: 2160 }), true);
    assert.equal(bufferIsUhd({ width: 1280, height: 720 }), false);
  });
});
