import { test, expect } from "@playwright/test";
import { selectSize } from "./helpers";

test("controls use a shared radius and framed surfaces add their inset", async ({ page }) => {
  test.setTimeout(90000);
  for (const route of ["button", "fab", "checkbox", "select", "multi-select", "calendar", "card-group", "list", "card", "textarea", "file-input"]) {
    await page.goto(`/#/components/${route}`);
    const demo = page.locator(".demo-primary").first();
    await expect(demo).toBeVisible();
    for (const size of (route === "file-input" ? ["sm", "md"] : ["sm", "md", "lg"]) as ("sm" | "md" | "lg")[]) {
      await selectSize(page, size);
      await expect.poll(() => demo.evaluate(el => el.getAnimations({subtree:true}).filter(animation => animation.playState === "running" && animation.effect?.getTiming().iterations !== Infinity).length)).toBe(0);
      await expect.poll(() => demo.evaluate(el => {
        return Array.from(el.querySelectorAll<HTMLElement>("button, [role=option], .mf-input-wrap, .mf-checkbox, .mf-card-choice, .mf-otp input")).filter(node => node.offsetWidth && node.offsetHeight && !node.matches(".mf-file-surface")).filter(node => {
          const css = getComputedStyle(node);
          const half = Math.min(node.offsetWidth, node.offsetHeight) / 2;
          const radius = node.classList.contains("mf-icon-button") ? half : Math.min(parseFloat(css.getPropertyValue("--mf-ui-radius")), half);
          return [css.borderTopLeftRadius, css.borderTopRightRadius, css.borderBottomLeftRadius, css.borderBottomRightRadius].some(value => Math.abs(Math.min(parseFloat(value), half) - radius) > .6);
        }).map(node => node.className);
      }), `${route} ${size} control shape`).toEqual([]);
      const surfaces = demo.locator(".mf-card, .mf-textarea, .mf-file-surface");
      for (const surface of await surfaces.all()) {
        const expected = await surface.evaluate(el => { const css=getComputedStyle(el);const base=parseFloat(css.getPropertyValue("--mf-ui-radius"));return el.matches(".mf-textarea") ? base : base + parseFloat(css.paddingLeft) + parseFloat(css.borderLeftWidth); });
        await expect(surface).toHaveCSS("border-top-left-radius", `${expected}px`);
      }
    }
  }
});

test("None hides form labels while retaining accessible names", async ({ page }) => {
  for (const route of ["text-field", "number-field", "select", "combobox", "multi-select", "date-picker", "time-picker", "file-input"]) {
    await page.goto(`/#/components/${route}`);
    await page.locator("#component-label-position").click();
    await page.getByRole("option", { name: "None", exact: true }).click();
    const demo = page.locator(".demo-primary").first();
    const field = demo.locator(".mf-field").first();
    await expect(field).toHaveClass(/mf-label--none/);
    const label = field.locator(":scope > .mf-field-label");
    await expect(label).toHaveCSS("clip-path", "inset(50%)");
    const name = (await label.textContent())!.replace(/\s*\*$/, "").trim();
    await expect(demo.getByLabel(name, { exact: true }).first()).toBeVisible();
  }
});

test("old scheme preferences migrate to Tonal Spot without offering other schemes", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("materialfluid.preferences", JSON.stringify({ colorScheme: "vibrant", locale: "en" })));
  await page.reload();
  await page.goto("/#/colors");
  await expect(page.getByRole("combobox", { name: "Theme color scheme" })).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("materialfluid.preferences")!).colorScheme)).toBe("tonalSpot");
});

test("field labels retain accessible names without focusing or opening their controls", async ({ page }) => {
  for (const route of ["text-field", "select", "combobox", "multi-select", "date-picker", "time-picker", "file-input"]) {
    await page.goto(`/#/components/${route}`);
    const field = page.locator(".demo-primary:not(.demo-loading) .mf-field").first();
    const label = field.locator(":scope > .mf-field-label");
    await label.click();
    await expect(field.locator("input:focus, button:focus, textarea:focus")).toHaveCount(0);
    await expect(page.locator(".mf-options-popup, .mf-date-popover, .mf-time-popover")).toHaveCount(0);
    const name = (await label.textContent())!.trim();
    await expect(page.locator(".demo-primary").getByLabel(name, { exact: true }).first()).toBeVisible();
  }
  await page.goto("/#/components/select");
  await page.locator(".demo-primary .mf-single-select-trigger").first().click();
  await expect(page.locator(".mf-options-popup")).toBeVisible();
});

test("selection captions are passive while their controls still toggle", async ({ page }) => {
  for (const route of ["checkbox", "radio-group", "switch"]) {
    await page.goto(`/#/components/${route}`);
    const choices = page.locator(".demo-primary:not(.demo-loading) .mf-choice");
    const choice = route === "radio-group" ? choices.last() : choices.first();
    const control = choice.locator("button").first();
    const before = await control.getAttribute("data-state");
    await choice.locator(":scope > span").last().click();
    await expect(control).toHaveAttribute("data-state", before!);
    await control.click();
    await expect(control).not.toHaveAttribute("data-state", before!);
  }
});
