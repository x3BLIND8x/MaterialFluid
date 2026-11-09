import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const config of [
  { locale: "en", theme: "light", width: 1440 },
  { locale: "fa", theme: "dark", width: 1440 },
  { locale: "en", theme: "dark", width: 390 },
  { locale: "fa", theme: "light", width: 390 },
]) test(`hue profile and exact gold round trip ${config.locale} ${config.theme} ${config.width}`, async ({ page }) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: config.width, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(prefs => {
    if (!localStorage.getItem("materialfluid.preferences")) localStorage.setItem("materialfluid.preferences", JSON.stringify(prefs));
  }, { ...config, motion: "minimal", accentSeed: "#eedd96", colorPreset: "neutral", colorDesign: "material", colorScheme: "tonalSpot" });
  const button = page.locator(".button-preview-form > button");
  const colors = () => button.evaluate(node => ({ fill: getComputedStyle(node).backgroundColor, ink: getComputedStyle(node).color }));
  const seed = () => page.locator(".mf-root").evaluate(node => getComputedStyle(node).getPropertyValue("--mf-accent-seed").trim());
  const tokens = () => page.locator(".mf-root").evaluate(node => {
    const style = (node as HTMLElement).style;
    return Object.fromEntries(Array.from(style).filter(name => name.startsWith("--mf-")).map(name => [name, style.getPropertyValue(name)]));
  });
  const hue = page.getByRole("slider", { name: config.locale === "fa" ? "فام رنگ پایه" : "Accent hue", exact: true });
  await page.goto("/#/components/button"); await expect(button).toBeVisible(); const original = await colors();
  await page.goto("/#/colors"); await expect(hue).toHaveAttribute("aria-valuenow", "48"); const originalTokens = await tokens();
  await hue.focus(); await page.keyboard.press("Home");
  await expect.poll(seed).toBe("#ee9696");
  // PageUp advances ten steps. Select a different family through the actual control.
  for (let i = 0; i < 12; i++) await page.keyboard.press("PageUp");
  await expect(hue).toHaveAttribute("aria-valuenow", "120"); await expect.poll(seed).toBe("#96ee96");
  await page.goto("/#/components/button"); await expect(button).toBeVisible();
  expect((await colors()).fill).not.toBe(original.fill);
  expect((await new AxeBuilder({ page }).include(".showcase-frame").withTags(["wcag2a", "wcag2aa"]).analyze()).violations).toEqual([]);
  await page.goto("/#/colors"); await hue.focus(); await page.keyboard.press("Home");
  for (let i = 0; i < 4; i++) await page.keyboard.press("PageUp");
  for (let i = 0; i < 8; i++) await page.keyboard.press("ArrowUp");
  await expect(hue).toHaveAttribute("aria-valuenow", "48"); await expect.poll(seed).toBe("#eedd96");
  expect(await tokens()).toEqual(originalTokens);
  await page.screenshot({ path: `reports/seed-hue-2026-11-09/${config.locale}-${config.theme}-${config.width}.png` });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.goto("/#/components/button"); await expect(button).toBeVisible(); expect(await colors()).toEqual(original);
  await page.reload(); await expect(button).toBeVisible(); expect(await colors()).toEqual(original); await expect.poll(seed).toBe("#eedd96");
});
