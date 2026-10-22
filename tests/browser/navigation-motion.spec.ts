import { test, expect } from "@playwright/test";

for (const [route, scope, target] of [
  ["tabs", ".mf-tab-list", "Projects"],
  ["navigation-rail", ".mf-navigation", "Projects"],
  ["side-navigation", ".mf-navigation", "Projects"],
  
  ["pagination", ".mf-pagination", "Page 4"],
  ["stepper", ".mf-stepper", "Finish"],
]) {
  test(`${route} carries the selected pill between items without dragging`, async ({ page }) => {
    await page.goto(`/#/components/${route}`);
    const nav = page.locator(`.demo-primary ${scope}`);
    await expect(nav.locator(".mf-selection")).toBeVisible();
    const frames = nav.evaluate(async element => {
      const samples: number[] = [];
      const start = performance.now();
      while (performance.now() - start < 700) {
        const pill = element.querySelector(".mf-selection");
        if (pill) { const rect = pill.getBoundingClientRect(); samples.push(rect.x + rect.y); }
        await new Promise(requestAnimationFrame);
      }
      return samples;
    });
    const item = nav.getByRole(route === "tabs" ? "tab" : "button", { name: target, exact: route !== "stepper" });
    await item.click();
    if (route === "tabs") await expect(item).toHaveAttribute("aria-selected", "true");
    else await expect(item).toHaveAttribute("aria-current", route === "stepper" ? "step" : "page");
    expect(new Set((await frames).map(value => value.toFixed(1))).size).toBeGreaterThan(3);
    const box = await item.boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x - 60, box!.y - 40, { steps: 5 });
    await page.mouse.up();
    if (route === "tabs") await expect(item).toHaveAttribute("aria-selected", "true");
    else await expect(item).toHaveAttribute("aria-current", route === "stepper" ? "step" : "page");
  });
}

test("showcase uses kit fields, Toggle and navigation", async ({page}) => {
  await page.goto("/");
  await expect(page.locator(".nav-search .mf-input-wrap")).toBeVisible();
  await expect(page.locator("#component-size")).toHaveAttribute("role","combobox");
  await expect(page.getByRole("button",{name:"Fluid",exact:true})).toHaveClass(/mf-toggle/);
  await expect(page.locator(".page-sections .mf-selection")).toBeVisible();
  await expect(page.locator(".catalogue-nav-list").first()).toHaveClass(/mf-navigation--side/);
  await page.getByRole("button",{name:"Fluid",exact:true}).click();
  await expect(page.getByRole("button",{name:"Minimal",exact:true})).toHaveClass(/mf-variant--outline/);
  await expect(page.locator(".mf-root")).toHaveAttribute("data-motion","minimal");
});

test("tabs stay compact and rounded, pagination has readable selected ink, and the shell is Ghost", async ({page}) => {
  await page.goto("/#/components/tabs");
  const list = page.locator(".demo-primary .mf-tab-list");
  await expect(list).toHaveCSS("border-radius", "999px");
  const widths = await list.evaluate(el => ({list: el.getBoundingClientRect().width, parent: el.parentElement!.getBoundingClientRect().width}));
  expect(widths.list).toBeLessThan(widths.parent);
  await expect(page.locator(".showcase-topbar")).toHaveClass(/mf-variant--ghost/);
  await expect(page.locator(".showcase-topbar")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await page.goto("/#/components/pagination");
  const selected = page.locator('.demo-primary [aria-current="page"]');
  const colors = await selected.evaluate(el => ({ink: getComputedStyle(el).color, fill: getComputedStyle(el.querySelector('.mf-selection')!).backgroundColor}));
  expect(colors.ink).not.toBe(colors.fill);
  await expect(page.locator('.catalogue-link[href$="bottom-navigation"]')).toHaveCount(0);
});

test("TOC jumps to its document sections and menu anchors stay stationary during a hold", async ({page}) => {
  await page.goto("/#/components/table-of-contents");
  await page.locator(".demo-primary .mf-navigation--toc").getByRole("button", {name:"Settings"}).click();
  await expect.poll(() => page.locator("#toc-demo-settings").evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(350);
  await page.goto("/#/components/menu");
  const trigger = page.locator(".demo-primary button").filter({hasText:"Actions"});
  await expect(trigger).toHaveClass(/mf-variant--primary/);
  await page.waitForTimeout(500);
  const before = await trigger.boundingBox();
  await trigger.hover();
  await page.mouse.down();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.waitForTimeout(400);
  const held = await trigger.boundingBox();
  expect(held!.width).toBeCloseTo(before!.width, 1);
  expect(held!.height).toBeCloseTo(before!.height, 1);
  await page.mouse.up();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
});
