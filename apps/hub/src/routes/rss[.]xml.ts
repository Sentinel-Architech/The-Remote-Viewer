import { createFileRoute } from "@tanstack/react-router";
import { JOURNAL } from "@/lib/trv/journal";
import { NETWORK_NAME, NETWORK_TAG } from "@/lib/trv/network";
import { xmlEscape } from "@/lib/trv/seo";

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const items = JOURNAL.map((a) => {
          const body = xmlEscape(a.body.join(" "));
          return `    <item>
      <title>${xmlEscape(a.title)}</title>
      <link>${origin}/journal/${a.slug}</link>
      <guid>${origin}/journal/${a.slug}</guid>
      <pubDate>${new Date(a.published + "T12:00:00Z").toUTCString()}</pubDate>
      <description>${xmlEscape(a.dek)}</description>
      <content:encoded><![CDATA[${body}]]></content:encoded>
    </item>`;
        }).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(NETWORK_NAME)} Journal</title>
    <link>${origin}/journal</link>
    <description>${xmlEscape(NETWORK_TAG)}</description>
    <language>en-us</language>
    <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=600",
          },
        });
      },
    },
  },
});
