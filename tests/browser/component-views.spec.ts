import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const config of [
  { locale: "en", theme: "light", width: 1440 },
  { locale: "fa", theme: "dark", width: 1440 },
  { locale: "en", theme: "dark", width: 390 },
  { locale: "fa", theme: "light", width: 390 },
]) {
  test(`configuration and documentation are separate: ${config.locale} ${config.theme} ${config.width}`, async ({ page }) => {
    await page.setViewportSize({ width: config.width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(value => localStorage.setItem("materialfluid.preferences", JSON.stringify(value)), { ...config, motion: "minimal" });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/#/components/button");
    const configuration = page.getByRole("tab", { name: config.locale === "fa" ? "پیکربندی" : "Configuration", exact: true });
    const documentation = page.getByRole("tab", { name: config.locale === "fa" ? "مستندات" : "Documentation", exact: true });
    await expect(configuration).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".button-configuration")).toBeVisible();
    await expect(page.locator(".documentation-section, .page-sections, .page-footer, .component-number")).toHaveCount(0);
    await page.screenshot({ path: `reports/component-views-2026-11-08/configuration-${config.locale}-${config.width}.png`, fullPage: true });
    expect((await new AxeBuilder({ page }).include(".showcase-frame").withTags(["wcag2a", "wcag2aa"]).analyze()).violations).toEqual([]);
    // The exported tabs support directional keyboard navigation in both directions.
    await configuration.focus();
    await page.keyboard.press(config.locale === "fa" ? "ArrowLeft" : "ArrowRight");
    await expect(documentation).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".button-configuration, .live-stage")).toHaveCount(0);
    await expect(page.locator(".usage-code")).toContainText("MaterialFluidProvider");
    await expect(page.locator(".props-table")).toBeVisible();
    await page.screenshot({ path: `reports/component-views-2026-11-08/documentation-${config.locale}-${config.width}.png`, fullPage: true });
    expect((await new AxeBuilder({ page }).include(".showcase-frame").withTags(["wcag2a", "wcag2aa"]).analyze()).violations).toEqual([]);
    await documentation.focus();
    await page.keyboard.press(config.locale === "fa" ? "ArrowRight" : "ArrowLeft");
    await expect(configuration).toHaveAttribute("aria-selected", "true");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("keyboard focus uses Active appearance on Button and IconButton and clears on blur", async ({ page }) => {
  for (const route of ["button", "icon-button"]) {
    await page.goto(`/#/components/${route}`);
    const button = page.locator(".showcase-canvas button.mf-button").first();
    await expect(button).toBeVisible();
    // A real Tab transition selects the first action after the active tab panel.
    await page.getByRole("tab", { name: "Configuration", exact: true }).focus();
    await page.keyboard.press("Tab");
    // Some pages expose size selectors before the example; advance to the action.
    for (let index = 0; index < 12 && !(await button.evaluate(node => node === document.activeElement)); index++) await page.keyboard.press("Tab");
    await expect(button).toBeFocused();
    expect(await button.evaluate(node => node.matches(":focus-visible"))).toBe(true);
    const activeColor = await button.evaluate(node => {
      const probe = node.cloneNode(false) as HTMLElement;
      probe.setAttribute("data-active", "true");
      probe.style.visibility = "hidden";
      node.parentElement!.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove(); return color;
    });
    await expect(button).toHaveCSS("background-color", activeColor);
    await page.keyboard.press("Tab");
    await expect(button).not.toBeFocused();
    expect(await button.evaluate(node => node.matches(":focus-visible"))).toBe(false);
    expect(await button.getAttribute("data-active")).toBeNull();
  }
});

test("nested component tabs stay independent of the catalogue view tabs", async ({ page }) => {
  await page.goto("/#/components/tabs");
  const inner = page.getByRole("tablist", { name: "Project views", exact: true });
  await inner.getByRole("tab", { name: "Projects", exact: true }).click();
  await expect(inner.getByRole("tab", { name: "Projects", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tab", { name: "Configuration", exact: true })).toHaveAttribute("aria-selected", "true");
  await inner.getByRole("tab", { name: "Projects", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(inner.getByRole("tab", { name: "Settings", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".live-stage")).toBeVisible();
});
