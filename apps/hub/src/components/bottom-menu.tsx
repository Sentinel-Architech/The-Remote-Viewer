import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { createBottomMenu, pullIconOntoMenu, type MenuIcon } from "@/lib/trv/bottom-menu";

const STARTER: MenuIcon[] = [
  { id: "command", label: "Command", glyph: "⌘" },
  { id: "intent", label: "Intent", glyph: "⌘I" },
  { id: "settings", label: "Settings", glyph: "⚙" },
];

const CUSTOM: MenuIcon[] = [
  { id: "compass", label: "Compass", glyph: "◎" },
  { id: "lantern", label: "Lantern", glyph: "✺" },
];

export function BottomMenu() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [menu, setMenu] = useState(() => createBottomMenu(STARTER));
  const [held, setHeld] = useState<MenuIcon | null>(null);

  function pull(icon: MenuIcon) {
    setMenu((current) => pullIconOntoMenu(current, icon));
    setHeld(null);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/70 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
      <div className="flex items-center gap-2 px-3 pt-2">
        <p className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">Pull onto the menu</p>
        <div className="flex gap-2 overflow-x-auto">
          {CUSTOM.map((icon) => (
            <button
              key={icon.id}
              type="button"
              draggable
              className="shrink-0 rounded-md border border-border px-2 py-1 text-xs"
              onDragStart={() => setHeld(icon)}
              onClick={() => pull(icon)}
            >
              {icon.glyph} {icon.label}
            </button>
          ))}
        </div>
      </div>
      <nav
        aria-label="Main menu"
        className="flex gap-2 overflow-x-auto px-3 py-2"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (held) pull(held);
        }}
      >
        {menu.icons.map((icon) => {
          const to = icon.id === "intent" ? "/hub/intent" : icon.id === "settings" ? "/hub/settings" : "/hub";
          const active = pathname === to;
          return (
            <Link
              key={icon.id}
              to={to}
              className={`flex h-12 w-24 shrink-0 flex-col items-center justify-center rounded-md text-[10px] ${active ? "text-fg" : "text-muted-foreground"}`}
            >
              <span>{icon.glyph}</span>
              {icon.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
