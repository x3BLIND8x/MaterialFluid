import { test, expect } from "@playwright/test";
import { selectSize } from "./helpers";

for (const locale of ["en", "fa"]) {
  test(`trailing field actions meet the edge at every size in ${locale}`, async ({ page }) => {
    await page.goto("/");
    await page.evaluate(locale => localStorage.setItem("materialfluid.preferences", JSON.stringify({locale, theme: "light", motion: "minimal"})), locale);
    await page.reload();
    for (const route of ["password-field", "select", "combobox", "multi-select", "date-picker", "time-picker"]) {
      await page.goto(`/#/components/${route}`);
      const surface = page.locator(".demo-primary").first().locator(".mf-input-wrap, .mf-select-trigger").first();
      await expect(surface).toBeVisible();
      for (const size of ["sm", "md", "lg"] as const) {
        await selectSize(page, size);
        await expect.poll(() => surface.evaluate(element => {
          const action = element.querySelector(".mf-icon-button:last-child, .mf-field-adornment:last-child")!;
          const field = element.getBoundingClientRect();
          const button = action.getBoundingClientRect();
          return getComputedStyle(element).direction === "rtl" ? button.left - field.left : field.right - button.right;
        })).toBeCloseTo(1, 0);
      }
    }
  });
}
