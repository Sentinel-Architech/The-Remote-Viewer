import { useRef, useState } from "react";
import { Download, Fingerprint, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LIFE_TAG, MOTTO } from "@/lib/trv";
import { carryLife, destroyThisCopy, takeLife } from "@/lib/life";
import { startHub } from "@/lib/hub-sync";
import { useIdentity } from "@/lib/identity";
import { viewingLens, usePill } from "@/lib/pill";

export function DigitalLife() {
  const short = useIdentity((s) => s.short);
  const pubkey = useIdentity((s) => s.pubkey);
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState<"take" | "carry" | "kill" | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const lens = usePill((s) => viewingLens(s));

  async function take() {
    setBusy("take");
    setError(null);
    setNote(null);
    try {
      await takeLife(pin);
      setNote("Life wrap downloaded. That file is yours. This device still holds a copy.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Take failed.");
    } finally {
      setBusy(null);
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy("carry");
    setError(null);
    setNote(null);
    try {
      const raw = JSON.parse(await file.text()) as unknown;
      const key = await carryLife(pin, raw);
      startHub();
      setNote(`Carried. This device is Viewer ${key.slice(0, 6)}… now.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Carry failed. Six digits and your file.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function destroy() {
    if (!armed) {
      setArmed(true);
      return;
    }
    setBusy("kill");
    setError(null);
    try {
      await destroyThisCopy();
      startHub();
      setArmed(false);
      setPin("");
      setNote("This copy is gone. Carry a life you own, or this device is a new Viewer.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Destroy failed.");
    } finally {
      setBusy(null);
    }
  }

  const yours = lens === "blue"
    ? "Your key, rank, seizes, lens, and specialist stay on this device. X is how friends find you — not who owns the life."
    : "Key here. Rank here. Seizes here. X is a name. The wrap is yours.";

  return (
    <div className="mt-3 rounded-lg bg-card-2 p-3 shadow-[var(--shadow-border)]" data-life="1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-sage uppercase">{MOTTO}</p>
          <p className="mt-1 text-xs tracking-wide text-muted uppercase">Your digital life</p>
        </div>
        <Fingerprint className="size-4 text-sage" strokeWidth={1.75} />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground">{LIFE_TAG}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted">{yours}</p>
      <p className="mt-2 font-mono text-xs text-sage">Viewer {short || "minting"}</p>
      <label className="mt-3 block">
        <span className="text-xs tracking-wide text-muted uppercase">Six digits wrap the take</span>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          aria-label="Six-digit wrap for your digital life"
          className="mt-1 h-11 w-full rounded-md bg-card px-3 font-mono text-lg tracking-[0.4em] text-foreground shadow-[var(--shadow-border)] outline-none"
          data-life-pin="1"
        />
      </label>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="primary" disabled={busy !== null || pin.length !== 6 || !pubkey} onClick={() => void take()}>
          <Download className="size-4" strokeWidth={1.75} />
          Take my life
        </Button>
        <Button
          variant="ghost"
          disabled={busy !== null || pin.length !== 6}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="size-4" strokeWidth={1.75} />
          Carry a life
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        aria-label="Open a Remote Viewer life file you own"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <Button
        variant={armed ? "primary" : "ghost"}
        className="mt-2 w-full"
        disabled={busy !== null}
        aria-label={armed ? "Confirm destroy this device copy" : "Destroy this device copy"}
        onClick={() => void destroy()}
      >
        <Trash2 className="size-4" strokeWidth={1.75} />
        {armed ? "Confirm: destroy this copy" : "Destroy this copy"}
      </Button>
      {note ? <p className="mt-2 text-sm text-sage">{note}</p> : null}
      {error ? <p className="mt-2 text-sm text-ember">{error}</p> : null}
      <p className="mt-2 text-xs text-subtle">
        Mesh scores are posts you made. The wrap is the life. We do not keep a copy.
      </p>
    </div>
  );
}
