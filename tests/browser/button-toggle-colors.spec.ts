import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for(const config of [{locale:'en',theme:'light',width:1440},{locale:'fa',theme:'dark',width:1440},{locale:'en',theme:'dark',width:390},{locale:'fa',theme:'light',width:390}])test(`Button toggle treatments ${config.locale} ${config.theme} ${config.width}`,async({page})=>{
  await page.setViewportSize({width:config.width,height:1000});
  await page.addInitScript(prefs=>localStorage.setItem('materialfluid.preferences',JSON.stringify({...prefs,motion:'minimal'})),config);
  await page.goto('/#/components/button');
  const preview=page.locator('.button-preview-form > button'),toggle=page.getByRole('switch',{name:config.locale==='fa'?'دکمه انتخابی':'Toggle button',exact:true});
  await expect(toggle).toBeDisabled();
  const choose=async(value:string)=>{await page.locator(`.button-configuration .mf-toggle-group button[data-value="${value}"]`).evaluate((node:HTMLButtonElement)=>node.click());await expect(preview).toHaveClass(new RegExp(`mf-variant--${value}\\b`));};
  for(const variant of ['tonal','outlined','ghost']){
    await choose(variant);await expect(toggle).toBeEnabled();
    await toggle.click();await expect(preview).toHaveAttribute('aria-pressed','false');
    await page.mouse.move(0,0);await page.waitForTimeout(350);
    const off=await preview.evaluate(node=>({background:getComputedStyle(node).backgroundColor,foreground:getComputedStyle(node).color}));
    await preview.evaluate((node:HTMLButtonElement)=>node.click());await expect(preview).toHaveAttribute('aria-pressed','true');
    const primary=await preview.evaluate(node=>{
      const probe=document.createElement('span');probe.style.cssText='background:var(--mf-primary-fill);color:var(--mf-on-primary-fill)';node.closest('.mf-root')!.append(probe);
      const css=getComputedStyle(probe),result={background:css.backgroundColor,foreground:css.color};probe.remove();return result;
    });
    await expect(preview).toHaveCSS('background-color',primary.background);await expect(preview).toHaveCSS('color',primary.foreground);
    await preview.evaluate((node:HTMLButtonElement)=>node.click());await expect(preview).toHaveAttribute('aria-pressed','false');
    await expect(preview).toHaveCSS('background-color',off.background);await expect(preview).toHaveCSS('color',off.foreground);
    await toggle.click();
  }
  await choose('tonal');await toggle.click();await preview.evaluate((node:HTMLButtonElement)=>node.click());
  await choose('filled');await expect(toggle).toBeDisabled();await expect(toggle).not.toBeChecked();await expect(preview).not.toHaveAttribute('aria-pressed');
  await choose('danger');await expect(toggle).toBeDisabled();
  expect((await new AxeBuilder({page}).include('.button-configuration').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
});
