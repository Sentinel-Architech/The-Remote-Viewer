import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = "http://127.0.0.1:8080";
await mkdir("/workspace/screenshots", { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

const email = `trial.${Date.now()}@trv.test`;
await page.goto(`${BASE}/login?trial=verified`, { waitUntil: "networkidle" });
await page.locator("#name").fill("Trial Node");
await page.locator("#email").fill(email);
await page.locator("#pw").fill("sentinel1");
await page.locator("label").filter({ hasText: /18 or older/i }).locator("input").check();
await page.locator("label").filter({ hasText: /sanctioned/i }).locator("input").check();
await page.getByRole("button", { name: /start 2-day trial|Create native TRV lock/i }).click();
await page.waitForURL(/\/hub/, { timeout: 25000 });

const heading = page.getByRole("heading", { name: /Baseline lock/i });
if (await heading.isVisible({ timeout: 3000 }).catch(() => false)) {
  const gate = page.locator("div.fixed").filter({ hasText: "Baseline lock" });
  await gate.getByText("I am 18 or older.").click();
  await gate.getByText(/I am not a sanctioned person/).click();
  await gate.getByRole("button", { name: /Enter the hub/i }).click();
  await heading.waitFor({ state: "hidden", timeout: 8000 }).catch(() => {});
}

for (let i = 0; i < 16; i++) {
  const next = page.getByRole("button", { name: /^Next$/i });
  if (!(await next.isVisible().catch(() => false))) break;
  await next.click();
  await page.waitForTimeout(180);
}

const ack = page.getByText(/I know what each station is/i);
if (await ack.isVisible().catch(() => false)) {
  await page.locator("#viewer-briefing input[type=checkbox]").check({ force: true }).catch(async () => {
    await ack.click();
  });
  await page.getByRole("button", { name: /Seal briefing/i }).click();
  await page.locator("#viewer-briefing").waitFor({ state: "hidden", timeout: 10000 }).catch(() => {});
}

await page.waitForTimeout(600);
const body = await page.locator("body").innerText();
const hasTrial =
  /Outside trial/i.test(body) || /Verified trial/i.test(body) || /48h/i.test(body) || /2-day/i.test(body);
await page.screenshot({ path: "/workspace/screenshots/seo-hub-trial.png", fullPage: true });

await page.goto(`${BASE}/hub/billing`, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const billing = await page.locator("body").innerText();
await page.screenshot({ path: "/workspace/screenshots/seo-billing-trial.png", fullPage: true });

console.log(
  JSON.stringify(
    {
      email,
      hasTrial,
      hubSnippet: body.slice(0, 500),
      billingHasClock: /Trial clock/i.test(billing),
      billingHasStart: /Start 2-day Verified trial/i.test(billing),
      billingSnippet: billing.slice(0, 400),
      errors,
    },
    null,
    2,
  ),
);
await browser.close();
