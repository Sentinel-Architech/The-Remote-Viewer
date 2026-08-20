import { useEffect, type ReactNode } from "react";
import { useViewer } from "./viewer-context";
import { applyTheme, parseTheme } from "@/lib/trv/themes";

export function ViewerThemeRoot({ children }: { children: ReactNode }) {
  const { profile } = useViewer();
  useEffect(() => {
    const local = typeof window !== "undefined" ? localStorage.getItem("trv-theme") : null;
    applyTheme(parseTheme(profile?.uiTheme || local));
  }, [profile?.uiTheme]);
  return <>{children}</>;
}