import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { assertNativeGameSource, SIM_GAMES } from "../src/lib/trv/native-games.ts";

const repo = fileURLToPath(new URL("../../..", import.meta.url));

const GAME_ROOTS = [
  "apps/hub/src/os-sim",
  "apps/hub/src/components/os-sim",
  "apps/hub/src/routes/hub/neuron.tsx",
  "apps/hub/src/routes/hub/os.tsx",
  "apps/hub/src/routes/hub/token-gateway.tsx",
  "apps/hub/src/lib/trv/token-gateway.ts",
  "apps/command-deck/src/components/playground",
  "apps/command-deck/src/routes/hub.deck.tsx",
];

async function filesUnder(path: string): Promise<string[]> {
  const info = await stat(path);
  if (info.isFile()) return [path];
  const out: string[] = [];
  for (const name of await readdir(path)) {
    if (name === "node_modules") continue;
    out.push(...(await filesUnder(join(path, name))));
  }
  return out;
}

test("the simulation games in this repo are the native four", () => {
  assert.deepEqual(
    SIM_GAMES.map((game) => game.id),
    ["sentinel-os", "neural-link", "gods-eye", "token-gateway"],
  );
});

test("simulation game sources do not call Google, Meta, or Alphabet", async () => {
  const files = (await Promise.all(GAME_ROOTS.map((root) => filesUnder(join(repo, root))))).flat();
  assert.ok(files.length > 4);
  for (const file of files) {
    const text = await readFile(file, "utf8");
    assert.doesNotThrow(() => assertNativeGameSource(text), file);
  }
});
