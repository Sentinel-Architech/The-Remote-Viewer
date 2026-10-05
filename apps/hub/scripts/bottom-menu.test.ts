import assert from "node:assert/strict";
import test from "node:test";
import { createBottomMenu, pullIconOntoMenu } from "../src/lib/trv/bottom-menu.ts";

test("the bottom menu is transparent, scrolls left to right, and takes a custom icon once", () => {
  const menu = createBottomMenu([
    { id: "command", label: "Command", glyph: "⌘" },
  ]);
  assert.equal(menu.place, "bottom");
  assert.equal(menu.transparent, true);
  assert.equal(menu.scroll, "left-to-right");
  const compass = { id: "compass", label: "Compass", glyph: "◎" };
  const pulled = pullIconOntoMenu(menu, compass);
  assert.deepEqual(pulled.icons.map((icon) => icon.id), ["command", "compass"]);
  const again = pullIconOntoMenu(pulled, compass);
  assert.equal(again.icons.length, 2);
});
