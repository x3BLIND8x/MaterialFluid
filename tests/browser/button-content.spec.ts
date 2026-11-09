import { test, expect } from "@playwright/test";
import { selectSize } from "./helpers";

for (const config of [
  { locale: "en", theme: "light", width: 1440 },
  { locale: "fa", theme: "dark", width: 1440 },
  { locale: "en", theme: "dark", width: 390 },
  { locale: "fa", theme: "light", width: 390 },
]) {
  test(`button content stays fixed during press and release: ${config.locale} ${config.theme} ${config.width}`, async ({ page }) => {
    await page.setViewportSize({ width: config.width, height: 900 });
    await page.addInitScript(value => localStorage.setItem("materialfluid.preferences", JSON.stringify(value)), { ...config, motion: "expressive" });
    for (const route of ["button", "icon-button"]) {
      await page.goto(`/#/components/${route}`);
      const button = page.locator(".showcase-canvas button.mf-button").first();
      await expect(button).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await button.scrollIntoViewIfNeeded();
      await button.hover();
      const samplesPromise = button.evaluate(async element => {
        const content = element.querySelector<HTMLElement>(".mf-button-content")!;
        const glyph = content.querySelector(".mf-animated-icon, svg");
        const range = document.createRange();
        range.selectNodeContents(content);
        const read = () => {
          const rect = glyph ? glyph.getBoundingClientRect() : range.getBoundingClientRect();
          return { width: rect.width, height: rect.height, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2,
            surfaceScale: new DOMMatrixReadOnly(getComputedStyle(element).transform).a };
        };
        const initial = read();
        const samples = [];
        const until = performance.now() + 1100;
        while (performance.now() < until) {
          samples.push(read());
          await new Promise(requestAnimationFrame);
        }
        return { initial, samples };
      });
      await page.mouse.down();
      await page.waitForTimeout(320);
      await page.mouse.up();
      const { initial, samples } = await samplesPromise;
      expect(Math.min(...samples.map(sample => sample.surfaceScale))).toBeLessThan(.97);
      for (const sample of samples) {
        for (const field of ["width", "height", "x", "y"] as const) expect(Math.abs(sample[field] - initial[field]), `${route} ${field}`).toBeLessThan(.6);
      }
      await expect.poll(() => button.evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).a)).toBeCloseTo(1, 2);
      await selectSize(page, "sm");
      await expect.poll(() => button.evaluate(element => (element as HTMLElement).offsetHeight)).toBeCloseTo(28, 0);
      await page.screenshot({ path: `reports/button-content-2026-11-08/${route}-${config.locale}-${config.theme}-${config.width}.png`, fullPage: true });
    }
  });
}
