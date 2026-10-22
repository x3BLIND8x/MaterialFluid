import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("all 56 pages render without runtime errors or overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  const links = await page
    .locator(".catalogue-link")
    .evaluateAll((links) =>
      links.map((link) => ({
        href: link.getAttribute("href")!,
        title: link.textContent!.trim(),
      })),
    );
  expect(links).toHaveLength(56);
  for (const link of links) {
    await page.goto("/" + link.href);
    await expect(page.locator("h1")).toHaveText(link.title);
    await expect(
      page.locator(".demo-primary:not(.demo-loading):visible").first(),
    ).toBeVisible();
    await expect(
      page.locator(".demo-primary:not(.demo-loading):visible > *"),
    ).not.toHaveCount(0);
    await expect(page.locator(".usage-code")).toContainText(
      "MaterialFluidProvider",
    );
  }
  expect(errors).toEqual([]);
});
test("bilingual search, settings and local persistence", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Search components" }).fill("کلید");
  await expect(page.locator(".catalogue-link")).toHaveCount(1);
  await page.getByRole("button", { name: "Switch to Persian" }).click();
  await expect(page.locator(".mf-root")).toHaveAttribute("dir", "rtl");
  await page.getByRole("button", { name: "تغییر ظاهر" }).click();
  await page.getByRole("button", { name: "تغییر ظاهر" }).click();
  await page.getByRole("button", { name: "روان", exact: true }).click();
  await page.reload();
  await expect(page.locator(".mf-root")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".mf-root")).toHaveAttribute(
    "data-motion",
    "minimal",
  );
  await expect(
    page.getByRole("heading", { name: "دکمه", exact: true }),
  ).toBeVisible();
});
test("dialog traps focus, escapes, and restores trigger focus", async ({
  page,
}) => {
  await page.goto("/#/components/dialog");
  const trigger = page.getByRole("button", {
    name: "Open dialog",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Close", exact: true }),
  ).toBeFocused();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate((element) =>
        element.contains(document.activeElement),
      ),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
test("selection controls and table work with keyboard and filtering", async ({
  page,
}) => {
  await page.goto("/#/components/tabs");
  await page.getByRole("tab", { name: "Overview" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Projects" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.goto("/#/components/data-table");
  await page.getByRole("searchbox", { name: "Filter rows" }).fill("Nora");
  await expect(page.locator(".mf-data-table tbody tr")).toHaveCount(4);
  await page.getByRole("checkbox", { name: "Select all rows" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "4 selected" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Name", exact: true }).click();
  await expect(
    page.locator(".mf-data-table th").filter({ hasText: "Name" }),
  ).toHaveAttribute("aria-sort", "ascending");
  await page
    .getByRole("searchbox", { name: "Filter rows" })
    .fill("no-such-person");
  await expect(
    page.getByRole("heading", { name: "No matching rows" }),
  ).toBeVisible();
});
test("combobox, OTP, and date selection work", async ({ page }) => {
  await page.goto("/#/components/combobox");
  const input = page.getByRole("combobox", { name: "Find a discipline", exact: true });
  await input.fill("Dev");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(input).toHaveValue("Development");
  await page.goto("/#/components/otp-input");
  await page
    .getByRole("textbox", { name: "Verification code 1", exact: true })
    .fill("1");
  await expect(
    page.getByRole("textbox", { name: "Verification code 2", exact: true }),
  ).toBeFocused();
  await page.goto("/#/components/date-picker");
  await page.getByRole("textbox", { name: "Start date", exact: true }).fill("2026/10/14");
  await page.getByRole("textbox", { name: "Start date", exact: true }).press("Enter");
  await page.getByRole("button", { name: "Choose date", exact: true }).click();
  await expect(page.locator(".mf-date-popover")).toBeVisible();
  await page
    .locator(".rdp-day_button")
    .filter({ hasText: /^15$/ })
    .first()
    .click();
  await expect(
    page.getByRole("textbox", { name: "Start date", exact: true }),
  ).toHaveValue("2026/10/15");
});
test("reduced motion and blocked storage remain usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw Error("blocked");
      },
    });
  });
  await page.goto("/#/components/animated-icon");
  await expect(page.locator(".mf-root")).toHaveAttribute(
    "data-motion",
    "reduced",
  );
  await expect(page.getByRole("switch", { name: "Wi-Fi" })).toBeVisible();
  await page.getByRole("switch", { name: "Wi-Fi" }).click();
  await expect(page.getByRole("switch", { name: "Wi-Fi" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
});
test("mobile navigation, touch switch dragging, cancellation, and RTL", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("/");
  await page.getByRole("button", { name: "Open component navigation" }).tap();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Switch", exact: true })
    .tap();
  const control = page.getByRole("switch", { name: "Wi-Fi", exact: true });
  await expect(control).toBeVisible();
  const box = (await control.boundingBox())!;
  const client = await context.newCDPSession(page);
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: box.x + 12, y: box.y + 17 }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: box.x + 42, y: box.y + 17 }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(control).toHaveAttribute("aria-checked", "true");
  await control.tap();
  await expect(control).toHaveAttribute("aria-checked", "false");
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: box.x + 12, y: box.y + 17 }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: box.x + 40, y: box.y + 17 }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchCancel",
    touchPoints: [],
  });
  await expect(control).toHaveAttribute("aria-checked", "false");
  await page.getByRole("button", { name: "More options" }).tap();
  await page.getByRole("button", { name: "Switch to Persian" }).tap();
  await page.keyboard.press("Escape");
  const rtlControl = page.getByRole("switch", { name: "وای‌فای", exact: true });
  const rtl = (await rtlControl.boundingBox())!;
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: rtl.x + 42, y: rtl.y + 17 }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: rtl.x + 12, y: rtl.y + 17 }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(rtlControl).toHaveAttribute("aria-checked", "true");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});
test("local fonts, no external requests, and accessibility on representative pages", async ({
  page,
}) => {
  const external: string[] = [];
  page.on("request", (request) => {
    if (
      !request.url().startsWith("http://127.0.0.1:5173") &&
      !request.url().startsWith("data:")
    )
      external.push(request.url());
  });
  for (const id of [
    "button",
    "text-field",
    "radio-group",
    "tabs",
    "data-table",
    "calendar",
    "animated-icon",
  ]) {
    await page.goto("/#/components/" + id);
    await page.locator(".demo-primary:not(.demo-loading):visible").waitFor();
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
      id,
    ).toEqual([]);
  }
  expect(external).toEqual([]);
  await page.getByRole("button", { name: "Switch to Persian" }).click();
  expect(
    await page.evaluate(() => document.fonts.check('16px "Vazirmatn RD"')),
  ).toBe(true);
});

test("selection menus share a scrollable dropdown", async ({ page }) => {
  await page.goto("/#/components/select");
  const trigger = page.locator(".demo-primary .mf-single-select-trigger");
  await trigger.click();
  const popup = page.locator(".mf-options-popup");
  await expect(popup).toBeVisible();
  const field = await trigger.boundingBox();
  await expect.poll(async () => {
    const menu = await popup.boundingBox();
    return Math.min(Math.abs(menu!.y - field!.y - field!.height - 6), Math.abs(menu!.y + menu!.height + 6 - field!.y));
  }).toBeLessThan(2);
  const list = page.locator(".mf-options-list");
  expect(await list.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
  await expect(page.getByRole("option", { name: "Design", exact: true })).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.getByRole("option", { name: "Project management", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(trigger).toContainText("Project management");
  await trigger.click();
  await expect(popup).toBeVisible();
  await expect(page.getByRole("option", { name: "Project management", exact: true })).toBeInViewport();
});

test("combo menus anchor below the visible input rather than its helper text", async ({ page }) => {
  await page.goto("/#/components/combobox");
  const input = page.getByRole("combobox", { name: "Find a discipline", exact: true });
  await input.click();
  const popup = page.locator(".mf-combobox-content");
  await expect(popup).toBeVisible();
  const control = await input.locator("xpath=ancestor::div[contains(@class, 'mf-input-wrap')]").boundingBox();
  await expect.poll(async () => {
    const menu = await popup.boundingBox();
    return Math.min(Math.abs(menu!.y - (control!.y + control!.height + 6)), Math.abs(menu!.y + menu!.height + 6 - control!.y));
  }).toBeLessThan(2);
});


test("date picker stays anchored to its field on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/components/date-picker");
  await page.getByRole("button", { name: "Choose date", exact: true }).click();
  const field = await page.locator(".demo-primary .mf-input-wrap").boundingBox();
  await expect.poll(async () => {
    const popup = await page.locator(".mf-date-popover").boundingBox();
    return Math.min(Math.abs(popup!.y - field!.y - field!.height - 8), Math.abs(popup!.y + popup!.height + 8 - field!.y));
  }).toBeLessThan(2);
});
