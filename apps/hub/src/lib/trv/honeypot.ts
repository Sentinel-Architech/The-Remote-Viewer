/** Consenting honeypot. Decoys waste scanners. Sentinel learns. Viewers are not silent bait. */

export const LURES = [
  { path: "/api/lure/.env", kind: "secret-scan", bait: "env dump" },
  { path: "/api/lure/wp-login.php", kind: "cms-brute", bait: "wp admin" },
  { path: "/api/lure/admin", kind: "panel-probe", bait: "admin panel" },
  { path: "/api/lure/wallet/export", kind: "key-theft", bait: "wallet export" },
  { path: "/api/lure/graphql", kind: "api-introspect", bait: "graphql" },
  { path: "/api/lure/debug/phpinfo", kind: "debug-leak", bait: "phpinfo" },
] as const;

export function classifyLure(path: string): { lure: string; kind: string } {
  const hit = LURES.find((l) => path.includes(l.path.replace("/api/lure", "")) || path.includes(l.kind));
  const raw = path.slice(0, 80) || "/api/lure/unknown";
  if (hit) return { lure: hit.path, kind: hit.kind };
  if (/\.env|id_rsa|credentials/i.test(path)) return { lure: raw, kind: "secret-scan" };
  if (/wp-|xmlrpc|phpmyadmin/i.test(path)) return { lure: raw, kind: "cms-brute" };
  if (/wallet|seed|private.?key/i.test(path)) return { lure: raw, kind: "key-theft" };
  if (/admin|debug|console/i.test(path)) return { lure: raw, kind: "panel-probe" };
  return { lure: raw, kind: "scanner" };
}

export function lessonFor(kind: string): string {
  return (
    {
      "secret-scan": "Never serve env files. Canary the path. Rotate nothing — there was no secret.",
      "cms-brute": "No WordPress here. Slow-play 403s. Do not reveal the real lock.",
      "panel-probe": "Admin is a lure. Identity is native TRV, not /admin.",
      "key-theft": "Seeds never leave the device. Export endpoints are always fake.",
      "api-introspect": "No public GraphQL schema. Refuse introspection.",
      "debug-leak": "Debug banners stay off. phpinfo is a tarpit.",
      scanner: "Ambient scan. Log, don't chatter. Heal from the pattern.",
    }[kind] || "Log the pattern. Heal. Do not open a backdoor to study one."
  );
}

export const DECOY_BODY: Record<string, string> = {
  "secret-scan": "APP_KEY=canary-not-a-secret\nDB_PASSWORD=honeypot\n",
  "cms-brute": "<form>wp-login decoy</form>",
  "panel-probe": '{"error":"unauthorized"}',
  "key-theft": '{"seed":"not-a-real-wallet","note":"canary"}',
  "api-introspect": '{"data":{"__schema":"canary"}}',
  "debug-leak": "PHP Version 0.0.0 (canary)",
  scanner: "ok",
};
