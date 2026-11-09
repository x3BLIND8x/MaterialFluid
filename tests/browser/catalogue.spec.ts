import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const newPages = ["split-button", "fab-menu", "chips", "navigation-bar", "sidebar", "toolbar", "carousel", "code-block", "shape", "side-sheet"];

test("catalogue has one ordered list and working new interactions", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".reference-tree")).toHaveCount(0);
  await expect(page.locator(".catalogue-tree a[role=treeitem]")).toHaveCount(45);
  await expect(page.locator(".catalogue-tree")).not.toContainText(/shadcn|Notification Center|Time Picker|OTP Input/);
  await page.goto("/#/components/split-button");
  await page.locator(".demo-primary").getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator(".demo-primary").getByRole("status")).toHaveText("Saved");
  await page.getByRole("button", { name: "Save options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Save a copy" }).click();
  await expect(page.locator(".demo-primary").getByRole("status")).toHaveText("Copy saved");
  await page.goto("/#/components/fab-menu");
  await page.locator(".demo-primary").getByRole("button", { name: "Create", exact: true }).click();
  await page.getByRole("menuitem", { name: "Folder", exact: true }).click();
  await expect(page.locator(".demo-primary").getByRole("status")).toHaveText("Folder created");
  await page.goto("/#/components/chips");
  const music = page.locator(".demo-primary").getByRole("button", { name: "Music", exact: true });
  await music.click();
  await expect(music).toHaveAttribute("aria-pressed", "true");
  await music.press("Space");
  await expect(music).toHaveAttribute("aria-pressed", "false");
  await page.goto("/#/components/toolbar");
  const toolbar = page.getByRole("toolbar", { name: "Document tools" });
  await toolbar.getByRole("button", { name: "Undo", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(toolbar.getByRole("button", { name: "Redo", exact: true })).toBeFocused();
  await page.goto("/#/components/carousel");
  await page.getByRole("button", { name: "Next slide" }).click();
  await expect(page.locator('.mf-carousel-slide[aria-hidden="false"]')).toContainText("Make room");
  await page.goto("/#/components/side-sheet");
  await page.getByRole("button", { name: "Open details", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Details", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open details", exact: true })).toBeFocused();
});

for (const config of [
  { locale: "en", theme: "light", width: 1440 },
  { locale: "fa", theme: "dark", width: 1440 },
  { locale: "en", theme: "dark", width: 390 },
  { locale: "fa", theme: "light", width: 390 },
]) {
  test(`new catalogue pages ${config.locale} ${config.theme} ${config.width}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width: config.width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(value => localStorage.setItem("materialfluid.preferences", JSON.stringify(value)), { ...config, motion: "minimal" });
    for (const id of newPages) {
      await page.goto(`/#/components/${id}`);
      await expect(page.locator(".demo-primary")).toBeVisible();
      await expect(page.locator(".demo-primary > *")).not.toHaveCount(0);
      await expect(page.getByRole("alert")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    }
    await page.goto("/#/components/chips");
    await expect(page.locator(".demo-primary")).toBeVisible();
    const result = await new AxeBuilder({ page }).include(".showcase-frame").withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(result.violations).toEqual([]);
    await page.screenshot({ path: `reports/catalogue-2026-11-08/${config.locale}-${config.theme}-${config.width}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
}
