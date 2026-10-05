/**
 * Bottom main menu.
 * The bar is partly transparent and scrolls left to right.
 * A viewer pulls a custom icon onto it by id.
 */

export type MenuIcon = {
  id: string;
  label: string;
  glyph: string;
};

export type BottomMenu = {
  place: "bottom";
  transparent: true;
  scroll: "left-to-right";
  icons: MenuIcon[];
};

export function createBottomMenu(icons: MenuIcon[]): BottomMenu {
  return {
    place: "bottom",
    transparent: true,
    scroll: "left-to-right",
    icons: unique(icons),
  };
}

export function pullIconOntoMenu(menu: BottomMenu, icon: MenuIcon): BottomMenu {
  if (menu.icons.some((item) => item.id === icon.id)) return menu;
  return {
    ...menu,
    icons: [...menu.icons, icon],
  };
}

function unique(icons: MenuIcon[]): MenuIcon[] {
  const seen = new Set<string>();
  const out: MenuIcon[] = [];
  for (const icon of icons) {
    if (seen.has(icon.id)) continue;
    seen.add(icon.id);
    out.push(icon);
  }
  return out;
}
