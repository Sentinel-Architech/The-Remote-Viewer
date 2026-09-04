import { createFileRoute } from "@tanstack/react-router";
import { Playground } from "@/components/playground/playground";

/** Hub links /hub/deck to Command Deck home. Two games: Neural Link and God's Eye. */
export const Route = createFileRoute("/hub/deck")({ component: HubDeckHome });

function HubDeckHome() {
  return <Playground />;
}
