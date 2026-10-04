"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { acceptRecoveryForms, signupHoldStatus } from "@/lib/trv/viewer-locks-server";
import { acceptanceCopy, SEED_OFF_PHONE, type RecoveryForms } from "@/lib/trv/viewer-locks";
import { requireUserVerification } from "@/lib/trv/biometric-gate";
import { Button } from "./ui/button";

export function CodeAcceptance() {
  const [open, setOpen] = useState(false);
  const [handle, setHandle] = useState<string | null>(null);
  const [forms, setForms] = useState<RecoveryForms>(1);
  const [written, setWritten] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void signupHoldStatus()
      .then((row) => {
        if (row.hasHold && !row.accepted) {
          setOpen(true);
          setHandle(row.handle);
        }
      })
      .catch(() => {
        setOpen(false);
      });
  }, []);

  if (!open) return null;

  async function accept() {
    if (!written) {
      toast.error("Write the code down first.");
      return;
    }
    setBusy(true);
    try {
      const gate = await requireUserVerification({ reason: "Accept how this code can be shown again" });
      if (!gate.ok && forms === 2) {
        toast.error("Two forms need this device lock to run.");
        return;
      }
      await acceptRecoveryForms({ data: { forms, writtenDown: true } });
      setOpen(false);
      toast.success(handle ? `Accepted for @${handle}.` : "Accepted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Acceptance failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border-b border-border bg-card px-5 py-4">
      <h2 className="font-display text-lg">Write the code down</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{SEED_OFF_PHONE}</p>
      <p className="mt-2 text-sm leading-relaxed text-fg">{acceptanceCopy(forms)}</p>
      {handle ? <p className="mt-2 text-sm">Signed by @{handle}. Not a company key.</p> : null}
      <label className="mt-3 flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1" checked={written} onChange={(e) => setWritten(e.target.checked)} />
        I wrote the code down. It is not stored on this phone.
      </label>
      <div className="mt-3 flex gap-2">
        <Button type="button" variant={forms === 1 ? "default" : "secondary"} onClick={() => setForms(1)}>
          1 form
        </Button>
        <Button type="button" variant={forms === 2 ? "default" : "secondary"} onClick={() => setForms(2)}>
          2 forms
        </Button>
      </div>
      <Button className="mt-3" type="button" disabled={busy || !written} onClick={() => void accept()}>
        Accept
      </Button>
    </section>
  );
}
