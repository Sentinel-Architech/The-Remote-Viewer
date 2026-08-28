import { createFileRoute } from "@tanstack/react-router";
import { Playground } from "@/components/command-deck/playground";

export const Route = createFileRoute("/hub/deck")({ component: DeckPage });

function DeckPage() {
  return (
    <div className="fixed inset-0 z-[80] bg-background">
      <Playground />
    </div>
  );
}
