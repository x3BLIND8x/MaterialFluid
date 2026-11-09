import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["colors", "foundations/typography", "foundations/shape", "motion", "foundations/accessibility"];
for(const config of [
  {locale:"en",theme:"light",width:1440},{locale:"fa",theme:"dark",width:1440},
  {locale:"en",theme:"dark",width:390},{locale:"fa",theme:"light",width:390},
]) test(`neutral algorithm changes rendered components ${config.locale} ${config.theme} ${config.width}`,async({page})=>{
  test.setTimeout(120000);
  await page.setViewportSize({width:config.width,height:900});
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.addInitScript(prefs=>{if(!localStorage.getItem("materialfluid.preferences"))localStorage.setItem("materialfluid.preferences",JSON.stringify(prefs));},{...config,motion:"minimal",colorDesign:"material",colorPreset:"neutral",colorScheme:"tonalSpot",accentSeed:"#eedd96"});
  const rendered=async()=>page.locator(".button-preview-form > button").evaluate(node=>({fill:getComputedStyle(node).backgroundColor,ink:getComputedStyle(node).color,canvas:getComputedStyle(node.closest(".mf-root")!).getPropertyValue("--mf-canvas").trim()}));
  await page.goto("/#/components/button");await expect(page.locator(".button-preview-form > button")).toBeVisible();const original=await rendered();
  await page.goto("/#/colors");
  await page.getByRole("combobox",{name:config.locale==="fa"?"الگوریتم رنگ":"Color algorithm",exact:true}).click();
  await page.getByRole("option",{name:"Expressive",exact:true}).click();
  await page.goto("/#/components/button");await expect(page.locator(".button-preview-form > button")).toBeVisible();
  await expect.poll(async()=>(await rendered()).fill).not.toBe(original.fill);
  expect((await rendered()).canvas).toBe(original.canvas);
  expect((await new AxeBuilder({page}).include(".showcase-frame").withTags(["wcag2a","wcag2aa"]).analyze()).violations).toEqual([]);
  await page.reload();await expect(page.locator(".button-preview-form > button")).toBeVisible();expect((await rendered()).fill).not.toBe(original.fill);
  await page.screenshot({path:`reports/foundations-2026-11-08/algorithm-button-${config.locale}-${config.width}.png`,fullPage:true});
});
for (const config of [
  { locale: "en", theme: "light", width: 1440 }, { locale: "fa", theme: "dark", width: 1440 },
  { locale: "en", theme: "dark", width: 390 }, { locale: "fa", theme: "light", width: 390 },
]) {
  test(`foundations ${config.locale} ${config.theme} ${config.width}`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: config.width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(value => localStorage.setItem("materialfluid.preferences", JSON.stringify(value)), { ...config, motion: "minimal" });
    const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
    for (const route of routes) {
      await page.goto(`/#/${route}`);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator(".foundation-tree a[role=treeitem]")).toHaveCount(5);
      await expect(page.locator(".catalogue-tree a[role=treeitem]")).toHaveCount(45);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), route).toBe(true);
      expect((await new AxeBuilder({ page }).include(".showcase-frame").withTags(["wcag2a", "wcag2aa"]).analyze()).violations, route).toEqual([]);
      if (route.startsWith("foundations/")) {
        await page.getByRole("tab", { name: config.locale === "fa" ? "مستندات" : "Documentation", exact: true }).click();
        expect((await new AxeBuilder({ page }).include(".showcase-frame").withTags(["wcag2a", "wcag2aa"]).analyze()).violations, `${route} docs`).toEqual([]);
      }
      await page.screenshot({ path: `reports/foundations-2026-11-08/${route.replaceAll("/", "-")}-${config.locale}-${config.width}.png`, fullPage: true });
    }
    expect(errors).toEqual([]);
  });
}

test("color algorithms persist while typography, shape and accessibility demos work", async ({ page }) => {
  await page.goto("/#/colors");
  await page.getByRole("combobox", { name: "Color algorithm", exact: true }).click();
  await page.getByRole("option", { name: "Expressive", exact: true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("materialfluid.preferences")!).colorScheme)).toBe("expressive");
  await page.reload(); await expect(page.getByRole("combobox", { name: "Color algorithm", exact: true })).toContainText("Expressive");
  await page.goto("/#/foundations/typography");
  await page.getByRole("textbox", { name: "Sample text", exact: true }).fill("Your type, preserved");
  await expect(page.locator(".foundation-type-preview")).toContainText("Your type, preserved");
  await page.getByRole("switch", { name: "Emphasized", exact: true }).click();
  await expect(page.locator(".foundation-type-preview p")).toHaveCSS("font-weight", "800");
  await page.goto("/#/foundations/shape");
  await expect(page.locator(".foundation-shapes button")).toHaveCount(35);
  await page.locator(".foundation-shapes").getByRole("button", { name: "Pill", exact: true }).click();
  await expect(page.locator(".foundation-shape-preview")).toHaveAttribute("aria-label", "Pill");
  await page.goto("/#/foundations/accessibility");
  const trigger = page.getByRole("button", { name: "Open dialog", exact: true }); await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible(); await page.keyboard.press("Tab");
  expect(await page.getByRole("dialog").evaluate(node => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape"); await expect(trigger).toBeFocused();
});

test("motion timeline replays owner curves and reduced motion goes to the target", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("materialfluid.preferences", JSON.stringify({motion:"expressive"})));
  await page.goto("/#/motion");
  const playhead=page.locator(".curve-playhead").first();
  await page.getByRole("button", { name: "Replay curves", exact: true }).click();
  await expect.poll(() => playhead.evaluate(node => Number(node.getAttribute("x1")))).toBeGreaterThan(20);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(playhead).toHaveAttribute("x1", "300");
  await page.getByRole("button", { name: "Replay curves", exact: true }).click();
  await expect(playhead).toHaveAttribute("x1", "300");
  await expect(page.locator(".foundation-motion-overview")).not.toContainText(/GSAP|standard settles|fluid drifts/);
});

test("interrupted shape changes settle exactly and forced-color keyboard focus stays visible", async ({ page }) => {
  await page.goto("/#/foundations/shape");
  const choices = page.locator(".foundation-shapes");
  await choices.getByRole("button", { name: "Pill", exact: true }).click();
  await choices.getByRole("button", { name: "Circle", exact: true }).click();
  const circle = await choices.getByRole("button", { name: "Circle", exact: true }).locator("path").getAttribute("d");
  await expect(page.locator(".foundation-shape-preview path")).toHaveAttribute("d", circle!);
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/#/components/button");
  const button = page.locator(".button-preview-form > button");
  await button.focus(); await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab");
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS("outline-style", "solid");
  await expect(button).toHaveCSS("outline-width", "3px");
});
