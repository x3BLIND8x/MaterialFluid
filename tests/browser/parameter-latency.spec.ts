import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('materialfluid.preferences', JSON.stringify({locale:'en', motion:'expressive'})));
});

for (const scenario of [
  { route:'components/button', control:'.mf-toggle-group[aria-label="Size"] button[data-value="lg"]', target:'.live-stage button', metric:'height', maxClones:5 },
  { route:'foundations/shape', control:'.foundation-shapes button[aria-label="Heart"]', target:'.foundation-shape-preview path', metric:'d', maxClones:5 },
  { route:'foundations/typography', control:'.mf-toggle-group[aria-label="Type family"] button[data-value="display"]', target:'.foundation-type-specimen', metric:'fontSize', maxClones:0 },
]) test(`${scenario.route} starts without measuring unchanged Buttons or sampling SVG paths`, async ({ page }) => {
  await page.goto('/#/'+scenario.route);
  await page.locator(scenario.control).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  const result=await page.evaluate(async ({control,target,metric}) => {
    const node=document.querySelector(target)!, read=()=>metric==='d'?node.getAttribute('d'):getComputedStyle(node)[metric as 'height'|'fontSize'];
    const before=read(), clone=Element.prototype.cloneNode, sample=SVGPathElement.prototype.getPointAtLength;
    let clones=0, samples=0;
    Element.prototype.cloneNode=function(deep?:boolean){clones++;return clone.call(this,deep);};
    SVGPathElement.prototype.getPointAtLength=function(distance:number){samples++;return sample.call(this,distance);};
    try {
      (document.querySelector(control) as HTMLButtonElement).click();
      let changed=false;
      for(let i=0;i<6;i++){await new Promise(requestAnimationFrame);changed ||= read()!==before;}
      return {clones,samples,changed};
    } finally {Element.prototype.cloneNode=clone;SVGPathElement.prototype.getPointAtLength=sample;}
  }, scenario);
  expect(result.clones).toBeLessThanOrEqual(scenario.maxClones);
  expect(result.samples).toBe(0);
  expect(result.changed).toBe(true);
});
