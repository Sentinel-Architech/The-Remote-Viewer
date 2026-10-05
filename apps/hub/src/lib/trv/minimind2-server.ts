import { createServerFn } from "@tanstack/react-start";
import { measureShippedMiniMind } from "./minimind2-measure";

/** Measures the shipped file on this machine. It does not fetch and it does not execute the network. */
export const minimindLocalStatus = createServerFn({ method: "GET" }).handler(async () => measureShippedMiniMind());
