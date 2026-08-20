import { createFileRoute } from "@tanstack/react-router";
import { settleOnramp } from "@/lib/trv/server";
import type { OnrampDest } from "@/lib/trv/onramp";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        const raw = await request.text();
        if (secret) {
          const sig = request.headers.get("stripe-signature") || "";
          const ok = await verifyStripe(raw, sig, secret);
          if (!ok) return new Response("invalid signature", { status: 400 });
        }
        let event: { type?: string; data?: { object?: Record<string, unknown> } };
        try {
          event = JSON.parse(raw) as typeof event;
        } catch {
          return new Response("bad json", { status: 400 });
        }
        if (event.type === "checkout.session.completed") {
          const obj = event.data?.object ?? {};
          const meta = (obj.metadata ?? {}) as Record<string, string>;
          const userId = meta.userId;
          const dest: OnrampDest = meta.dest === "sol" ? "sol" : "trv";
          const usd = Number(meta.usd || 0);
          const sessionId = typeof obj.id === "string" ? obj.id : "stripe";
          if (userId && usd > 0) {
            await settleOnramp(userId, usd, dest, sessionId);
          }
        }
        return new Response(JSON.stringify({ received: true }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});

async function verifyStripe(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k, v];
    }),
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${payload}`));
  const hex = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === v1;
}
