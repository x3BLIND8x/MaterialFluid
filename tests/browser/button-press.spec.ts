import { selectSize } from "./helpers";
import { readFileSync } from "node:fs";
import type { ButtonMotionSettings } from "../../src/kit/provider";
// Read the shared numeric defaults without importing browser-only color dependencies into Node.
const defaultsSource = readFileSync(new URL("../../src/kit/provider.tsx", import.meta.url), "utf8")
  .match(/export const buttonMotionDefaults[^=]*= \{([\s\S]*?)\};/)![1];
const buttonMotionDefaults = Object.fromEntries(
  [...defaultsSource.matchAll(/(\w+):\s*([\d.]+)/g)].map(([, name, value]) => [name, Number(value)]),
) as unknown as ButtonMotionSettings;
const defaultScale = 1 - buttonMotionDefaults.pressDepth / 100;
const defaultRadiusReduction = buttonMotionDefaults.pressDepth / 100 * buttonMotionDefaults.radiusDepthRatio;
import { test, expect } from "@playwright/test";

test("rapid taps restart the press feedback on every click", async ({ page }) => {
  await page.goto("/#/components/button");
  const button = page.locator(".live-stage").getByRole("button", { name: "Filled", exact: true });
  await button.hover();
  await button.evaluate(element => {
    const tracked = element as HTMLButtonElement & { pressTrace: { samples: { time: number; scale: number }[]; starts: number[]; stop: boolean } };
    const trace: typeof tracked.pressTrace = tracked.pressTrace = { samples: [], starts: [], stop: false };
    element.addEventListener('pointerdown', () => trace.starts.push(performance.now()));
    const record = () => {
      trace.samples.push({ time: performance.now(), scale: new DOMMatrixReadOnly(getComputedStyle(element).transform).a });
      if (!trace.stop) requestAnimationFrame(record);
    };
    requestAnimationFrame(record);
  });
  for (let i = 0; i < 3; i++) {
    await page.mouse.down();
    await page.waitForTimeout(10);
    await page.mouse.up();
    if (i < 2) await page.waitForTimeout(45);
  }
  await page.waitForTimeout(150);
  const { samples, starts } = await button.evaluate(element => {
    const trace = (element as HTMLButtonElement & { pressTrace: { samples: { time: number; scale: number }[]; starts: number[]; stop: boolean } }).pressTrace;
    trace.stop = true;
    return trace;
  });
  for (const start of starts.slice(1)) {
    const after = samples.filter(sample => sample.time >= start + 10 && sample.time <= start + 100);
    expect(Math.max(...after.map(sample => sample.scale))).toBeGreaterThan(.975);
    expect(Math.min(...after.map(sample => sample.scale))).toBeLessThan(.97);
  }
});

test("toggle pill and checkbox also restart on repeated quick clicks", async ({ page }) => {
  for (const target of [
    { route: "toggle-group", press: ".live-stage .mf-segment", artwork: ".live-stage .mf-toggle-group .mf-selection", floor: .95 },
    { route: "checkbox", press: ".live-stage .mf-checkbox", artwork: ".live-stage .mf-checkbox", floor: .94 },
  ]) {
    await page.goto(`/#/components/${target.route}`);
    const control = page.locator(target.press).first();
    const artwork = page.locator(target.artwork).first();
    await control.hover();
    const samplesPromise = artwork.evaluate(async element => {
      const samples: { time: number; scale: number }[] = [];
      const until = performance.now() + 650;
      while (performance.now() < until) {
        samples.push({ time: performance.now(), scale: new DOMMatrixReadOnly(getComputedStyle(element).transform).a });
        await new Promise(requestAnimationFrame);
      }
      return samples;
    });
    const starts: number[] = [];
    for (let i = 0; i < 3; i++) {
      starts.push(await page.evaluate(() => performance.now()));
      await page.mouse.down();
      await page.waitForTimeout(10);
      await page.mouse.up();
      if (i < 2) await page.waitForTimeout(45);
    }
    const samples = await samplesPromise;
    for (const start of starts.slice(1)) {
      const after = samples.filter(sample => sample.time >= start + 10 && sample.time <= start + 100);
      expect(Math.max(...after.map(sample => sample.scale)), target.route).toBeGreaterThan(.975);
      expect(Math.min(...after.map(sample => sample.scale)), target.route).toBeLessThan(target.floor);
    }
  }
});

test("resize springs real dimensions and surrounding layout", async ({page}) => {
  // Keep both the preview and its configuration in view while sampling motion.
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto("/#/components/button");
  const button = page.locator(".live-stage").getByRole("button", { name: "Filled",exact:true});
  await expect(button).toHaveAttribute("data-mf-sized", "true");
  await page.evaluate(() => document.fonts.ready);
  const samplesPromise = button.evaluate(async element => {
    const read = () => {
      const rect = element.getBoundingClientRect();
      return { height: rect.height, center: rect.x + rect.width / 2, container: element.closest(".demo-stack")!.getBoundingClientRect().height };
    };
    const samples = [read()];
    // The configuration panel can require scrolling/opening a menu. Start the
    // recording at the actual size mutation so those UI steps cannot exhaust it.
    await new Promise<void>(resolve => {
      const observer = new MutationObserver(() => {
        if (element.classList.contains("mf-scale--sm")) { observer.disconnect(); resolve(); }
      });
      observer.observe(element, { attributes: true, attributeFilter: ["class"] });
    });
    const start = performance.now();
    while (performance.now()-start < 1200) {
      samples.push(read());
      await new Promise(requestAnimationFrame);
    }
    return samples;
  });
  await selectSize(page, "sm");
  const samples = await samplesPromise;
  expect(new Set(samples.map(s => s.height.toFixed(2))).size).toBeGreaterThan(5);
  expect(new Set(samples.map(s => s.container.toFixed(2))).size).toBeGreaterThan(5);
  const dampingRatio = buttonMotionDefaults.sizeDamping / (2 * Math.sqrt(buttonMotionDefaults.stiffness * buttonMotionDefaults.mass));
  const overshoot = dampingRatio < 1 ? Math.exp(-Math.PI * dampingRatio / Math.sqrt(1 - dampingRatio ** 2)) : 0;
  // The authored size spring is underdamped; bound its physical overshoot rather than requiring none.
  const expectedFloor = 28 - (samples[0].height - 28) * overshoot;
  expect(Math.min(...samples.map(s=>s.height))).toBeGreaterThanOrEqual(expectedFloor - .5);
  await expect.poll(async () => (await button.boundingBox())!.height).toBeCloseTo(28, 1);
});

test("hover fades in both modes without replaying the center color reveal", async ({page}) => {
  await page.goto("/#/components/button");
  const button = page.locator(".live-stage").getByRole("button", { name: "Filled",exact:true});
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
  const button = page.locator(".live-stage").getByRole("button", { name: "Filled",
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
      parseFloat(initial.radius) * Math.min(1, 1 - (1 - sample.x) * buttonMotionDefaults.radiusDepthRatio),
    );
    expect(sample.radius).toBeCloseTo(expectedRadius, 1);
  }
  // The overshoot belongs to the easing curve, not to shape distortion.
  expect(Math.min(...samples.map((sample) => sample.x))).toBeLessThan(0.948);
  await expect
    .poll(async () => (await measure()).width)
    .toBeCloseTo(initial.width * defaultScale, 0);
  // Keep holding beyond the spring settling time: the old radius override persisted here.
  await page.waitForTimeout(1800);
  const held = await measure();
  await expect(button.locator(".mf-button-ripple")).toHaveCSS("opacity", "0.2");
  expect(held.height).toBeCloseTo(initial.height * defaultScale, 0);
  expect(parseFloat(held.radius)).toBeCloseTo(
    parseFloat(initial.radius) * (1 - defaultRadiusReduction),
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
    .toBeCloseTo(initial.width * defaultScale, 0);
  await expect.poll(async () => (await measure()).height).toBeCloseTo(initial.height * defaultScale, 0);
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
    parseFloat(initial.radius) * (1 - defaultRadiusReduction * rippleProgress),
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

test("component pages keep the authored defaults without Advanced controls", async ({page}) => {
  for (const route of ["button", "fab", "toggle", "animated-icon"]) {
    await page.goto(`/#/components/${route}`);
    await expect(page.locator(".showcase-canvas")).toBeVisible();
    await expect(page.locator(".advanced-tuning")).toHaveCount(0);
    await expect(page.getByRole("button", {name:"Advanced",exact:true})).toHaveCount(0);
  }
});

test("quick release finishes the ripple before fading it out", async ({
  page,
}) => {
  await page.goto("/#/components/button");
  const button = page.locator(".live-stage").getByRole("button", { name: "Filled",
    exact: true,
  });
  await button.hover();
  await page.mouse.down();
  await page.waitForTimeout(40);
  const ripple = button.locator(".mf-button-ripple");
  const scale = () =>
    ripple.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  expect(await scale()).toBeGreaterThan(0);
  const finish = ripple.evaluate(async el => {
    const samples: {scale:number;opacity:number}[]=[];
    while (el.isConnected) {
      samples.push({scale:new DOMMatrix(getComputedStyle(el).transform).a,opacity:Number(getComputedStyle(el).opacity)});
      await new Promise(requestAnimationFrame);
    }
    return samples;
  });
  await page.mouse.up();
  const frames=await finish;
  expect(frames.some(frame=>frame.scale>=.99 && frame.opacity>=.19)).toBe(true);
  await expect(ripple).toHaveCount(0);
});

test("minimal rapid clicks preserve the existing radius progress", async ({
  page,
}) => {
  await page.goto("/#/components/button");
  await page.getByRole("button", { name: "Fluid", exact: true }).click();
  const button = page.locator(".live-stage").getByRole("button", { name: "Filled",
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
    const button = page.locator(".live-stage").getByRole("button", { name: "Filled",
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
    const button = page.locator(".live-stage").getByRole("button", { name: "Filled",
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
      .toBeCloseTo(initial.width * defaultScale, 0);
    await expect.poll(async () => (await button.boundingBox())!.height).toBeCloseTo(initial.height * defaultScale, 0);
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
