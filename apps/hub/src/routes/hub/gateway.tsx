import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { GATEWAY_DOCS } from "@/lib/trv/gateway";
import { useViewer } from "@/components/viewer-context";
import { verifyViewer } from "@/lib/trv/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/hub/gateway")({ component: GatewayPage });

const FLASH = [0, 2, 3, 1];

function GatewayPage() {
  const { profile, setProfile } = useViewer();
  const verified = Boolean(profile?.verifiedAt);
  const [hover, setHover] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [handshake, setHandshake] = useState(false);
  const [seq, setSeq] = useState<number[]>([]);
  const [flash, setFlash] = useState<number | null>(null);

  const docs = GATEWAY_DOCS;
  const active = useMemo(() => docs.find((d) => d.id === open), [docs, open]);

  async function playFlash() {
    setSeq([]);
    for (const n of FLASH) {
      setFlash(n);
      await new Promise((r) => setTimeout(r, 420));
      setFlash(null);
      await new Promise((r) => setTimeout(r, 180));
    }
  }

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <h1 className="font-display text-3xl">The Gateway Process</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Documents and sources are free. Methods — the how of each activity —
          stay sealed until a Viewer passes the robot handshake and leaves
          Initiate. Hover a card to preview whether it is document or method.
        </p>
        <div className="mt-3">
          <Badge variant={verified ? "native" : "warn"}>
            {verified ? "Verified Viewer · methods open" : "Initiate · methods sealed"}
          </Badge>
        </div>
      </div>

      {!verified && (
        <div className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <h2 className="font-display text-xl">Robot handshake</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Watch the four-node flash, then tap the same order. This is how TRV
            verifies a Viewer is not a script.
          </p>
          <Button className="mt-3" onClick={() => { setHandshake(true); void playFlash(); }}>
            Begin handshake
          </Button>
          {handshake && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    const next = [...seq, n];
                    setSeq(next);
                    if (next.length === 4) {
                      void verifyViewer({ data: { sequence: next } }).then((r) => {
                        if (r.ok && r.profile) {
                          setProfile(r.profile);
                          toast.success("Verified Viewer. Methods unsealed.");
                          setHandshake(false);
                        } else {
                          toast.error("Handshake rejected");
                          setSeq([]);
                          void playFlash();
                        }
                      });
                    }
                  }}
                  className="h-14 rounded-[var(--radius-sm)] border border-border"
                  style={{ background: flash === n ? "#ecece8" : "#181b22" }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {docs.map((d) => {
          const locked = d.kind === "method" && !verified;
          return (
            <button
              key={d.id}
              type="button"
              onMouseEnter={() => setHover(d.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(d.id)}
              onClick={() => setOpen(d.id)}
              className="rounded-[var(--radius-xl)] border border-border bg-card p-5 text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{d.kind}</span>
                {locked && <Badge variant="warn">Paywalled method</Badge>}
              </div>
              <h2 className="mt-2 font-display text-xl">{d.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{d.summary}</p>
              {hover === d.id && (
                <p className="mt-3 text-xs leading-relaxed text-fg">
                  {locked
                    ? "Method locked. Complete the robot handshake to read the steps."
                    : d.body.slice(0, 180) + "…"}
                </p>
              )}
            </button>
          );
        })}
      </div>

      <Dialog open={Boolean(open)} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{active?.title}</DialogTitle>
            <DialogDescription>{active?.kind}</DialogDescription>
          </DialogHeader>
          {active?.kind === "method" && !verified ? (
            <p className="text-sm text-muted-foreground">
              This method is sealed. Documents remain free. Upgrade via the
              handshake above — it is a Viewer check, not a payment processor.
            </p>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{active?.body}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
