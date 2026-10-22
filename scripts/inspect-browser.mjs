import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve(".cache/playwright");
const { chromium } = await import("@playwright/test");
const browser = await chromium.launch({ channel: "chromium", headless: true });
await mkdir(".impeccable/review", { recursive: true });
const errors = [];
try {
  for (const [label, width, height, locale, theme] of [
    ["desktop", 1440, 1000, "en", "light"],
    ["mobile", 390, 844, "en", "dark"],
    ["mobile-fa", 390, 844, "fa", "dark"],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.on("pageerror", error => errors.push(`${label}: ${error.message}`));
    await page.goto("http://127.0.0.1:5173");
    await page.evaluate(({locale, theme}) => {
      const key = "materialfluid.preferences";
      if (key) localStorage.setItem(key, JSON.stringify({...JSON.parse(localStorage.getItem(key) ?? "{}"), locale, theme}));
    }, {locale, theme});
    await page.reload();
    for (const route of ["button", "button-group", "select", "multi-select", "date-picker", "data-table", "notification-center", "bottom-sheet"]) {
      await page.goto(`http://127.0.0.1:5173/#/components/${route}`);
      await page.locator(".demo-primary:not(.demo-loading):visible").waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
      await page.screenshot({path: `.impeccable/review/${label}-${route}.png`, fullPage: true});
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      if (overflow) errors.push(`${label}/${route}: horizontal overflow`);
    }
    await page.close();
  }
} finally { await browser.close(); }
if (errors.length) throw Error(errors.join("\n"));
console.log("24 rendered review captures; no runtime errors or page overflow.");
