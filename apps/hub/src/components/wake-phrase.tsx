import { useState } from "react";
import { answerWakePhrase } from "@/lib/trv/sentinel-voice";

export function WakePhrase() {
  const [said, setSaid] = useState("hey sentinel does a dapp like the remote viewer exist");
  const [result, setResult] = useState("No question has been asked.");

  function ask() {
    const fact = answerWakePhrase(said);
    setResult(fact.text);
  }

  return (
    <section className="space-y-3 rounded-[var(--radius-xl)] border border-border bg-card p-5">
      <h2 className="font-display text-2xl">Hey Sentinel</h2>
      <p className="text-sm text-muted-foreground">
        Speech capture is unwired. Type the wake phrase. If no fact source is connected, the answer stays empty.
      </p>
      <label className="block text-sm" htmlFor="wake-said">
        Phrase
        <input
          id="wake-said"
          className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm"
          value={said}
          onChange={(event) => setSaid(event.target.value)}
        />
      </label>
      <button type="button" className="rounded-md border border-border px-3 py-2 text-sm" onClick={ask}>
        Ask
      </button>
      <p className="text-sm" data-wake-result="">
        {result}
      </p>
    </section>
  );
}
