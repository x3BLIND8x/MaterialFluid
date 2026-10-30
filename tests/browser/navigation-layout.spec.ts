import {test,expect} from '@playwright/test';
import {selectSize} from './helpers';

test('pagination numbers, overflow and stepper symbols stay centered at every size',async({page})=>{
 for(const locale of ['en','fa']){
  await page.goto('/');await page.evaluate(locale=>localStorage.setItem('materialfluid.preferences',JSON.stringify({locale,motion:'minimal'})),locale);await page.reload();
  for(const route of ['pagination','stepper']){
   await page.goto(`/#/components/${route}`);
   for(const size of ['sm','md','lg']){
    await selectSize(page,size);
    const offsets=await page.locator(route==='pagination'?'.demo-primary .mf-page-button':'.demo-primary .mf-step-dot').evaluateAll(nodes=>nodes.map(node=>{
     const ink=node.querySelector('.mf-step-symbol')??node.querySelector('span:not(.mf-selection)')!;
     const a=node.getBoundingClientRect(),b=ink.getBoundingClientRect();
     return {x:Math.abs(a.x+a.width/2-b.x-b.width/2),y:Math.abs(a.y+a.height/2-b.y-b.height/2)};
    }));
    for(const point of offsets){expect(point.x).toBeLessThan(1);expect(point.y).toBeLessThan(1);}
    if(route==='stepper'){
     const dot=page.locator('.demo-primary button[aria-current=step] .mf-step-dot');
     const a=(await dot.boundingBox())!,b=(await dot.locator('.mf-selection').boundingBox())!;
     expect(Math.abs(a.x-b.x)).toBeLessThan(1);expect(Math.abs(a.y-b.y)).toBeLessThan(1);
    }else await expect(page.locator('.demo-primary .mf-pagination-gap svg')).toHaveCount(1);
   }
  }
 }
});

test('Size stays inline, keeps short options on one line, and preserves corners during close',async({page})=>{
 await page.goto('/#/components/select');
 const trigger=page.locator('#component-size');
 await trigger.evaluate(n=>n.style.borderRadius="32px");
 const label=page.locator('label[for=component-size]');
 const a=(await trigger.boundingBox())!,b=(await label.boundingBox())!;
 expect(Math.abs(a.y+a.height/2-b.y-b.height/2)).toBeLessThan(1);
 await trigger.click();const panel=page.locator('.mf-options-popup');await expect(panel.getByRole('option')).toHaveCount(3);
 await expect(panel.getByRole('option',{name:'Medium',exact:true})).toBeVisible();
 const rows=await panel.locator('.mf-select-item-label').evaluateAll(nodes=>nodes.map(n=>({height:n.getBoundingClientRect().height,line:parseFloat(getComputedStyle(n).lineHeight)})));
 for(const row of rows)expect(row.height).toBeLessThanOrEqual(row.line+1);
 const radius=await trigger.evaluate(n=>`${Math.min((n as HTMLElement).offsetWidth/2,(n as HTMLElement).offsetHeight/2,parseFloat(getComputedStyle(n).borderTopLeftRadius))}px`);
 await page.keyboard.press('Escape');
 const corners=await panel.evaluate(async n=>{const result=[];for(let i=0;i<8&&n.isConnected;i++){const s=getComputedStyle(n,'::before');result.push([s.borderTopLeftRadius,s.borderBottomLeftRadius]);await new Promise(requestAnimationFrame);}return result;});
 for(const values of corners)expect(values).toEqual([radius,radius]);
 await expect(panel).toHaveCount(0);
});

test('label placement previews preserve field associations in English and Persian',async({page})=>{
 for(const locale of ['en','fa']){
  await page.goto('/');await page.evaluate(locale=>localStorage.setItem('materialfluid.preferences',JSON.stringify({locale,motion:'minimal'})),locale);await page.reload();await page.goto('/#/components/text-field');
  for(const [value,en,fa] of [['top','Top','بالا'],['start','Start','ابتدا'],['none','None','بدون برچسب']]){
   await page.locator('#component-label-position').click();await page.getByRole('option',{name:locale==='fa'?fa:en,exact:true}).click();
   const field=page.locator('.demo-primary .mf-field').first();await expect(field).toHaveClass(new RegExp(`mf-label--${value}`));
   const label=field.locator('> .mf-field-label'),control=field.locator('.mf-input-wrap').first();
   const a=(await label.boundingBox())!,b=(await control.boundingBox())!;
   if(value==='top')expect(a.y+a.height).toBeLessThanOrEqual(b.y);
   if(value==='none')await expect(label).toHaveCSS('clip-path','inset(50%)');
   if(value==='start'||value==='end'){
    const before=(value==='start')===(locale==='en');
    if(before)expect(a.x+a.width).toBeLessThanOrEqual(b.x);else expect(a.x).toBeGreaterThanOrEqual(b.x+b.width);
   }
   const id=await label.getAttribute('for');expect(id).toBeTruthy();await expect(field.locator('input')).toHaveAttribute('id',id!);
  }
 }
});
