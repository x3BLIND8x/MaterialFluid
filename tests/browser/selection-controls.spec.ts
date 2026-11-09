import { selectSize } from "./helpers";
import { test, expect, type Locator } from "@playwright/test";
import { catalogue } from "../../src/showcase/catalogue";

test("slider outlines follow keyboard focus and stay hidden after mouse release", async ({ page }) => {
  await page.goto("/#/components/slider");
  const slider = page.locator(".live-stage .mf-slider").first();
  const thumb = slider.getByRole("slider");
  const handle = thumb.locator(".mf-slider-handle");
  await thumb.click();
  await expect(thumb).toBeFocused();
  await expect(handle).toHaveCSS("outline-style", "none");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(thumb).toBeFocused();
  await expect(handle).toHaveCSS("outline-style", "solid");
  // A mouse selection must also clear an existing keyboard focus ring.
  await thumb.click();
  await expect(handle).toHaveCSS("outline-style", "none");
  const track = (await slider.locator(".mf-slider-track").boundingBox())!;
  await page.mouse.click(track.x + track.width * .34, track.y + track.height / 2);
  await expect(thumb).toBeFocused();
  await expect(handle).toHaveCSS("outline-style", "none");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(handle).toHaveCSS("outline-style", "solid");
});

test("track clicks spring toward the pointer and keep animating after a quick release", async ({ page }) => {
  for (const locale of ["en", "fa"]) {
    await page.goto("/#/components/slider");
    await page.evaluate(locale => localStorage.setItem("materialfluid.preferences", JSON.stringify({ locale, motion: "expressive" })), locale);
    await page.reload();
    for (const index of [0, 1]) {
      const slider = page.locator(".live-stage .mf-slider").nth(index);
      const thumb = slider.getByRole("slider");
      const track = (await slider.locator(".mf-slider-track").boundingBox())!;
      for (const quickRelease of [false, true]) {
        const x = track.x + track.width * (quickRelease ? .22 : .82);
        await page.mouse.move(x, track.y + track.height / 2);
        // Record from pointer-down so automation overhead cannot consume the spring.
        await thumb.evaluate(el => {
          (el as HTMLElement & { __mfTrackRecording?: Promise<number[]> }).__mfTrackRecording = new Promise<number[]>(resolve => {
          document.addEventListener("pointerdown", () => {
            const positions = [el.getBoundingClientRect().x];
            const frame = () => {
              positions.push(el.getBoundingClientRect().x);
              if (positions.length < 22) requestAnimationFrame(frame);
              else resolve(positions);
            };
            requestAnimationFrame(frame);
          }, { once: true, capture: true });
          });
        });
        await page.mouse.down();
        if (quickRelease) await page.mouse.up();
        const frames = await thumb.evaluate(el => (el as HTMLElement & { __mfTrackRecording?: Promise<number[]> }).__mfTrackRecording!);
        expect(new Set(frames.map(x => x.toFixed(2))).size).toBeGreaterThan(5);
        if (!quickRelease) await page.mouse.up();
        await expect(slider).not.toHaveAttribute("data-pointer-motion", "true");
        const value = Number(await thumb.getAttribute("aria-valuenow"));
        const expectedX = track.x + track.width * (locale === "fa" ? 1 - value / 100 : value / 100);
        const bounds = (await thumb.boundingBox())!;
        expect(Math.abs(bounds.x + bounds.width / 2 - expectedX)).toBeLessThan(1);
        await expect(thumb.locator(".mf-slider-handle")).toHaveCSS("outline-style", "none");
      }
    }
  }
});

test("held arrow keys keep slider movement and pressed-handle animation active", async ({ page }) => {
  await page.goto("/#/components/slider");
  const slider = page.locator(".live-stage .mf-slider").nth(1);
  const thumb = slider.getByRole("slider");
  const handle = thumb.locator(".mf-slider-handle");
  await thumb.focus();
  await page.keyboard.down("ArrowRight");
  await expect(thumb).toHaveAttribute("aria-valuenow", "60");
  await expect(slider).toHaveAttribute("data-key-held", "true");
  await expect.poll(() => handle.evaluate(el => parseFloat(getComputedStyle(el).width))).toBeLessThan(3);
  for (const value of [70, 80, 90]) {
    const before = (await thumb.boundingBox())!.x;
    await page.keyboard.down("ArrowRight");
    await expect(thumb).toHaveAttribute("aria-valuenow", String(value));
    await expect(slider).toHaveAttribute("data-key-held", "true");
    await expect.poll(async () => (await thumb.boundingBox())!.x).toBeGreaterThan(before + 1);
    expect(await thumb.locator("..").evaluate(el => parseFloat(getComputedStyle(el).transitionDuration))).toBeGreaterThan(0);
  }
  await page.keyboard.up("ArrowRight");
  await expect(slider).not.toHaveAttribute("data-key-held", "true");
  await expect(handle).toHaveCSS("width", "4px");
});

test("held sliders follow a continuous spring and settle to steps in LTR and RTL", async ({ page }) => {
  for (const locale of ["en", "fa"]) {
    await page.goto("/#/components/slider");
    await page.evaluate(locale => localStorage.setItem("materialfluid.preferences", JSON.stringify({ locale, motion: "expressive" })), locale);
    await page.reload();
    for (const index of [0, 1]) {
      const slider = page.locator(".live-stage .mf-slider").nth(index);
      const thumb = slider.getByRole("slider");
      await thumb.hover();
      await page.mouse.down();
      const track = (await slider.locator(".mf-slider-track").boundingBox())!;
      for (const fraction of [.14, .83, .37]) {
        const x = track.x + track.width * fraction;
        await page.mouse.move(x, track.y + track.height / 2);
        const frames = await thumb.evaluate(async (el, rtl) => {
          const samples: { x: number; gapError: number }[] = [];
          for (let i = 0; i < 35; i++) {
            const bounds = el.getBoundingClientRect();
            const center = bounds.x + bounds.width / 2;
            const segment = el.closest(".mf-slider")!.querySelector(".mf-slider-segment")!.getBoundingClientRect();
            samples.push({ x: center, gapError: Math.abs(center - (rtl ? segment.left : segment.right)) });
            await new Promise(requestAnimationFrame);
          }
          return samples;
        }, locale === "fa");
        expect(new Set(frames.map(frame => frame.x.toFixed(2))).size).toBeGreaterThan(5);
        expect(Math.max(...frames.map(frame => frame.gapError))).toBeLessThan(1);
        await expect.poll(async () => {
          const bounds = (await thumb.boundingBox())!;
          return Math.abs(bounds.x + bounds.width / 2 - x);
        }).toBeLessThan(1);
      }
      await expect(slider.locator(".mf-slider-value")).toHaveCount(0);
      await expect(thumb).toHaveCSS("box-shadow", "none");
      await expect(thumb.locator(".mf-slider-handle")).toHaveCSS("outline-style", "none");
      const releaseX = track.x + track.width * .64;
      await page.mouse.move(releaseX, track.y + track.height / 2);
      await page.mouse.up();
      if (index === 1) {
        const frames = await thumb.evaluate(async el => {
          const positions = [el.getBoundingClientRect().x];
          for (let i = 0; i < 30; i++) {
            await new Promise(requestAnimationFrame);
            positions.push(el.getBoundingClientRect().x);
          }
          return positions;
        });
        expect(new Set(frames.map(x => x.toFixed(2))).size).toBeGreaterThan(5);
      }
      const value = Number(await thumb.getAttribute("aria-valuenow"));
      const targetX = track.x + track.width * (locale === "fa" ? 1 - value / 100 : value / 100);
      await expect.poll(async () => {
        const bounds = (await thumb.boundingBox())!;
        return Math.abs(bounds.x + bounds.width / 2 - targetX);
      }).toBeLessThan(1);
      await expect(slider).not.toHaveAttribute("data-pointer-motion", "true");
    }
  }
});

test("range slider press feedback affects only the held handle and its gaps", async ({ page }) => {
  for (const locale of ["en", "fa"]) {
    await page.goto("/#/components/slider");
    await page.evaluate(locale => localStorage.setItem("materialfluid.preferences", JSON.stringify({ locale, motion: "expressive" })), locale);
    await page.reload();
    const slider = page.locator(".live-stage .mf-slider").nth(2);
    for (const index of [0, 1, 0]) {
      const held = slider.getByRole("slider").nth(index);
      await held.hover();
      await page.mouse.down();
      const samples = await slider.evaluate(async (el, inactive) => {
        const frames: { width: number; gaps: number[] }[] = [];
        for (let i = 0; i < 15; i++) {
          const handle = el.querySelectorAll(".mf-slider-handle")[inactive].getBoundingClientRect();
          const center = handle.x + handle.width / 2;
          const pieces = Array.from(el.querySelectorAll(".mf-slider-piece")).map(piece => piece.getBoundingClientRect());
          frames.push({ width: handle.width, gaps: [center - Math.max(...pieces.filter(piece => piece.right < center).map(piece => piece.right)), Math.min(...pieces.filter(piece => piece.left > center).map(piece => piece.left)) - center] });
          await new Promise(requestAnimationFrame);
        }
        return frames;
      }, 1 - index);
      for (const sample of samples) {
        expect(sample.width).toBeCloseTo(4, 1);
        for (const gap of sample.gaps) expect(gap).toBeCloseTo(8, 1);
      }
      await expect(held).toHaveAttribute("data-pressed", "true");
      await expect.poll(() => held.locator(".mf-slider-handle").evaluate(el => parseFloat(getComputedStyle(el).width))).toBeLessThan(3);
      await page.mouse.up();
    }
  }
});

test("slider full and empty corner rounding animates in both directions", async ({ page }) => {
  for (const locale of ["en", "fa"]) {
    await page.goto("/#/components/slider");
    await page.evaluate(locale => localStorage.setItem("materialfluid.preferences", JSON.stringify({ locale, motion: "expressive" })), locale);
    await page.reload();
    const slider = page.locator(".live-stage .mf-slider").first();
    const thumb = slider.getByRole("slider");
    await expect(slider).toHaveAttribute("data-position-ready", "true");
    for (const key of ["End", "Home", "End"]) {
      const piece = slider.locator(key === "End" ? ".mf-slider-range > .mf-slider-piece" : ".mf-slider-segment:last-child > .mf-slider-piece");
      await thumb.focus();
      const samples = await piece.evaluate(async (el, { key, side }) => {
        const radii: number[] = [parseFloat(getComputedStyle(el).getPropertyValue(side))];
        // Start capture with the input so driver scheduling cannot miss the transition.
        const thumb = el.closest(".mf-slider")!.querySelector('[role="slider"]')!;
        thumb.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
        thumb.dispatchEvent(new KeyboardEvent("keyup", { key, bubbles: true }));
        for (let i = 0; i < 25; i++) {
          await new Promise(requestAnimationFrame);
          radii.push(parseFloat(getComputedStyle(el).getPropertyValue(side)));
        }
        return radii;
      }, { key, side: (key === "End") === (locale === "en") ? "border-top-right-radius" : "border-top-left-radius" });
      expect(new Set(samples.map(radius => radius.toFixed(2))).size).toBeGreaterThan(4);
      expect(samples.some(radius => radius > 2.1 && radius < 7.9)).toBe(true);
      await expect(piece).toHaveCSS((key === "End") === (locale === "en") ? "border-top-right-radius" : "border-top-left-radius", "8px");
    }
  }
});

test("slider tracks keep gaps and rounded full or empty ends at every size", async ({ page }) => {
  for (const locale of ["en", "fa"]) {
    await page.goto("/#/components/slider");
    await page.evaluate(locale => localStorage.setItem("materialfluid.preferences", JSON.stringify({ locale, motion: "minimal" })), locale);
    await page.reload();
    for (const size of ["sm", "md", "lg"]) {
      await selectSize(page, size);
      const slider = page.locator(".live-stage .mf-slider").first();
      const thumb = slider.getByRole("slider");
      await expect(thumb).toHaveCSS("width", "44px");
      for (const key of ["Home", "End"]) {
        await thumb.press(key);
        const corners = await slider.locator(".mf-slider-piece").evaluateAll(pieces => pieces.filter(piece => piece.getBoundingClientRect().width > 1).map(piece => {
          const css = getComputedStyle(piece);
          const expected = piece.getBoundingClientRect().height / 2;
          return [css.borderTopLeftRadius, css.borderTopRightRadius, css.borderBottomLeftRadius, css.borderBottomRightRadius].map(radius => Math.abs(parseFloat(radius) - expected));
        }));
        expect(corners).toHaveLength(1);
        for (const error of corners.flat()) expect(error).toBeLessThan(.1);
      }
      await thumb.press("Home");
      await thumb.press("PageUp");
      const gapChecks = await page.locator(".live-stage .mf-slider").evaluateAll(sliders => sliders.map(slider => {
        const handles = Array.from(slider.querySelectorAll(".mf-slider-handle")).map(handle => handle.getBoundingClientRect());
        return Array.from(slider.querySelectorAll(".mf-slider-piece")).filter(piece => piece.getBoundingClientRect().width > 1).every(piece => {
          const rect = piece.getBoundingClientRect();
          return handles.every(handle => rect.right <= handle.left - 1 || rect.left >= handle.right + 1);
        });
      }));
      expect(gapChecks.every(Boolean)).toBe(true);
    }
  }
});

async function expectOuterPress(control: Locator) {
  const scale = () => control.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a);
  await expect.poll(scale).toBeLessThan(.99);
}

test("checkbox and radio control presses animate and select while captions remain passive", async ({ page }) => {
  for (const route of ["checkbox", "radio-group"]) {
    await page.goto(`/#/components/${route}`);
    const control = page.locator(`.live-stage .${route === "checkbox" ? "mf-checkbox" : "mf-radio"}`).first();
    const labelText = control.locator("..").locator(":scope > span");
    let expectedChecked = await control.getAttribute("aria-checked") === "true";
    for (let repeat = 0; repeat < 2; repeat++) {
      await labelText.click();
      await expect(control).toHaveAttribute("aria-checked", String(expectedChecked));
      await control.hover();
      await page.mouse.down();
      await expectOuterPress(control);
      await page.mouse.up();
      expectedChecked = route === "radio-group" || !expectedChecked;
      await expect(control).toHaveAttribute("aria-checked", String(expectedChecked));
      await expect.poll(() => control.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a)).toBeCloseTo(1, 3);
    }
  }
});

test("radio preview keeps the previous dot visible and the pressed dot below active size", async ({ page }) => {
  await page.goto("/#/components/radio-group");
  const radios = page.locator(".live-stage .mf-radio-group").first().locator(".mf-radio");
  const selected = radios.nth(1);
  const other = radios.nth(0);
  const dot = selected.locator(".mf-radio-center");
  await expect(dot).toHaveAttribute("r", "6");
  await other.hover();
  await page.mouse.down();
  await expectOuterPress(other);
  await expect.poll(() => dot.evaluate(el => Number(el.getAttribute("r")))).toBeLessThan(5.8);
  expect(await dot.evaluate(el => Number(el.getAttribute("r")))).toBeGreaterThan(5);
  await expect.poll(() => other.locator(".mf-radio-center").evaluate(el => Number(el.getAttribute("r")))).toBeCloseTo(4.2, 1);
  expect(await selected.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a)).toBeGreaterThan(.93);
  await page.mouse.up();
  await expect(other).toHaveAttribute("aria-checked", "true");
  await expect.poll(() => dot.evaluate(el => Number(el.getAttribute("r")))).toBeLessThan(.05);
  await expect.poll(() => other.locator(".mf-radio-center").evaluate(el => Number(el.getAttribute("r")))).toBeCloseTo(6, 2);
  await other.hover();
  await page.mouse.down();
  await expect.poll(() => other.locator(".mf-radio-center").evaluate(el => Number(el.getAttribute("r")))).toBeCloseTo(4.2, 1);
  await page.mouse.up();
});

test("quick repeated clicks finish a visible outer spring after release", async ({ page }) => {
  for (const route of ["checkbox", "radio-group"]) {
    await page.goto(`/#/components/${route}`);
    const control = page.locator(`.live-stage .${route === "checkbox" ? "mf-checkbox" : "mf-radio"}`).first();
    for (let repeat = 0; repeat < 2; repeat++) {
      await control.evaluate(element => {
        const frames: number[] = [];
        Object.assign(window, { outerFrames: frames });
        element.addEventListener("pointerup", () => {
          const sample = () => {
            frames.push(new DOMMatrixReadOnly(getComputedStyle(element).transform).a);
            if (frames.length < 60) requestAnimationFrame(sample);
          };
          requestAnimationFrame(sample);
        }, { once: true });
      });
      await control.click({ delay: 10 });
      await expect.poll(() => page.evaluate(() => (window as unknown as { outerFrames: number[] }).outerFrames.length)).toBe(60);
      const frames = await page.evaluate(() => (window as unknown as { outerFrames: number[] }).outerFrames);
      expect(Math.min(...frames)).toBeLessThan(route === "radio-group" ? .98 : .91);
      if (route === "radio-group") expect(Math.max(...frames)).toBeLessThanOrEqual(1);
      expect(new Set(frames.map(value => value.toFixed(3))).size).toBeGreaterThan(8);
      await expect.poll(() => control.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a)).toBeCloseTo(1, 3);
    }
  }
});

test("checkbox and radio outer shapes spring on press and respect reduced motion", async ({ page }) => {
  for (const route of ["checkbox", "radio-group"]) {
    await page.goto(`/#/components/${route}`);
    const controls = page.locator(`.live-stage .${route === "checkbox" ? "mf-checkbox" : "mf-radio"}`);
    for (const index of [0, 0, 0, 1, 1, 1]) {
      const control = controls.nth(index);
      const radius = await control.evaluate(el => getComputedStyle(el).borderRadius);
      await control.hover();
      await page.mouse.down();
      await expectOuterPress(control);
      await expect.poll(async()=>Math.abs(parseFloat(await control.evaluate(el=>getComputedStyle(el).borderRadius))-parseFloat(radius))).toBeLessThan(.1);
      await page.mouse.up();
      await expect.poll(() => control.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a)).toBeCloseTo(1, 3);
    }
    await controls.first().focus();
    await page.keyboard.down("Space");
    await expectOuterPress(controls.first());
    await page.keyboard.up("Space");
    await expect.poll(() => controls.first().evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a)).toBeCloseTo(1, 3);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await controls.first().hover();
    await page.mouse.down();
    await expect(controls.first()).toHaveCSS("transform", "none");
    await page.mouse.up();
    await page.emulateMedia({ reducedMotion: "no-preference" });
  }
});

test("indeterminate checkbox draws its minus stroke", async ({ page }) => {
  await page.addInitScript(() => {
    const samples: number[] = [];
    Object.assign(window, { minusSamples: samples });
    const sample = () => {
      const path = document.querySelector(".live-stage .mf-checkbox-minus path");
      if (path) samples.push(parseFloat(path.getAttribute("stroke-dasharray") ?? "0"));
      if (samples.length < 30) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await page.goto("/#/components/checkbox");
  await expect(page.locator(".live-stage .mf-checkbox-minus path")).toHaveAttribute("stroke-dasharray", "1 1");
  const samples = await page.evaluate(() => (window as unknown as { minusSamples: number[] }).minusSamples);
  expect(samples.some(value => value > 0 && value < 1)).toBe(true);
});

test("Free slider wheel glides and pointer press animates while reduced motion stays immediate", async ({ page }) => {
  await page.goto("/#/components/slider");
  const slider = page.locator(".live-stage .mf-slider").first();
  const thumb = slider.getByRole("slider");
  await expect(slider).toHaveAttribute("data-position-ready", "true");
  await expect(thumb.locator("..")).toHaveCSS("transition-duration", "0s");
  const frames = await thumb.evaluate(async element => {
    const positions = [element.getBoundingClientRect().x];
    element.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, bubbles: true, cancelable: true }));
    for (let i = 0; i < 14; i++) {
      await new Promise(requestAnimationFrame);
      positions.push(element.getBoundingClientRect().x);
    }
    return positions;
  });
  await expect(thumb).toHaveAttribute("aria-valuenow", "65");
  expect(new Set(frames.map(x => x.toFixed(2))).size).toBeGreaterThan(3);
  expect(frames.some(x => x > frames[0] + .1 && x < frames.at(-1)! - .1)).toBe(true);
  await expect(thumb.locator("..")).toHaveCSS("transition-duration", "0s");
  await thumb.hover();
  await page.mouse.wheel(0, -100);
  await page.mouse.down();
  await expect(thumb.locator("..")).toHaveCSS("transition-duration", "0s");
  await expect.poll(() => thumb.locator(".mf-slider-handle").evaluate(el => parseFloat(getComputedStyle(el).width))).toBeLessThan(3);
  await page.mouse.up();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(slider).not.toHaveAttribute("data-fluid", "true");
  await thumb.hover();
  await page.mouse.wheel(0, -100);
  await expect(thumb.locator("..")).toHaveCSS("transition-duration", "0s");
});

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
  await expect(stage.locator(".mf-toggle-group").first().locator(".mf-selection")).toBeVisible();
  const fill = await stage.locator(".mf-toggle-group").first().locator(".mf-selection").evaluate(el => getComputedStyle(el).backgroundColor);
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
  await expect(boxes.nth(1).locator(".mf-choice-fill")).toHaveCSS("clip-path", "circle(75% at 50% 50%)");
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
        const expected = await button.evaluate(el => { const color=(name:string)=>{const probe=document.createElement("span");probe.style.background=`var(--mf-${name})`;el.append(probe);const result=getComputedStyle(probe).backgroundColor;probe.remove();return result;};return {track:color("primary"),thumb:color("outline-surface")}; });
        await button.click();
        await expect(button).toHaveAttribute("aria-checked", "true");
        await expect(button.locator("[data-icon-name=wifi]")).toBeVisible();
        await expect.poll(() => button.locator(".mf-switch-thumb").evaluate(el => getComputedStyle(el).backgroundColor)).toBe(expected.thumb);
        await expect.poll(() => button.evaluate(el => getComputedStyle(el).backgroundColor)).toBe(expected.track);
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
  const handleStyle = await thumb.locator(".mf-slider-handle").evaluate(el => {
    const style = getComputedStyle(el);
    return { width: parseFloat(style.width), height: parseFloat(style.height), fill: style.backgroundColor };
  });
  expect(handleStyle.height).toBeGreaterThan(handleStyle.width * 3);
  expect(handleStyle.width).toBe(4);
  expect(handleStyle.fill).toBe(await slider.locator(".mf-slider-range > .mf-slider-piece").evaluate(el => getComputedStyle(el).backgroundColor));
  await expect(thumb).toHaveCSS("width", "44px");
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
  // The release animation completes before pointer-only easing is removed.
  await expect(thumb.locator("..")).toHaveCSS("transition-duration", "0s");
  const stepped = page.locator(".live-stage .mf-slider").nth(1);
  await expect(stepped).toHaveAttribute("data-slider-mode", "stepped");
  const steppedThumb = stepped.getByRole("slider").first();
  await steppedThumb.press("ArrowRight");
  await expect(steppedThumb).toHaveAttribute("aria-valuenow", "60");
  expect(await steppedThumb.locator("..").evaluate(el => parseFloat(getComputedStyle(el).transitionDuration))).toBeGreaterThan(0);
  for (const id of ["button", "icon-button", "checkbox", "radio-group", "switch", "slider", "text-field"]) {
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

test("dense playground sliders preserve numeric increments with expressive pointer motion", async ({ page }) => {
  await page.goto("/#/motion");
  await page.locator(".motion-example-picker").getByRole("button", { name: "Button press & ripple", exact: true }).click();
  const thumb = page.getByRole("slider", { name: "Stiffness", exact: true });
  const slider = page.locator(".mf-slider").filter({ has: thumb });
  await expect(slider).toHaveAttribute("data-snap-motion", "false");
  await expect(thumb.locator("..")).toHaveCSS("transition-duration", "0s");
  await thumb.press("ArrowRight");
  await expect(thumb).toHaveAttribute("aria-valuenow", "705");
  const rect = (await slider.boundingBox())!;
  await page.mouse.move(rect.x + rect.width * .3, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width * .7, rect.y + rect.height / 2, { steps: 10 });
  await page.mouse.up();
  const value = Number(await thumb.getAttribute("aria-valuenow"));
  expect(value).toBeGreaterThan(350);
  expect((value - 20) % 5).toBe(0);
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
