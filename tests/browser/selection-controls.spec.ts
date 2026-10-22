import { selectSize } from "./helpers";
import { test, expect } from "@playwright/test";
import { catalogue } from "../../src/showcase/catalogue";

test("selection controls use one preview and keep selected states visible", async ({ page }) => {
  await page.goto("/#/components/toggle");
  const stage = page.locator(".live-stage");
  await expect(stage.locator(".demo-primary")).toHaveCount(1);
  const toggle = stage.locator(".mf-toggle").first();
  await expect(toggle).toHaveClass(/mf-variant--outline/);
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toHaveClass(/mf-variant--primary/);
  await toggle.press("Space");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");

  await page.goto("/#/components/toggle-group");
  await expect(stage.locator(".mf-toggle-group")).toHaveCount(3);
  const grid = stage.getByRole("button", { name: "Grid", exact: true });
  await grid.click();
  await expect(grid).toHaveAttribute("aria-pressed", "true");
  await expect(grid.locator(".mf-selection")).toBeVisible();
  const fill = await grid.locator(".mf-selection").evaluate(el => getComputedStyle(el).backgroundColor);
  expect(fill).not.toBe("rgba(0, 0, 0, 0)");
  await expect(stage.locator(".mf-toggle-group").first().locator('[aria-pressed="true"]')).toHaveCount(1);
});

test("checkbox off, partial and checked states have distinct marks and liquid fill", async ({ page }) => {
  await page.goto("/#/components/checkbox");
  const boxes = page.locator(".live-stage .mf-checkbox");
  await expect(boxes).toHaveCount(2);
  await expect(boxes.nth(1)).toHaveAttribute("data-state", "indeterminate");
  await expect(boxes.nth(1).locator('[data-icon-name="minus"]')).toBeVisible();
  await expect(boxes.nth(1).locator('[data-icon-name="check"]')).toBeHidden();
  const fill = boxes.first().locator(".mf-choice-fill");
  const off = await fill.evaluate(el => getComputedStyle(el).clipPath);
  await boxes.first().hover();
  await page.mouse.down();
  await expect(boxes.first()).toHaveAttribute("data-state", "unchecked");
  await expect.poll(() => fill.evaluate(el => getComputedStyle(el).clipPath)).not.toBe(off);
  await page.mouse.up();
  await expect(boxes.first()).toHaveAttribute("data-state", "checked");
  await expect.poll(() => fill.evaluate(el => getComputedStyle(el).clipPath)).not.toBe(off);
  await expect(boxes.nth(1).locator(".mf-choice-fill")).toHaveCSS("clip-path", "circle(0% at 50% 50%)");
  await expect(boxes.first().locator('[data-icon-name="check"]')).toBeVisible();
  await expect(fill).toHaveCSS("border-radius", "0px");
  const colors = await boxes.first().evaluate(el => ({
    ink: getComputedStyle(el.querySelector('[data-icon-name="check"]')!).color,
    fill: getComputedStyle(el.querySelector(".mf-choice-fill")!).backgroundColor,
  }));
  expect(colors.ink).not.toBe(colors.fill);
  await boxes.first().press("Space");
  await expect(boxes.first()).toHaveAttribute("data-state", "unchecked");
});

for (const locale of ["en", "fa"]) {
  test(`radio and switch centers stay aligned at every size in ${locale}`, async ({ page }) => {
    await page.addInitScript(locale => localStorage.setItem("materialfluid.preferences", JSON.stringify({ locale, theme: "dark" })), locale);
    for (const id of ["radio-group", "switch", "checkbox"]) {
      await page.goto(`/#/components/${id}`);
      for (const size of ["sm", "md", "lg"]) {
        await selectSize(page, size);
        const items = page.locator(id === "switch" ? ".live-stage .mf-switch-thumb" : id === "checkbox" ? ".live-stage .mf-checkbox" : ".live-stage .mf-radio");
        await expect(items.first()).toBeVisible();
        for (const item of await items.all()) {
          const delta = await item.evaluate(el => {
            const outer = el.getBoundingClientRect();
            const circle = el.querySelector<SVGCircleElement>(".mf-radio-center");
            if (circle) {
              const center = new DOMPoint(circle.cx.baseVal.value, circle.cy.baseVal.value).matrixTransform(circle.getScreenCTM()!);
              return { x: Math.abs(center.x - outer.x - outer.width / 2), y: Math.abs(center.y - outer.y - outer.height / 2) };
            }
            const inner = (el.querySelector(".mf-animated-icon, .mf-switch-language") ?? el).getBoundingClientRect();
            return { x: Math.abs(inner.x + inner.width / 2 - outer.x - outer.width / 2), y: Math.abs(inner.y + inner.height / 2 - outer.y - outer.height / 2) };
          });
          expect(delta.x).toBeLessThan(0.6);
          expect(delta.y).toBeLessThan(0.6);
        }
      }
      if (id === "radio-group") {
        const selected = page.locator('.live-stage .mf-radio[data-state="checked"] .mf-radio-center').first();
        await expect(selected).toHaveAttribute("r", "6");
        const other = page.locator('.live-stage .mf-radio[value="personal"]').first();
        await other.hover();
        await page.mouse.down();
        await expect.poll(() => other.locator(".mf-radio-center").evaluate(el => Number(el.getAttribute("r")))).toBeGreaterThan(0);
        await page.mouse.up();
        await expect(other).toHaveAttribute("aria-checked", "true");
      }
      if (id === "switch") {
        const button = page.locator(".live-stage .mf-switch").first();
        const thumbColor = await button.locator(".mf-switch-thumb").evaluate(el => getComputedStyle(el).backgroundColor);
        const offTrack = await button.evaluate(el => getComputedStyle(el).backgroundColor);
        await button.click();
        await expect(button).toHaveAttribute("aria-checked", "true");
        await expect(button.locator("[data-icon-name=wifi]")).toBeVisible();
        await expect.poll(() => button.locator(".mf-switch-thumb").evaluate(el => getComputedStyle(el).backgroundColor)).toBe(offTrack);
        await expect.poll(() => button.evaluate(el => getComputedStyle(el).backgroundColor)).toBe(thumbColor);
        await button.press("Space");
        await expect(button).toHaveAttribute("aria-checked", "false");
      }
    }
  });
}

test("sliders support smooth movement and navigation to Text Field stays healthy", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/#/components/slider");
  const slider = page.locator(".live-stage .mf-slider").first();
  const thumb = slider.getByRole("slider");
  const handleStyle = await thumb.evaluate(el => {
    const style = getComputedStyle(el);
    return { width: parseFloat(style.width), height: parseFloat(style.height), border: style.borderTopColor };
  });
  expect(handleStyle.height).toBeGreaterThan(handleStyle.width * 3);
  expect(handleStyle.width).toBeGreaterThanOrEqual(8);
  expect(handleStyle.border).toBe(await slider.locator(".mf-slider-range").evaluate(el => getComputedStyle(el).backgroundColor));
  await expect(slider).toHaveAttribute("data-fluid", "true");
  await thumb.press("ArrowRight");
  await expect(thumb).toHaveAttribute("aria-valuenow", "60.01");
  await thumb.press("End");
  await expect(thumb).toHaveAttribute("aria-valuenow", "100");
  await thumb.press("Home");
  await expect(thumb).toHaveAttribute("aria-valuenow", "0");
  const rect = await slider.boundingBox();
  await page.mouse.move(rect!.x + 2, rect!.y + rect!.height / 2);
  await page.mouse.down();
  await page.mouse.move(rect!.x + rect!.width * 0.63, rect!.y + rect!.height / 2, { steps: 12 });
  await page.mouse.up();
  expect(Number(await thumb.getAttribute("aria-valuenow"))).toBeGreaterThan(55);
  // Pointer tracking is immediate: neither the Radix position wrapper nor range eases behind the input.
  await expect(thumb.locator("..")).toHaveCSS("transition-duration", "0s");
  const stepped = page.locator(".live-stage .mf-slider").nth(1);
  await expect(stepped).toHaveAttribute("data-slider-mode", "stepped");
  const steppedThumb = stepped.getByRole("slider").first();
  await steppedThumb.press("ArrowRight");
  await expect(steppedThumb).toHaveAttribute("aria-valuenow", "60");
  expect(await steppedThumb.locator("..").evaluate(el => parseFloat(getComputedStyle(el).transitionDuration))).toBeGreaterThan(0);
  for (const id of ["toggle", "toggle-group", "checkbox", "radio-group", "switch", "slider", "text-field"]) {
    await page.locator(`a[href="#/components/${id}"]`).first().click();
    await expect(page.locator(".live-stage .demo-primary").first()).toBeVisible();
  }
  await expect(page.locator(".live-stage input").first()).toBeVisible();
  await page.locator(".live-stage input").first().fill("A working field");
  expect(errors).toEqual([]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/components/slider");
  await expect(page.locator(".live-stage .mf-slider").first()).not.toHaveAttribute("data-fluid", "true");
});

test("a failed forms module shows recovery instead of a white screen", async ({ page }) => {
  await page.goto("/#/components/toggle");
  await expect(page.locator(".live-stage .demo-primary")).toBeVisible();
  await page.route("**/src/showcase/demos/forms.tsx*", route => route.abort());
  await page.locator('a[href="#/components/text-field"]').first().click();
  await expect(page.getByRole("button", { name: "Reload example" })).toBeVisible();
  await expect(page.locator(".catalogue-navigation")).toBeVisible();
  await page.unroute("**/src/showcase/demos/forms.tsx*");
  await page.getByRole("button", { name: "Reload example" }).click();
  await expect(page.locator(".live-stage input").first()).toBeVisible();
});

test("Text Field and Textarea stay Outline and spring their horizontal inset on focus", async ({ page }) => {
  for (const id of ["text-field", "textarea"]) {
    await page.goto(`/#/components/${id}`);
    await expect(page.locator(".live-stage .demo-primary")).toHaveCount(1);
    const field = page.locator(".demo-primary .mf-field");
    await expect(field).toHaveClass(/mf-variant--outline/);
    const input = page.locator(id === "textarea" ? ".demo-primary textarea" : ".demo-primary input");
    const surface = id === "textarea" ? input : page.locator(".demo-primary .mf-input-wrap");
    const padding = () => surface.evaluate(el => parseFloat(getComputedStyle(el).paddingLeft));
    const inset = () => page.locator(id === "textarea" ? ".demo-primary textarea" : ".demo-primary .mf-input-value-wrap").evaluate(el => parseFloat(getComputedStyle(el).paddingLeft));
    const resting = await padding();
    expect(resting).toBe(12);
    const rect = await surface.boundingBox();
    const restingInset = await inset();
    await input.focus();
    await input.fill("A focused field");
    await expect.poll(inset).toBeGreaterThan(restingInset + 7);
    expect((await surface.boundingBox())!.width).toBeCloseTo(rect!.width, 1);
    if (id === "textarea") {
      expect(await input.evaluate(el => parseFloat(getComputedStyle(el).paddingTop))).toBeLessThanOrEqual(12);
    }
    await input.blur();
    await expect.poll(padding).toBeLessThan(resting + .1);
  }
});

test("every form page renders one Outline example without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const entry of catalogue.filter(entry => entry.family === "forms")) {
    await page.goto(`/#/components/${entry.id}`);
    const stage = page.locator(".live-stage");
    await expect(stage.locator(".demo-primary")).toHaveCount(1);
    await expect(stage.locator(".mf-field,.mf-calendar-wrap,.mf-otp").first()).toHaveClass(/mf-variant--outline/);
  }
  expect(errors).toEqual([]);
});

test("checkbox tick starts promptly once the rectangle is fully filled", async ({ page }) => {
  await page.goto("/#/components/checkbox");
  await expect(page.locator(".live-stage .mf-checkbox").first()).toBeVisible();
  const frames = await page.evaluate(async () => {
    const button = document.querySelector<HTMLButtonElement>(".live-stage .mf-checkbox")!;
    button.click();
    const start = performance.now();
    const frames: { elapsed: number; ready: boolean; radius: number; opacity: number; tick: number | null }[] = [];
    await new Promise<void>(resolve => {
      function sample() {
        const mark = button.querySelector<HTMLElement>(".mf-checkbox-mark")!;
        const path = mark.querySelector(".mf-checkbox-tick path");
        frames.push({ elapsed: performance.now() - start, ready: mark.dataset.ready === "true", radius: parseFloat(getComputedStyle(button.querySelector(".mf-choice-fill")!).clipPath.replace("circle(", "")), opacity: parseFloat(getComputedStyle(mark).opacity), tick: path ? parseFloat(path.getAttribute("stroke-dasharray") ?? "1") : null });
        if (performance.now() - start < 350) requestAnimationFrame(sample);
        else resolve();
      }
      requestAnimationFrame(sample);
    });
    return frames;
  });
  expect(frames.filter(frame => frame.ready).every(frame => frame.radius >= 70.7)).toBe(true);
  expect(frames.find(frame => frame.ready)!.elapsed).toBeLessThan(250);
  expect(frames.at(-1)!.opacity).toBeGreaterThan(.99);
  expect(frames.some(frame => frame.ready && frame.tick !== null && frame.tick < .95)).toBe(true);
  expect(frames.at(-1)!.tick).toBeGreaterThan(.99);
});

test("Switch anticipates the change on press and commits on release", async ({ page }) => {
  await page.goto("/#/components/switch");
  const button = page.locator(".live-stage .mf-switch").first();
  const x = () => button.locator(".mf-switch-thumb").evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41);
  await button.hover();
  await page.mouse.down();
  await expect(button).toHaveAttribute("aria-checked", "false");
  await expect.poll(x).toBeGreaterThan(1);
  expect(await x()).toBeLessThan(10);
  await page.mouse.up();
  await expect(button).toHaveAttribute("aria-checked", "true");
  await expect.poll(x).toBeGreaterThan(19.9);
  await page.mouse.down();
  await expect(button).toHaveAttribute("aria-checked", "true");
  await expect.poll(x).toBeLessThan(19);
  expect(await x()).toBeGreaterThan(10);
  await page.mouse.up();
  await expect(button).toHaveAttribute("aria-checked", "false");
  await expect.poll(x).toBeLessThan(.1);
});

test("slider handles appear at their initial values without load animation", async ({ page }) => {
  await page.addInitScript(() => {
    const probe = { initialTransition: "", frames: [] as number[] };
    Object.defineProperty(window, "sliderLoadProbe", { value: probe });
    const observer = new MutationObserver(() => {
      const slider = document.querySelector('.live-stage .mf-slider[data-slider-mode="stepped"]');
      const thumb = slider?.querySelector('[role="slider"]');
      if (!thumb) return;
      observer.disconnect();
      probe.initialTransition = getComputedStyle(thumb.parentElement!).transitionDuration;
      const start = performance.now();
      const sample = () => {
        probe.frames.push(thumb.getBoundingClientRect().x);
        if (performance.now() - start < 300) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    observer.observe(document, { childList: true, subtree: true });
  });
  await page.goto("/#/components/slider");
  await page.waitForTimeout(400);
  const probe = await page.evaluate(() => (window as unknown as { sliderLoadProbe: { initialTransition: string; frames: number[] } }).sliderLoadProbe);
  expect(probe.initialTransition).toBe("0s");
  expect(probe.frames.length).toBeGreaterThan(3);
  expect(Math.max(...probe.frames) - Math.min(...probe.frames)).toBeLessThan(.6);
});

test("dense Advanced sliders track directly while preserving numeric increments", async ({ page }) => {
  await page.goto("/#/components/toggle");
  await page.locator(".advanced-tuning-trigger").click();
  const thumb = page.getByRole("slider", { name: "Text morph duration (ms)", exact: true });
  const slider = page.locator(".mf-slider").filter({ has: thumb });
  await expect(slider).toHaveAttribute("data-snap-motion", "false");
  await expect(thumb.locator("..")).toHaveCSS("transition-duration", "0s");
  await thumb.press("ArrowRight");
  await expect(thumb).toHaveAttribute("aria-valuenow", "110");
  const rect = (await slider.boundingBox())!;
  await page.mouse.move(rect.x + rect.width * .3, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width * .7, rect.y + rect.height / 2, { steps: 10 });
  await page.mouse.up();
  const value = Number(await thumb.getAttribute("aria-valuenow"));
  expect(value).toBeGreaterThan(350);
  expect((value - 100) % 10).toBe(0);
});

test("snap animation adapts to available width without changing the value or step", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/#/components/slider");
  const slider = page.locator(".live-stage .mf-slider").nth(2);
  const thumb = slider.getByRole("slider").first();
  await expect(slider).toHaveAttribute("data-snap-motion", "true");
  await thumb.press("ArrowRight");
  await expect(thumb).toHaveAttribute("aria-valuenow", "30");
  await page.setViewportSize({ width: 320, height: 900 });
  await expect(slider).toHaveAttribute("data-snap-motion", "false");
  await expect(thumb.locator("..")).toHaveCSS("transition-duration", "0s");
  await expect(thumb).toHaveAttribute("aria-valuenow", "30");
  await thumb.press("ArrowRight");
  await expect(thumb).toHaveAttribute("aria-valuenow", "35");
  await page.setViewportSize({ width: 1440, height: 1100 });
  await expect(slider).toHaveAttribute("data-snap-motion", "true");
  await expect(thumb).toHaveAttribute("aria-valuenow", "35");
});
