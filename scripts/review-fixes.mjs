import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
for(const [route,selector] of [['data-table','.mf-data-table th button:not(.mf-checkbox)'],['accordion','.mf-accordion-trigger'],['stepper','.mf-stepper button'],['chip','.mf-chip > button:not(.mf-icon-button)']]){
 await page.goto('http://127.0.0.1:5173/#/components/'+route);
 const target=page.locator(selector).first();await target.waitFor();await target.focus();await page.evaluate(()=>document.fonts.ready);
 const radius=await target.evaluate(element=>getComputedStyle(element).borderRadius);
 if(radius==='0px')throw Error('Square focus surface: '+route);
 console.log(route,'radius:',radius);
 await page.screenshot({path:'.impeccable/review/focus-'+route+'.png',fullPage:true});
}
await page.goto('http://127.0.0.1:5173/#/components/bottom-sheet');await page.getByRole('button',{name:'Open bottom sheet',exact:true}).click();const sheet=page.locator('.mf-bottom-sheet');await sheet.waitFor();await page.waitForTimeout(350);console.log('sheet corners',await sheet.evaluate(element=>{const s=getComputedStyle(element);return [s.borderTopLeftRadius,s.borderTopRightRadius,s.borderBottomLeftRadius,s.borderBottomRightRadius];}));await page.screenshot({path:'.impeccable/review/rounded-bottom-sheet.png',fullPage:false});await browser.close();
