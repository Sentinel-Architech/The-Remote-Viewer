import { useEffect, useRef, useState } from "react";
import { Mic, Shield } from "lucide-react";
import { toast } from "sonner";
import { askSentinel, speakSentinel } from "@/lib/trv/sentinel-ai";
import { announce } from "@/lib/trv/media";
import { Button } from "./ui/button";
import { Sheet, SheetContent } from "./ui/sheet";
import { Switch } from "./ui/switch";

type Turn = { role: "user" | "assistant"; content: string };

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRec;
    SpeechRecognition?: new () => SpeechRec;
  }
}

type SpeechRec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: { results: { length: number; [i: number]: { isFinal: boolean; 0: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

function speechCtor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

export function SentinelDock() {
  const [open, setOpen] = useState(false);
  const [wake, setWake] = useState(false);
  const [voice, setVoice] = useState(true);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const recRef = useRef<SpeechRec | null>(null);
  const talkRef = useRef<SpeechRec | null>(null);
  const armed = useRef(false);
  const turnsRef = useRef(turns);
  turnsRef.current = turns;
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("trv-open-sentinel", onOpen);
    return () => window.removeEventListener("trv-open-sentinel", onOpen);
  }, []);

  useEffect(() => {
    const Ctor = speechCtor();
    if (!Ctor || !wake) {
      recRef.current?.stop();
      return;
    }
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (ev) => {
      let said = "";
      for (let i = 0; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r?.isFinal) said += r[0].transcript;
      }
      const t = said.toLowerCase();
      if (t.includes("hey sentinel")) {
        const after = said.replace(/hey sentinel[,.]?/i, "").trim();
        setOpen(true);
        if (after.length > 2 && !armed.current) {
          armed.current = true;
          void send(after).finally(() => {
            armed.current = false;
          });
        }
      }
    };
    rec.onend = () => {
      if (wake) {
        try {
          rec.start();
        } catch {
          /* already started */
        }
      }
    };
    recRef.current = rec;
    try {
      rec.start();
    } catch {
      /* ignore */
    }
    return () => {
      rec.onend = null;
      rec.stop();
    };
  }, [wake]);

  function speakButton() {
    if (listening) {
      talkRef.current?.stop();
      setListening(false);
      return;
    }
    const Ctor = speechCtor();
    if (!Ctor) {
      toast.error("This browser cannot hear. Type an order instead.");
      return;
    }
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (ev) => {
      let said = "";
      for (let i = 0; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r) said += r[0].transcript;
      }
      said = said.trim();
      if (said) {
        setInput(said);
        void send(said);
      }
    };
    rec.onerror = (ev) => {
      setListening(false);
      if (ev.error !== "aborted" && ev.error !== "no-speech") {
        toast.error("Mic closed. Type instead.");
      }
    };
    rec.onend = () => setListening(false);
    talkRef.current = rec;
    try {
      rec.start();
      setListening(true);
      setOpen(true);
    } catch {
      toast.error("Mic refused. Type an order.");
      setListening(false);
    }
  }

  async function send(prompt: string) {
    const text = prompt.trim();
    if (!text || busy) return;
    setBusy(true);
    setTurns((t) => [...t, { role: "user", content: text }]);
    setInput("");
    try {
      const r = await askSentinel({
        data: { prompt: text, history: turnsRef.current.slice(-6) },
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      setTurns((t) => [...t, { role: "assistant", content: r.text }]);
      if (voice) {
        const s = await speakSentinel({ data: r.text.slice(0, 800) });
        if (s.ok) {
          const bin = Uint8Array.from(atob(s.b64), (c) => c.charCodeAt(0));
          const blob = new Blob([bin], { type: s.mime });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          void audio.play();
          audio.onended = () => URL.revokeObjectURL(url);
        } else {
          announce(r.text.slice(0, 280));
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Helm closed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-3 z-30 hidden flex-col items-end gap-2 md:bottom-6 md:flex">
        <Button
          type="button"
          size="sm"
          variant={listening ? "default" : "secondary"}
          aria-pressed={listening}
          aria-label={listening ? "Stop speaking to Sentinel" : "Speak to Sentinel"}
          onClick={speakButton}
        >
          <Mic className="size-4" />
          {listening ? "Listening…" : "Speak"}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-12 w-12 place-items-center rounded-full border border-accent/50 bg-card text-accent"
          aria-label="Open Sentinel. Type or press Speak. Microphone stays off."
        >
          <Shield className="size-5" />
        </button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex w-[min(100%,26rem)] flex-col">
          <h2 className="font-display text-xl">Personal Sentinel</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Type an order, or press Speak. The microphone stays off until you
            do. Wake word is optional — never on by default.
          </p>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Mic className="size-3.5" /> Always-on wake word
            </span>
            <Switch checked={wake} onCheckedChange={setWake} />
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span>Knight voice (Leo — male)</span>
            <Switch checked={voice} onCheckedChange={setVoice} />
          </div>
          <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto">
            {turns.length === 0 ? (
              <p className="text-sm text-muted-foreground">Press Speak, or type. No mic until you ask.</p>
            ) : (
              turns.map((t, i) => (
                <p
                  key={i}
                  className={`text-sm leading-relaxed ${t.role === "assistant" ? "text-fg" : "text-muted-foreground"}`}
                >
                  <span className="text-[11px] uppercase tracking-wide text-accent">
                    {t.role === "assistant" ? "Sentinel" : "Viewer"}
                  </span>
                  <br />
                  {t.content}
                </p>
              ))
            )}
          </div>
          <form
            className="mt-3 flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <input
              className="h-11 w-full rounded-[var(--radius-sm)] border border-input bg-elevated px-3 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type an order"
              aria-label="Order for Sentinel"
            />
            <div className="flex gap-2">
              <Button type="button" variant={listening ? "default" : "secondary"} className="flex-1" onClick={speakButton}>
                <Mic className="size-4" />
                {listening ? "Stop" : "Speak"}
              </Button>
              <Button type="submit" disabled={busy} className="flex-1">
                {busy ? "…" : "Send"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
