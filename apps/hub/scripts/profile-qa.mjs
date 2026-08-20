import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = "http://127.0.0.1:8080";
await mkdir("/workspace/screenshots", { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  permissions: ["camera", "microphone"],
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

async function dismissAge() {
  const heading = page.getByRole("heading", { name: /Baseline lock/i });
  if (!(await heading.isVisible({ timeout: 2000 }).catch(() => false))) return;
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

const email = `viewer.${Date.now()}@trv.test`;
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.locator("#name").fill("Archer Node");
await page.locator("#email").fill(email);
await page.locator("#pw").fill("sentinel1");
await page.locator("label").filter({ hasText: /18 or older/i }).locator("input").check();
await page.locator("label").filter({ hasText: /sanctioned/i }).locator("input").check();
await page.getByRole("button", { name: /Create native TRV lock/i }).click();
await page.waitForURL(/\/hub/, { timeout: 20000 });
await dismissAge();
await completeBriefing();

await page.goto(`${BASE}/hub/profile`, { waitUntil: "networkidle" });
await dismissAge();
await completeBriefing();
await page.waitForSelector("text=Remote Viewer profile", { timeout: 15000 });

await page.locator("#st").fill("Standing watch");
await page.locator("#loc").fill("Houston, TX");
await page.locator("#cr").fill("Remote Viewer");
await page.getByRole("button", { name: /Save identity/i }).click();
await page.getByText("Profile saved").waitFor({ timeout: 8000 }).catch(() => {});

await page.getByRole("tab", { name: "Docs" }).click();
await page.locator("#dt").fill("Watch notes");
await page.locator("#doc-body").fill("Private vault note — Sentinel only.");
await page.getByRole("button", { name: /File note/i }).click();
await page.getByText(/Filed in vault/i).waitFor({ timeout: 8000 }).catch(() => {});
const filed = await page.locator("li").filter({ hasText: "Watch notes" }).count();

await page.goto(`${BASE}/hub/live`, { waitUntil: "networkidle" });
await dismissAge();
await completeBriefing();
await page.getByRole("button", { name: /^mic$/i }).click();
await page.getByRole("button", { name: /^Go live$/i }).click();
await page.waitForTimeout(2500);

await page.goto(`${BASE}/hub/profile`, { waitUntil: "networkidle" });
const liveVisible = await page.getByText(/Live/i).first().isVisible().catch(() => false);
await page.screenshot({ path: "/workspace/screenshots/profile-live.png", fullPage: true });

const handle = (await page.locator("p.font-mono").first().innerText()).replace("@", "").trim();
await page.goto(`${BASE}/v/${handle}`, { waitUntil: "networkidle" });
await page.screenshot({ path: "/workspace/screenshots/profile-public.png", fullPage: true });

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${BASE}/hub/profile`, { waitUntil: "networkidle" });
await dismissAge();
await completeBriefing();
await page.screenshot({ path: "/workspace/screenshots/profile-identity-mobile.png", fullPage: true });

console.log(JSON.stringify({
  filed,
  liveVisible,
  handle,
  errors: errors.slice(0, 12),
  publicText: (await page.locator("body").innerText()).slice(0, 200),
}, null, 2));

await browser.close();
