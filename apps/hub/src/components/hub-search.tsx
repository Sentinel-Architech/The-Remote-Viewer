import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const HUB_STATIONS = [
  { to: "/hub", label: "Command" },
  { to: "/hub/deck", label: "Deck" },
  { to: "/hub/node", label: "Node" },
  { to: "/hub/neuron", label: "Defend" },
  { to: "/hub/mesh", label: "Mesh" },
  { to: "/hub/shop", label: "TRV shop" },
  { to: "/hub/os", label: "OS" },
  { to: "/hub/audit", label: "Audit" },
  { to: "/hub/live", label: "Live" },
  { to: "/hub/clips", label: "Clips" },
  { to: "/hub/friends", label: "Friends" },
  { to: "/hub/hydra", label: "Hydra" },
  { to: "/hub/forum", label: "Forum" },
  { to: "/hub/create", label: "Studio" },
  { to: "/hub/market", label: "Market" },
  { to: "/hub/honeypot", label: "Honeypot" },
  { to: "/hub/billing", label: "Billing" },
  { to: "/hub/gateway", label: "Gateway" },
  { to: "/hub/browser", label: "Browser" },
  { to: "/hub/theme", label: "Theme" },
  { to: "/hub/profile", label: "Profile" },
  { to: "/hub/settings", label: "Settings" },
  { to: "/hub/intent", label: "Intent" },
] as const;

export function HubSearch() {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matches = useMemo(
    () =>
      needle
        ? HUB_STATIONS.filter((station) => station.label.toLowerCase().includes(needle) || station.to.includes(needle))
        : [],
    [needle],
  );

  return (
    <div className="relative">
      <label htmlFor="hub-search" className="sr-only">Search stations</label>
      <input
        id="hub-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search stations"
        autoComplete="off"
        className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 text-sm text-fg"
      />
      {needle ? (
        <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-[var(--radius-sm)] border border-border bg-card">
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">No station</li>
          ) : (
            matches.map((station) => (
              <li key={station.to}>
                <Link
                  to={station.to}
                  onClick={() => setQuery("")}
                  className="flex min-h-11 items-center px-3 text-sm hover:bg-elevated"
                >
                  {station.label}
                </Link>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
