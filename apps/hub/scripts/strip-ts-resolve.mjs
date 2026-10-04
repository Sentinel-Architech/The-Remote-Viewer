import { register } from "node:module";

await register("./strip-ts-hook.mjs", import.meta.url);
