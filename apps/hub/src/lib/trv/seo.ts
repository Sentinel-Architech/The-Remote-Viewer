import { NETWORK_NAME, NETWORK_SHORT, NETWORK_TAG } from "./network";
import { PAID_TRIAL_HOURS } from "./trial";

export const SEO_DEFAULT_DESC =
  `${NETWORK_NAME}: check in daily to defend The Sentinel and earn TRV. Sign in, land one intercept, claim the watch. No ticket.`;

export function pageTitle(title: string): string {
  if (title === NETWORK_NAME || title.startsWith(`${NETWORK_NAME}`)) return title;
  return `${title} · ${NETWORK_NAME}`;
}

export function pageHead(opts: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}) {
  const title = pageTitle(opts.title);
  const index = opts.index !== false;
  return {
    meta: [
      { title },
      { name: "description", content: opts.description.slice(0, 320) },
      { name: "robots", content: index ? "index,follow,max-image-preview:large" : "noindex,nofollow" },
      { name: "author", content: NETWORK_NAME },
      { name: "application-name", content: NETWORK_SHORT },
    ],
    links: [
      { rel: "canonical", href: opts.path },
    ],
  };
}

export function orgJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: NETWORK_NAME,
    alternateName: NETWORK_SHORT,
    description: NETWORK_TAG,
    url: "/",
    logo: "/favicon.svg",
    foundingDate: "2026",
    knowsAbout: [
      "remote viewing",
      "Gateway Process",
      "decentralized applications",
      "mesh defense",
      "native cryptocurrency wallets",
    ],
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: NETWORK_NAME,
    alternateName: NETWORK_SHORT,
    description: SEO_DEFAULT_DESC,
    url: "/",
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: "/viewers?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}

export function softwareJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: NETWORK_NAME,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: `Initiate is free. Verified is $${9}/month, with a ${PAID_TRIAL_HOURS}-hour self-serve trial.`,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.path,
    })),
  };
}

export function articleJsonLd(opts: {
  title: string;
  description: string;
  path: string;
  published: string;
  modified: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    datePublished: opts.published,
    dateModified: opts.modified,
    inLanguage: "en-US",
    author: { "@type": "Organization", name: NETWORK_NAME },
    publisher: { "@type": "Organization", name: NETWORK_NAME, logo: { "@type": "ImageObject", url: "/favicon.svg" } },
    mainEntityOfPage: opts.path,
  };
}

export function personJsonLd(opts: {
  name: string;
  handle: string;
  description: string;
  path: string;
  jobTitle?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: opts.name,
    alternateName: `@${opts.handle}`,
    description: opts.description,
    url: opts.path,
    jobTitle: opts.jobTitle || "Remote Viewer",
    affiliation: { "@type": "Organization", name: NETWORK_NAME },
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
