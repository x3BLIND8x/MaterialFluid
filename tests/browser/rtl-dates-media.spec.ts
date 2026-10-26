import {test,expect} from '@playwright/test';
for(const locale of ['en','fa']) {
  test(`${locale} dates share native button triggers and calendar arrows follow reading direction`,async({page})=>{
    await page.addInitScript(locale=>localStorage.setItem('materialfluid.preferences',JSON.stringify({locale,motion:'expressive'})),locale);
    await page.goto('/#/components/date-picker');
    const trigger=page.locator('.demo-primary .mf-select-trigger').first();
    await expect(trigger).toHaveJSProperty('tagName','BUTTON');
    await expect(trigger.locator('input,button')).toHaveCount(0);
    await trigger.click();await expect(page.locator('.mf-date-popover')).toBeVisible();
    const previous=page.locator('.mf-date-popover .rdp-button_previous');const next=page.locator('.mf-date-popover .rdp-button_next');
    await expect(previous.locator('.mf-animated-icon')).toHaveAttribute('data-icon-name',locale==='fa'?'chevron-right':'chevron-left');
    await expect(next.locator('.mf-animated-icon')).toHaveAttribute('data-icon-name',locale==='fa'?'chevron-left':'chevron-right');
    const before=await page.locator('.mf-date-popover .rdp-month_caption').innerText();await next.click();
    await expect(page.locator('.mf-date-popover .rdp-month_caption').last()).not.toHaveText(before);
    await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
    await trigger.press('Space');await expect(page.locator('.mf-date-popover')).toBeVisible();await page.keyboard.press('Escape');
    const style=await trigger.evaluate(el=>{const s=getComputedStyle(el);return{height:s.height,radius:s.borderRadius,padding:s.padding}});
    await page.goto('/#/components/date-range-picker');
    const range=page.locator('.demo-primary .mf-select-trigger').first();await expect(range).toBeVisible();
    expect(await range.evaluate(el=>{const s=getComputedStyle(el);return{height:s.height,radius:s.borderRadius,padding:s.padding}})).toEqual(style);
  });
  test(`${locale} playback retains media order and page ratio reads current / total`,async({page})=>{
    await page.addInitScript(locale=>localStorage.setItem('materialfluid.preferences',JSON.stringify({locale,motion:'minimal'})),locale);
    await page.goto('/#/components/button-group');
    const playback=page.getByRole('group',{name:locale==='fa'?'پخش':'Playback',exact:true});
    const rewind=playback.getByRole('button',{name:locale==='fa'?'۱۰ ثانیه به عقب':'Rewind 10 seconds'});
    const forward=playback.getByRole('button',{name:locale==='fa'?'۱۰ ثانیه به جلو':'Forward 10 seconds'});
    expect((await rewind.boundingBox())!.x).toBeLessThan((await forward.boundingBox())!.x);
    await playback.getByRole('button',{name:locale==='fa'?'پخش':'Play',exact:true}).click();
    await expect(playback.getByRole('button',{name:locale==='fa'?'مکث':'Pause',exact:true})).toHaveAttribute('aria-pressed','true');
    await playback.getByRole('button',{name:locale==='fa'?'توقف':'Stop',exact:true}).click();
    const pages=page.getByRole('group',{name:locale==='fa'?'صفحه‌بندی':'Pagination',exact:true});
    await pages.getByRole('button',{name:locale==='fa'?'بعدی':'Next',exact:true}).click();
    const ratio=pages.locator('output');await expect(ratio).toHaveCSS('direction','ltr');
    const positions=await ratio.evaluate(el=>Array.from(el.children).map(child=>child.getBoundingClientRect().x));
    expect(positions[0]).toBeLessThan(positions[1]);expect(positions[1]).toBeLessThan(positions[2]);
    await expect(ratio).toHaveAttribute('aria-label',locale==='fa'?'صفحهٔ ۲ از ۵':'Page 2 of 5');
    await page.goto('/#/components/pagination');
    const previous=page.getByRole('button',{name:locale==='fa'?'صفحه قبل':'Previous page',exact:true});
    const next=page.getByRole('button',{name:locale==='fa'?'صفحه بعد':'Next page',exact:true});
    await expect(previous.locator('.mf-animated-icon')).toHaveAttribute('data-icon-name',locale==='fa'?'arrow-right':'arrow-left');
    await expect(next.locator('.mf-animated-icon')).toHaveAttribute('data-icon-name',locale==='fa'?'arrow-left':'arrow-right');
  });
}
