import { createFileRoute } from "@tanstack/react-router";
import { settleOnramp } from "@/lib/trv/server";
import type { OnrampDest } from "@/lib/trv/onramp";

/** Stripe replay window (seconds). */
const MAX_AGE_SEC = 300;

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
        if (!secret) {
          return new Response("webhook secret not configured", { status: 503 });
        }
        const raw = await request.text();
        const sig = request.headers.get("stripe-signature") || "";
        const ok = await verifyStripe(raw, sig, secret);
        if (!ok) return new Response("invalid signature", { status: 400 });

        let event: { type?: string; data?: { object?: Record<string, unknown> } };
        try {
          event = JSON.parse(raw) as typeof event;
        } catch {
          return new Response("bad json", { status: 400 });
        }
        if (event.type === "checkout.session.completed") {
          const obj = event.data?.object ?? {};
          const paymentStatus = typeof obj.payment_status === "string" ? obj.payment_status : "";
          if (paymentStatus && paymentStatus !== "paid" && paymentStatus !== "no_payment_required") {
            return new Response(JSON.stringify({ received: true, skipped: "unpaid" }), {
              headers: { "Content-Type": "application/json" },
            });
          }
          const meta = (obj.metadata ?? {}) as Record<string, string>;
          const userId = typeof meta.userId === "string" ? meta.userId : "";
          const dest: OnrampDest = meta.dest === "sol" ? "sol" : "trv";
          // Trust Stripe's settled amount, never client-supplied metadata.usd.
          const amountTotal = Number(obj.amount_total);
          const usd = Number.isFinite(amountTotal) && amountTotal > 0 ? amountTotal / 100 : 0;
          const sessionId = typeof obj.id === "string" ? obj.id : "";
          if (userId && usd > 0 && sessionId) {
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

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyStripe(payload: string, header: string, secret: string): Promise<boolean> {
  const items = header.split(",").map((p) => p.trim());
  let t = "";
  const v1s: string[] = [];
  for (const item of items) {
    const eq = item.indexOf("=");
    if (eq < 0) continue;
    const k = item.slice(0, eq);
    const v = item.slice(eq + 1);
    if (k === "t") t = v;
    if (k === "v1" && v) v1s.push(v);
  }
  if (!t || !v1s.length) return false;
  const ts = Number(t);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() / 1000 - ts) > MAX_AGE_SEC) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${payload}`));
  const hex = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
  let match = false;
  for (const v1 of v1s) {
    if (timingSafeEqualHex(hex, v1.toLowerCase())) match = true;
  }
  return match;
}
