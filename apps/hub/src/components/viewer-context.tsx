import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { ViewerProfile, WatchStatus } from "@/lib/trv/types";
import { ensureProfile, myLiveStatus, watchStatus } from "@/lib/trv/server";
import { WATCH_REFRESH } from "@/lib/trv/watch-events";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { toast } from "sonner";

const Ctx = createContext<{
  profile: ViewerProfile | null;
  setProfile: (p: ViewerProfile) => void;
  reload: () => Promise<void>;
  watch: WatchStatus | null;
  refreshWatch: () => Promise<void>;
}>({
  profile: null,
  setProfile: () => {},
  reload: async () => {},
  watch: null,
  refreshWatch: async () => {},
});

export function ViewerProvider({ children }: { children: ReactNode }) {
  const { user } = useCurrentUserState();
  const [profile, setProfile] = useState<ViewerProfile | null>(null);
  const [watch, setWatch] = useState<WatchStatus | null>(null);
  const userId = user?.id ?? null;
  const displayName = user?.displayName ?? undefined;

  const refreshWatch = useCallback(async () => {
    const s = await watchStatus();
    setWatch(s);
    setProfile((p) => {
      if (!p || p.sentinelHealth === s.health) return p;
      return { ...p, sentinelHealth: s.health };
    });
    if (s.decayDamage > 0) {
      toast.error(
        `Sentinel took ${s.decayDamage} damage — ${s.missedDays} missed watch day${s.missedDays === 1 ? "" : "s"}.`,
      );
    }
  }, []);

  const reload = useCallback(async () => {
    const referral =
      typeof window !== "undefined" ? localStorage.getItem("trv-ref") || undefined : undefined;
    const edition =
      typeof window !== "undefined" ? localStorage.getItem("trv-edition") || undefined : undefined;
    const paidTrial =
      typeof window !== "undefined" ? localStorage.getItem("trv-paid-trial") === "verified" : false;
    const p = await ensureProfile({
      data: { displayName, referral, edition, paidTrial },
    });
    setProfile(p);
    await refreshWatch().catch(() => {});
  }, [displayName, refreshWatch]);

  useEffect(() => {
    if (!userId) return;
    void reload().catch(() => {});
  }, [userId, reload]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const s = await myLiveStatus();
        if (cancelled) return;
        setProfile((p) => {
          if (!p) return p;
          const title = s.title;
          if (p.liveNow === s.live && p.liveTitle === title) return p;
          return { ...p, liveNow: s.live, liveTitle: title };
        });
      } catch {
        /* ignore */
      }
    };
    void tick();
    const id = window.setInterval(() => void tick(), 6000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [userId]);

  useEffect(() => {
    const onPing = () => {
      void refreshWatch().catch(() => {});
    };
    window.addEventListener(WATCH_REFRESH, onPing);
    return () => window.removeEventListener(WATCH_REFRESH, onPing);
  }, [refreshWatch]);

  return (
    <Ctx.Provider value={{ profile, setProfile, reload, watch, refreshWatch }}>
      {children}
    </Ctx.Provider>
  );
}

export function useViewer() {
  return useContext(Ctx);
}
