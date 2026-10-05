import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { HubShell } from "@/components/hub-shell";
import { IntentBar } from "@/components/intent-bar";
import { ViewerProvider } from "@/components/viewer-context";

export const Route = createFileRoute("/hub")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex,nofollow" }],
  }),
  component: HubLayout,
});

function HubLayout() {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const searchStr = useRouterState({ select: (state) => state.location.searchStr });
  const publicIntent = pathname === "/hub/intent";
  if (isPending && !publicIntent) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg text-sm text-muted-foreground">
        Restoring session…
      </div>
    );
  }
  if (!user && publicIntent) {
    const want = new URLSearchParams(searchStr).get("want") ?? "";
    return (
      <div className="min-h-dvh bg-bg p-5 text-fg md:p-8">
        <IntentBar initialWant={want} />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return (
    <ViewerProvider>
      <HubShell />
    </ViewerProvider>
  );
}
