import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type {MaterialFluidIconButtonElement} from '../../src/kit/elements';
const preview=(page:Page)=>page.locator('.icon-button-preview-form > button');
const pick=async(page:Page,section:string,value:string)=>page.locator(`${section} button[data-value="${value}"]`).evaluate((node:HTMLButtonElement)=>node.click());

for(const config of [{locale:'en',theme:'light',width:1440},{locale:'fa',theme:'dark',width:1440},{locale:'en',theme:'dark',width:390},{locale:'fa',theme:'light',width:390}])test(`IconButton configuration ${config.locale} ${config.theme} ${config.width}`,async({page})=>{
  test.setTimeout(90000);
  await page.setViewportSize({width:config.width,height:1000});await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(prefs=>localStorage.setItem('materialfluid.preferences',JSON.stringify({...prefs,motion:'minimal'})),config);
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('/#/components/icon-button');
  const button=preview(page);await expect(button).toBeVisible();await expect(page.locator('#component-size')).toHaveCount(0);await expect(page.locator('.icon-button-configuration')).not.toContainText(/Square|Elevated|Playback|Scenarios/);
  for(const [size,height,glyph] of [['xs',24,16],['sm',28,20],['md',48,24],['lg',58,28],['xl',96,40]] as const){
    await pick(page,'#icon-button-appearance',size);
    const widths:number[]=[];
    for(const width of ['narrow','default','wide']){
      await pick(page,'#icon-button-appearance',width);
      await expect.poll(()=>button.evaluate(node=>(node as HTMLElement).offsetHeight)).toBe(height);
      const box=await button.evaluate(node=>{const b=node.getBoundingClientRect(),g=node.querySelector('.mf-animated-icon')!.getBoundingClientRect();return {width:b.width,glyph:g.width,dx:Math.abs(b.x+b.width/2-g.x-g.width/2),dy:Math.abs(b.y+b.height/2-g.y-g.height/2)};});
      expect(box.glyph).toBeCloseTo(glyph,0);expect(box.dx).toBeLessThan(.6);expect(box.dy).toBeLessThan(.6);widths.push(box.width);
    }
    expect(widths[0]).toBeLessThanOrEqual(widths[1]);expect(widths[2]).toBeGreaterThan(widths[1]);
  }
  await pick(page,'#icon-button-appearance','md');await pick(page,'#icon-button-appearance','default');
  expect((await new AxeBuilder({page}).include('.showcase-frame').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  await pick(page,'#example-presets','emphasize');const off=await button.evaluate(node=>getComputedStyle(node).backgroundColor);
  await button.evaluate((node:HTMLButtonElement)=>node.click());await expect(button).toHaveAttribute('aria-pressed','true');await expect(button.locator('[data-icon-name="pause"]')).toHaveCount(1);
  await expect(button).toHaveCSS('background-color',off);
  await button.evaluate((node:HTMLButtonElement)=>node.click());await expect(button).toHaveAttribute('aria-pressed','false');await expect(button.locator('[data-icon-name="play_arrow"]')).toHaveCount(1);
  expect((await new AxeBuilder({page}).include('.showcase-frame').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  await page.screenshot({path:`reports/icon-button-2026-11-09/config-${config.locale}-${config.theme}-${config.width}.png`,fullPage:true});
  await page.getByRole('tab',{name:config.locale==='fa'?'مستندات':'Documentation',exact:true}).click();
  await expect(page.locator('.usage-code')).toContainText('variant="emphasize"');await expect(page.locator('.usage-code')).toContainText('selectedIcon');
  await page.getByRole('button',{name:'Web Components',exact:true}).click();await expect(page.locator('.usage-code')).toContainText('<mf-icon-button');
  expect((await new AxeBuilder({page}).include('.showcase-frame').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});

test('null selected icon reveals the same symbol in Button and IconButton with reversible fill animation',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('materialfluid.preferences',JSON.stringify({locale:'en',motion:'expressive'})));
  for(const route of ['button','icon-button']){
    await page.goto('/#/components/'+route);
    await page.locator(route==='button'?'.button-preview-form:not(.icon-button-preview-form)':'.icon-button-preview-form').waitFor();
    await pick(page,'#example-presets','favorite');
    await page.getByRole('group',{name:'Selected icon',exact:true}).getByRole('button').click();await page.getByRole('dialog').getByRole('button',{name:'None',exact:true}).click();
    const button=page.locator('.button-preview-form > button');await expect(button.locator('.mf-selection-icon')).toHaveCount(1);
    await expect(button.locator('.mf-selection-icon')).toHaveAttribute('data-icon-fill','outlined');
    const trace=await button.evaluate(async node=>{
      const circle=node.querySelector('clipPath circle')!,read=()=>parseFloat(getComputedStyle(circle).r);
      const original=node.querySelector('.mf-selection-icon')!.getAttribute('data-icon-name');
      (node as HTMLButtonElement).click();const frames:number[]=[];const end=performance.now()+650;
      while(performance.now()<end){frames.push(read());await new Promise(requestAnimationFrame);}
      return {frames,original,current:node.querySelector('.mf-selection-icon')!.getAttribute('data-icon-name')};
    });
    expect(trace.current).toBe(trace.original);expect(new Set(trace.frames.map(n=>n.toFixed(2))).size).toBeGreaterThan(3);expect(trace.frames.at(-1)!).toBeGreaterThan(16);
    await button.evaluate((node:HTMLButtonElement)=>node.click());await expect.poll(()=>button.locator('clipPath circle').evaluate(node=>parseFloat(getComputedStyle(node).r))).toBeLessThan(.1);
    await page.emulateMedia({reducedMotion:'reduce'});await button.evaluate((node:HTMLButtonElement)=>node.click());await expect(button.locator('.mf-selection-icon')).toHaveAttribute('data-icon-fill','filled');
    await expect.poll(()=>button.locator('clipPath circle').evaluate(node=>parseFloat(getComputedStyle(node).r))).toBeGreaterThan(16);await page.emulateMedia({reducedMotion:'no-preference'});
  }
});

test('all-icon selection, nullable selected icon, state preservation and native form actions',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('materialfluid.preferences',JSON.stringify({locale:'en',motion:'minimal'})));await page.goto('/#/components/icon-button');
  const button=preview(page);await page.getByRole('group',{name:'Icon',exact:true}).getByRole('button').click();await page.getByRole('searchbox',{name:'Search all icons',exact:true}).fill('rocket_launch');await page.getByRole('dialog').getByRole('button',{name:'rocket_launch',exact:true}).click();
  await expect(button.locator('[data-icon-name="rocket_launch"]')).toHaveCount(1);await page.getByRole('textbox',{name:'Accessible label',exact:true}).fill('Launch "draft"');
  await pick(page,'#icon-button-appearance','tonal');await page.getByRole('switch',{name:'Toggle button',exact:true}).click();await button.evaluate((node:HTMLButtonElement)=>node.click());await expect(button).toHaveAttribute('aria-pressed','true');
  await page.getByRole('tab',{name:'Documentation',exact:true}).click();await expect(page.locator('.usage-code')).toContainText('selectedIcon={null}');await expect(page.locator('.usage-code')).toContainText('Launch \\"draft\\"'.replaceAll('\\\\','\\'));
  await page.getByRole('tab',{name:'Configuration',exact:true}).click();await expect(button).toHaveAttribute('aria-pressed','true');
  await pick(page,'#icon-button-appearance','filled');await expect(page.getByRole('switch',{name:'Toggle button',exact:true})).toBeDisabled();await expect(button).not.toHaveAttribute('aria-pressed');
  await pick(page,'#icon-button-behavior','determinate');await expect(button.getByRole('progressbar')).toHaveAttribute('aria-valuenow','60');
  await pick(page,'#icon-button-behavior','submit');await button.evaluate((node:HTMLButtonElement)=>node.click());await expect(page.locator('.button-preview-status')).toHaveText('Form submitted');
});

test('IconButton Web Component exposes selected-icon/width/state methods and native events',async({page})=>{
  await page.goto('/#/components/icon-button');
  await page.evaluate(async()=>{
    const {defineMaterialFluidIconButton}=await import(/* @vite-ignore */String('/src/kit/elements.tsx'));defineMaterialFluidIconButton();
    const form=document.createElement('form');form.id='icon-element-form';form.innerHTML='<input name="project" value="Original" aria-label="Project"><mf-icon-button id="icon-element" icon="heart" selected-icon="check" variant="tonal" toggle aria-label="Favorite" value="favorite"></mf-icon-button>';document.body.append(form);
    const element=document.querySelector<MaterialFluidIconButtonElement>('#icon-element')!;await element.updateComplete;
    element.addEventListener('change',event=>{form.dataset.changed=JSON.stringify((event as CustomEvent).detail);});
    form.addEventListener('submit',event=>{event.preventDefault();form.dataset.submitted=String(new FormData(form,(event as SubmitEvent).submitter).get('action'));});
  });
  const host=page.locator('#icon-element'),button=host.getByRole('button');
  await button.click();await expect(button).toHaveAttribute('aria-pressed','true');await expect(host.locator('[data-icon-name="check"]')).toHaveCount(1);
  await expect(page.locator('#icon-element-form')).toHaveAttribute('data-changed',JSON.stringify({selected:true,value:'favorite'}));
  await host.evaluate(async node=>{const element=node as MaterialFluidIconButtonElement;element.setSelectedIcon(null).setWidth('wide').setSize('xl').deselect();await element.updateComplete;});await expect(button.locator('[data-icon-fill="outlined"]')).toHaveCount(1);
  await host.evaluate(async node=>{const element=node as MaterialFluidIconButtonElement;element.setVariant('emphasize').setIcon('play_arrow').setSelectedIcon('pause').setAriaLabel('Play').setSelectedLabel('Pause').select();await element.updateComplete;});await expect(button).toHaveAccessibleName('Pause');
  await host.evaluate(async node=>{const element=node as MaterialFluidIconButtonElement;element.toggleSelected().disable();await element.updateComplete;});await expect(button).toBeDisabled();await expect(button).toHaveAccessibleName('Play');
  await host.evaluate(async node=>{const element=node as MaterialFluidIconButtonElement;element.enable();element.toggle=false;element.type='submit';element.name='action';element.value='save';await element.updateComplete;});await button.click();await expect(page.locator('#icon-element-form')).toHaveAttribute('data-submitted','save');
  await page.locator('#icon-element-form input').fill('Changed');await host.evaluate(async node=>{const element=node as MaterialFluidIconButtonElement;element.type='reset';await element.updateComplete;});await button.click();await expect(page.locator('#icon-element-form input')).toHaveValue('Original');
});
