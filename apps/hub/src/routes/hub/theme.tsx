import { createFileRoute } from "@tanstack/react-router";
import { useViewer } from "@/components/viewer-context";
import { ViewerUiSettings } from "@/components/viewer-ui-settings";

export const Route = createFileRoute("/hub/theme")({ component: ThemePage });

function ThemePage() {
  const { profile, setProfile } = useViewer();
  return (
    <div className="p-5 md:p-8">
      <ViewerUiSettings
        planId={profile?.planId ?? "initiate"}
        saved={profile?.uiTheme}
        onSaved={(raw) => {
          if (profile) setProfile({ ...profile, uiTheme: raw });
        }}
      />
    </div>
  );
}
