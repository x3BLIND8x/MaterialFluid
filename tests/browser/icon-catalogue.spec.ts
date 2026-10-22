import { test, expect } from "@playwright/test";

test("optional icon pack loads on demand, paginates, and preserves source contours", async ({ page }) => {
  let loadedPack = false;
  page.on("response", response => {
    if (response.url().includes("/src/kit/material-icons.ts")) loadedPack = true;
  });
  await page.goto("/#/components/button");
  await expect(page.getByRole("button", {name: "Primary", exact: true})).toBeVisible();
  expect(loadedPack).toBe(false);
  await page.goto("/#/components/animated-icon");
  await expect(page.locator(".icon-gallery-tile")).toHaveCount(48);
  expect(loadedPack).toBe(true);
  const initial = await page.locator(".icon-gallery-grid").textContent();
  await page.getByRole("button", {name: "Next page", exact: true}).click();
  await expect.poll(() => page.locator(".icon-gallery-grid").textContent()).not.toBe(initial);
  await page.getByRole("searchbox", {name: "Search icons", exact: true}).fill("rocket_launch");
  await expect(page.locator(".icon-gallery-tile")).toHaveCount(1);
  await page.getByRole("button", {name: "Preview rocket_launch", exact: true}).click();
  await expect(page.locator(".icon-gallery-code")).toContainText("materialfluid/icons");
  await expect(page.locator(".icon-preview-button")).toHaveCount(6);
  for (const icon of await page.locator(".icon-preview-button svg").all()) {
    expect((await icon.locator("path").first().getAttribute("d"))!.length).toBeGreaterThan(20);
    await expect(icon).toHaveAttribute("fill", "currentColor");
  }
});
