import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = "http://127.0.0.1:8080";
await mkdir("/workspace/screenshots", { recursive: true });

const browser = await chromium.launch({ headless: true });
const errors = [];

async function shot(page, path, file) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `/workspace/screenshots/${file}`, fullPage: true });
}

const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await desktop.newPage();
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

await shot(page, "/", "seo-landing.png");
await shot(page, "/journal", "seo-journal.png");
await shot(page, "/journal/two-day-verified-trial", "seo-article.png");
await shot(page, "/dapp", "seo-dapp.png");
await shot(page, "/faq", "seo-faq.png");
await shot(page, "/viewers", "seo-viewers.png");
await shot(page, "/pricing", "seo-pricing.png");
await shot(page, "/login?trial=verified", "seo-login-trial.png");

const landingHasTrial = await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" }).then(async () => {
  return page.getByRole("link", { name: /Try Verified/i }).count();
});
const dappHasSteps = await page.goto(`${BASE}/dapp`, { waitUntil: "domcontentloaded" }).then(async () => {
  return page.getByRole("heading", { name: /Native lock/i }).count();
});
const faqHasLd = await page.goto(`${BASE}/faq`, { waitUntil: "domcontentloaded" }).then(async () => {
  return page.locator('script[type="application/ld+json"]').count();
});

const email = `outside.${Date.now()}@trv.test`;
await page.goto(`${BASE}/login?trial=verified`, { waitUntil: "networkidle" });
await page.locator("#name").fill("Outside Viewer");
await page.locator("#email").fill(email);
await page.locator("#pw").fill("sentinel1");
await page.locator("label").filter({ hasText: /18 or older/i }).locator("input").check();
await page.locator("label").filter({ hasText: /sanctioned/i }).locator("input").check();
const submit = page.getByRole("button", { name: /start 2-day trial|Create native TRV lock/i });
await submit.click();
await page.waitForURL(/\/hub/, { timeout: 25000 });

async function dismissAge() {
  const heading = page.getByRole("heading", { name: /Baseline lock/i });
  if (!(await heading.isVisible({ timeout: 2500 }).catch(() => false))) return;
  const gate = page.locator("div.fixed").filter({ hasText: "Baseline lock" });
  await gate.getByText("I am 18 or older.").click();
  await gate.getByText(/I am not a sanctioned person/).click();
  await gate.getByRole("button", { name: /Enter the hub/i }).click();
  await heading.waitFor({ state: "hidden", timeout: 8000 }).catch(() => {});
}
async function completeBriefing() {
  const briefing = page.locator("#viewer-briefing");
  if (!(await briefing.isVisible({ timeout: 2500 }).catch(() => false))) return;
  while (await page.getByRole("button", { name: /^Next$/i }).isVisible().catch(() => false)) {
    await page.getByRole("button", { name: /^Next$/i }).click();
  }
  const ack = page.getByText(/I know what each station is/i);
  if (await ack.isVisible().catch(() => false)) await ack.click();
  const seal = page.getByRole("button", { name: /Seal briefing/i });
  if (await seal.isVisible().catch(() => false)) {
    await seal.click();
    await briefing.waitFor({ state: "hidden", timeout: 8000 }).catch(() => {});
  }
}

await dismissAge();
await completeBriefing();
await page.waitForTimeout(800);
const trialVisible = await page.getByText(/Outside trial|Verified trial|Verified for/i).count();
await page.screenshot({ path: "/workspace/screenshots/seo-hub-trial.png", fullPage: true });

await page.goto(`${BASE}/hub/billing`, { waitUntil: "networkidle" });
await dismissAge();
await completeBriefing();
await page.screenshot({ path: "/workspace/screenshots/seo-billing-trial.png", fullPage: true });
const billingClock = await page.getByText(/Trial clock|Verified trial/i).count();

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mpage = await mobile.newPage();
await mpage.goto(`${BASE}/`, { waitUntil: "networkidle" });
await mpage.waitForTimeout(300);
await mpage.screenshot({ path: "/workspace/screenshots/seo-landing-mobile.png", fullPage: true });
await mpage.goto(`${BASE}/dapp`, { waitUntil: "networkidle" });
await mpage.screenshot({ path: "/workspace/screenshots/seo-dapp-mobile.png", fullPage: true });

const sitemap = await (await desktop.request.get(`${BASE}/sitemap.xml`)).text();
const rss = await (await desktop.request.get(`${BASE}/rss.xml`)).text();

console.log(
  JSON.stringify(
    {
      landingHasTrial,
      dappHasSteps,
      faqHasLd,
      trialVisible,
      billingClock,
      sitemapUrls: (sitemap.match(/<loc>/g) || []).length,
      rssItems: (rss.match(/<item>/g) || []).length,
      sitemapHasJournal: sitemap.includes("/journal"),
      errors: errors.slice(0, 12),
    },
    null,
    2,
  ),
);

await browser.close();
