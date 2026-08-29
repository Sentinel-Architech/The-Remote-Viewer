import { useEffect, useState } from "react";

type PromptEvent = Event & {
  prompt: () => Promise<void>;
};

export function useInstall() {
  const [promptEvent, setPromptEvent] = useState<PromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const nav = navigator as Navigator & { standalone?: boolean };
    const apply = () => setStandalone(mq.matches || nav.standalone === true);
    apply();
    mq.addEventListener("change", apply);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as PromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => {
      mq.removeEventListener("change", apply);
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  async function install() {
    if (promptEvent) {
      await promptEvent.prompt();
      setPromptEvent(null);
      return;
    }
    window.location.assign("/?install=1&platform=ios");
  }

  return { install, canPrompt: Boolean(promptEvent), standalone };
}
