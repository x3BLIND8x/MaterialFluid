import {test,expect} from '@playwright/test';
for(const locale of ['en','fa']) {
  test(`${locale} dates share native button triggers and calendar arrows follow reading direction`,async({page})=>{
    await page.addInitScript(locale=>localStorage.setItem('materialfluid.preferences',JSON.stringify({locale,motion:'expressive'})),locale);
    await page.goto('/#/components/date-picker');
    const trigger=page.locator('.demo-primary .mf-select-trigger').first();
    await expect(trigger).toHaveJSProperty('tagName','BUTTON');
    await expect(trigger.locator('input,button')).toHaveCount(0);
    await trigger.click();await expect(page.locator('.mf-date-popover')).toBeVisible();
    const previous=page.locator('.mf-date-popover .rdp-button_previous:visible');const next=page.locator('.mf-date-popover .rdp-button_next:visible');
    await expect(previous.locator('.mf-animated-icon')).toHaveAttribute('data-icon-name',locale==='fa'?'chevron-right':'chevron-left');
    await expect(next.locator('.mf-animated-icon')).toHaveAttribute('data-icon-name',locale==='fa'?'chevron-left':'chevron-right');
    const before=await page.locator('.mf-date-popover .mf-calendar-caption').innerText();await next.click();
    await expect(page.locator('.mf-date-popover .mf-calendar-caption').last()).not.toHaveText(before);
    await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
    await trigger.press('Space');await expect(page.locator('.mf-date-popover')).toBeVisible();await page.keyboard.press('Escape');
    const style=await trigger.evaluate(el=>{const s=getComputedStyle(el);return{height:s.height,radius:s.borderRadius,padding:s.padding}});
    await page.goto('/#/components/date-range-picker');
    const range=page.locator('.demo-primary .mf-select-trigger').first();await expect(range).toBeVisible();
    expect(await range.evaluate(el=>{const s=getComputedStyle(el);return{height:s.height,radius:s.borderRadius,padding:s.padding}})).toEqual(style);
  });
  test(`${locale} connected groups follow reading order and pagination arrows remain directional`,async({page})=>{
    await page.addInitScript(locale=>localStorage.setItem('materialfluid.preferences',JSON.stringify({locale,motion:'minimal'})),locale);
    await page.goto('/#/components/button-group');
    await page.locator('#example-presets button[data-value="single"]').evaluate((node:HTMLButtonElement)=>node.click());
    const group=page.locator('.button-group-preview > .mf-button-group');await expect(group).toHaveAttribute('data-selection','single');
    const actions=group.locator(':scope > button');const first=await actions.first().boundingBox(),last=await actions.last().boundingBox();
    expect(locale==='fa'?first!.x>last!.x:first!.x<last!.x).toBe(true);
    await actions.first().focus();await page.keyboard.press('Enter');await expect(actions.first()).toHaveAttribute('aria-pressed','true');
    await page.goto('/#/components/pagination');
    const previous=page.getByRole('button',{name:locale==='fa'?'صفحه قبل':'Previous page',exact:true});
    const next=page.getByRole('button',{name:locale==='fa'?'صفحه بعد':'Next page',exact:true});
    await expect(previous.locator('.mf-animated-icon')).toHaveAttribute('data-icon-name',locale==='fa'?'arrow-right':'arrow-left');
    await expect(next.locator('.mf-animated-icon')).toHaveAttribute('data-icon-name',locale==='fa'?'arrow-left':'arrow-right');
  });
}
