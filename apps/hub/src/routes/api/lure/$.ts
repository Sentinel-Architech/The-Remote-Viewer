import { createFileRoute } from "@tanstack/react-router";
import { absorbProbe } from "@/lib/trv/server";
import { classifyLure, DECOY_BODY } from "@/lib/trv/honeypot";

export const Route = createFileRoute("/api/lure/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
      PUT: handle,
    },
  },
});

async function handle({ request }: { request: Request }) {
  const url = new URL(request.url);
  const absorbed = await absorbProbe(url.pathname);
  const body = DECOY_BODY[absorbed.kind] || DECOY_BODY.scanner;
  const cls = classifyLure(url.pathname);
  return new Response(body, {
    status: 403,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-TRV-Canary": cls.kind,
      "Cache-Control": "no-store",
    },
  });
}
