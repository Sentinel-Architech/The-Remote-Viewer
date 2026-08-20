import { useState } from "react";
import { toast } from "sonner";
import { useViewer } from "./viewer-context";
import { attestBaseline } from "@/lib/trv/server";
import { Button } from "./ui/button";
import { NCMEC_NAME, NCMEC_TIP } from "@/lib/trv/compliance";

export function AgeGate() {
  const { profile, setProfile } = useViewer();
  const [age, setAge] = useState(false);
  const [ofac, setOfac] = useState(false);
  if (!profile || (profile.ageOk && profile.ofacOk)) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-bg/80 p-4">
      <div className="my-4 w-full max-w-md rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <h2 className="font-display text-2xl">Baseline lock</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          18 or older. Not on the OFAC SDN list. TRV is a US-native hub — not a
          foreign-adversary app. CSAM is refused.{" "}
          <a className="underline" href={NCMEC_TIP} target="_blank" rel="noreferrer">
            {NCMEC_NAME}
          </a>
          .
        </p>
        <label className="mt-4 flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-1" checked={age} onChange={(e) => setAge(e.target.checked)} />
          I am 18 or older.
        </label>
        <label className="mt-3 flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-1" checked={ofac} onChange={(e) => setOfac(e.target.checked)} />
          I am not a sanctioned person and I am not opening this node as an agent of a foreign-adversary controlled application.
        </label>
        <Button
          className="mt-5 w-full"
          disabled={!age || !ofac}
          onClick={async () => {
            try {
              const p = await attestBaseline({ data: { age18: true, ofac: true } });
              if (p) setProfile(p);
              toast.success("Baseline sealed");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Attest failed");
            }
          }}
        >
          Enter the hub
        </Button>
      </div>
    </div>
  );
}
