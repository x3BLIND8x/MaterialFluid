import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { MaterialFluidButtonGroupElement } from "../../src/kit/elements";
const preview=(page:Page)=>page.locator('.button-group-preview > .mf-button-group');
const pick=async(page:Page,section:string,value:string)=>{await page.locator(`${section} button[data-value="${value}"]`).click();};
for(const config of [{locale:"en",theme:"light",width:1440},{locale:"fa",theme:"dark",width:1440},{locale:"en",theme:"dark",width:390},{locale:"fa",theme:"light",width:390}])test(`ButtonGroup configuration ${config.locale} ${config.theme} ${config.width}`,async({page})=>{
  test.setTimeout(90000);
  await page.setViewportSize({width:config.width,height:1000});await page.emulateMedia({reducedMotion:"reduce"});
  await page.addInitScript(prefs=>localStorage.setItem("materialfluid.preferences",JSON.stringify({...prefs,motion:"minimal"})),config);
  const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));await page.goto('/#/components/button-group');
  const group=preview(page);await expect(group).toBeVisible();await expect(group.locator(':scope > button')).toHaveCount(3);
  await expect(page.locator('.button-group-configuration')).not.toContainText(/Square|Elevated/);
  await expect(page.locator('.documentation-section,.page-sections')).toHaveCount(0);
  const controls='#button-group-appearance';
  for(const kind of ['standard','connected']){
    await pick(page,controls,kind);await expect(group).toHaveAttribute('data-kind',kind);
    for(const [size,height]of [['xs',24],['sm',28],['md',48],['lg',58],['xl',96]] as const){await pick(page,controls,size);await expect.poll(()=>group.locator(':scope > button').first().evaluate(el=>el.getBoundingClientRect().height)).toBeCloseTo(height,0);}
  }
  await pick(page,controls,'md');
  for(const [density,height]of [['default',48],['comfortable',44],['compact',40]] as const){await pick(page,controls,density);await expect.poll(()=>group.locator(':scope > button').first().evaluate(el=>el.getBoundingClientRect().height)).toBeCloseTo(height,0);}
  await pick(page,controls,'default');await pick(page,'#example-presets','single');
  const buttons=group.locator(':scope > button');await expect(buttons.nth(1)).toHaveAttribute('aria-pressed','true');await buttons.nth(0).click();await expect(buttons.nth(0)).toHaveAttribute('aria-pressed','true');await buttons.nth(0).click();await expect(buttons.nth(0)).toHaveAttribute('aria-pressed','true');
  const corners=await buttons.first().evaluate(el=>{const css=getComputedStyle(el);return {outer:parseFloat(css.borderStartStartRadius),inner:parseFloat(css.borderStartEndRadius)};});expect(corners.outer).toBeCloseTo(corners.inner,0);
  await page.getByRole('switch',{name:config.locale==='fa'?'عرض یکسان':'Equal width',exact:true}).click();const widths=await buttons.evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().width));expect(Math.max(...widths)-Math.min(...widths)).toBeLessThan(1);
  const positions=await buttons.evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().x));expect(config.locale==='fa'?positions[0]>positions[2]:positions[0]<positions[2]).toBe(true);
  expect((await new AxeBuilder({page}).include('.showcase-frame').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  await page.screenshot({path:`reports/button-group-2026-11-09/${config.locale}-${config.theme}-${config.width}.png`,fullPage:true});
  await page.getByRole('tab',{name:config.locale==='fa'?'مستندات':'Documentation',exact:true}).click();await expect(page.locator('.usage-code')).toContainText('ButtonGroupItem');
  await page.getByRole('button',{name:'Web Components',exact:true}).click();await expect(page.locator('.usage-code')).toContainText('defineMaterialFluidButtonGroup');await expect(page.locator('.usage-code')).toContainText('<mf-button-group-item');
  await page.getByRole('tab',{name:config.locale==='fa'?'پیکربندی':'Configuration',exact:true}).focus();await page.keyboard.press('Enter');await expect(group.locator(':scope > button').first()).toHaveAttribute('aria-pressed','true');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
test('Emphasize is Behavior for both controls, keeps Primary off/on, and never adds an Appearance variant',async({page})=>{
  for(const route of ['button','icon-button']){
    await page.goto(`/#/components/${route}`);const form=page.locator(`.${route}-preview-form`),button=form.locator(':scope > button');await expect(button).toBeVisible();
    await expect(page.locator(`#${route}-appearance button[data-value="emphasize"]`)).toHaveCount(0);
    await pick(page,`#${route}-appearance`,'tonal');
    await page.getByRole('switch',{name:'Toggle button',exact:true}).click();await page.getByRole('switch',{name:'Emphasize',exact:true}).click();await expect(button).toHaveAttribute('data-emphasize','true');
    await page.mouse.move(0,0);const color=await button.evaluate(el=>{const probe=document.createElement('span');probe.style.background='var(--mf-primary-fill)';el.append(probe);const color=getComputedStyle(probe).backgroundColor;probe.remove();return color;});await expect(button).toHaveCSS('background-color',color);await button.evaluate((el:HTMLButtonElement)=>el.click());await expect(button).toHaveAttribute('aria-pressed','true');await expect(button).toHaveCSS('background-color',color);
    await pick(page,`#${route}-appearance`,'outlined');await expect(button).toHaveAttribute('data-emphasize','true');await expect(button).toHaveCSS('background-color',color);
    await page.getByRole('tab',{name:'Documentation',exact:true}).click();await expect(page.locator('.usage-code')).toContainText('emphasize');await expect(page.locator('.usage-code')).not.toContainText('variant="emphasize"');
    await page.getByRole('button',{name:'Web Components',exact:true}).click();await expect(page.locator('.usage-code')).toContainText(' emphasize');
  }
});
test('standard presses retain layout and change radius, keyboard works and connected selected labels animate',async({page})=>{
  await page.goto('/#/components/button-group');const group=preview(page),buttons=group.locator(':scope > button');await expect(buttons).toHaveCount(3);
  const before=await buttons.evaluateAll(nodes=>nodes.map(node=>({width:(node as HTMLElement).offsetWidth,radius:parseFloat(getComputedStyle(node).borderTopLeftRadius),content:node.querySelector('.mf-button-content')!.getBoundingClientRect().width})));
  await buttons.nth(1).hover();await page.mouse.down();
  await expect.poll(()=>buttons.nth(1).evaluate(node=>parseFloat(getComputedStyle(node).borderTopLeftRadius))).toBeLessThan(before[1].radius-1);expect(await buttons.nth(1).evaluate(node=>(node as HTMLElement).offsetWidth)).toBe(before[1].width);
  const content=await buttons.nth(1).locator('.mf-button-content').boundingBox();expect(content!.width).toBeCloseTo(before[1].content,0);
  await page.mouse.up();await expect.poll(()=>buttons.nth(1).evaluate(el=>(el as HTMLElement).style.width)).toBe('');
  await pick(page,'#example-presets','multi');await buttons.first().focus();await page.keyboard.press('Space');await expect(buttons.first()).toHaveAttribute('aria-pressed','false');await page.keyboard.press('Tab');await expect(buttons.nth(1)).toBeFocused();await page.keyboard.press('Enter');await expect(buttons.nth(1)).toHaveAttribute('aria-pressed','true');
  await pick(page,'#example-presets','labels');await expect(buttons.first().locator('[data-icon-name="search"]')).toBeVisible();
  await expect.poll(()=>buttons.first().locator('.mf-group-label').evaluate(el=>el.getBoundingClientRect().width)).toBeGreaterThan(20);
  await expect(buttons.nth(1)).toHaveAccessibleName('Nearby');await buttons.nth(1).click();
  await expect.poll(()=>buttons.first().locator('.mf-group-label').evaluate(el=>el.getBoundingClientRect().width)).toBeLessThan(1);
  await expect.poll(()=>buttons.nth(1).locator('.mf-group-label').evaluate(el=>el.getBoundingClientRect().width)).toBeGreaterThan(20);
  await page.emulateMedia({reducedMotion:'reduce'});await buttons.nth(2).click();await expect(buttons.nth(2)).toHaveAttribute('aria-pressed','true');
  await page.getByRole('group',{name:'Button 1 icon',exact:true}).getByRole('button').click();const dialog=page.getByRole('dialog',{name:'Choose an icon',exact:true});await expect(dialog).toContainText('4,322');await dialog.getByRole('searchbox',{name:'Search all icons',exact:true}).fill('rocket_launch');await dialog.getByRole('button',{name:'rocket_launch',exact:true}).click();await expect(buttons.first().locator('[data-icon-name="rocket_launch"]')).toBeVisible();
});
test('ButtonGroup Web Component methods, events, disabled items, content updates and native forms',async({page})=>{
  await page.goto('/#/components/button-group');await page.evaluate(async()=>{
    const {defineMaterialFluidButtonGroup}=await import(/* @vite-ignore */ String('/src/kit/elements.tsx'));defineMaterialFluidButtonGroup();
    const form=document.createElement('form');form.id='group-web-form';form.innerHTML='<mf-button-group id="group-web" aria-label="Web actions" kind="connected" selection="multi" required value=\'["a"]\'><mf-button-group-item value="a">A</mf-button-group-item><mf-button-group-item value="b" name="action" type="submit">B</mf-button-group-item><mf-button-group-item value="c" disabled>C</mf-button-group-item></mf-button-group>';
    form.addEventListener('submit',event=>{event.preventDefault();form.dataset.submitted=String(new FormData(form,(event as SubmitEvent).submitter).get('action'));});document.body.append(form);
    const group=document.querySelector<MaterialFluidButtonGroupElement>('#group-web')!;await group.updateComplete;
    const events:string[]=[];group.addEventListener('action',event=>{events.push('action');form.dataset.action=JSON.stringify((event as CustomEvent).detail);});group.addEventListener('change',event=>{events.push('change');form.dataset.change=JSON.stringify((event as CustomEvent).detail.value);form.dataset.order=events.join(',');});
  });
  const host=page.locator('#group-web');await expect(host.getByRole('button',{name:'A',exact:true})).toHaveAttribute('aria-pressed','true');await host.getByRole('button',{name:'B',exact:true}).click();
  await expect(page.locator('#group-web-form')).toHaveAttribute('data-order','action,change');await expect(page.locator('#group-web-form')).toHaveAttribute('data-submitted','b');
  expect(await host.evaluate(async node=>{const group=node as MaterialFluidButtonGroupElement;group.deselect('a').deselect('b');await group.updateComplete;return group.getSelected();})).toEqual(['b']);
  await host.evaluate(async node=>{const group=node as MaterialFluidButtonGroupElement;group.disable();await group.updateComplete;group.enable().disableButton(0).setDensity('compact').setOrientation('vertical').setVariant('tonal');await group.updateComplete;});
  await expect(host.getByRole('button',{name:'A',exact:true})).toBeDisabled();await expect(host.getByRole('button',{name:'C',exact:true})).toBeDisabled();await expect(host.getByRole('button',{name:'B',exact:true})).toBeEnabled();
  await host.evaluate(async node=>{const group=node as MaterialFluidButtonGroupElement;group.enableButton(2);group.querySelector('mf-button-group-item[value="c"]')!.textContent='Changed';await group.updateComplete;});await expect(host.getByRole('button',{name:'Changed',exact:true})).toBeEnabled();
  expect((await new AxeBuilder({page}).include('#group-web-form').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  await host.evaluate(async node=>{const group=node as MaterialFluidButtonGroupElement;const parent=group.parentElement!;group.remove();await Promise.resolve();parent.append(group);await group.updateComplete;});await expect(host.getByRole('button',{name:'B',exact:true})).toHaveAttribute('aria-pressed','true');
});

for(const width of [1440,390])test(`stable Standard selected-only labels and rounded Connected selection ${width}`,async({page})=>{
  await page.setViewportSize({width,height:1000});
  await page.addInitScript(()=>localStorage.setItem('materialfluid.preferences',JSON.stringify({locale:'en',motion:'expressive'})));
  await page.goto('/#/components/button-group');
  const group=preview(page),buttons=group.locator(':scope > button');await expect(buttons).toHaveCount(3);
  await pick(page,'#example-presets','labels');await pick(page,'#button-group-appearance','standard');
  await expect(buttons.nth(1).locator('[data-icon-name="location_on"]')).toBeVisible();await page.evaluate(()=>document.fonts.ready);await expect.poll(()=>buttons.nth(1).evaluate(el=>parseFloat((el as HTMLElement).style.getPropertyValue('--mf-group-label-min')))).toBeGreaterThan(40);
  const before=await buttons.evaluateAll(nodes=>nodes.map(node=>(node as HTMLElement).offsetWidth));
  const trace=await buttons.nth(1).evaluate(async node=>{
    (node as HTMLButtonElement).click();const frames:{widths:number[];bars:boolean;pageOverflow:boolean}[]=[];const root=node.parentElement!;const end=performance.now()+700;
    while(performance.now()<end){frames.push({widths:Array.from(root.children).map(el=>(el as HTMLElement).offsetWidth),bars:root.offsetHeight-root.clientHeight>0||root.offsetWidth-root.clientWidth>0,pageOverflow:document.documentElement.scrollWidth>innerWidth});await new Promise(requestAnimationFrame);}
    return frames;
  });
  expect(trace.every(frame=>frame.widths.every((value,index)=>Math.abs(value-before[index])<=1))).toBe(true);
  expect(trace.some(frame=>frame.bars||frame.pageOverflow)).toBe(false);
  await expect(buttons.nth(1)).toHaveAttribute('aria-pressed','true');
  await expect.poll(()=>buttons.nth(1).locator('.mf-group-label').evaluate(el=>el.getBoundingClientRect().width)).toBeGreaterThan(20);
  const off=await buttons.first().evaluate(el=>{const content=el.querySelector('.mf-button-content')!.getBoundingClientRect(),icon=el.querySelector('.mf-animated-icon')!.getBoundingClientRect();return Math.abs(icon.x+icon.width/2-content.x-content.width/2);});expect(off).toBeLessThan(1);
  await pick(page,'#button-group-appearance','connected');
  const radius=await buttons.nth(1).evaluate(el=>{const css=getComputedStyle(el);return [css.borderTopLeftRadius,css.borderTopRightRadius,css.borderBottomRightRadius,css.borderBottomLeftRadius].map(parseFloat);});
  expect(Math.max(...radius)-Math.min(...radius)).toBeLessThan(1);expect(radius[0]).toBeGreaterThan(8);
  await buttons.nth(1).hover();await page.mouse.down();await expect.poll(()=>buttons.nth(1).evaluate(el=>parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeLessThan(radius[0]-1);await page.mouse.up();
  await expect.poll(()=>buttons.nth(1).evaluate(el=>parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeCloseTo(radius[0],0);
});

test('group spring overshoot has painting room in both orientations',async({page})=>{
  await page.goto('/#/components/button-group');const group=preview(page),buttons=group.locator(':scope > button');await expect(buttons).toHaveCount(3);
  for(const orientation of ['horizontal','vertical']){
    await pick(page,'#button-group-appearance',orientation);
    const css=await group.evaluate(el=>{const css=getComputedStyle(el);return {overflow:css.overflow,margin:parseFloat(css.overflowClipMargin)};});expect(css.overflow).toBe('clip');expect(css.margin).toBeGreaterThanOrEqual(16);
    await buttons.first().hover();await page.mouse.down();await page.mouse.up();
    const frames=await group.evaluate(async el=>{const samples:boolean[]=[];const until=performance.now()+700;while(performance.now()<until){const group=el.getBoundingClientRect(),room=parseFloat(getComputedStyle(el).overflowClipMargin);samples.push(Array.from(el.children).every(node=>{const button=node.getBoundingClientRect();return button.left>=group.left-room&&button.right<=group.right+room&&button.top>=group.top-room&&button.bottom<=group.bottom+room;}));await new Promise(requestAnimationFrame);}return samples;});expect(frames.every(Boolean)).toBe(true);
  }
});

test('connected selected-label growth keeps the existing ripple covering the button',async({page})=>{
  await page.setViewportSize({width:390,height:1000});
  await page.addInitScript(()=>localStorage.setItem('materialfluid.preferences',JSON.stringify({locale:'en',motion:'expressive'})));
  await page.goto('/#/components/button-group');await pick(page,'#example-presets','labels');const button=preview(page).locator(':scope > button').nth(1);await expect(button.locator('[data-icon-name="location_on"]')).toBeVisible();
  await button.hover();await page.mouse.down();const ripple=button.locator('.mf-button-ripple');await expect.poll(()=>ripple.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).a)).toBeCloseTo(1,3);
  const before=await ripple.evaluate(el=>parseFloat(getComputedStyle(el).width));await button.evaluate((el:HTMLButtonElement)=>el.click());await expect(button).toHaveAttribute('aria-pressed','true');
  await expect.poll(()=>ripple.evaluate(el=>parseFloat(getComputedStyle(el).width))).toBeGreaterThan(before+20);
  await expect.poll(()=>ripple.evaluate(el=>{const css=getComputedStyle(el),size=parseFloat(css.width),x=parseFloat(css.left)+size/2,y=parseFloat(css.top)+size/2,button=el.closest('button')!;return Math.abs(size-2*Math.hypot(Math.max(x,button.offsetWidth-x),Math.max(y,button.offsetHeight-y)));})).toBeLessThan(1);
  await page.mouse.up();await expect(ripple).toHaveCount(0);
});

for(const locale of ['en','fa'])test(`group selection remains current after cached configuration edits ${locale}`,async({page})=>{
  await page.setViewportSize({width:locale==='fa'?390:1440,height:1000});
  await page.addInitScript(locale=>localStorage.setItem('materialfluid.preferences',JSON.stringify({locale,motion:'expressive'})),locale);
  await page.goto('/#/components/button-group');await pick(page,'#example-presets','multi');const buttons=preview(page).locator(':scope > button');
  await buttons.nth(1).evaluate((el:HTMLButtonElement)=>el.click());await expect(buttons.nth(1)).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#example-presets button[data-value="multi"]')).toHaveAttribute('aria-pressed','true');
  await pick(page,'#button-group-behavior','single');await expect(buttons.first()).toHaveAttribute('aria-pressed','true');await expect(buttons.nth(1)).toHaveAttribute('aria-pressed','false');
  await buttons.nth(2).evaluate((el:HTMLButtonElement)=>el.click());await expect(buttons.nth(2)).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:locale==='fa'?'حذف دکمه 1':'Remove button 1',exact:true}).click();await expect(buttons).toHaveCount(2);await expect(buttons.nth(1)).toHaveAttribute('aria-pressed','true');
  await pick(page,'#button-group-appearance','tonal');await expect(buttons.nth(1)).toHaveAttribute('aria-pressed','true');
  await page.getByRole('tab',{name:locale==='fa'?'مستندات':'Documentation',exact:true}).click();await expect(page.locator('.usage-code')).toContainText('underline');
  await page.getByRole('tab',{name:locale==='fa'?'پیکربندی':'Configuration',exact:true}).click();await expect(buttons.nth(1)).toHaveAttribute('aria-pressed','true');
  const search=page.getByRole('searchbox',{name:locale==='fa'?'جستجوی کامپوننت‌ها':'Search components',exact:true});
  if(await search.isVisible()){await search.fill('Button Group');await expect(page.locator('.catalogue-tree')).toContainText(locale==='fa'?'گروه دکمه':'Button Group');await search.clear();}
});
