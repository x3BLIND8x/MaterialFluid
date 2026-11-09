import { test, expect } from "@playwright/test";
import { selectSize } from "./helpers";

test("size variants spring real geometry across component families", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.addInitScript(() =>
    localStorage.setItem(
      "materialfluid.preferences",
      JSON.stringify({ locale: "en", motion: "expressive" }),
    ),
  );
  const cases = [
    ["text-field", ".mf-input-wrap", "height"],
    ["checkbox", ".mf-checkbox", "width"],
    ["switch", ".mf-switch", "width"],
    ["otp-input", ".mf-otp input", "width"],
    ["avatar", ".mf-avatar", "width"],
    ["spinner", ".mf-spinner:nth-child(2)", "width"],
    ["card", ".mf-card", "padding-top"],
    ["tabs", ".mf-tab", "height"],
    ["tree", ".mf-tree-item", "height"],
    ["file-input", ".mf-file-surface", "height"],
  ];
  for (const [route, selector, property] of cases) {
    await page.goto(`/#/components/${route}`);
    const target = page.locator(`.demo-primary ${selector}`).first();
    await expect(target).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const initial = await target.evaluate(
      (el, property) =>
        parseFloat(getComputedStyle(el).getPropertyValue(property)),
      property,
    );
    const recording = target.evaluate(async (el, property) => {
      const samples: number[] = [];
      const start = performance.now();
      while (performance.now() - start < 1400) {
        samples.push(
          parseFloat(getComputedStyle(el).getPropertyValue(property)),
        );
        await new Promise(requestAnimationFrame);
      }
      return samples;
    }, property);
    await selectSize(page, "sm");
    const samples = await recording;
    const final = samples.at(-1)!;
    expect(Math.abs(final - initial), route).toBeGreaterThan(1);
    expect(
      new Set(samples.map((value) => value.toFixed(2))).size,
      route,
    ).toBeGreaterThan(5);
    expect(
      samples.filter(
        (value) =>
          value > Math.min(initial, final) + 0.1 &&
          value < Math.max(initial, final) - 0.1,
      ).length,
      route,
    ).toBeGreaterThan(3);
    await selectSize(page, "md");
    await expect
      .poll(
        async () =>
          target.evaluate(
            (el, property) =>
              parseFloat(getComputedStyle(el).getPropertyValue(property)),
            property,
          ),
        { message: route },
      )
      .toBeCloseTo(initial, 0);
  }
});

test("size motion respects reduced motion and FileInput has no Large option", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/components/file-input");
  await page.locator("#component-size").click();
  await expect(
    page.getByRole("option", { name: "Large", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("option", { name: "Small", exact: true }).click();
  await expect(
    page.locator(".demo-primary .mf-file-surface").first(),
  ).toHaveCSS("display", "grid");
  expect(
    await page
      .locator(".demo-primary .mf-file-surface")
      .first()
      .evaluate((el) => el.getAnimations().length),
  ).toBe(0);
});

for (const locale of ["en", "fa"])
  test(`calendar header scales, aligns and keeps month before year (${locale})`, async ({
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
    await page.goto("/#/components/calendar");
    for (const [size, height] of [
      ["sm", 28],
      ["md", 48],
      ["lg", 58],
    ] as const) {
      await selectSize(page, size);
      const header = page.locator(".demo-primary .mf-calendar-header").last();
      const month = header.locator(".mf-calendar-caption button").nth(0),
        year = header.locator(".mf-calendar-caption button").nth(1);
      const previous = header.locator(":scope > button").first(),
        next = header.locator(":scope > button").last();
      for (const button of [month, year, previous, next])
        await expect
          .poll(async () => (await button.boundingBox())!.height)
          .toBeCloseTo(height, 0);
      const boxes = await Promise.all(
        [previous, month, year, next].map((button) => button.boundingBox()),
      );
      const centers = boxes.map((box) => box!.y + box!.height / 2);
      expect(Math.max(...centers) - Math.min(...centers)).toBeLessThan(1);
      expect(
        locale === "en" ? boxes[1]!.x < boxes[2]!.x : boxes[1]!.x > boxes[2]!.x,
      ).toBe(true);
      for (const row of await page.locator(".demo-primary .rdp-week").all())
        expect(
          await row.locator(".rdp-day:not(.rdp-outside)").count(),
        ).toBeGreaterThan(0);
    }
  });

test("date ranges form a continuous band with round endpoints", async ({
  page,
}) => {
  await page.goto("/#/components/date-range-picker");
  await page.locator(".demo-primary .mf-select-trigger").first().click();
  const panel = page.locator(".mf-date-popover");
  const middle = panel.locator(".rdp-range_middle").first();
  await expect(middle).toBeVisible();
  await expect(middle).toHaveCSS("border-top-left-radius", "0px");
  await expect(middle.locator("button")).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  for (const kind of ["start", "end"]) {
    const cell = panel.locator(`.rdp-range_${kind}`).first();
    expect(
      await cell.evaluate((el) => getComputedStyle(el).backgroundImage),
    ).toContain("linear-gradient");
    const button = cell.locator("button");
    const bounds = (await button.boundingBox())!;
    await expect.poll(() => button.evaluate(node => parseFloat(getComputedStyle(node).borderTopLeftRadius))).toBeCloseTo(Math.min(bounds.width, bounds.height) / 2, 0);
  }
});

for (const locale of ["en", "fa"])
  test(`date range selection restarts and commits a new interval (${locale})`, async ({
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
    await page.goto("/#/components/date-range-picker");
    const trigger = page.locator(".demo-primary .mf-select-trigger").first();
    await trigger.click();
    const panel = page.locator(".mf-date-popover");
    const days = panel.locator(".rdp-day:not(.rdp-outside)");
    const first = await days.nth(5).getAttribute("data-day");
    const last = await days.nth(8).getAttribute("data-day");
    await days.nth(5).locator("button").click();
    await expect(trigger).toContainText("----");
    await days.nth(8).locator("button").click();
    await expect(panel.locator(".rdp-range_start")).toHaveAttribute(
      "data-day",
      first!,
    );
    await expect(panel.locator(".rdp-range_end")).toHaveAttribute(
      "data-day",
      last!,
    );
    await expect(panel.locator(".rdp-range_middle")).toHaveCount(2);
    await expect(trigger).not.toContainText("----");
  });

test("interrupted size changes retarget from the visible geometry and release their styles", async ({
  page,
}) => {
  await page.goto("/#/components/text-field");
  const field = page.locator(".demo-primary .mf-input-wrap").first();
  await expect(field).toBeVisible();
  const result = await field.evaluate(async (el) => {
    const root = el.closest(".mf-scale--md")!;
    root.classList.replace("mf-scale--md", "mf-scale--sm");
    for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
    const before = el.getBoundingClientRect().height;
    root.classList.replace("mf-scale--sm", "mf-scale--lg");
    await new Promise(requestAnimationFrame);
    // Compare the new animation origin, independent of a loaded frame advancing playback.
    const frames = (el.getAnimations().at(-1)?.effect as KeyframeEffect).getKeyframes();
    const after = parseFloat(String(frames[0].height));
    return { before, after };
  });
  expect(result.before).toBeGreaterThan(28);
  expect(result.before).toBeLessThan(48);
  expect(Math.abs(result.after - result.before)).toBeLessThan(5);
  await expect
    .poll(async () => (await field.boundingBox())!.height)
    .toBeCloseTo(58, 0);
  await expect
    .poll(() => field.evaluate((el) => el.getAnimations().length))
    .toBe(0);
  // Width/height remain authored by CSS, so a later responsive resize stays fluid.
  expect(await field.evaluate((el) => (el as HTMLElement).style.height)).toBe(
    "",
  );
});
