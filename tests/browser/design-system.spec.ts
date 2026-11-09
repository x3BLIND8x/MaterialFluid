import { test, expect } from "@playwright/test";
import { selectSize } from "./helpers";

test("variant previews share one dotted canvas with a solid divided header", async ({page}) => {
  for(const route of ["button","icon-button","fab"]){
    await page.goto(`/#/components/${route}`);
    const canvas=page.locator(".live-stage > .showcase-canvas");
    await expect(canvas).toHaveCount(1);
    await expect(canvas).toHaveCSS("background-size","20px 20px");
    if(route === "fab") await expect(page.locator(".component-appearance-controls")).toHaveCSS("border-bottom-width","1px");
    else await expect(page.locator(`.${route}-configuration`)).toBeVisible();
    for(const demo of await canvas.locator(".demo-primary:not(.demo-loading)").all()) await expect(demo).toHaveCSS("background-image","none");
  }
});

test("group frames add the real inset to the button radius", async ({page}) => {
  await page.goto("/#/components/toggle-group");
  const group=page.locator(".demo-primary .mf-toggle-group").first();
  for(const size of ["sm","md","lg"]){
    await selectSize(page,size);
    await expect.poll(()=>group.evaluate(el=>{
      const css=getComputedStyle(el);const item=el.querySelector<HTMLElement>(".mf-segment")!;const radius=parseFloat(getComputedStyle(item).borderTopLeftRadius);
      return Math.abs(parseFloat(css.borderTopLeftRadius)-(radius+parseFloat(css.paddingLeft)+parseFloat(css.borderLeftWidth)));
    })).toBeLessThan(.6);
  }
});

test("Tree icon modes remove empty slots and support parent-only icons", async ({page}) => {
  await page.goto("/#/components/tree");
  const demo=page.locator(".demo-primary");
  await expect(demo.locator(".mf-tree-icon")).toHaveCount(0);
  await expect(demo.locator('[role=treeitem]:not([aria-expanded]) .mf-tree-chevron')).toHaveCount(0);
  await demo.getByRole("button",{name:"With icons",exact:true}).click();
  await expect(demo.locator(".mf-tree-icon")).toHaveCount(7);
  await demo.getByRole("button",{name:"Parent icons",exact:true}).click();
  await expect(demo.locator(".mf-tree-icon")).toHaveCount(2);
  await expect(demo.locator(".mf-tree-group .mf-tree-icon")).toHaveCount(0);
  await demo.getByRole("button",{name:"Iconless",exact:true}).click();
  await expect(demo.locator(".mf-tree-icon")).toHaveCount(0);
});

test("field icon buttons start circular, compress their radius, and restore it", async ({page}) => {
  for(const route of ["password-field","number-field"]){
    await page.goto(`/#/components/${route}`);
    const action=page.locator(".demo-primary .mf-icon-button").first();
    for(const size of ["sm","md","lg"]){
      await selectSize(page,size);
      await expect.poll(()=>action.evaluate(el=>Math.abs(parseFloat(getComputedStyle(el).borderTopLeftRadius)-Math.min((el as HTMLElement).offsetWidth,(el as HTMLElement).offsetHeight)/2))).toBeLessThan(.1);
      await expect(action).toHaveCSS("width", size === "sm" ? "28px" : size === "lg" ? "40px" : "36px");
      const diameter=await action.evaluate(el=>Math.min((el as HTMLElement).offsetWidth,(el as HTMLElement).offsetHeight));
      await action.hover();await page.mouse.down();
      await expect.poll(()=>action.evaluate(el=>parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeLessThan(diameter/2*.96);
      await page.mouse.up();
      await expect.poll(()=>action.evaluate(el=>parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeCloseTo(diameter/2,1);
    }
  }
});

for(const theme of ["light","dark"])test(`Switch swaps paired colors and Tree uses neutral ink (${theme})`,async({page})=>{
  await page.goto("/");await page.evaluate(theme=>localStorage.setItem("materialfluid.preferences",JSON.stringify({theme,locale:"en",motion:"minimal"})),theme);await page.reload();
  const tree=page.locator(".catalogue-tree");
  const ink=await tree.evaluate(el=>{const probe=document.createElement("span");probe.style.color="var(--mf-on-surface)";el.append(probe);const value=getComputedStyle(probe).color;probe.remove();return value;});
  await expect(tree.locator("a[role=treeitem]").first()).toHaveCSS("color",ink);
  await expect(tree.getByRole("button",{name:"Expand all",exact:true})).toHaveCSS("color",ink);
  await page.goto("/#/components/switch");
  const control=page.locator(".demo-primary .mf-switch").first();
  const off=await control.evaluate(el=>({track:getComputedStyle(el).backgroundColor,thumb:getComputedStyle(el.querySelector(".mf-switch-thumb")!).backgroundColor}));
  await control.click();await expect(control).toHaveAttribute("aria-checked","true");
  await expect(control).toHaveCSS("background-color",off.thumb);
  await expect(control.locator(".mf-switch-thumb")).toHaveCSS("background-color",off.track);
});

test("identity colors survive seed changes and toasts use the shared raised surface",async({page})=>{
  await page.goto("/#/components/avatar");
  const avatars=page.locator(".demo-primary .mf-avatar[data-color]");
  const read=()=>avatars.evaluateAll(nodes=>nodes.map(el=>getComputedStyle(el).backgroundColor));
  await expect(avatars.first()).toBeVisible();const before=await read();expect(new Set(before).size).toBeGreaterThan(2);
  await page.evaluate(()=>{const prefs=JSON.parse(localStorage.getItem("materialfluid.preferences")!);prefs.accentSeed="#ff0000";localStorage.setItem("materialfluid.preferences",JSON.stringify(prefs));});await page.reload();await expect.poll(read).toEqual(before);
  await page.goto("/#/components/toast");await page.getByRole("button",{name:"Show notification",exact:true}).click();
  const toast=page.locator(".mf-toast").first();await expect(toast).toBeVisible();
  const expected=await toast.evaluate(el=>{const probe=document.createElement("span");probe.style.background="var(--mf-component-raised)";el.append(probe);const value=getComputedStyle(probe).backgroundColor;probe.remove();return value;});
  await expect(toast).toHaveCSS("background-color",expected);
});

for(const locale of ["en","fa"])test(`AM/PM stays centered in the time picker (${locale})`,async({page})=>{
  await page.goto("/");await page.evaluate(locale=>localStorage.setItem("materialfluid.preferences",JSON.stringify({locale,motion:"minimal"})),locale);await page.reload();await page.goto("/#/components/time-picker");
  await page.locator(".demo-primary .mf-time-format").getByRole("button",{name:locale==="fa"?"۱۲ ساعته":"12 hour",exact:true}).click();
  await page.locator(".demo-primary .mf-time-field input").first().click();
  const panel=page.locator(".mf-time-popover");await expect(panel).toBeVisible();
  const period=panel.locator(".mf-time-period");await expect(period).toBeVisible();
  const offset=await period.evaluate(el=>{const outer=el.closest(".mf-time-popover")!.getBoundingClientRect();const inner=el.getBoundingClientRect();return Math.abs(inner.x+inner.width/2-outer.x-outer.width/2);});
  expect(offset).toBeLessThan(1);
});
