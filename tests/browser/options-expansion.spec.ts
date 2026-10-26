import {test,expect} from '@playwright/test';

for (const route of ['select','combobox','multi-select']) {
  test(`${route} morphs its entire surface and collapses on repeated keyboard dismissals`,async({page})=>{
    await page.goto('/');
    await page.evaluate(()=>localStorage.setItem('materialfluid.preferences',JSON.stringify({locale:'en',motion:'expressive'})));
    await page.goto(`/#/components/${route}`);
    await page.reload();
    const demo=page.locator('.demo-primary').first();
    const surface=demo.locator('.mf-input-wrap,.mf-select-trigger').first();
    const trigger=route==='select'?demo.locator('.mf-single-select-trigger').first():route==='combobox'?demo.locator('input[role=combobox]').first():demo.locator('.mf-multi-select-content > button').first();
    for(let repeat=0;repeat<2;repeat++){
      await page.evaluate(()=>{
        if(document.documentElement.dataset.freezeOptions)return;
        document.documentElement.dataset.freezeOptions='true';
        const animate=Element.prototype.animate;
        Element.prototype.animate=function(keyframes,options){
          const animation=animate.call(this,keyframes,options);
          if(this.matches('.mf-options-popup[data-state="open"]'))animation.pause();
          return animation;
        };
      });
      await trigger.click();
      const panel=page.locator('.mf-options-popup');
      await expect(panel).toBeAttached();
      await expect(panel).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
      await expect(panel).toHaveCSS('border-top-width','0px');
      await expect(panel).not.toHaveClass(/mf-floating/);
      const frames=await panel.evaluate(async el=>{
        const animation=el.getAnimations().find(a=>(a.effect as KeyframeEffect).getKeyframes().some(frame=>'--mf-options-reveal' in frame));
        if(!animation)throw new Error('Missing height morph');
        animation.pause();
        const heights=[];
        for(const time of [0,75,150,300]){animation.currentTime=time;await new Promise(requestAnimationFrame);heights.push(el.querySelector('.mf-options-viewport')!.getBoundingClientRect().height)}
        animation.finish();
        const row=el.querySelector('.mf-select-item')!;
        const entrance=row.getAnimations().find(a=>(a.effect as KeyframeEffect).getKeyframes().some(frame=>'filter' in frame));
        if(!entrance)throw new Error('Missing row entrance');
        entrance.pause();entrance.currentTime=50;
        const blur=getComputedStyle(row).filter;
        entrance.finish();
        return {heights,blur};
      });
      expect(frames.heights[0]).toBeLessThan(frames.heights[1]);
      expect(frames.heights[1]).toBeLessThan(frames.heights[2]);
      expect(frames.heights[2]).toBeLessThan(frames.heights[3]);
      await expect(surface).toHaveCSS('border-bottom-color','rgba(0, 0, 0, 0)');
      await expect(surface).toHaveCSS('outline-style','none');
      await expect(surface).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
      expect(await panel.evaluate(el=>getComputedStyle(el,'::before').backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
      expect(frames.blur).not.toBe('blur(0px)');
      await expect(surface).toHaveAttribute('data-options-expanded','true');
      await expect(surface.locator('.mf-icon-button .mf-animated-icon').last()).toHaveCSS('rotate','180deg');
      const fieldBox=(await surface.boundingBox())!;const listBox=(await panel.boundingBox())!;
      expect(listBox.width).toBeCloseTo(fieldBox.width,0);
      const side=await panel.getAttribute('data-side');
      expect(Math.abs(side==='top'?fieldBox.y-(listBox.y+listBox.height):listBox.y-(fieldBox.y+fieldBox.height))).toBeLessThan(2);
      await page.keyboard.press('Escape');
      const closing=await panel.evaluate(async el=>{
        const heights=[];
        for(let i=0;i<8&&el.isConnected;i++){heights.push(el.querySelector('.mf-options-viewport')!.getBoundingClientRect().height);await new Promise(requestAnimationFrame)}
        return heights;
      });
      expect(closing.at(-1)!).toBeLessThan(closing[0]);
      await expect(panel).toHaveCount(0);
      await expect(surface).not.toHaveAttribute('data-options-expanded');
    }
  });
}

test('filtering retargets the expanded surface and keyboard selection commits',async({page})=>{
  await page.goto('/#/components/combobox');
  const input=page.locator('.demo-primary input[role=combobox]').first();await input.click();
  const panel=page.locator('.mf-options-popup');await expect(panel).toBeVisible();
  const label=(await panel.getByRole('option').filter({hasText:'Development'}).first().textContent())!.trim();
  await input.fill(label);await expect(panel.getByRole('option')).toHaveCount(1);
  await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
  await expect(input).toHaveValue(label);await expect(panel).toHaveCount(0);
});

for(const mode of ['minimal','reduced'])test(`${mode} motion opens immediately on mobile RTL`,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  if(mode==='reduced')await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');await page.evaluate(mode=>localStorage.setItem('materialfluid.preferences',JSON.stringify({locale:'fa',motion:mode==='minimal'?'minimal':'expressive'})),mode);
  await page.goto('/#/components/combobox');await page.reload();
  const input=page.locator('.demo-primary input[role=combobox]').first();await input.click();
  const panel=page.locator('.mf-options-popup');await expect(panel).toBeVisible();
  expect(await panel.evaluate(el=>el.getAnimations().length)).toBe(0);
  const box=(await panel.boundingBox())!;expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(391);
  await page.keyboard.press('Escape');await expect(panel).toHaveCount(0);
});


test('an interrupted close reopens from its current height and upward placement stays connected',async({page})=>{
  await page.goto('/#/components/combobox');
  const input=page.locator('.demo-primary input[role=combobox]').first();
  await input.click();const panel=page.locator('.mf-options-popup');
  await expect.poll(()=>panel.evaluate(el=>el.getBoundingClientRect().height)).toBeGreaterThan(250);
  await page.keyboard.press('Escape');await input.click();
  await expect(input).toHaveAttribute('aria-expanded','true');
  await expect.poll(()=>panel.evaluate(el=>el.getBoundingClientRect().height)).toBeGreaterThan(250);
  await page.keyboard.press('Escape');await expect(panel).toHaveCount(0);
  await page.setViewportSize({width:800,height:700});
  await page.locator('.demo-primary').first().evaluate(el=>{el.style.position='fixed';el.style.top='480px';el.style.left='300px';el.style.width='360px';});
  await input.click();await expect(panel).toHaveAttribute('data-side','top');
  await expect.poll(()=>panel.evaluate(el=>el.getBoundingClientRect().height)).toBeGreaterThan(250);
  const field=(await input.locator('..').locator('..').boundingBox())!;const list=(await panel.boundingBox())!;
  expect(Math.abs(list.y+list.height-field.y)).toBeLessThan(2);
  expect(list.y).toBeGreaterThanOrEqual(0);
});
