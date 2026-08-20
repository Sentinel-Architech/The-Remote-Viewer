import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { announce, matchVoiceRoute } from "@/lib/trv/media";
import { askSentinel } from "@/lib/trv/sentinel-ai";
import { Button } from "./ui/button";
import { applyTheme, parseTheme, THEME_PRESETS } from "@/lib/trv/themes";

type Rec = {
  continuous: boolean;
  lang: string;
  onresult: ((ev: { results: { isFinal: boolean; 0: { transcript: string } }[] }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function VoiceHelm() {
  const navigate = useNavigate();
  const [on, setOn] = useState(false);
  const recRef = useRef<Rec | null>(null);

  useEffect(() => {
    const toggle = () => setOn((v) => !v);
    window.addEventListener("trv-toggle-handsfree", toggle);
    return () => window.removeEventListener("trv-toggle-handsfree", toggle);
  }, []);

  useEffect(() => {
    if (!on) {
      recRef.current?.stop();
      return;
    }
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      toast.error("This browser has no speech recognition. Use keyboard and skip-link instead.");
      setOn(false);
      return;
    }
    const rec = new Ctor() as Rec;
    rec.continuous = true;
    rec.lang = "en-US";
    rec.onresult = (ev) => {
      const last = ev.results[ev.results.length - 1];
      if (!last?.isFinal) return;
      const said = last[0].transcript.trim();
      void handle(said);
    };
    rec.onend = () => {
      if (on) {
        try {
          rec.start();
        } catch {
          /* already */
        }
      }
    };
    recRef.current = rec;
    try {
      rec.start();
      announce("Hands-free on. Say open forum, or hey Sentinel.");
    } catch {
      /* */
    }
    return () => rec.stop();
  }, [on]);

  async function handle(said: string) {
    const t = said.toLowerCase();
    if (t.includes("hands free off") || t.includes("stop listening")) {
      setOn(false);
      announce("Hands-free off");
      return;
    }
    if (t.includes("scroll down")) {
      window.scrollBy({ top: 400, behavior: "smooth" });
      announce("Scrolling down");
      return;
    }
    if (t.includes("scroll up")) {
      window.scrollBy({ top: -400, behavior: "smooth" });
      announce("Scrolling up");
      return;
    }
    if (t.includes("go back")) {
      history.back();
      announce("Back");
      return;
    }
    if (t.includes("high contrast") || t.includes("signal theme")) {
      const th = parseTheme(null);
      applyTheme({ ...th, preset: "signal", accent: THEME_PRESETS.signal.accent });
      announce("Signal contrast on");
      return;
    }
    const route = matchVoiceRoute(t);
    if (route) {
      announce(`Opening ${route.replace("/hub/", "") || "command"}`);
      void navigate({ to: route });
      return;
    }
    const brief = said.replace(/hey sentinel[,.]?/i, "").trim();
    if (/hey sentinel/i.test(said) && brief.length > 2) {
      announce("Briefing Sentinel");
      try {
        const r = await askSentinel({ data: { prompt: brief } });
        if (r.ok) announce(r.text.slice(0, 280));
      } catch {
        announce("Helm closed");
      }
    }
  }

  return (
    <div className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-3 z-40 hidden md:bottom-6 md:block">
      <Button
        type="button"
        variant={on ? "default" : "secondary"}
        aria-pressed={on}
        aria-label={on ? "Hands-free voice on. Click to stop." : "Start hands-free voice control"}
        onClick={() => setOn((v) => !v)}
      >
        {on ? "Listening" : "Hands-free"}
      </Button>
    </div>
  );
}
