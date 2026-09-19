import { createFileRoute } from "@tanstack/react-router";
import { NativeIdentityProvider } from "@/providers";
import { NativeDashboard } from "@/components/native-stack";

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
