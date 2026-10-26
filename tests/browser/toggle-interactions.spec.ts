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

test("icon variants share a compact row", async ({ page }) => {
  await page.goto("/#/components/icon-button");
  const buttons = page.locator(".demo-primary .mf-icon-button");
  await expect(buttons).toHaveCount(6);
  const bounds = await buttons.evaluateAll(nodes => nodes.map(node => {
    const rect = node.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top };
  }));
  for (let i = 1; i < bounds.length; i++) {
    expect(Math.abs(bounds[i].top - bounds[0].top)).toBeLessThan(1);
    expect(bounds[i].left - bounds[i - 1].right).toBeLessThanOrEqual(14);
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

test("Toggle advanced fade controls the Toggle and FAB blur transitions", async ({ page }) => {
  for (const fade of [100, 0]) {
    await page.goto("/#/components/toggle");
    await page.locator(".advanced-tuning-trigger").click();
    const setting = page.getByRole("slider", { name: "Text fade (%)", exact: true });
    await setting.press(fade === 100 ? "End" : "Home");
    await expect(setting).toHaveAttribute("aria-valuenow", String(fade));
    for (const id of ["toggle", "fab"]) {
      if (id === "fab") await page.locator('a[href="#/components/fab"]').first().click();
      await expect(page.locator(id === "toggle" ? ".live-stage .mf-toggle" : ".live-stage .mf-fab").first()).toBeVisible();
      const selector = ".live-stage .mf-morph-label";
      await expect(page.locator(selector).first()).toBeVisible();
      const minimum = await page.evaluate(async ({ id, selector }) => {
        const button = document.querySelector<HTMLButtonElement>(id === "toggle" ? ".live-stage .mf-toggle" : ".live-stage .mf-fab")!;
        button.click();
        const start = performance.now();
        let minimum = 1;
        await new Promise<void>(resolve => {
          function sample() {
            minimum = Math.min(minimum, parseFloat(getComputedStyle(document.querySelector(selector)!).opacity));
            if (performance.now() - start < 300) requestAnimationFrame(sample);
            else resolve();
          }
          requestAnimationFrame(sample);
        });
        return minimum;
      }, { id, selector });
      if (fade === 100) expect(minimum).toBeLessThan(.2);
      else expect(minimum).toBeGreaterThan(.99);
    }
  }
  await page.locator('a[href="#/components/toggle"]').first().click();
  await page.locator(".advanced-tuning-trigger").click();
  await page.getByRole("button", { name: "Reset text morph" }).click();
  await expect(page.getByRole("slider", { name: "Text fade (%)", exact: true })).toHaveAttribute("aria-valuenow", "0");
  await expect(page.getByRole("slider", { name: "Text blur strength (px)", exact: true })).toHaveAttribute("aria-valuenow", "6");
  await expect(page.getByRole("slider", { name: "Text morph duration (ms)", exact: true })).toHaveAttribute("aria-valuenow", "100");
});
