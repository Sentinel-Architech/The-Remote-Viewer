import { createFileRoute } from "@tanstack/react-router";
import { X_HANDLE, X_URL } from "@/lib/trv/x-surface";
import { xKeyConfigured } from "@/lib/trv/x-key";

export const Route = createFileRoute("/api/x-station")({
  server: {
    handlers: {
      GET: async () =>
        Response.json({
          handle: X_HANDLE,
          url: X_URL,
          keyConfigured: xKeyConfigured(),
          door: false,
        }),
    },
  },
});
