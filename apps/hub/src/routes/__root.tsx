import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

import { NETWORK_NAME } from "@/lib/trv/network";
import { SEO_DEFAULT_DESC } from "@/lib/trv/seo";

const APP_NAME = NETWORK_NAME;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "theme-color", content: "#08090b" },
      {
        name: "description",
        content: SEO_DEFAULT_DESC,
      },
      { name: "robots", content: "index,follow,max-image-preview:large" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "alternate", type: "application/rss+xml", title: `${APP_NAME} Journal`, href: "/rss.xml" },
      { rel: "sitemap", href: "/sitemap.xml" },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg">
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Toaster
          theme="dark"
          position="bottom-center"
          offset="5.5rem"
          toastOptions={{
            className: "bg-card text-fg border-border",
          }}
        />
        <Scripts />
      </body>
    </html>
  ),
});
