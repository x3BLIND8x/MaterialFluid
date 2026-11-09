import { test, expect } from "@playwright/test";

test("linear and circular waves move without changing progress semantics", async ({
  page,
}) => {
  await page.goto("/#/components/progress");
  const progress = page.locator('.demo-primary [role="progressbar"]');
  const wave = progress.locator(".mf-progress-wave");
  await expect(wave).toBeVisible();
  const before = await wave.getAttribute("d");
  const value = await progress.getAttribute("aria-valuenow");
  await expect.poll(() => wave.getAttribute("d")).not.toBe(before);
  await expect(progress).toHaveAttribute("aria-valuenow", value!);
  const slider = page.locator('.demo-primary [role="slider"]').first();
  await slider.focus();
  await slider.press("End");
  await expect(progress).toHaveAttribute("aria-valuenow", "100");
  await expect(progress.locator(".mf-wave-stop")).toHaveCount(0);
  await expect
    .poll(() =>
      wave.evaluate((el) => {
        const center = el.closest("svg")!.viewBox.baseVal.height / 2;
        return Array.from(
          el.getAttribute("d")!.matchAll(/[ML][\d.]+,([\d.]+)/g),
          (match) => Number(match[1]),
        ).every((y) => Math.abs(y - center) < 0.01);
      }),
    )
    .toBe(true);
  await page.goto("/#/components/spinner");
  const spinner = page.locator(".demo-primary .mf-spinner").first();
  await expect(spinner).toHaveAttribute("role", "status");
  const circular = spinner.locator(".mf-spinner-wave");
  const initial = await circular.getAttribute("d");
  await expect.poll(() => circular.getAttribute("d")).not.toBe(initial);
  await expect(circular).toHaveCSS("animation-name", "mf-wave-arc");
});

test("waves remain visible and stationary with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [route, selector] of [
    ["progress", ".mf-progress-wave"],
    ["spinner", ".mf-spinner-wave"],
  ]) {
    await page.goto(`/#/components/${route}`);
    const wave = page.locator(`.demo-primary ${selector}`).first();
    await expect(wave).toBeVisible();
    const samples = await wave.evaluate(async (element) => {
      const paths: (string | null)[] = [];
      for (let i = 0; i < 15; i++) {
        paths.push(element.getAttribute("d"));
        await new Promise(requestAnimationFrame);
      }
      return paths;
    });
    expect(new Set(samples).size).toBe(1);
    await expect(wave).toHaveCSS("animation-name", "none");
  }
});

test("indeterminate linear waves retain an unknown accessible value and mirror in RTL", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "materialfluid.preferences",
      JSON.stringify({ locale: "fa" }),
    ),
  );
  await page.goto("/#/components/progress");
  await page
    .locator(".example-controls")
    .getByRole("switch", { name: /Loading|بارگذاری/ })
    .check();
  const progress = page.locator('.demo-primary [role="progressbar"]');
  await expect(progress).not.toHaveAttribute("aria-valuenow");
  await expect(progress.locator(".mf-wave-travel")).toBeVisible();
  await expect(progress.locator(".mf-linear-wave")).toHaveCSS(
    "transform",
    "matrix(-1, 0, 0, 1, 0, 0)",
  );
});

for (const locale of ["en", "fa"])
  test(`Progress exposes the segmented and status-row variants (${locale})`, async ({
    page,
  }) => {
    await page.addInitScript(
      (locale) =>
        localStorage.setItem(
          "materialfluid.preferences",
          JSON.stringify({ locale, motion: "minimal" }),
        ),
      locale,
    );
    await page.goto("/#/components/progress");
    const styles = page
      .locator(".demo-primary")
      .getByRole("group", {
        name: locale === "en" ? "Progress style" : "ظاهر پیشرفت",
      });
    await styles
      .getByRole("button", {
        name: locale === "en" ? "Segmented" : "بخش‌بندی",
        exact: true,
      })
      .click();
    const progress = page.locator('.demo-primary [role="progressbar"]');
    await expect(progress.locator(".mf-progress-stage")).toHaveCount(2);
    await expect(progress).toHaveAttribute("aria-valuenow", "65");
    await expect(progress.locator(".mf-progress-status-text")).toBeVisible();
    await expect(progress.locator(".mf-progress-percent")).toHaveText(
      locale === "en" ? "65%" : "۶۵٪",
    );
    await expect(progress.locator(".mf-progress-remaining")).toBeVisible();
    await expect(progress).toHaveAttribute("aria-valuetext", /65%|۶۵٪/);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
