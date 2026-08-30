import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/hub/deck")({ component: DeckPage });

const FIELD = "https://the-remote-viewer.grok.me";

function DeckPage() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Hub station</p>
          <h1 className="font-display text-3xl">Command Deck</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            The field is part of this Hub. Synapse and God's Eye live here.
            Shop, friends, live, and forum stay one tap away — they are not a
            different product.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <a href={FIELD} target="_top" rel="noreferrer">
              Full field
            </a>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link to="/hub/shop">TRV shop</Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link to="/hub/market">Market</Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link to="/hub/friends">Friends</Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link to="/hub/live">Live</Link>
          </Button>
        </div>
      </div>
      <iframe
        title="Command Deck field"
        src={FIELD}
        className="h-[min(78dvh,900px)] w-full rounded-[var(--radius-md)] border border-border bg-black"
        allow="fullscreen"
      />
    </div>
  );
}
