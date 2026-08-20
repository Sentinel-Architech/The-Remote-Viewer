import { createFileRoute } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { HubShell } from "@/components/hub-shell";
import { ViewerProvider } from "@/components/viewer-context";

export const Route = createFileRoute("/hub")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex,nofollow" }],
  }),
  component: HubLayout,
});

function HubLayout() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg text-sm text-muted-foreground">
        Restoring session…
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
