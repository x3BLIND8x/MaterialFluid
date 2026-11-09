import { test, expect } from "@playwright/test";

test("private playground experiments remain interactive and leave component defaults intact", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/#/motion");
  const picker = page.locator(".motion-example-picker");
  await picker.getByRole("button", { name: "Button press & ripple", exact: true }).click();
  await page.getByRole("spinbutton", { name: "Press depth value", exact: true }).fill("20");
  const button = page.locator(".motion-stage").getByRole("button", { name: "Hold me", exact: true });
  await button.hover(); await page.mouse.down();
  await expect.poll(() => button.evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).a)).toBeCloseTo(.8, 2);
  await page.mouse.up();
  await picker.getByRole("button", { name: "Accordion", exact: true }).click();
  await page.locator(".motion-stage").getByRole("button", { name: "Hold before opening", exact: true }).click();
  await expect(page.locator(".motion-stage").getByText("A little anticipation, then the full reveal. The title stays still and the preview stays empty.", { exact: true })).toBeVisible();
  await picker.getByRole("button", { name: "Alert dialog", exact: true }).click();
  await page.getByRole("button", { name: "Open spring dialog", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible(); await page.keyboard.press("Escape");
  await picker.getByRole("button", { name: "Dropdown menu", exact: true }).click();
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await expect(page.getByRole("menu", { name: "Open menu", exact: true })).toBeVisible(); await page.keyboard.press("Escape");
  await page.goto("/#/components/button");
  const standard = page.locator(".button-preview-form > .mf-button");
  await standard.hover(); await page.mouse.down();
  await expect.poll(() => standard.evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).a)).toBeCloseTo(.92, 2);
  await page.mouse.up();
  expect(errors).toEqual([]);
});
