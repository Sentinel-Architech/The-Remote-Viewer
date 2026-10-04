import { useEffect, type ReactNode } from "react";
import { useViewer } from "./viewer-context";
import { applyTheme, parseTheme } from "@/lib/trv/themes";
import { holographicEquipped } from "@/lib/trv/shop";

export function ViewerThemeRoot({ children }: { children: ReactNode }) {
  const { profile } = useViewer();
  useEffect(() => {
    const local = typeof window !== "undefined" ? localStorage.getItem("trv-theme") : null;
    applyTheme(parseTheme(profile?.uiTheme || local));
    if (typeof document !== "undefined") {
      document.documentElement.dataset.holographic = holographicEquipped(profile?.shopChrome)
        ? "1"
        : "0";
    }
  }, [profile?.uiTheme, profile?.shopChrome]);
  return <>{children}</>;
}
