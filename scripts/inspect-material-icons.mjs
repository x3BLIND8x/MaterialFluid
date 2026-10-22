import { resolve } from "node:path";
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve(".cache/playwright");
const { chromium } = await import("@playwright/test");
const browser = await chromium.launch({ channel: "chromium", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto("http://127.0.0.1:5173/#/components/animated-icon");
await page.getByRole("switch", { name: "Wi-Fi", exact: true }).waitFor();
await page.evaluate(() => document.fonts.ready);
await page.screenshot({
  path: ".impeccable/review/material-icons-desktop.png",
  fullPage: true,
});
await page.getByRole("button", { name: "Change appearance" }).click();
await page.getByRole("button", { name: "Change appearance" }).click();
await page.getByRole("searchbox", { name: "Search components" }).focus();
await page.waitForTimeout(250);
await page.screenshot({path:".impeccable/review/material-search-focus.png",fullPage:false});
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole("button", { name: "Switch to Persian" }).click();
await page.getByRole("switch", { name: "وای‌فای", exact: true }).waitFor();
await page.evaluate(() => document.fonts.ready);
await page.screenshot({
  path: ".impeccable/review/material-icons-mobile-fa.png",
  fullPage: true,
});
await browser.close();
