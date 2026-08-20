import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = "http://127.0.0.1:8080";
await mkdir("/workspace/screenshots", { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

async function dismissAge() {
  const heading = page.getByRole("heading", { name: /Baseline lock/i });
  if (!(await heading.isVisible({ timeout: 4000 }).catch(() => false))) return;
  const gate = page.locator("div.fixed").filter({ hasText: "Baseline lock" });
  await gate.getByText("I am 18 or older.").click();
  await gate.getByText(/I am not a sanctioned person/).click();
  await gate.getByRole("button", { name: /Enter the hub/i }).click();
  await heading.waitFor({ state: "hidden", timeout: 8000 }).catch(() => {});
}

const email = `brief.${Date.now()}@trv.test`;
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.locator("#name").fill("Briefing Node");
await page.locator("#email").fill(email);
await page.locator("#pw").fill("sentinel1");
await page.locator("label").filter({ hasText: /18 or older/i }).locator("input").check();
await page.locator("label").filter({ hasText: /sanctioned/i }).locator("input").check();
await page.getByRole("button", { name: /Create native TRV lock/i }).click();
await page.waitForURL(/\/hub/, { timeout: 20000 });
await dismissAge();

const briefing = page.locator("#viewer-briefing");
await briefing.waitFor({ state: "visible", timeout: 15000 });

const skipVisible = await page.getByRole("button", { name: /skip/i }).isVisible().catch(() => false);
await page.keyboard.press("Escape");
const stillUp = await briefing.isVisible();

await page.screenshot({ path: "/workspace/screenshots/briefing-welcome.png" });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: "/workspace/screenshots/briefing-welcome-mobile.png" });
await page.setViewportSize({ width: 1280, height: 900 });

const titles = [];
while (await page.getByRole("button", { name: /^Next$/i }).isVisible().catch(() => false)) {
  titles.push((await page.locator("#briefing-title").innerText()).trim());
  const n = await briefing.getAttribute("data-briefing-step");
  if (n === "2") {
    await page.screenshot({ path: "/workspace/screenshots/briefing-watch.png" });
  }
  if (n === "8") {
    await page.screenshot({ path: "/workspace/screenshots/briefing-profile.png" });
  }
  await page.getByRole("button", { name: /^Next$/i }).click();
  await page.waitForTimeout(180);
}
titles.push((await page.locator("#briefing-title").innerText()).trim());

const seal = page.getByRole("button", { name: /Seal briefing/i });
const sealDisabled = await seal.isDisabled();
await page.screenshot({ path: "/workspace/screenshots/briefing-seal.png" });
await page.getByText(/I know what each station is/i).click();
await seal.click();
await briefing.waitFor({ state: "hidden", timeout: 10000 });

await page.waitForSelector("text=Command", { timeout: 10000 });
await page.screenshot({ path: "/workspace/screenshots/briefing-hub-after.png" });

await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(800);
const briefingAfterReload = await page.locator("#viewer-briefing").isVisible().catch(() => false);

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${BASE}/hub`, { waitUntil: "networkidle" });
const briefingMobile = await page.locator("#viewer-briefing").isVisible().catch(() => false);
await page.screenshot({ path: "/workspace/screenshots/briefing-hub-mobile.png" });

console.log(
  JSON.stringify({
    skipVisible,
    stillUpAfterEscape: stillUp,
    steps: titles.length,
    titles,
    sealDisabledUntilAck: sealDisabled,
    briefingAfterReload,
    briefingMobile,
    errors,
  }),
);

await browser.close();
