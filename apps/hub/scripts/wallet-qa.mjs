import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = "http://127.0.0.1:8080";
await mkdir("/workspace/screenshots", { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

async function dismissOverlays() {
  await page.waitForTimeout(700);
  for (let i = 0; i < 12; i++) {
    const gate = page.locator("div.fixed").filter({ hasText: "Baseline lock" });
    if (await gate.isVisible().catch(() => false)) {
      await gate.getByText("I am 18 or older.").click();
      await gate.getByText(/I am not a sanctioned person/).click();
      await gate.getByRole("button", { name: /Enter the hub/i }).click();
      await gate.waitFor({ state: "hidden", timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(400);
      continue;
    }
    const briefing = page.locator("#viewer-briefing");
    if (await briefing.isVisible().catch(() => false)) {
      for (let n = 0; n < 22; n++) {
        const next = briefing.getByRole("button", { name: /^Next$/i });
        if (!(await next.isVisible().catch(() => false))) break;
        await next.click();
        await page.waitForTimeout(140);
      }
      const box = briefing.locator("input[type=checkbox]");
      if (await box.isVisible().catch(() => false)) {
        await box.check({ force: true });
        await briefing.getByRole("button", { name: /Seal briefing/i }).click();
        await briefing.waitFor({ state: "hidden", timeout: 12000 }).catch(() => {});
      }
      await page.waitForTimeout(400);
      continue;
    }
    return;
  }
}

const email = `wallet.${Date.now()}@trv.test`;
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.locator("#name").fill("Wallet Node");
await page.locator("#email").fill(email);
await page.locator("#pw").fill("sentinel1");
await page.locator("label").filter({ hasText: /18 or older/i }).locator("input").check();
await page.locator("label").filter({ hasText: /sanctioned/i }).locator("input").check();
await page.getByRole("button", { name: /Create native TRV lock/i }).click();
await page.waitForURL(/\/hub/, { timeout: 25000 });
await page.locator("#viewer-briefing, div.fixed").filter({ hasText: /Baseline lock|Viewer briefing|This map is required/i }).first()
  .waitFor({ timeout: 8000 })
  .catch(() => {});
await dismissOverlays();
await page.locator("#viewer-briefing").waitFor({ state: "hidden", timeout: 8000 }).catch(() => {});

await page.getByRole("button", { name: /Viewer wallet/i }).click();
await page.getByRole("heading", { name: /Viewer wallet/i }).waitFor({ timeout: 8000 });
await page.locator("#wpin").fill("viewer9");
await page.getByRole("button", { name: /Seal Ed25519 wallet/i }).click();
await page.getByText("Ed25519", { exact: true }).waitFor({ timeout: 15000 });
await page.getByRole("button", { name: /Sign helm proof/i }).waitFor({ timeout: 8000 });
await page.getByRole("button", { name: /Sign helm proof/i }).click();
await page.getByText(/TRV-HELM\|1\|/).waitFor({ timeout: 8000 });
const body = await page.locator("body").innerText();
const state = await context.storageState();
await page.screenshot({ path: "/workspace/screenshots/wallet-ed25519.png", fullPage: true });

const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  storageState: state,
});
const mpage = await mobile.newPage();
await mpage.goto(`${BASE}/hub`, { waitUntil: "networkidle" });
await mpage.waitForTimeout(600);
const mgate = mpage.locator("div.fixed").filter({ hasText: "Baseline lock" });
if (await mgate.isVisible().catch(() => false)) {
  await mgate.getByText("I am 18 or older.").click();
  await mgate.getByText(/I am not a sanctioned person/).click();
  await mgate.getByRole("button", { name: /Enter the hub/i }).click();
  await mgate.waitFor({ state: "hidden", timeout: 8000 }).catch(() => {});
}
const briefing = mpage.locator("#viewer-briefing");
if (await briefing.isVisible().catch(() => false)) {
  for (let n = 0; n < 22; n++) {
    const next = briefing.getByRole("button", { name: /^Next$/i });
    if (!(await next.isVisible().catch(() => false))) break;
    await next.click();
    await mpage.waitForTimeout(120);
  }
  const box = briefing.locator("input[type=checkbox]");
  if (await box.isVisible().catch(() => false)) {
    await box.check({ force: true });
    await briefing.getByRole("button", { name: /Seal briefing/i }).click();
    await briefing.waitFor({ state: "hidden", timeout: 12000 }).catch(() => {});
  }
}
await mpage.getByRole("button", { name: /^Wallet$/i }).click();
await mpage.getByRole("heading", { name: /Viewer wallet/i }).waitFor({ timeout: 8000 });
await mpage.screenshot({ path: "/workspace/screenshots/wallet-ed25519-mobile.png", fullPage: true });

const ok = /Ed25519/.test(body) && /TRV-HELM\|1\|/.test(body) && /Unlocked/.test(body);
console.log(JSON.stringify({
  ok,
  ed25519: /Ed25519/.test(body),
  proof: /TRV-HELM\|1\|/.test(body),
  unlocked: /Unlocked/.test(body),
  errors: errors.slice(0, 8),
}, null, 2));
await browser.close();
if (!ok) process.exit(1);
