import { createFileRoute } from "@tanstack/react-router";
import { JOURNAL } from "@/lib/trv/journal";
import { listPublicHandles } from "@/lib/trv/server";
import { xmlEscape } from "@/lib/trv/seo";

const STATIC = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/journal", changefreq: "weekly", priority: "0.9" },
  { path: "/viewers", changefreq: "hourly", priority: "0.9" },
  { path: "/dapp", changefreq: "monthly", priority: "0.8" },
  { path: "/pricing", changefreq: "weekly", priority: "0.8" },
  { path: "/faq", changefreq: "monthly", priority: "0.8" },
  { path: "/covenant", changefreq: "monthly", priority: "0.7" },
  { path: "/company", changefreq: "monthly", priority: "0.6" },
  { path: "/compliance", changefreq: "monthly", priority: "0.5" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        let handles: { handle: string; createdAt: string }[] = [];
        try {
          handles = await listPublicHandles();
        } catch {
          handles = [];
        }
        const today = new Date().toISOString().slice(0, 10);
        const urls: string[] = [];
        for (const row of STATIC) {
          urls.push(urlXml(`${origin}${row.path}`, today, row.changefreq, row.priority));
        }
        for (const article of JOURNAL) {
          urls.push(
            urlXml(`${origin}/journal/${article.slug}`, article.modified, "monthly", "0.7"),
          );
        }
        for (const h of handles) {
          const parsed = Date.parse(String(h.createdAt));
          const last = Number.isFinite(parsed) ? new Date(parsed).toISOString().slice(0, 10) : today;
          urls.push(urlXml(`${origin}/v/${encodeURIComponent(h.handle)}`, last, "daily", "0.6"));
        }
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});

function urlXml(loc: string, lastmod: string, changefreq: string, priority: string) {
  return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${xmlEscape(lastmod)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}
