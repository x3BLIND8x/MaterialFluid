import { test, expect } from "@playwright/test";

test("action color adjustments persist and reset without changing other roles", async ({page}) => {
  await page.addInitScript(()=>{if(!localStorage.getItem("materialfluid.preferences"))localStorage.setItem("materialfluid.preferences",JSON.stringify({colorPreset:"standard",theme:"light"}));});
  await page.goto("/#/components/button");
  const button = page.locator(".demo-primary .mf-button.mf-variant--filled");
  const read = () => button.evaluate(el => getComputedStyle(el).backgroundColor);
  const original = await read();
  await page.getByRole("button", {name:"Showcase preferences", exact:true}).click();
  await page.locator(".action-color-settings > summary").click();
  const group = page.locator(".action-color-group").filter({has:page.locator("summary", {hasText:/^Filled$/})});
  await group.locator(":scope > summary").click();
  const adjustment = group.getByRole("slider", {name:"Light brightness adjustment",exact:true});
  await adjustment.focus();await page.keyboard.press("End");
  await expect.poll(read).not.toBe(original);
  const tuned = await button.evaluate(el => { const probe=document.createElement("span");probe.style.background="var(--mf-variant-fill)";el.append(probe);const color=getComputedStyle(probe).backgroundColor;probe.remove();return color; });
  await expect.poll(read).toBe(tuned);await page.reload();await expect.poll(read).toBe(tuned);
  await page.getByRole("button", {name:"Showcase preferences",exact:true}).click();
  await page.getByRole("button", {name:"Reset colors",exact:true}).click();
  await expect.poll(read).toBe(original);
});

test("accent selection is hue-only, persists, and resets to the original gold", async ({page}) => {
  await page.goto("/#/components/button");
  const seed=()=>page.locator(".mf-root").evaluate(el=>getComputedStyle(el).getPropertyValue("--mf-accent-seed").trim());
  await page.getByRole("button", {name:"Showcase preferences",exact:true}).click();
  const hue=page.getByRole("slider",{name:"Accent hue",exact:true});
  await hue.focus();await page.keyboard.press("Home");await expect.poll(seed).toBe("#ee9696");
  await page.keyboard.press("ArrowRight");await expect.poll(seed).toBe("#ee9796");
  await page.reload();await expect.poll(seed).toBe("#ee9796");
  await page.getByRole("button", {name:"Showcase preferences",exact:true}).click();
  await page.locator(".accent-control").getByRole("button",{name:"Reset",exact:true}).click();
  await expect.poll(seed).toBe("#eedd96");
});

for(const theme of ["light","dark"]) test(`Material selections use shared primary roles (${theme})`,async({page})=>{
  await page.goto("/");await page.evaluate(theme=>localStorage.setItem("materialfluid.preferences",JSON.stringify({theme})),theme);await page.reload();
  for(const [route,selector] of [["checkbox",'.mf-checkbox[data-state="checked"] .mf-choice-fill'],["switch",'.mf-switch[data-state="checked"]'],["slider",'.mf-slider-range > .mf-slider-piece'],["progress",'.mf-progress-fill'],["calendar",'.rdp-selected .rdp-day_button']]){
    await page.goto(`/#/components/${route}`);const demo=page.locator(".demo-primary");
    if(route==="checkbox")await demo.getByRole("checkbox").first().click();
    if(route==="switch")await demo.getByRole("switch").first().click();
    const component=demo.locator(selector).first();await expect(component).toBeVisible();
    await expect.poll(()=>component.evaluate(el=>{const probe=document.createElement("span");probe.style.background="var(--mf-primary)";el.append(probe);const matches=(el instanceof SVGElement ? getComputedStyle(el).stroke : getComputedStyle(el).backgroundColor)===getComputedStyle(probe).backgroundColor;probe.remove();return matches;})).toBe(true);
  }
});

test("mobile Persian palette controls scroll, mirror and keep values clear of labels", async ({
  page,
}) => {
  await page.addInitScript(()=>{if(!localStorage.getItem("materialfluid.preferences"))localStorage.setItem("materialfluid.preferences",JSON.stringify({colorPreset:"standard"}));});
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/components/button");
  await page.getByRole("button", { name: "More options" }).click();
  await page
    .getByRole("button", { name: "Switch to Persian", exact: true })
    .click();
  await page
    .getByRole("button", { name: "ترجیحات نمایش", exact: true })
    .click();
  const brightness = page.getByRole("slider", {
    name: "اشباع رنگ اصلی",
    exact: true,
  });
  await brightness.focus();
  await page.keyboard.press("End");
  await expect(brightness).toHaveAttribute("aria-valuenow", "200");
  const contrast = page.getByRole("slider", { name: "کنتراست", exact: true });
  await contrast.focus();
  await page.keyboard.press("End");
  await expect(contrast).toHaveAttribute("aria-valuenow", "100");
  const row = page.locator(".color-setting:visible").last();
  const clear = await row.evaluate((el) => {
    const label = el
      .querySelector(".mf-field-heading")!
      .getBoundingClientRect();
    const output = el.querySelector("output")!.getBoundingClientRect();
    return {
      outputLeft: output.left,
      labelRight: label.right,
      rowRight: el.getBoundingClientRect().right,
    };
  });
  expect(clear.outputLeft).toBeLessThan(clear.rowRight - 100);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.getByText("نقش‌های رنگی پیشرفته", { exact: true }).click();
  const border = page.getByRole("slider", {
    name: "روشنایی حاشیه‌ها در حالت تیره",
    exact: true,
  });
  await border.focus();
  await page.keyboard.press("End");
  await expect(border).toHaveAttribute("aria-valuenow", "100");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});

test("danger uses solid red and white foregrounds in actions and surfaces", async ({
  page,
}) => {
  for (const theme of ["light", "dark"]) {
    await page.goto("/");
    await page.evaluate(
      (theme) =>
        localStorage.setItem(
          "materialfluid.preferences",
          JSON.stringify({ theme }),
        ),
      theme,
    );
    await page.reload();
    await expect(page.locator(".mf-root")).toHaveAttribute("data-theme", theme);
    for (const [route, selector, background, foreground] of [
      ["button", ".mf-button", "error-fill", "on-error-fill"],
      ["icon-button", ".mf-icon-button", "error-fill", "on-error-fill"],
    ]) {
      await page.goto(`/#/components/${route}`);
      await page.locator('.mf-toggle-group button[data-value="danger"]').click();
      const component = page.locator(`.demo-primary ${selector}.mf-variant--danger`).first();
      await expect
        .poll(() =>
          component.evaluate(
            (el, { background, foreground }) => {
              const sample = document.createElement("span");
              sample.style.backgroundColor = `var(--mf-palette-${background})`;
              sample.style.color = `var(--mf-palette-${foreground})`;
              el.appendChild(sample);
              const css = getComputedStyle(el),
                expected = getComputedStyle(sample);
              const icon = el.querySelector(".mf-animated-icon");
              const pairMatches =
                css.backgroundColor === expected.backgroundColor &&
                css.color === expected.color;
              sample.style.color = "var(--mf-icon-ink)";
              const result =
                pairMatches &&
                (!icon ||
                  getComputedStyle(icon).color ===
                    getComputedStyle(sample).color);
              sample.remove();
              return result;
            },
            { background, foreground },
          ),
        )
        .toBe(true);
    }
  }
});
