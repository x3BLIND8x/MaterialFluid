import { test, expect } from "@playwright/test";
import { selectSize } from "./helpers";

test("select icon colors match password-field icons in light and dark themes", async ({ page }) => {
  for (const theme of ["light", "dark"]) {
    await page.goto("/#/components/password-field");
    await page.evaluate(theme => localStorage.setItem("materialfluid.preferences", JSON.stringify({ locale: "en", theme, motion: "minimal" })), theme);
    await page.reload();
    const passwordIcon = page.locator(".demo-primary .mf-icon-button .mf-animated-icon").first();
    await expect(passwordIcon).toBeVisible();
    const color = await passwordIcon.evaluate(el => getComputedStyle(el).color);
    await passwordIcon.hover();
    const passwordButton = passwordIcon.locator("..");
    const hoverColor = await passwordButton.evaluate(el => {
      const probe = document.createElement("span");
      probe.style.cssText = "position:absolute;background:var(--mf-solid-hover)";
      el.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });
    await expect(passwordButton).toHaveCSS("background-color", hoverColor);
    await page.goto("/#/components/select");
    const selectIcon = page.locator(".demo-primary .mf-field-trigger-icon .mf-animated-icon").first();
    await expect(selectIcon).toHaveCSS("color", color);
    await selectIcon.hover();
    await expect(selectIcon).toHaveCSS("color", color);
    await expect(selectIcon.locator("..")).toHaveCSS("background-color", hoverColor);
  }
});

test("select icons replay the field-button press spring without nested buttons", async ({ page }) => {
  await page.goto("/#/components/select");
  await page.evaluate(() => localStorage.setItem("materialfluid.preferences", JSON.stringify({ locale: "en", motion: "expressive" })));
  await page.reload();
  const trigger = page.locator(".demo-primary .mf-single-select-trigger").first();
  const icon = trigger.locator(".mf-field-trigger-icon");
  await expect(trigger.locator("button")).toHaveCount(0);
  for (let i = 0; i < 2; i++) {
    await trigger.hover();
    await page.mouse.down();
    const scales = await icon.evaluate(async el => {
      const values: number[] = [];
      for (let i = 0; i < 15; i++) {
        values.push(new DOMMatrixReadOnly(getComputedStyle(el).transform).a);
        await new Promise(requestAnimationFrame);
      }
      return values;
    });
    expect(Math.min(...scales)).toBeLessThan(.99);
    await page.mouse.up();
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(page.getByRole("option").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect.poll(() => icon.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a)).toBeCloseTo(1, 2);
  }
  await trigger.focus();
  const keyboardScales = await icon.evaluate(async el => {
    // Capture from the key event, including the short press before popup focus.
    el.closest("button")!.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    const values: number[] = [];
    for (let i = 0; i < 15; i++) {
      values.push(new DOMMatrixReadOnly(getComputedStyle(el).transform).a);
      await new Promise(requestAnimationFrame);
    }
    return values;
  });
  expect(Math.min(...keyboardScales)).toBeLessThan(.99);
  await page.keyboard.up(" ");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await trigger.click();
  await expect(icon).toHaveCSS("transform", "none");
});

for (const locale of ["en", "fa"]) {
  test(`trailing field icons keep an inset and scale up at every size in ${locale}`, async ({ page }) => {
    await page.goto("/");
    await page.evaluate(locale => localStorage.setItem("materialfluid.preferences", JSON.stringify({locale, theme: "light", motion: "minimal"})), locale);
    await page.reload();
    const actionWidths = new Map<string, number>();
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
        })).toBeGreaterThanOrEqual(9);
        const width = await surface.evaluate(el => el.querySelector(".mf-icon-button:last-child, .mf-field-adornment:last-child")!.getBoundingClientRect().width);
        if (route === "password-field") actionWidths.set(size, width);
        else expect(width).toBeCloseTo(actionWidths.get(size)!, 1);
        const icon = surface.locator(".mf-icon-button:last-child .mf-animated-icon, .mf-field-adornment:last-child .mf-animated-icon").first();
        await expect(icon).toHaveCSS("width", `${size === "sm" ? 20 : size === "lg" ? 24 : 22}px`);
        expect(width).toBeCloseTo(size === "sm" ? 32 : size === "lg" ? 40 : 36, 1);
        const alignment = await icon.evaluate(el => {
          const glyph = el.getBoundingClientRect();
          const action = el.closest(".mf-icon-button, .mf-field-adornment")!.getBoundingClientRect();
          return { x: Math.abs(glyph.x + glyph.width / 2 - action.x - action.width / 2), y: Math.abs(glyph.y + glyph.height / 2 - action.y - action.height / 2), ratio: glyph.width / action.width };
        });
        expect(alignment.x).toBeLessThan(.5);
        expect(alignment.y).toBeLessThan(.5);
        expect(alignment.ratio).toBeLessThan(.7);
        if (route === "multi-select") {
          for (const chipIcon of await surface.locator(".mf-multi-chip .mf-animated-icon").all()) await expect(chipIcon).toHaveCSS("width", "14px");
        }
      }
    }
  });
}
