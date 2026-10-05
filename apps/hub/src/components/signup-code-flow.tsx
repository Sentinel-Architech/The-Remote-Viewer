"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { confirmSignupCode, issueSignupCode } from "@/lib/trv/viewer-locks-server";
import { SEED_OFF_PHONE } from "@/lib/trv/viewer-locks";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function CodeQr({ value }: { value: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    void QRCode.toCanvas(canvas, value, { margin: 1, width: 220, errorCorrectionLevel: "M" });
  }, [value]);
  return <canvas ref={ref} className="mx-auto rounded-[var(--radius-sm)] bg-[#f4f1ea]" aria-label="One-time code QR" />;
}

export function SignupCodeFlow({ onConfirmed }: { onConfirmed: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [mailNote, setMailNote] = useState<string | null>(null);

  async function send(delivery: "email" | "qr") {
    setBusy(true);
    setMailNote(null);
    try {
      const row = await issueSignupCode({ data: { email, delivery } });
      if (!row.ok) {
        setCode(null);
        setMailNote(row.reason);
        return;
      }
      setCode(row.code);
      toast.message("Write this code down. This phone will not keep it.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Code failed");
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    setBusy(true);
    try {
      await confirmSignupCode({ data: { email, code: typed } });
      setCode(null);
      setTyped("");
      onConfirmed(email);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Code did not match");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-muted-foreground">
        First signup uses email for a one-time code, or a QR drawn on this device. This step does not use Google, Meta, or Alphabet. {SEED_OFF_PHONE}
      </p>
      <div>
        <Label htmlFor="signup-email">Email</Label>
        <Input id="signup-email" type="email" className="mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" disabled={busy || !email.includes("@")} onClick={() => void send("email")}>
          Email a code
        </Button>
        <Button type="button" disabled={busy || !email.includes("@")} onClick={() => void send("qr")}>
          Show a QR code
        </Button>
      </div>
      {mailNote ? <p className="text-sm text-warn">{mailNote}</p> : null}
      {code ? (
        <div className="rounded-[var(--radius-md)] border border-border p-3">
          <CodeQr value={code} />
          <p className="mt-3 font-mono text-2xl tracking-widest">{code}</p>
          <p className="mt-2 text-xs text-muted-foreground">Write it down now. It is not saved on this phone. Stripe, X Money, and Phantom are purchase rails. They are not this login.</p>
        </div>
      ) : null}
      <div>
        <Label htmlFor="signup-code">Code you wrote down</Label>
        <Input id="signup-code" className="mt-1.5" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
      </div>
      <Button type="button" className="w-full" disabled={busy || typed.trim().length < 8} onClick={() => void confirm()}>
        Confirm code
      </Button>
    </div>
  );
}
