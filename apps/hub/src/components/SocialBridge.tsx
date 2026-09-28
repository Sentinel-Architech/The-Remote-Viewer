"use client";

/**
 * Issue #67 order: human proof → briefing → social.
 * Google / X never appear on /login. This is a migration ramp only.
 */

import { useState } from "react";
import { toast } from "sonner";
import { GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useViewer } from "@/components/viewer-context";

export function SocialBridge() {
  const { profile } = useViewer();
  const [busy, setBusy] = useState(false);
  const briefed = Boolean(profile?.tutorialAt);

  if (!briefed) {
    return (
      <p className="text-sm text-muted-foreground">
        Seal the Viewer briefing first. Social bridges stay closed until then.
      </p>
    );
  }

  async function oauth(providerId: string) {
    if (busy) return;
    setBusy(true);
    try {
      await signIn(providerId, { callbackURL: "/hub/settings", errorCallbackURL: "/hub/settings" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bridge failed");
      setBusy(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-warn/30 bg-warn/10 p-3">
      <p className="flex items-start gap-2 text-xs leading-relaxed text-warn">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
        External identity is not native TRV security. Use only after the briefing.
        It cannot satisfy the on-device lock.
      </p>
      <div className="mt-3 space-y-2">
        {GROK_PROVIDERS.map((p) => (
          <Button
            key={p.providerId}
            type="button"
            variant="outline"
            className="w-full"
            disabled={busy}
            onClick={() => void oauth(p.providerId)}
          >
            Continue with {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
