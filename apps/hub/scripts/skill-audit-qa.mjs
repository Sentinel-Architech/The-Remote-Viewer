import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = "http://127.0.0.1:8080";
await mkdir("/workspace/screenshots", { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = [];
const net = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (msg) => {
  errors.push(`${msg.type()}:${msg.text().slice(0, 240)}`);
});
page.on("response", async (res) => {
  if (res.status() >= 400) net.push(`${res.status()} ${res.url().slice(0, 120)}`);
});

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
        await page.waitForTimeout(180);
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

const email = `audit.${Date.now()}@trv.test`;
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.locator("#name").fill("Audit Node");
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

await page.goto(`${BASE}/hub/audit`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await dismissOverlays();
await page.locator("#viewer-briefing").waitFor({ state: "hidden", timeout: 8000 }).catch(() => {});
await page.getByRole("heading", { name: /Skill audit/i }).waitFor({ timeout: 10000 });

const before = await page.locator("body").innerText();
await page.screenshot({ path: "/workspace/screenshots/skill-audit-idle.png", fullPage: true });

const overlayUp = await page.locator("#viewer-briefing").isVisible().catch(() => false);
const idleCatalog = /Delegation/.test(before) && /CSAM stop/.test(before) && /Stripe is a rail/.test(before);

const runBtn = page.getByRole("button", { name: "Run skill audit" });
await runBtn.click();
const auditing = await page.getByRole("button", { name: "Auditing…" }).waitFor({ timeout: 8000 }).then(() => true).catch(() => false);
let outcome = "none";
if (auditing) {
  outcome = await page.getByRole("button", { name: "Re-run skill audit" }).waitFor({ timeout: 45000 }).then(() => "rerun").catch(() => "timeout");
} else {
  await page.waitForTimeout(1500);
  outcome = "no-auditing";
}

const after = await page.locator("body").innerText();
await page.screenshot({ path: "/workspace/screenshots/skill-audit-run.png", fullPage: true });

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(250);
await page.screenshot({ path: "/workspace/screenshots/skill-audit-mobile.png", fullPage: true });

const overallMatch = after.match(/LAST RUN[\s\S]{0,80}?(\d{1,3})/i);
const overall = overallMatch ? Number(overallMatch[1]) : null;
const atPar = (after.match(/At par/g) || []).length;
const short = (after.match(/\bShort\b/g) || []).length;
const helmLive = /Live helm/.test(after);
const helmDark = /Helm dark/.test(after);
const hasEvidence = /Doctrine \d+/.test(after);
const toast = await page.locator("[data-sonner-toast]").allInnerTexts().catch(() => []);

console.log(
  JSON.stringify(
    {
      email,
      overlayUp,
      idleCatalog,
      auditing,
      outcome,
      overall,
      atPar,
      short,
      helmLive,
      helmDark,
      hasEvidence,
      toast,
      errors,
      net: net.slice(0, 20),
      snippet: after.slice(0, 900),
    },
    null,
    2,
  ),
);
await browser.close();
