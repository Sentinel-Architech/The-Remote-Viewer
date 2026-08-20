import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listInbox, sendMessage } from "@/lib/trv/commons";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function CommsRail() {
  const [open, setOpen] = useState(true);
  const [inbox, setInbox] = useState<Awaited<ReturnType<typeof listInbox>>>([]);
  const [peer, setPeer] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    void listInbox()
      .then((rows) => {
        setInbox(rows);
        if (!peer && rows[0]) setPeer(rows[0].handle);
      })
      .catch(() => {});
    const id = window.setInterval(() => {
      void listInbox()
        .then(setInbox)
        .catch(() => {});
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  async function send() {
    if (!peer || !text.trim()) return;
    try {
      await sendMessage({ data: { handle: peer, body: text.trim() } });
      setText("");
      setInbox(await listInbox());
      toast.success(`Sent to @${peer}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Send failed");
    }
  }

  return (
    <aside className="flex w-full flex-col rounded-[var(--radius-xl)] border border-border bg-card md:w-80">
      <button
        type="button"
        className="flex h-11 items-center justify-between px-4 text-left text-sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="font-medium">Network comms</span>
        <span className="text-xs text-muted-foreground">{open ? "Hide" : "Show"}</span>
      </button>
      {open ? (
        <div className="flex min-h-0 flex-1 flex-col border-t border-border p-3">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Threads live on the Network — not only this device. Browse the web;
            talk still lands here.
          </p>
          <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto" aria-live="polite">
            {inbox.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className="w-full rounded-[var(--radius-sm)] border border-border bg-elevated p-2 text-left text-xs"
                  onClick={() => setPeer(m.handle)}
                >
                  <span className="text-accent">@{m.handle}</span>
                  <span className="mt-1 block text-muted-foreground">{m.body}</span>
                </button>
              </li>
            ))}
            {inbox.length === 0 ? (
              <li className="text-xs text-muted-foreground">No inbound yet. Mutual verified friends can write you off this page.</li>
            ) : null}
          </ul>
          <div className="mt-3 flex gap-2">
            <Input
              aria-label="Reply"
              placeholder={peer ? `Reply @${peer}` : "Handle first"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void send();
              }}
            />
            <Button type="button" size="sm" onClick={() => void send()} disabled={!peer}>
              Send
            </Button>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
