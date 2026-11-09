import { selectSize } from "./helpers";
import { test, expect } from "@playwright/test";

test("icon-only toggle groups follow component size", async ({ page }) => {
  await page.goto("/#/components/toggle-group");
  const item = page.locator(".live-stage .mf-segment[data-icon-only]").first();
  for (const [size, pixels] of [["sm", 28], ["md", 48], ["lg", 58]] as const) {
    await selectSize(page, size);
    await expect(item).toHaveCSS("width", `${pixels}px`);
    await expect(item).toHaveCSS("height", `${pixels}px`);
  }
});

test("dragged selection keeps one pill and glides between snapped items", async ({ page }) => {
  await page.goto("/#/components/toggle-group");
  const group = page.locator(".live-stage .mf-toggle-group").first();
  const first = group.getByRole("button", { name: "List", exact: true });
  const last = group.getByRole("button", { name: "Board", exact: true });
  const pill = group.locator(".mf-selection");
  const restRadius = await pill.evaluate(el => parseFloat(getComputedStyle(el).borderTopLeftRadius));
  await first.hover();
  await page.mouse.down();
  await expect(group.locator(".mf-button-ripple")).toHaveCount(0);
  await expect.poll(() => pill.evaluate(el => parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeLessThan(restRadius - 2);
  const probe = await group.evaluate(async element => {
    const pill = element.querySelector(".mf-selection")!;
    const target = element.querySelectorAll(".mf-segment")[2].getBoundingClientRect();
    const positions = [pill.getBoundingClientRect().x];
    const scales: number[] = [];
    element.dispatchEvent(new PointerEvent("pointermove", { pointerId: 1, isPrimary: true, pointerType: "mouse", clientX: target.x + target.width / 2, clientY: target.y + target.height / 2, bubbles: true }));
    for (let i = 0; i < 18; i++) {
      await new Promise(requestAnimationFrame);
      positions.push(pill.getBoundingClientRect().x);
      scales.push(new DOMMatrixReadOnly(getComputedStyle(pill).transform).a);
    }
    return { samePill: pill === element.querySelector(".mf-selection"), positions, scales };
  });
  expect(probe.samePill).toBe(true);
  expect(Math.max(...probe.scales)).toBeLessThanOrEqual(1);
  expect(new Set(probe.positions.map(x => x.toFixed(1))).size).toBeGreaterThan(3);
  expect(probe.positions.at(-1)!).toBeGreaterThan(probe.positions[0] + 80);
  await expect(last).toHaveAttribute("aria-pressed", "true");
  await expect(group.locator(".mf-selection")).toHaveCount(1);
  await expect.poll(() => last.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a)).toBeCloseTo(1, 3);
  await expect.poll(() => first.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a)).toBeGreaterThan(.99);
  await last.hover();
  await expect(last).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await page.mouse.up();
  await expect(last).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => pill.evaluate(el => parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeCloseTo(restRadius, 0);
});

test("icon variants configure one shared preview", async ({ page }) => {
  await page.goto("/#/components/icon-button");
  const preview=page.locator(".icon-button-preview-form > .mf-icon-button");
  await expect(preview).toHaveCount(1);
  const variants=page.locator('#icon-button-appearance .mf-toggle-group[aria-label="Variant"]');
  for(const value of ["filled","emphasize","tonal","outlined","ghost","danger"]){
    await variants.locator(`button[data-value="${value}"]`).click();
    await expect(preview).toHaveClass(new RegExp(`mf-variant--${value}\\b`));
    await expect(preview).toHaveCount(1);
  }
});

test("selected labels interpolate to 700", async ({ page }) => {
  await page.goto("/#/components/toggle");
  const toggle = page.locator(".live-stage .mf-toggle").first();
  await expect(toggle).toHaveCSS("font-weight", "500");
  await toggle.click();
  await expect(toggle).toHaveCSS("font-weight", "700");
  await toggle.click();
  await expect(toggle).toHaveCSS("font-weight", "500");
  await page.goto("/#/components/checkbox");
  const checkbox = page.locator(".live-stage .mf-checkbox").first();
  const label = checkbox.locator("..").locator(":scope > span");
  await expect(label).toHaveCSS("font-weight", "500");
  await checkbox.click();
  await expect(label).toHaveCSS("font-weight", "700");
});

test("mouse dragging selects a segment without growing the pill or group", async ({ page }) => {
  await page.goto("/#/components/toggle-group");
  const group = page.locator(".live-stage .mf-toggle-group").first();
  await expect(group.locator(".mf-selection")).toHaveText("");
  const first = group.getByRole("button", { name: "List", exact: true });
  const last = group.getByRole("button", { name: "Board", exact: true });
  const before = await group.boundingBox();
  await first.hover();
  await page.mouse.down();
  await expect.poll(() => group.locator(".mf-selection").evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a)).toBeLessThan(1);
  const held = await group.boundingBox();
  expect(held!.width).toBeCloseTo(before!.width, 0);
  expect(held!.height).toBeCloseTo(before!.height, 0);
  const destination = await last.boundingBox();
  await page.mouse.move(destination!.x + destination!.width / 2, destination!.y + destination!.height / 2, { steps: 8 });
  await expect(last).toHaveAttribute("aria-pressed", "true");
  await page.mouse.up();
  await expect(last).toHaveAttribute("aria-pressed", "true");
  await expect(last).toHaveCSS("font-weight", "700");
  await expect.poll(() => group.locator(".mf-selection").evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a)).toBeCloseTo(1, 3);
  await first.press("Space");
  await expect(first).toHaveAttribute("aria-pressed", "true");
});

test("held pills stay within both edges at every size in LTR and RTL", async ({ page }) => {
  for (const locale of ["en", "fa"]) {
    await page.goto("/#/components/toggle-group");
    await page.evaluate(locale => localStorage.setItem("materialfluid.preferences", JSON.stringify({ locale, motion: "expressive" })), locale);
    await page.reload();
    const group = page.locator(".live-stage .mf-toggle-group").first();
    for (const size of ["sm", "md", "lg"]) {
      await selectSize(page, size);
      for (const index of [0, 2]) {
        const button = group.locator(".mf-segment").nth(index);
        await button.click();
        await expect(group.locator(".mf-selection")).toBeVisible();
        await button.hover();
        await page.mouse.down();
        await page.waitForTimeout(350);
        const outer = (await group.boundingBox())!;
        const pill = (await group.locator(".mf-selection").boundingBox())!;
        expect(pill.x).toBeGreaterThanOrEqual(outer.x + .5);
        expect(pill.x + pill.width).toBeLessThanOrEqual(outer.x + outer.width - .5);
        expect(pill.y).toBeGreaterThanOrEqual(outer.y + .5);
        expect(pill.y + pill.height).toBeLessThanOrEqual(outer.y + outer.height - .5);
        await page.mouse.up();
      }
    }
  }
});

test("touch dragging commits on release and cancellation restores selection", async ({ page, context }) => {
  await page.goto("/#/components/toggle-group");
  const group = page.locator(".live-stage .mf-toggle-group").first();
  const list = group.getByRole("button", { name: "List", exact: true });
  const grid = group.getByRole("button", { name: "Grid", exact: true });
  const client = await context.newCDPSession(page);
  const a = (await list.boundingBox())!;
  const b = (await grid.boundingBox())!;
  const start = { x: a.x + a.width / 2, y: a.y + a.height / 2 };
  const end = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [start] });
  for (let i = 1; i <= 6; i++) await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: start.x + (end.x - start.x) * i / 6, y: start.y }] });
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(grid).toHaveAttribute("aria-pressed", "true");
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [start] });
  await expect(list).toHaveAttribute("aria-pressed", "true");
  await client.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
  await expect(grid).toHaveAttribute("aria-pressed", "true");
});

test("Toggle and FAB retain their opaque default text morph without Advanced controls", async ({ page }) => {
  for (const id of ["toggle", "fab"]) {
    await page.goto(`/#/components/${id}`);
    const button = page.locator(id === "toggle" ? ".live-stage .mf-toggle" : ".live-stage .mf-fab").first();
    await expect(button).toBeVisible();
    await expect(page.locator(".advanced-tuning-trigger")).toHaveCount(0);
    const samples = await button.evaluate(async element => {
      const read = () => {
        const css = getComputedStyle(element.querySelector(".mf-morph-label")!);
        return { opacity: Number(css.opacity), blur: parseFloat(css.filter.match(/blur\(([^)]+)/)?.[1] ?? "0") };
      };
      (element as HTMLButtonElement).click();
      const frames = [];
      const start = performance.now();
      while (performance.now() - start < 350) { frames.push(read()); await new Promise(requestAnimationFrame); }
      return frames;
    });
    expect(Math.min(...samples.map(frame => frame.opacity))).toBeGreaterThan(.99);
    expect(Math.max(...samples.map(frame => frame.blur))).toBeGreaterThan(.1);
    await expect(button.locator(".mf-morph-label")).toHaveCSS("filter", "blur(0px)");
  }
});
