import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { MaterialFluidSwitchElement } from "../../src/kit/elements";
const pick = (page: Page, section: string, value: string) =>
  page.locator(`${section} button[data-value="${value}"]`).click();
for (const config of [
  { locale: "en", theme: "light", width: 1440 },
  { locale: "fa", theme: "dark", width: 1440 },
  { locale: "en", theme: "dark", width: 390 },
  { locale: "fa", theme: "light", width: 390 },
])
  test(`Switch configuration ${config.locale} ${config.theme} ${config.width}`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: config.width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(
      (config) =>
        localStorage.setItem(
          "materialfluid.preferences",
          JSON.stringify({ ...config, motion: "minimal" }),
        ),
      config,
    );
    const errors: string[] = [];
    page.on("pageerror", (event) => errors.push(event.message));
    await page.goto("/#/components/switch");
    const box = page.locator('.switch-preview [role="switch"]');
    await expect(box).toHaveAttribute("aria-checked", "false");
    await page.locator(".switch-preview .mf-switch-label").click();
    await expect(box).toHaveAttribute("aria-checked", "true");
    await box.locator("svg").click();
    await expect(box).toHaveAttribute("aria-checked", "false");
    await box.focus();
    await page.keyboard.press("Space");
    await expect(box).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("Enter");
    await expect(box).toHaveAttribute("aria-checked", "false");
    await expect(
      page.locator('.switch-preview [role="status"]'),
    ).not.toContainText(/Submitted|ارسال شد/);
    const dragBounds = (await box.boundingBox())!,
      start =
        config.locale === "fa"
          ? dragBounds.x + dragBounds.width - 8
          : dragBounds.x + 8,
      end =
        config.locale === "fa"
          ? dragBounds.x + 8
          : dragBounds.x + dragBounds.width - 8;
    await page.mouse.move(start, dragBounds.y + dragBounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(end, dragBounds.y + dragBounds.height / 2, {
      steps: 5,
    });
    await page.mouse.up();
    await expect(box).toHaveAttribute("aria-checked", "true");

    for (const size of ["sm", "md", "lg"]) {
      await pick(page, "#switch-appearance", size);
      await expect(box.locator("..")).toHaveClass(
        new RegExp(`mf-scale--${size}`),
      );
    }
    await pick(page, "#switch-appearance", "start");
    const positions = await box.evaluate((el) => ({
      box: el.getBoundingClientRect().x,
      label: el
        .closest("label")!
        .querySelector(".mf-switch-label")!
        .getBoundingClientRect().x,
    }));
    expect(
      config.locale === "fa"
        ? positions.label > positions.box
        : positions.label < positions.box,
    ).toBe(true);
    await pick(page, "#example-presets", "help");
    await expect(box).toHaveAccessibleDescription(
      config.locale === "fa"
        ? "دریافت اعلان پیام‌های تازه"
        : "Receive alerts for new messages",
    );
    await page
      .getByRole("switch", {
        name: config.locale === "fa" ? "خطا" : "Error",
        exact: true,
      })
      .click();
    await expect(box).toHaveAttribute("aria-invalid", "true");
    await expect.poll(()=>box.evaluate(el=>{const css=getComputedStyle(el),ctx=document.createElement('canvas').getContext('2d')!;ctx.fillStyle=css.borderTopColor;const actual=ctx.fillStyle;ctx.fillStyle=css.getPropertyValue('--mf-error');return actual===ctx.fillStyle;})).toBe(true);
    expect((await new AxeBuilder({page}).include('.switch-preview').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);

    await pick(page, "#example-presets", "icons");
    await expect(box.locator('[data-icon-name="volume_off"]')).toBeVisible();
    await box.click();
    await expect(box.locator('[data-icon-name="volume_up"]')).toBeVisible();
    await pick(page, "#example-presets", "language");
    await expect(box.locator(".mf-switch-language")).toHaveText("EN");
    await box.click();
    await expect(box.locator(".mf-switch-language")).toHaveText("فا");
    await expect(page.locator(".switch-configuration")).not.toContainText(
      /Scenarios|Advanced|Elevated|Square/,
    );
    await expect(
      page.locator(".documentation-section,.page-sections"),
    ).toHaveCount(0);
    expect(
      (
        await new AxeBuilder({ page })
          .include(".showcase-frame")
          .withTags(["wcag2a", "wcag2aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `reports/switch-2026-11-10/${config.locale}-${config.theme}-${config.width}.png`,
      fullPage: true,
    });
    await page
      .getByRole("tab", {
        name: config.locale === "fa" ? "مستندات" : "Documentation",
        exact: true,
      })
      .click();
    await expect(page.locator(".usage-code")).toContainText("Switch");
    await page
      .getByRole("button", { name: "Web Components", exact: true })
      .click();
    await expect(page.locator(".usage-code")).toContainText(
      "defineMaterialFluidSwitch",
    );
    expect(errors).toEqual([]);
  });
test("Switch drag, native required/reset, owner motion and full optional icons", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.addInitScript(() =>
    localStorage.setItem(
      "materialfluid.preferences",
      JSON.stringify({ locale: "en", motion: "expressive" }),
    ),
  );
  await page.goto("/#/components/switch");
  const box = page.locator('.switch-preview [role="switch"]'),
    thumb = box.locator(".mf-switch-thumb");
  await expect(box).toBeVisible();
  const initial = await thumb.boundingBox(),
    bounds = (await box.boundingBox())!;
  await page.mouse.move(bounds.x + 8, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width - 5,
    bounds.y + bounds.height / 2,
    { steps: 8 },
  );
  await page.mouse.up();
  await expect(box).toHaveAttribute("aria-checked", "true");
  await expect
    .poll(async () => (await thumb.boundingBox())!.x)
    .toBeGreaterThan(initial!.x + 10);
  await pick(page, "#example-presets", "required");
  await page
    .locator(".switch-preview")
    .getByRole("button", { name: "Submit", exact: true })
    .click();
  await expect(box).toBeFocused();
  await box.click();
  await page
    .locator(".switch-preview")
    .getByRole("button", { name: "Submit", exact: true })
    .click();
  await expect(page.locator('.switch-preview [role="status"]')).toContainText(
    "enabled",
  );
  await page
    .locator(".switch-preview")
    .getByRole("button", { name: "Reset form", exact: true })
    .click();
  await expect(box).toHaveAttribute("aria-checked", "false");
  await pick(page, "#example-presets", "icons");
  await page
    .getByRole("group", { name: "Selected icon", exact: true })
    .getByRole("button")
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Choose an icon",
    exact: true,
  });
  await expect(dialog).toContainText("4,322");
  await dialog
    .getByRole("searchbox", { name: "Search all icons", exact: true })
    .fill("rocket_launch");
  await dialog
    .getByRole("button", { name: "rocket_launch", exact: true })
    .click();
  await box.click();
  await expect(box.locator('[data-icon-name="rocket_launch"]')).toBeVisible();
  await page.getByRole("switch", { name: "Disabled", exact: true }).click();
  await expect(box).toBeDisabled();
  await page.locator(".switch-preview .mf-switch-label").click({ force: true });
  await expect(box).toHaveAttribute("aria-checked", "true");
});
test("Switch Web Component preserves defaults, rich labels, source events, errors and forms", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto("/#/components/switch");
  await page.evaluate(async () => {
    const { defineMaterialFluidSwitch } = await import(
      /* @vite-ignore */ String("/src/kit/elements.tsx")
    );
    defineMaterialFluidSwitch();
    const form = document.createElement("form");
    form.id = "switch-form";
    form.innerHTML =
      '<mf-switch id="web-switch" checked required name="sync" value="yes" supporting-text="Uses data" motion="minimal"><em id="rich-switch-label">Sync</em></mf-switch><button type="reset">Reset web switch</button>';
    document.body.append(form);
    const host = form.querySelector<MaterialFluidSwitchElement>("mf-switch")!;
    await host.updateComplete;
    host.on("change", (event) => {
      if (!(event instanceof CustomEvent))
        throw Error("duplicate native change escaped");
      host.dataset.count = String(Number(host.dataset.count ?? 0) + 1);
      host.dataset.native = (event.detail.nativeEvent as Event).type;
    });
    host.on("focus", () => {
      host.dataset.focused = "true";
    });
  });
  const host = page.locator("#web-switch"),
    box = host.getByRole("switch"),
    form = page.locator("#switch-form");
  await expect(box).toHaveAccessibleName("Sync");
  await expect(box).toHaveAccessibleDescription("Uses data");
  await expect(page.locator("#rich-switch-label")).toHaveCount(1);
  expect(
    await form.evaluate((el) =>
      new FormData(el as HTMLFormElement).get("sync"),
    ),
  ).toBe("yes");
  await host.locator("em").click();
  await expect(box).toHaveAttribute("aria-checked", "false");
  await expect(host).toHaveAttribute("data-count", "1");
  await expect(host).toHaveAttribute("data-native", "change");
  await box.focus();
  await expect(host).toHaveAttribute("data-focused", "true");
  await host.evaluate(async (el) => {
    const c = el as MaterialFluidSwitchElement;
    c.defaultChecked = false;
    c.defaultChecked = true;
    await c.updateComplete;
  });
  await expect(box).toHaveAttribute("aria-checked", "false");
  await page
    .getByRole("button", { name: "Reset web switch", exact: true })
    .click();
  await expect(box).toHaveAttribute("aria-checked", "true");
  await expect(host).toHaveAttribute("data-count", "1");
  await host.evaluate(async (el) => {
    const c = el as MaterialFluidSwitchElement;
    c.uncheck().setError(true).setSupportingText("Offline");
    await c.updateComplete;
  });
  await expect(box).toHaveAccessibleDescription("Offline");
  await expect(box).toHaveAttribute("aria-invalid", "true");
  expect(
    await host.evaluate((el) =>
      (el as MaterialFluidSwitchElement).checkValidity(),
    ),
  ).toBe(false);
  await host.evaluate(async (el) => {
    const c = el as MaterialFluidSwitchElement;
    c.removeSupportingText()
      .check()
      .setValueAttribute("agreed")
      .setLabel("Renamed");
    await c.updateComplete;
  });
  await expect(box).toHaveAccessibleName("Renamed");
  await expect(box).not.toHaveAttribute("aria-describedby");
  await expect(box).toHaveAttribute("aria-invalid", "true");
  await expect(host).toHaveAttribute("data-count", "1");
  expect(
    await form.evaluate((el) =>
      new FormData(el as HTMLFormElement).get("sync"),
    ),
  ).toBe("agreed");
  await box.press("Enter");
  await expect(box).toHaveAttribute("aria-checked", "false");
  await expect(host).toHaveAttribute("data-count", "2");
  await host.evaluate((el) => {
    const c = el as MaterialFluidSwitchElement;
    c.on("tap", (event) => {
      c.dataset.tap = String((event as CustomEvent).detail.clientX);
    });
    c.on("swipe", (event) => {
      c.dataset.swipe = (event as CustomEvent).detail.direction;
    });
    const button = c.querySelector("button")!;
    for (const [type, x] of [
      ["pointerdown", 10],
      ["pointerup", 10],
      ["pointerdown", 10],
      ["pointermove", 70],
      ["pointerup", 70],
    ] as const)
      button.dispatchEvent(
        new PointerEvent(type, {
          pointerId: 9,
          pointerType: "touch",
          isPrimary: true,
          button: 0,
          clientX: x,
          clientY: 10,
          bubbles: true,
        }),
      );
  });
  await expect(host).toHaveAttribute("data-tap", "10");
  await expect(host).toHaveAttribute("data-swipe", "right");
  await host.evaluate(async (el) => {
    const c = el as MaterialFluidSwitchElement;
    c.disable();
    await c.updateComplete;
  });
  await expect(box).toBeDisabled();
  await host.evaluate(async (el) => {
    const c = el as MaterialFluidSwitchElement;
    c.enable();
    const parent = c.parentElement!;
    c.remove();
    await Promise.resolve();
    parent.append(c);
    await c.updateComplete;
  });
  await expect(box).toHaveAccessibleName("Renamed");
  await host.evaluate((el) => (el as MaterialFluidSwitchElement).destroy());
  await expect(host).toHaveCount(0);
});
test.describe("Switch touch targets", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 900 },
  });
  test("48px target and touch activation", async ({ page }) => {
    await page.goto("/#/components/switch");
    const box = page.locator('.switch-preview [role="switch"]');
    const target = (await box.locator("..").boundingBox())!;
    expect(target.width).toBeGreaterThanOrEqual(48);
    expect(target.height).toBeGreaterThanOrEqual(48);
    await box.tap();
    await expect(box).toHaveAttribute("aria-checked", "true");
  });
});
