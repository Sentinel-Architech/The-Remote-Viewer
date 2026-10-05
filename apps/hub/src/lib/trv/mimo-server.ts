import { createServerFn } from "@tanstack/react-start";
import { runMimoOnBox } from "./mimo-local";

/** Reports the on-box copy. It does not fetch weights. */
export const mimoLocalStatus = createServerFn({ method: "GET" }).handler(async () => runMimoOnBox());
