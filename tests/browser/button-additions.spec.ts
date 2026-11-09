import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { MaterialFluidButtonElement } from "../../src/kit/elements";
async function choose(page: import("@playwright/test").Page, label: string, option: string) {
  await page.locator(`.mf-toggle-group[aria-label="${label}"]`).getByRole("button",{name:option,exact:true}).click();
}
test("Button presets, five sizes, all-icon choices, behaviors and both code formats",async({page})=>{
  let iconPackLoaded=false;page.on("response",response=>{if(response.url().includes("/src/kit/material-icons.ts"))iconPackLoaded=true;});
  await page.goto("/#/components/button");
  const preview=page.locator(".button-preview-form > .mf-button");await expect(preview).toHaveText("Filled");expect(iconPackLoaded).toBe(false);
  await expect(page.getByText("Scenarios",{exact:true})).toHaveCount(0);await expect(page.getByText("Square shape",{exact:true})).toHaveCount(0);
  await expect(page.locator('.mf-toggle-group[aria-label="Variant"]').getByRole("button",{name:/Elevated|Square/i})).toHaveCount(0);
  await choose(page,"Size","Extra Small");await expect.poll(()=>preview.evaluate(element=>element.getBoundingClientRect().height)).toBeCloseTo(24,0);
  await choose(page,"Size","Extra Large");await expect.poll(()=>preview.evaluate(element=>element.getBoundingClientRect().height)).toBeCloseTo(96,0);
  await choose(page,"Example Presets","Favorite");await expect(preview).toHaveAttribute("aria-pressed","false");await preview.click();await expect(preview).toHaveAttribute("aria-pressed","true");
  await page.getByRole("tab",{name:"Documentation",exact:true}).click();
  await page.getByRole("button",{name:"Web Components",exact:true}).click();await expect(page.locator(".usage-code")).toContainText("<mf-button");await expect(page.locator(".usage-code")).toContainText(" selected");
  await page.getByRole("button",{name:"React",exact:true}).click();await expect(page.locator(".usage-code")).toContainText("useState(true)");
  await page.getByRole("tab",{name:"Configuration",exact:true}).click();
  await expect(preview).toHaveAttribute("aria-pressed","true");
  await choose(page,"Example Presets","Default");
  await page.locator(".button-icon-control").first().getByRole("button",{name:"Choose icon",exact:true}).click();
  const dialog=page.getByRole("dialog",{name:"Choose an icon",exact:true});await expect(dialog.getByRole("button",{name:"None",exact:true})).toBeVisible();
  await expect(dialog).toContainText("4,322");await dialog.getByRole("searchbox",{name:"Search all icons"}).fill("rocket_launch");
  await dialog.getByRole("button",{name:"rocket_launch",exact:true}).click();await expect(preview.locator('[data-icon-name="rocket_launch"]')).toHaveCount(1);
  await expect(page.getByRole("spinbutton",{name:"Icon size",exact:true})).toHaveCount(0);
  const icon = preview.locator('[data-icon-name="rocket_launch"]');
  await expect.poll(() => icon.evaluate(node => node.getBoundingClientRect().width)).toBeCloseTo(22, 0);
  await choose(page,"Size","Small");
  await expect.poll(() => icon.evaluate(node => node.getBoundingClientRect().width)).toBeCloseTo(16, 0);
  await choose(page,"Size","Extra Large");
  await expect.poll(() => icon.evaluate(node => node.getBoundingClientRect().width)).toBeCloseTo(32, 0);
  await choose(page,"Size","Medium");
  await expect(page.getByRole("switch",{name:"Ripple",exact:true})).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Advanced",exact:true})).toHaveCount(0);
  await choose(page,"Icon position","End");await page.getByRole("textbox",{name:"Button text",exact:true}).fill("Launch");
  await expect(preview).toHaveText("Launch");
  await page.getByRole("tab",{name:"Documentation",exact:true}).click();
  await expect(page.locator(".usage-code")).toContainText('icon="rocket_launch"');await expect(page.locator(".usage-code")).toContainText('iconPosition="end"');
  await page.getByRole("tab",{name:"Configuration",exact:true}).click();
  await choose(page,"Progress","Determinate");await expect(preview.getByRole("progressbar")).toHaveAttribute("aria-valuenow","60");
  await page.getByRole("switch",{name:"Loading",exact:true}).click();await page.getByRole("textbox",{name:"Loading text",exact:true}).fill("Launching");await expect(preview).toBeDisabled();await expect(preview).toHaveText("Launching");
  await page.getByRole("switch",{name:"Loading",exact:true}).click();await expect(preview).toBeEnabled();await expect(preview).toHaveText("Launch");
  await choose(page,"Action type","Submit form");await preview.click();await expect(page.locator(".button-preview-status")).toHaveText("Form submitted");
});

test("Web Component uses the real Button API, emits selection and retains native form behavior",async({page})=>{
  await page.goto("/#/components/button");
  await page.evaluate(async()=>{
    const {defineMaterialFluidButton}=await import(/* @vite-ignore */ String("/src/kit/elements.tsx"));defineMaterialFluidButton();
    const form=document.createElement("form");form.id="element-test";form.innerHTML='<input name="project" value="Original" aria-label="Project"><mf-button id="web-example" variant="tonal" toggle value="favorite">Favorite</mf-button>';
    document.body.append(form);const element=document.querySelector<MaterialFluidButtonElement>("#web-example")!;await element.updateComplete;
    element.addEventListener("change",event=>{form.dataset.selection=JSON.stringify((event as CustomEvent).detail);});
    form.addEventListener("submit",event=>{event.preventDefault();form.dataset.submitted=String(new FormData(form,(event as SubmitEvent).submitter).get("action"));});
  });
  const host=page.locator("#web-example"),button=host.getByRole("button",{name:"Favorite",exact:true});
  expect(await host.evaluate(node => {
    let focused = 0, blurred = 0;
    node.addEventListener("focus", () => focused++, { once: true });
    node.addEventListener("blur", () => blurred++, { once: true });
    (node as MaterialFluidButtonElement).focus();
    document.querySelector<HTMLInputElement>("#element-test input")!.focus();
    return { focused, blurred };
  })).toEqual({ focused: 1, blurred: 1 });
  await button.click();await expect(button).toHaveAttribute("aria-pressed","true");await expect(page.locator("#element-test")).toHaveAttribute("data-selection",JSON.stringify({selected:true,value:"favorite"}));
  await host.evaluate(async(node)=>{const element=node as MaterialFluidButtonElement;await element.setLoading(true,"Saving");});await expect(host.getByRole("button",{name:"Saving",exact:true})).toBeDisabled();
  await host.evaluate(async(node)=>{const element=node as MaterialFluidButtonElement;await element.setLoading(false);await element.setProgress(42);});await expect(host.getByRole("progressbar")).toHaveAttribute("aria-valuenow","42");await expect(host.getByRole("button",{name:"Favorite",exact:true})).toBeEnabled();
  await host.evaluate(async(node)=>{const element=node as MaterialFluidButtonElement;await element.hideProgress();element.toggle=false;element.type="submit";element.name="action";element.value="save";element.text="Submit";await element.updateComplete;});
  await host.getByRole("button",{name:"Submit",exact:true}).click();await expect(page.locator("#element-test")).toHaveAttribute("data-submitted","save");
  await page.locator('#element-test input').fill("Changed");await host.evaluate(async(node)=>{const element=node as MaterialFluidButtonElement;element.type="reset";element.text="Reset";await element.updateComplete;});await host.getByRole("button",{name:"Reset",exact:true}).click();await expect(page.locator('#element-test input')).toHaveValue("Original");
  await host.evaluate(async(node)=>{const element=node as MaterialFluidButtonElement;element.setAttribute("aria-label","Icon action");element.text="";element.icon="check";await element.updateComplete;});await expect(host.getByRole("button",{name:"Icon action",exact:true})).toBeVisible();
  expect((await new AxeBuilder({page}).include("#element-test").withTags(["wcag2a","wcag2aa"]).analyze()).violations).toEqual([]);
  await host.evaluate(async node => {
    const element = node as MaterialFluidButtonElement;
    const parent = element.parentElement!;
    element.remove(); await Promise.resolve();
    element.removeAttribute("text"); element.removeAttribute("icon"); element.removeAttribute("aria-label");
    parent.append(element); await element.updateComplete;
  });
  await expect(host.getByRole("button", {name:"Favorite",exact:true})).toBeVisible();
});
for(const config of [{locale:"en",theme:"light",width:1440},{locale:"fa",theme:"dark",width:1440},{locale:"en",theme:"dark",width:390},{locale:"fa",theme:"light",width:390}]){
  test(`Button configuration ${config.locale} ${config.theme} ${config.width}`,async({page})=>{
    await page.setViewportSize({width:config.width,height:900});await page.emulateMedia({reducedMotion:"reduce"});await page.addInitScript(value=>localStorage.setItem("materialfluid.preferences",JSON.stringify(value)),{...config,motion:"minimal"});
    const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));await page.goto("/#/components/button");await expect(page.locator(".button-configuration")).toBeVisible();
    await expect(page.locator(".button-configuration")).not.toContainText(/Elevated|Square/);
    await expect(page.locator(".advanced-tuning")).toHaveCount(0);
    if (config.locale === "fa") {
      await page.getByRole("switch", { name: "فعال", exact: true }).click();
      await expect(page.locator(".button-preview-form > .mf-button")).toHaveText("پر");
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
    expect((await new AxeBuilder({page}).include(".showcase-frame").withTags(["wcag2a","wcag2aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({path:`reports/button-defaults-2026-11-08/${config.locale}-${config.theme}-${config.width}.png`,fullPage:true});expect(errors).toEqual([]);
  });
}
