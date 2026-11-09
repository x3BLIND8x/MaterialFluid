import {test,expect} from '@playwright/test';

for(const config of [{locale:'en',theme:'light',width:1440},{locale:'fa',theme:'dark',width:1440},{locale:'en',theme:'dark',width:390},{locale:'fa',theme:'light',width:390}])test(`Button progress sizing and placement ${config.locale} ${config.theme} ${config.width}`,async({page})=>{
  test.setTimeout(60000);
  await page.setViewportSize({width:config.width,height:1000});
  await page.addInitScript(prefs=>localStorage.setItem('materialfluid.preferences',JSON.stringify({...prefs,motion:'minimal'})),config);
  await page.goto('/#/components/button');
  const choose=async(value:string)=>page.locator(`.button-configuration .mf-toggle-group button[data-value="${value}"]`).evaluate((node:HTMLButtonElement)=>node.click());
  // An icon exposes the shared start/end control; progress replaces that slot.
  await choose('favorite');
  const button=page.locator('.button-preview-form > button'),progress=button.getByRole('progressbar');
  for(const position of ['start','end']){
    await choose(position);
    for(const mode of ['determinate','indeterminate']){
      await choose(mode);
      for(const [size,pixels] of [['xs',14],['sm',16],['md',22],['lg',24],['xl',32]] as const){
        await choose(size);await expect(progress).toHaveCSS('width',`${pixels}px`);await expect(progress).toHaveCSS('height',`${pixels}px`);
        const bounds=await progress.evaluate(node=>{
          const p=node.getBoundingClientRect(),svg=node.querySelector('svg')!.getBoundingClientRect(),button=node.closest('button')!.getBoundingClientRect();
          const content=node.parentElement!,text=[...content.childNodes].find(child=>child.nodeType===Node.TEXT_NODE&&child.textContent?.trim())!;
          const range=document.createRange();range.selectNodeContents(text);const label=range.getBoundingClientRect();
          return {centerError:Math.abs(p.y+p.height/2-button.y-button.height/2),svgError:Math.abs(svg.y+svg.height/2-p.y-p.height/2),inside:p.left>=button.left&&p.right<=button.right,side:p.x<label.x?'left':'right'};
        });
        expect(bounds.centerError,`${mode}/${size}/${position}`).toBeLessThan(1);expect(bounds.svgError).toBeLessThan(1);expect(bounds.inside).toBe(true);
        expect(bounds.side).toBe((position==='start')===(config.locale==='en')?'left':'right');
      }
    }
  }
});
