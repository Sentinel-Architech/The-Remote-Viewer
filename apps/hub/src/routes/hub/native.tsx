import { createFileRoute } from "@tanstack/react-router";
import { NativeIdentityProvider } from "@/providers/NativeIdentityProvider";
import { NativeDashboard } from "@/components/NativeDashboard";

export const Route = createFileRoute("/hub/native")({
  component: NativePage,
});

function NativePage() {
  return (
    <NativeIdentityProvider>
      <div className="min-h-[70vh] bg-background text-foreground">
        <NativeDashboard mode="individual" />
      </div>
    </NativeIdentityProvider>
  );
}
