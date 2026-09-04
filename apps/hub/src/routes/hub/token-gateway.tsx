import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useViewer } from "@/components/viewer-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  beginGatewaySeize,
  commitGatewaySeize,
  gatewayStatus,
  seedSimTokenDrop,
} from "@/lib/trv/token-gateway-server";

export const Route = createFileRoute("/hub/token-gateway")({
  component: TokenGatewayPage,
});

type Status = Awaited<ReturnType<typeof gatewayStatus>>;

function TokenGatewayPage() {
  const { profile, reload } = useViewer();
  const [status, setStatus] = useState<Status | null>(null);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<string>("");

  async function refresh() {
    const s = await gatewayStatus();
    setStatus(s);
    return s;
  }

  useEffect(() => {
    void refresh().catch(() => {});
  }, []);

  if (!profile) return <div className="p-8 text-sm text-muted-foreground">Binding node…</div>;

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <p className="text-[11px] tracking-[0.2em] uppercase text-accent">SIM · Token Gateway</p>
        <h1 className="mt-1 font-display text-3xl">Remote Viewer Token Gateway</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Teaching ledger only. One drop, one winner, one commit. Neon when
          DATABASE_URL is set; PGLite in preview. The Eye is a hint. The seize
          is a signed challenge + atomic spend. Not AR camera. Not cash.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="warn">SIM</Badge>
          <Badge variant="muted">db {status?.db ?? "…"}</Badge>
          <Badge variant={status?.migration ? "native" : "warn"}>
            {status?.migration ? "0018 applied" : "0018 missing"}
          </Badge>
          <Badge variant="muted">drop {String((status?.drop as { status?: string } | null)?.status ?? "none")}</Badge>
        </div>
      </div>

      <section className="flex flex-wrap gap-2">
        <Button
          disabled={busy}
          variant="secondary"
          onClick={() => {
            setBusy(true);
            void seedSimTokenDrop()
              .then(async () => {
                toast.success("SIM drop seeded");
                await refresh();
              })
              .catch((e) => toast.error(e instanceof Error ? e.message : "Seed failed"))
              .finally(() => setBusy(false));
          }}
        >
          Seed SIM drop
        </Button>
        <Button
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void beginGatewaySeize()
              .then(async (r) => {
                setChallenge(r.challenge);
                setLast(`challenge ${r.code}`);
                toast.message(r.challenge ? "Challenge live · 45s" : r.code);
                await refresh();
              })
              .catch((e) => toast.error(e instanceof Error ? e.message : "Begin failed"))
              .finally(() => setBusy(false));
          }}
        >
          Begin seize
        </Button>
        <Button
          disabled={busy || !challenge}
          onClick={() => {
            setBusy(true);
            void commitGatewaySeize({
              data: { challenge: challenge ?? "", simOverlay: true },
            })
              .then(async (r) => {
                setLast(`${r.code}${r.ok ? ` +Δ${r.amount ?? 0}` : ""}`);
                if (r.ok && r.code === "OK") toast.success(`Pivoted · ${r.amount} TRV`);
                else if (r.code === "SELF") toast.message("Retry · already yours");
                else toast.error(r.code);
                await reload();
                await refresh();
              })
              .catch((e) => toast.error(e instanceof Error ? e.message : "Seize failed"))
              .finally(() => setBusy(false));
          }}
        >
          Seize via SIM overlay
        </Button>
        <Button
          disabled={busy || !challenge}
          variant="secondary"
          onClick={() => {
            setBusy(true);
            void commitGatewaySeize({
              data: { challenge: challenge ?? "", lat: 0, lon: 0, simOverlay: false },
            })
              .then(async (r) => {
                setLast(r.code);
                toast.message(r.code);
                await refresh();
              })
              .catch((e) => toast.error(e instanceof Error ? e.message : "Reject failed"))
              .finally(() => setBusy(false));
          }}
        >
          Fail NOT_PRESENT (0,0)
        </Button>
      </section>

      <p className="font-mono text-xs text-muted-foreground">
        last {last || "—"} · credits {profile.credits} · challenge {challenge ? "held" : "none"}
      </p>
      <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
        SIM overlay uses the seeded Boardman coordinates so a desktop Viewer can
        drill the pivot without GPS. Fail (0,0) must return NOT_PRESENT. A second
        seize of the same drop must return SELF or SPENT — never a second credit.
        After Hub deploy, Neon runs the same CTE. This page does not open the
        public sidewalk.
      </p>
    </div>
  );
}
