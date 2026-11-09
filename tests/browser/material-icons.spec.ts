import { test, expect } from "@playwright/test";

test("local icon gallery uses fixed defaults and supports Persian mobile", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/#/components/animated-icon");
  await expect(page.locator(".icon-gallery-tile")).toHaveCount(48);
  await expect(page.locator(".icon-gallery-intro")).toContainText("4322 icons");
  const search = page.getByRole("searchbox", {name:"Search icons", exact:true});
  await search.fill("قلب");
  await expect(page.locator(".icon-gallery-tile")).toHaveCount(1);
  await page.getByRole("button", {name:"Preview heart", exact:true}).click();
  await expect(page.locator(".icon-gallery-code")).toContainText('name="heart"');
  await search.fill("no-such-icon-xyz");
  await expect(page.getByRole("heading", {name:"No matching icons"})).toBeVisible();
  await page.getByRole("button", {name:"Clear search", exact:true}).click();
  await expect(page.locator(".advanced-tuning-trigger")).toHaveCount(0);
  await expect(page.locator(".icon-gallery-code")).not.toContainText(/duration=|strokeWidth=|stagger=|fillDuration=/);
  await page.setViewportSize({width:390,height:844});
  await page.getByRole("button", {name:"More options"}).click();
  await page.getByRole("button", {name:"Switch to Persian"}).click();
  await page.keyboard.press("Escape");
  await expect(page.locator(".mf-root")).toHaveAttribute("dir", "rtl");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("paused action icons remain static across mouse, keyboard and reduced motion", async ({page}) => {
  await page.goto("/#/components/icon-button");
  const button = page.locator(".icon-button-preview-form > button");
  const icon = button.locator("svg");
  const path = await icon.locator("path").first().getAttribute("d");
  await button.hover();
  await page.mouse.down();
  await page.waitForTimeout(150);
  await expect(icon.locator("mask, clipPath")).toHaveCount(0);
  await page.mouse.up();
  await button.press("Enter");
  await button.press("Space");
  expect(await icon.locator("path").first().getAttribute("d")).toBe(path);
  await expect(button).toHaveAccessibleName("Open menu");
  await expect(icon).toBeVisible();
  await page.emulateMedia({reducedMotion:"reduce"});
  await expect(page.locator(".mf-root")).toHaveAttribute("data-motion","reduced");
  await expect(icon.locator("mask, clipPath")).toHaveCount(0);
});

test("gallery connection switches retain independent state while previews are paused", async ({page}) => {
  await page.goto("/#/components/animated-icon");
  for (const [label,name] of [["Wi-Fi","wifi"],["Bluetooth","bluetooth"]]) {
    const control = page.getByRole("switch",{name:label,exact:true});
    await expect(control).not.toBeChecked();
    await control.click();
    await expect(control).toBeChecked();
    await expect(control.locator(".mf-animated-icon")).toHaveAttribute("data-icon-name",name);
  }
  await expect(page.getByRole("switch",{name:"Wi-Fi",exact:true})).toBeChecked();
  await page.getByRole("switch",{name:"Bluetooth",exact:true}).press("Space");
  await expect(page.getByRole("switch",{name:"Bluetooth",exact:true})).not.toBeChecked();
  await expect(page.getByRole("switch",{name:"Wi-Fi",exact:true})).toBeChecked();
});
