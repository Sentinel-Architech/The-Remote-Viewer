import { FRIEND_FINDER_MIN, friendFinder, type FinderNode } from "@/lib/trv/friend-finder";
import { Button } from "@/components/ui/button";

export function FriendFinder({
  optedIn,
  nodes,
  onHandshake,
}: {
  optedIn: boolean;
  nodes: FinderNode[];
  onHandshake: (handle: string) => void;
}) {
  const result = friendFinder({ optedIn, nodes });
  return (
    <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
      <h2 className="font-display text-xl">Friend finder</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Opens at {FRIEND_FINDER_MIN} opted-in Viewers. Distance stays coarsened. A suggestion is not a friend until both handshake.
      </p>
      <p className="mt-3 text-sm">{result.reason}</p>
      {result.open ? (
        <ul className="mt-4 space-y-2">
          {result.suggestions.map((node) => (
            <li key={node.handle} className="flex items-center justify-between gap-2">
              <span className="text-sm">@{node.handle} <span className="text-muted-foreground">~{node.miles} mi</span></span>
              <Button type="button" size="sm" variant="secondary" onClick={() => onHandshake(node.handle)}>
                Offer handshake
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
