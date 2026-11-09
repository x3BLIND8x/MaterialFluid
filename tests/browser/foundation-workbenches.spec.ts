import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const choose = (page: import("@playwright/test").Page, group: string, name: string) => page.locator(`.mf-toggle-group[aria-label="${group}"]`).getByRole("button", { name, exact: true }).click();
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { if (!localStorage.getItem("materialfluid.preferences")) localStorage.setItem("materialfluid.preferences", JSON.stringify({ locale:"en", theme:"light", motion:"expressive" })); }); });

for(const config of [{locale:"en",theme:"light",width:1440},{locale:"fa",theme:"dark",width:1440},{locale:"en",theme:"dark",width:390},{locale:"fa",theme:"light",width:390}])test(`workbench coverage ${config.locale} ${config.theme} ${config.width}`,async({page})=>{
  test.setTimeout(180000);await page.setViewportSize({width:config.width,height:1000});await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/");await page.evaluate(prefs=>localStorage.setItem("materialfluid.preferences",JSON.stringify(prefs)),{...config,motion:"minimal"});await page.reload();
  const fa=config.locale==="fa",errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
  const audit=async()=>{expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect((await new AxeBuilder({page}).include(".showcase-frame").withTags(["wcag2a","wcag2aa"]).analyze()).violations).toEqual([]);};
  for(const route of ["foundations/typography","foundations/shape","motion","foundations/accessibility","components/button"]){
    await page.goto(`/#/${route}`);await expect(page.locator("h1")).toBeVisible();await expect(page.locator('.foundation-tree a[role="treeitem"]')).toHaveCount(5);
    if(route==="foundations/typography")for(const name of fa?["متن","مقاله","ریاضی","کد","نقل‌قول","کلیدها","علمی"]:["Text","Article","Math","Code","Quote","Keyboard","Scientific"]){await choose(page,fa?"نمونه‌های آماده":"Example Presets",name);await audit();}
    else if(route==="foundations/accessibility")for(const name of fa?["صفحه‌کلید","خطای فرم","صفحه‌خوان","کنتراست","کاهش حرکت"]:["Keyboard","Form errors","Screen reader","Contrast","Reduced motion"]){await choose(page,fa?"نمونه‌های آماده":"Example Presets",name);await audit();}
    else await audit();
    await page.screenshot({path:`reports/foundation-workbenches-2026-11-09/${route.replaceAll("/","-")}-${config.locale}-${config.width}.png`,fullPage:true});
  }
  expect(errors).toEqual([]);
});

test("typography interpolates without overshoot and provides formatted text, MathML and code", async ({ page }) => {
  await page.goto("/#/foundations/typography");
  const specimen = page.locator(".foundation-type-specimen");
  const start = await specimen.evaluate(node => parseFloat(getComputedStyle(node).fontSize));
  const samples = await specimen.evaluate(async node => {
    (document.querySelector('.mf-toggle-group[aria-label="Type family"] button[data-value="display"]') as HTMLButtonElement).click();
    const values:number[]=[];const until=performance.now()+350;
    while(performance.now()<until){ values.push(parseFloat(getComputedStyle(node).fontSize));await new Promise(requestAnimationFrame); }
    return values;
  });
  expect(new Set(samples).size).toBeGreaterThan(3);
  expect(samples.every(value => value >= start && value <= samples.at(-1)! + .01)).toBe(true);
  expect(await specimen.evaluate(node => getComputedStyle(node).transitionTimingFunction)).toContain("ease-out");
  for(const name of ["Bold","Italic","Underline","Strikethrough","Highlight"])await page.getByRole("button",{name,exact:true}).click();
  await expect(specimen).toHaveCSS("font-weight","800");
  await expect(specimen.locator(":scope > div").last()).toHaveCSS("font-style","italic");
  await choose(page,"Example Presets","Math");await expect(specimen.locator("math mfrac")).toHaveCount(1);
  await choose(page,"Example Presets","Code");await expect(specimen.locator("pre code")).toContainText("createFoundationTheme");
  await choose(page,"Example Presets","Article");await expect(specimen.locator("article p")).toHaveCount(2);
  await choose(page,"Example Presets","Quote");await expect(specimen.locator("blockquote cite")).toHaveText("Charles Eames");
  await choose(page,"Example Presets","Text");
  await page.getByRole("button",{name:"Subscript",exact:true}).click();await expect(specimen.locator("sub")).toHaveCount(1);
  await page.getByRole("button",{name:"Superscript",exact:true}).click();await expect(specimen.locator("sub")).toHaveCount(0);await expect(specimen.locator("sup")).toHaveCount(1);await expect(page.getByRole("button",{name:"Subscript",exact:true})).toHaveAttribute("aria-pressed","false");
  await page.getByRole("button",{name:"Superscript",exact:true}).click();
  await choose(page,"Example Presets","Keyboard");await expect(specimen.locator("kbd")).toHaveCount(7);
  await choose(page,"Example Presets","Scientific");await expect(specimen.locator("sub")).toHaveCount(4);await expect(specimen.locator("sup")).toHaveCount(3);
  await choose(page,"Example Presets","Article");await expect(specimen.locator("mark").first()).toHaveCSS("border-radius","4px");expect(await specimen.locator("article p mark").first().evaluate(node=>node.getClientRects().length)).toBeGreaterThan(1);
  await page.getByRole("tab",{name:"Documentation",exact:true}).click();await page.getByRole("tab",{name:"Configuration",exact:true}).click();
  await expect(page.getByRole("button",{name:"Bold",exact:true})).toHaveAttribute("aria-pressed","true");
});

test("shape morph has intermediate frames, a highlighted selection and one grid selector",async({page})=>{
  await page.goto("/#/foundations/shape");
  await expect(page.getByRole("combobox")).toHaveCount(0);
  const choices=page.locator(".foundation-shapes"),pill=choices.getByRole("button",{name:"Pill",exact:true});
  const final=await pill.locator("path").getAttribute("d");
  const paths=await page.evaluate(async()=>{
    const path=document.querySelector(".foundation-shape-preview path")!;
    (document.querySelector('.foundation-shapes button[aria-label="Pill"]') as HTMLButtonElement).click();
    const values=[];for(let i=0;i<18;i++){await new Promise(requestAnimationFrame);values.push(path.getAttribute("d"));}return values;
  });
  expect(new Set(paths).size).toBeGreaterThan(5);expect(paths[0]).not.toBe(final);
  await expect(page.locator(".foundation-shape-preview path")).toHaveAttribute("d",final!);
  await expect(pill).toHaveAttribute("aria-pressed","true");
  expect(await pill.evaluate(node=>getComputedStyle(node).backgroundColor)).not.toBe(await choices.getByRole("button",{name:"Circle",exact:true}).evaluate(node=>getComputedStyle(node).backgroundColor));
  await page.getByRole("button",{name:"Replay morph",exact:true}).click();
  await expect(page.locator(".foundation-shape-preview path")).toHaveAttribute("d",final!);
  await page.emulateMedia({reducedMotion:"reduce"});await choices.getByRole("button",{name:"Circle",exact:true}).click();
  const circle=await choices.getByRole("button",{name:"Circle",exact:true}).locator("path").getAttribute("d");
  await expect(page.locator(".foundation-shape-preview path")).toHaveAttribute("d",circle!);
});

test("accessibility examples validate, restore focus and announce repeat saves",async({page})=>{
  await page.goto("/#/foundations/accessibility");
  const open=page.getByRole("button",{name:"Open dialog",exact:true});await open.click();
  const dialog=page.getByRole("dialog"),project=dialog.getByRole("textbox",{name:"Project name",exact:true}),confirm=dialog.getByRole("button",{name:"Confirm",exact:true}),close=dialog.getByRole("button",{name:"Close",exact:true});
  await expect(project).toBeFocused();
  await page.keyboard.press("Tab");await expect(confirm).toBeFocused();
  await page.keyboard.press("Tab");await expect(close).toBeFocused();
  await page.keyboard.press("Tab");await expect(project).toBeFocused();
  await page.keyboard.press("Shift+Tab");await expect(close).toBeFocused();
  expect(await dialog.evaluate(node=>node===document.activeElement)).toBe(false);
  await page.keyboard.press("Escape");await expect(open).toBeFocused();
  await choose(page,"Example Presets","Form errors");await page.getByRole("button",{name:"Save preferences",exact:true}).click();
  const email=page.getByRole("textbox",{name:"Email address"});await expect(email).toBeFocused();await expect(email).toHaveAttribute("aria-invalid","true");await expect(email).toHaveAttribute("aria-describedby",/.+/);
  await email.fill("owner@example.com");await page.getByRole("button",{name:"Save preferences",exact:true}).click();await expect(page.locator('output[role="status"]')).toContainText("Email accepted");
  await choose(page,"Example Presets","Screen reader");const save=page.getByRole("button",{name:"Save example",exact:true});await save.click();await expect(save).toBeFocused();await expect(page.locator('output[role="status"]')).toContainText("Revision 1");await save.click();await expect(page.locator('output[role="status"]')).toContainText("Revision 2");
  await choose(page,"Example Presets","Contrast");await expect(page.getByRole("table")).toBeVisible();
  await expect(page.locator('.foundation-tree a[href*="interaction"]')).toHaveCount(0);
});

test("motion curves show timestamps and share pause, seek and reduced-motion playback",async({page})=>{
  await page.goto("/#/motion");
  await expect(page.locator(".foundation-motion-role svg text")).toHaveCount(12);
  await choose(page,"Playback speed","0.5×");await page.getByRole("button",{name:"Play",exact:true}).click();
  const slider=page.getByRole("slider",{name:"Playback position",exact:true});
  await expect.poll(()=>slider.getAttribute("aria-valuenow").then(Number)).toBeGreaterThan(10);
  await page.getByRole("button",{name:"Pause",exact:true}).click();const time=await slider.getAttribute("aria-valuenow");await page.waitForTimeout(100);await expect(slider).toHaveAttribute("aria-valuenow",time!);
  const bounds=await page.locator('.foundation-curve-track').evaluateAll(nodes=>nodes.map(track=>{const dot=track.querySelector('.foundation-motion-dot')!.getBoundingClientRect(),box=track.closest('.foundation-motion-role')!.getBoundingClientRect();return dot.left>=box.left&&dot.right<=box.right&&track.getBoundingClientRect().width<box.width*.7;}));expect(bounds.every(Boolean)).toBe(true);
  await slider.focus();await page.keyboard.press("End");await expect(page.locator(".curve-playhead").first()).toHaveAttribute("x1","300");
  await page.getByRole("button",{name:"Replay curves",exact:true}).click();await expect.poll(()=>slider.getAttribute("aria-valuenow").then(Number)).toBeLessThan(Number(time));
  await page.emulateMedia({reducedMotion:"reduce"});await expect(page.locator(".curve-playhead").first()).toHaveAttribute("x1","300");
});

test("shared Button press and resize use the plotted crossing limits",async({page})=>{
  await page.goto("/#/components/button");const button=page.locator(".button-preview-form > button");await button.hover();
  await button.evaluate(node=>{const values:number[]=[new DOMMatrixReadOnly(getComputedStyle(node).transform).a];const until=performance.now()+850;(node as HTMLElement & {trace:Promise<number[]>}).trace=new Promise(resolve=>{const sample=()=>{values.push(new DOMMatrixReadOnly(getComputedStyle(node).transform).a);if(performance.now()<until)requestAnimationFrame(sample);else resolve(values);};requestAnimationFrame(sample);});});
  await page.mouse.down();const press=await button.evaluate(node=>(node as HTMLElement & {trace:Promise<number[]>}).trace);await page.mouse.up();
  const crossings=(values:number[],target:number)=>{let previous=Math.sign(values[0]-target),count=0;for(const value of values){if(Math.abs(value-target)<.00001)continue;const sign=Math.sign(value-target);if(sign!==previous){count++;previous=sign;}}return count;};
  expect(crossings(press,.92),JSON.stringify(press)).toBe(3);await expect.poll(()=>button.evaluate(node=>new DOMMatrixReadOnly(getComputedStyle(node).transform).a)).toBeCloseTo(1,3);
  const height=await button.evaluate(async node=>{(document.querySelector('.mf-toggle-group[aria-label="Size"] button[data-value="lg"]') as HTMLButtonElement).click();const values:number[]=[];const until=performance.now()+750;while(performance.now()<until){values.push(node.getBoundingClientRect().height);await new Promise(requestAnimationFrame);}return values;});
  expect(crossings(height,58),JSON.stringify(height)).toBe(2);expect(height.at(-1)).toBeCloseTo(58,1);
});
