import { createFileRoute, redirect } from "@tanstack/react-router";

/** Deck station opens the Network home. Two games live on Command Deck: Neural Link and God's Eye. */
export const Route = createFileRoute("/hub/deck")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
