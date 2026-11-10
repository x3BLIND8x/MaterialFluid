import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type {
  MaterialFluidRadiosElement,
  MaterialFluidRadioElement,
} from "../../src/kit/elements";
const pick = (page: Page, section: string, value: string) =>
  page.locator(`${section} button[data-value="${value}"]`).click();
for (const config of [
  { locale: "en", theme: "light", width: 1440 },
  { locale: "fa", theme: "dark", width: 1440 },
  { locale: "en", theme: "dark", width: 390 },
  { locale: "fa", theme: "light", width: 390 },
])
  test(`Radios configuration ${config.locale} ${config.theme} ${config.width}`, async ({
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
    await page.goto("/#/components/radio-group");
    const group = page.locator('.radios-preview [role="radiogroup"]'),
      radios = group.getByRole("radio");
    await expect(radios).toHaveCount(3);
    await expect(radios.nth(1)).toHaveAttribute("aria-checked", "true");
    await group.locator(".mf-radio-label").first().click();
    await expect(radios.first()).toHaveAttribute("aria-checked", "true");
    await radios.first().focus();
    await page.keyboard.press(
      config.locale === "fa" ? "ArrowLeft" : "ArrowRight",
    );
    await expect(radios.nth(1)).toBeFocused();
    await expect(radios.nth(1)).toHaveAttribute("aria-checked", "true");
    await page
      .getByRole("switch", {
        name:
          config.locale === "fa"
            ? "غیرفعال کردن یک گزینه"
            : "Disable an option",
        exact: true,
      })
      .click();
    await expect(radios.nth(1)).toBeDisabled();
    await radios.first().focus();
    await page.keyboard.press(
      config.locale === "fa" ? "ArrowLeft" : "ArrowRight",
    );
    await expect(radios.nth(2)).toBeFocused();
    await expect(radios.nth(2)).toHaveAttribute("aria-checked", "true");
    for (const [size, width] of [
      ["sm", 16],
      ["md", 24],
      ["lg", 28],
    ] as const) {
      await pick(page, "#radios-appearance", size);
      await expect(radios.first()).toHaveCSS("width", `${width}px`);
    }
    await pick(page, "#radios-appearance", "vertical");
    await expect(group).toHaveAttribute("aria-orientation", "vertical");
    await pick(page, "#radios-appearance", "start");
    const positions = await radios.first().evaluate((el) => ({
      control: el.getBoundingClientRect().x,
      label: el
        .closest("label")!
        .querySelector(".mf-radio-label")!
        .getBoundingClientRect().x,
    }));
    expect(
      config.locale === "fa"
        ? positions.label > positions.control
        : positions.label < positions.control,
    ).toBe(true);
    await expect(page.locator(".radios-configuration")).not.toContainText(
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
    await page.evaluate(()=>window.scrollTo(0,0));
    await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBe(0);
    const skip=await page.locator('.skip-link').boundingBox();
    expect(skip!.y+skip!.height).toBeLessThanOrEqual(0);
    await page.screenshot({
      path: `reports/radios-2026-11-10/${config.locale}-${config.theme}-${config.width}.png`,
      fullPage: true,
    });
    await page
      .getByRole("tab", {
        name: config.locale === "fa" ? "مستندات" : "Documentation",
        exact: true,
      })
      .click();
    await expect(page.locator(".usage-code")).toContainText("Radios");
    await page
      .getByRole("button", { name: "Web Components", exact: true })
      .click();
    await expect(page.locator(".usage-code")).toContainText(
      "defineMaterialFluidRadios",
    );
    expect(errors).toEqual([]);
  });
test("Radios native required forms, reset, disabled guards and current content configuration", async ({
  page,
}) => {
  await page.goto("/#/components/radio-group");
  const group = page.locator('.radios-preview [role="radiogroup"]'),
    radios = group.getByRole("radio");
  await pick(page, "#example-presets", "required");
  await page
    .locator(".radios-preview")
    .getByRole("button", { name: "Submit", exact: true })
    .click();
  await expect(radios.first()).toBeFocused();
  await expect(
    page.locator('.radios-preview [role="status"]'),
  ).not.toContainText("Submitted");
  await group.locator(".mf-radio-label").first().click();
  await page
    .locator(".radios-preview")
    .getByRole("button", { name: "Submit", exact: true })
    .click();
  await expect(page.locator('.radios-preview [role="status"]')).toContainText(
    "personal",
  );
  await page
    .locator(".radios-preview")
    .getByRole("button", { name: "Reset form", exact: true })
    .click();
  await expect(radios.nth(1)).toHaveAttribute("aria-checked", "true");
  await pick(page, "#radios-content", "delivery");
  await expect(radios.first()).toHaveAccessibleName("Standard delivery");
  await group.locator(".mf-radio-label").first().click();
  await page
    .locator(".radios-preview")
    .getByRole("button", { name: "Submit", exact: true })
    .click();
  await expect(page.locator('.radios-preview [role="status"]')).toContainText(
    "standard",
  );
  await page.getByRole("switch", { name: "Disabled", exact: true }).click();
  for (const radio of await radios.all()) await expect(radio).toBeDisabled();
  await group.locator(".mf-radio-label").nth(1).click({ force: true });
  await expect(radios.first()).toHaveAttribute("aria-checked", "true");
});
test("Radios Web Component declarative updates, silent APIs, nullable values and native reset", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto("/#/components/radio-group");
  await page.evaluate(async () => {
    const { defineMaterialFluidRadios } = await import(
      /* @vite-ignore */ String("/src/kit/elements.tsx")
    );
    defineMaterialFluidRadios();
    const form = document.createElement("form");
    form.id = "web-radios-form";
    form.innerHTML =
      '<mf-radios id="web-radios" aria-label="Plan" name="plan" value="b" required motion="minimal"><mf-radio value="a">Alpha</mf-radio><mf-radio value="b">Beta</mf-radio><mf-radio value="c" disabled>Gamma</mf-radio></mf-radios><button type="reset">Reset web radios</button>';
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.dataset.submitted = "yes";
    });
    document.body.append(form);
    const host = form.querySelector<MaterialFluidRadiosElement>("mf-radios")!;
    await host.updateComplete;
    host.on("change", (event) => {
      if (!(event instanceof CustomEvent))
        throw Error("duplicate native event escaped");
      host.dataset.changes = String(Number(host.dataset.changes ?? 0) + 1);
      host.dataset.native = event.detail.originalEvent.type;
    });
  });
  const host = page.locator("#web-radios"),
    group = host.getByRole("radiogroup"),
    radios = group.getByRole("radio"),
    form = page.locator("#web-radios-form");
  await expect(group).toHaveAccessibleName("Plan");
  await expect(radios.nth(1)).toHaveAttribute("aria-checked", "true");
  await expect(host.locator("mf-radio")).toHaveCount(3);
  expect(
    await form.evaluate((el) =>
      new FormData(el as HTMLFormElement).get("plan"),
    ),
  ).toBe("b");
  await group.locator(".mf-radio-label").first().click();
  await expect(host).toHaveAttribute("data-changes", "1");
  await expect(host).toHaveAttribute("data-native", "change");
  await host.evaluate(async (el) => {
    const c = el as MaterialFluidRadiosElement;
    c.defaultValue = "a";
    c.defaultValue = "b";
    await c.updateComplete;
  });
  await expect(radios.first()).toHaveAttribute("aria-checked", "true");
  await page
    .getByRole("button", { name: "Reset web radios", exact: true })
    .click();
  await expect(radios.nth(1)).toHaveAttribute("aria-checked", "true");
  await expect(host).toHaveAttribute("data-changes", "1");
  await host.evaluate(async (el) => {
    const c = el as MaterialFluidRadiosElement;
    c.setValue(null).disable().enableOption("c");
    await c.updateComplete;
  });
  expect(
    await host.evaluate((el) => (el as MaterialFluidRadiosElement).getValue()),
  ).toBeNull();
  for (const radio of await radios.all()) await expect(radio).toBeDisabled();
  await host.evaluate(async (el) => {
    const c = el as MaterialFluidRadiosElement;
    c.enable()
      .disableOption("a")
      .addOption({ value: "d", label: "Delta", labelBefore: true });
    await c.updateComplete;
  });
  await expect(radios).toHaveCount(4);
  await expect(radios.first()).toBeDisabled();
  await expect(radios.nth(2)).toBeEnabled();
  await expect(radios.nth(3).locator("..")).toHaveAttribute(
    "data-label-position",
    "start",
  );
  expect(
    await host.evaluate((el) =>
      (el as MaterialFluidRadiosElement).checkValidity(),
    ),
  ).toBe(false);
  await host.evaluate(async (el) => {
    const c = el as MaterialFluidRadiosElement;
    c.setValue("d");
    await c.updateComplete;
  });
  await expect(radios.nth(3)).toHaveAttribute("aria-checked", "true");
  expect(
    await form.evaluate((el) =>
      new FormData(el as HTMLFormElement).get("plan"),
    ),
  ).toBe("d");
  await expect(host).toHaveAttribute("data-changes", "1");
  await host.evaluate(async (el) => {
    const child = el.querySelector<MaterialFluidRadioElement>(
      'mf-radio[value="d"]',
    )!;
    child.label = "Renamed";
    child.disabled = true;
  });
  await expect(radios.nth(3)).toHaveAccessibleName("Renamed");
  await expect(radios.nth(3)).toBeDisabled();
  await host.evaluate((el) =>
    el.querySelector('mf-radio[value="d"]')!.remove(),
  );
  await expect(radios).toHaveCount(3);
  expect(
    await host.evaluate((el) => (el as MaterialFluidRadiosElement).getValue()),
  ).toBeNull();
  await host.evaluate(async (el) => {
    const c = el as MaterialFluidRadiosElement;
    c.setValue("missing").enableOption("a");
    await c.updateComplete;
    const child = document.createElement("mf-radio");
    child.value = "d";
    child.label = "Delta again";
    c.append(child);
  });
  await expect(radios).toHaveCount(4);
  expect(
    await host.evaluate((el) => (el as MaterialFluidRadiosElement).getValue()),
  ).toBeNull();
  await host.evaluate(async (el) => {
    const c = el as MaterialFluidRadiosElement;
    c.direction = "horizontal";
    c.labelPosition = "start";
    c.setAttribute("locale", "fa");
    const parent = c.parentElement!;
    c.remove();
    await Promise.resolve();
    parent.append(c);
    await c.updateComplete;
  });
  await expect(group).toHaveAttribute("dir", "rtl");
  await expect(group).toHaveAttribute("aria-orientation", "horizontal");
  await host.evaluate(async (el) => {
    const c = el as MaterialFluidRadiosElement;
    c.setValue("a");
    await c.updateComplete;
  });
  await radios.first().press("Enter");
  await expect(form).toHaveAttribute("data-submitted", "yes");
  await expect(radios.first()).toHaveAttribute("aria-checked", "true");
  await host.evaluate(el=>{const c=el as MaterialFluidRadiosElement,input=c.radios[0].input,before=c.dataset.changes;c.lifecycle.destroy();input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));if(c.dataset.changes!==before)throw Error('change callback survived destroy');});
  await expect(host).toHaveCount(0);
});
test.describe("Radios coarse pointer", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 900 },
  });
  test("48px option targets and touch selection", async ({ page }) => {
    await page.goto("/#/components/radio-group");
    const first = page.locator('.radios-preview [role="radio"]').first();
    const bounds = (await first.locator("..").boundingBox())!;
    expect(bounds.height).toBeGreaterThanOrEqual(48);
    expect(bounds.width).toBeGreaterThanOrEqual(48);
    await first.tap();
    await expect(first).toHaveAttribute("aria-checked", "true");
  });
});
