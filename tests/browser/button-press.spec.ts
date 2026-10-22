import { selectSize } from "./helpers";
import { test, expect } from "@playwright/test";

test("resize springs real dimensions and surrounding layout", async ({page}) => {
  await page.goto("/#/components/button");
  const button = page.getByRole("button", {name:"Primary",exact:true});
  await expect(button).toHaveAttribute("data-mf-sized", "true");
  await page.evaluate(() => document.fonts.ready);
  const samplesPromise = button.evaluate(async element => {
    const samples = [];
    const start = performance.now();
    while (performance.now()-start < 1200) {
      const rect = element.getBoundingClientRect();
      samples.push({height:rect.height, center:rect.x+rect.width/2, container:element.closest(".demo-stack")!.getBoundingClientRect().height});
      await new Promise(requestAnimationFrame);
    }
    return samples;
  });
  await selectSize(page, "sm");
  const samples = await samplesPromise;
  expect(new Set(samples.map(s => s.height.toFixed(2))).size).toBeGreaterThan(5);
  expect(new Set(samples.map(s => s.container.toFixed(2))).size).toBeGreaterThan(5);
  expect(Math.min(...samples.map(s=>s.height))).toBeGreaterThanOrEqual(27.9);
  expect(samples.at(-1)!.height).toBeCloseTo(28, 1);
});

test("hover fades in both modes without replaying the center color reveal", async ({page}) => {
  await page.goto("/#/components/button");
  const button = page.getByRole("button", {name:"Primary",exact:true});
  await button.hover();
  await expect(button).toHaveCSS("transition-property", "background-color, color, border-color");
  await expect(button.locator(".mf-button-color-reveal")).toHaveCount(0);
  await page.getByRole("button", {name:"Fluid",exact:true}).click();
  await button.hover();
  await expect(button).toHaveCSS("transition-property", "background-color, color, border-color");
  await expect(button.locator(".mf-button-color-reveal")).toHaveCount(0);
});

test("button spring timing stays symmetric and preserves corners on long holds", async ({
  page,
}) => {
  await page.goto("/#/components/button");
  const button = page.getByRole("button", {
    name: "Primary",
    exact: true,
  });
  const measure = () =>
    button.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return {
        width: box.width,
        height: box.height,
        radius: getComputedStyle(element).borderRadius,
      };
    });
  await expect
    .poll(async () => parseFloat((await measure()).radius))
    .toBeLessThan(100);
  await expect.poll(async () => (await measure()).height).toBeCloseTo(48, 1);
  await page.evaluate(() => document.fonts.ready);
  const initial = await measure();
  await button.hover();
  const samplesPromise = button.evaluate(async (element) => {
    const samples: {
      x: number;
      y: number;
      skewX: number;
      skewY: number;
      radius: number;
    }[] = [];
    const start = performance.now();
    while (performance.now() - start < 800) {
      const matrix = new DOMMatrix(getComputedStyle(element).transform);
      samples.push({
        x: matrix.a,
        y: matrix.d,
        skewX: matrix.b,
        skewY: matrix.c,
        radius: parseFloat(getComputedStyle(element).borderRadius),
      });
      await new Promise(requestAnimationFrame);
    }
    return samples;
  });
  await page.mouse.down();
  const samples = await samplesPromise;
  for (const sample of samples) {
    expect(sample.x).toBeCloseTo(sample.y, 5);
    expect(sample.skewX).toBe(0);
    expect(sample.skewY).toBe(0);
    const expectedRadius = Math.max(
      6,
      parseFloat(initial.radius) * Math.min(1, 1 - (1 - sample.x) * 5),
    );
    expect(sample.radius).toBeCloseTo(expectedRadius, 1);
  }
  // The overshoot belongs to the easing curve, not to shape distortion.
  expect(Math.min(...samples.map((sample) => sample.x))).toBeLessThan(0.948);
  await expect
    .poll(async () => (await measure()).width)
    .toBeCloseTo(initial.width * 0.94, 0);
  // Keep holding beyond the spring settling time: the old radius override persisted here.
  await page.waitForTimeout(1800);
  const held = await measure();
  await expect(button.locator(".mf-button-ripple")).toHaveCSS("opacity", "0.2");
  expect(held.height).toBeCloseTo(initial.height * 0.94, 0);
  expect(parseFloat(held.radius)).toBeCloseTo(
    parseFloat(initial.radius) * 0.7,
    1,
  );
  await button.screenshot({
    path: ".impeccable/review/button-held-desktop.png",
  });
  await page.mouse.up();
  await expect(button.locator(".mf-button-ripple")).toHaveCount(0);
  await expect
    .poll(async () => (await measure()).width)
    .toBeCloseTo(initial.width, 1);
  await expect.poll(async () => (await measure()).radius).toBe(initial.radius);

  await button.focus();
  await page.keyboard.down("Enter");
  await expect
    .poll(async () => (await measure()).width)
    .toBeCloseTo(initial.width * 0.94, 0);
  await expect.poll(async () => (await measure()).height).toBeCloseTo(initial.height * 0.94, 0);
  await page.keyboard.up("Enter");
  await expect
    .poll(async () => (await measure()).width)
    .toBeCloseTo(initial.width, 1);

  await page.getByRole("button", { name: "Fluid", exact: true }).click();
  await button.hover();
  await page.mouse.down();
  await page.waitForTimeout(300);
  expect((await measure()).width).toBeCloseTo(initial.width, 1);
  expect(parseFloat((await measure()).radius)).toBeLessThan(
    parseFloat(initial.radius),
  );
  const rippleProgress = await button
    .locator(".mf-button-ripple")
    .evaluate(
      (element) =>
        (new DOMMatrix(getComputedStyle(element).transform).a *
          parseFloat(getComputedStyle(element).opacity)) /
        0.2,
    );
  expect(parseFloat((await measure()).radius)).toBeCloseTo(
    parseFloat(initial.radius) * (1 - 0.3 * rippleProgress),
    0,
  );
  await expect(button.locator(".mf-button-ripple")).toHaveCSS("opacity", "0.2");
  await button.screenshot({
    path: ".impeccable/review/button-minimal-ripple.png",
  });
  await page.mouse.up();
  await expect(button.locator(".mf-button-ripple")).toHaveCount(0);
  await expect.poll(async () => (await measure()).radius).toBe(initial.radius);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await button.hover();
  await page.mouse.down();
  await page.waitForTimeout(150);
  await expect(button.locator(".mf-button-ripple")).toHaveCSS(
    "transform",
    "none",
  );
  expect((await measure()).radius).toBe(initial.radius);
  await page.mouse.up();
});

test("temporary tuning updates the actual button and reset restores defaults", async ({
  page,
}) => {
  await page.goto("/#/components/button");
  await page.getByRole("button", {name:"Advanced", exact:true}).click();
  await expect(
    page
      .locator(".demo-button-tuning")
      .getByRole("slider", { name: "Ripple release speed (×)", exact: true }),
  ).toHaveAttribute("aria-valuenow", "2");
  const depth = page.getByRole("slider", {
    name: "Press depth (%)",
    exact: true,
  });
  await depth.focus();
  await page.keyboard.press("End");
  await expect(depth).toHaveAttribute("aria-valuenow", "20");
  const button = page.getByRole("button", {
    name: "Primary",
    exact: true,
  });
  const initial = (await button.boundingBox())!;
  await button.hover();
  await page.mouse.down();
  await expect
    .poll(async () => (await button.boundingBox())!.width)
    .toBeCloseTo(initial.width * 0.8, 0);
  await page.mouse.up();
  await page.getByRole("button", { name: "Reset tuning", exact: true }).click();
  await expect(depth).toHaveAttribute("aria-valuenow", "6");
  await page.screenshot({
    path: ".impeccable/review/button-tuning-desktop.png",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "More options" }).click();
  await page.getByRole("button", { name: "Switch to Persian" }).click();
  await page.keyboard.press("Escape");
  await page.screenshot({
    path: ".impeccable/review/button-tuning-mobile-fa.png",
    fullPage: true,
  });
});

test("quick release finishes the ripple before fading it out", async ({
  page,
}) => {
  await page.goto("/#/components/button");
  await page.getByRole("button", {name:"Advanced", exact:true}).click();
  const duration = page.getByRole("slider", {
    name: "Ripple duration (ms)",
    exact: true,
  });
  await duration.focus();
  await page.keyboard.press("End");
  const ease = page.getByRole("slider", {
    name: "Ripple fast-start strength (%)",
    exact: true,
  });
  await expect(ease).toHaveAttribute("aria-valuenow", "85");
  await ease.focus();
  await page.keyboard.press("Home");
  const button = page.getByRole("button", {
    name: "Primary",
    exact: true,
  });
  await button.hover();
  await page.mouse.down();
  await page.waitForTimeout(40);
  const ripple = button.locator(".mf-button-ripple");
  const scale = () =>
    ripple.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  const atRelease = await scale();
  await page.mouse.up();
  await page.waitForTimeout(180);
  await expect(ripple).toHaveCSS("opacity", "0.2");
  expect(await scale()).toBeGreaterThan(atRelease);
  await expect.poll(scale).toBeGreaterThan(0.99);
  await expect(ripple).toHaveCount(0);
});

test("minimal rapid clicks preserve the existing radius progress", async ({
  page,
}) => {
  await page.goto("/#/components/button");
  await page.getByRole("button", { name: "Fluid", exact: true }).click();
  const button = page.getByRole("button", {
    name: "Primary",
    exact: true,
  });
  const radius = () =>
    button.evaluate((el) => parseFloat(getComputedStyle(el).borderRadius));
  await button.hover();
  await page.mouse.down();
  await page.waitForTimeout(400);
  const before = await radius();
  await page.mouse.up();
  await page.waitForTimeout(20);
  const continuity = button.evaluate(async (el) => {
    const frames: number[] = [];
    const start = performance.now();
    while (performance.now() - start < 180) {
      frames.push(parseFloat(getComputedStyle(el).borderRadius));
      await new Promise(requestAnimationFrame);
    }
    return frames;
  });
  await page.mouse.down();
  await page.waitForTimeout(30);
  await expect(button.locator(".mf-button-ripple")).toHaveCount(2);
  await page.mouse.up();
  const frames = await continuity;
  expect(
    Math.max(...frames.slice(1).map((value, i) => Math.abs(value - frames[i]))),
  ).toBeLessThan(3);
  for (let i = 0; i < 3; i++) {
    await page.mouse.down();
    await page.waitForTimeout(25);
    await page.mouse.up();
  }
  await expect(button.locator(".mf-button-ripple")).toHaveCount(0);
  await expect.poll(radius).toBeGreaterThan(before + 4);
});

for (const minimal of [false, true]) {
  test(`Enter and Space activate once with centered feedback (${minimal ? "minimal" : "fluid"})`, async ({
    page,
  }) => {
    await page.goto("/#/components/button");
    if (minimal)
      await page.getByRole("button", { name: "Fluid", exact: true }).click();
    const button = page.getByRole("button", {
      name: "Primary",
      exact: true,
    });
    await button.evaluate((el) => {
      el.dataset.activations = "0";
      el.addEventListener("click", () => {
        el.dataset.activations = String(Number(el.dataset.activations) + 1);
      });
    });
    let count = 0;
    for (const key of ["Enter", "Space"]) {
      await button.focus();
      await page.keyboard.down(key);
      const ripple = button.locator(".mf-button-ripple").last();
      await expect(ripple).toBeAttached();
      const centerError = await ripple.evaluate((el) =>
        Math.abs(
          parseFloat((el as HTMLElement).style.left) +
            parseFloat((el as HTMLElement).style.width) / 2 -
            el.parentElement!.offsetWidth / 2,
        ),
      );
      expect(centerError).toBeLessThan(1);
      await page.keyboard.down(key);
      await expect(button.locator(".mf-button-ripple")).toHaveCount(1);
      await page.keyboard.up(key);
      await expect(button).toHaveAttribute("data-activations", String(++count));
      await expect(button.locator(".mf-button-ripple")).toHaveCount(0);
    }
    await page.getByRole("button", {name:"Advanced", exact:true}).click();
    const depth = page.getByRole("slider", {
      name: "Press depth (%)",
      exact: true,
    });
    await depth.focus();
    await page.keyboard.press("ArrowRight");
    await expect(depth).toHaveAttribute("aria-valuenow", "7");
  });
}

test.describe("touch press", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  test("shrinks both dimensions and preserves corners during a touch hold", async ({
    page,
  }) => {
    await page.goto("/#/components/button");
    const button = page.getByRole("button", {
      name: "Primary",
      exact: true,
    });
    await button.scrollIntoViewIfNeeded();
    const initial = (await button.boundingBox())!;
    const touch = await page.context().newCDPSession(page);
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [
        { x: initial.x + initial.width / 2, y: initial.y + initial.height / 2 },
      ],
    });
    await expect
      .poll(async () => (await button.boundingBox())!.width)
      .toBeCloseTo(initial.width * 0.94, 0);
    await expect.poll(async () => (await button.boundingBox())!.height).toBeCloseTo(initial.height * 0.94, 0);
    await expect
      .poll(async () =>
        parseFloat(
          await button.evaluate((el) => getComputedStyle(el).borderRadius),
        ),
      )
      .toBeLessThan(24);
    await button.screenshot({
      path: ".impeccable/review/button-held-mobile.png",
    });
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchCancel",
      touchPoints: [],
    });
    await expect(button.locator(".mf-button-ripple")).toHaveCount(0);
    await expect
      .poll(async () => (await button.boundingBox())!.width)
      .toBeCloseTo(initial.width, 1);
  });
});
