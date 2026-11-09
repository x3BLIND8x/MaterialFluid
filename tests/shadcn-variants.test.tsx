import {afterEach,beforeAll,expect,it,vi} from 'vitest';
import {render,screen,cleanup,fireEvent} from '@testing-library/react';
import {MaterialFluidProvider} from '../src/kit/provider';
import {Accordion} from '../src/kit/surfaces';
import {Resizable,CodeBlock,Carousel,Trace} from '../src/kit/shadcn';
afterEach(cleanup);
it('uses independent shared accordion triggers only for trace steps with diagnostic output',()=>{
 render(<MaterialFluidProvider motion="minimal"><Trace steps={[{title:'Validate',description:'Checks passed',status:'complete',details:'42 checked'},{title:'Build',status:'error',details:'Missing export'},{title:'Publish',description:'Waiting for build',status:'pending'}]}/></MaterialFluidProvider>);
 const validate=screen.getByRole('button',{name:/Validate/}),build=screen.getByRole('button',{name:/Build/});
 expect(screen.queryByRole('button',{name:/Publish/})).toBeNull();expect(validate.classList.contains('mf-accordion-trigger')).toBe(true);expect(validate.classList.contains('mf-button')).toBe(false);
 fireEvent.click(validate);fireEvent.click(build);expect(validate.getAttribute('aria-expanded')).toBe('true');expect(build.getAttribute('aria-expanded')).toBe('true');fireEvent.click(build);expect(build.getAttribute('aria-expanded')).toBe('false');expect(validate.getAttribute('aria-expanded')).toBe('true');
});
beforeAll(()=>Object.defineProperty(window,'matchMedia',{writable:true,value:vi.fn(()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()}))}));
it('keeps two accordion sections open in multiple mode and closes one independently',()=>{
 render(<MaterialFluidProvider motion="minimal"><Accordion type="multiple" items={[{value:'a',title:'First',content:'First detail'},{value:'b',title:'Second',content:'Second detail'}]}/></MaterialFluidProvider>);
 fireEvent.click(screen.getByRole('button',{name:'First'}));fireEvent.click(screen.getByRole('button',{name:'Second'}));
 expect(screen.getByRole('button',{name:'First'}).getAttribute('aria-expanded')).toBe('true');expect(screen.getByRole('button',{name:'Second'}).getAttribute('aria-expanded')).toBe('true');
 fireEvent.click(screen.getByRole('button',{name:'First'}));expect(screen.getByRole('button',{name:'First'}).getAttribute('aria-expanded')).toBe('false');expect(screen.getByRole('button',{name:'Second'}).getAttribute('aria-expanded')).toBe('true');
});
it('uses up/down and snap points for a vertical resizer, ignoring horizontal keys',()=>{
 render(<MaterialFluidProvider motion="minimal"><Resizable orientation="vertical" label="Resize panels" first="First panel" second="Second panel" snapPoints={[50,75]}/></MaterialFluidProvider>);
 const handle=screen.getByRole('separator');fireEvent.keyDown(handle,{key:'ArrowRight'});expect(handle.getAttribute('aria-valuenow')).toBe('50');fireEvent.keyDown(handle,{key:'ArrowDown'});expect(handle.getAttribute('aria-valuenow')).toBe('55');fireEvent.keyDown(handle,{key:'Home'});expect(handle.getAttribute('aria-valuenow')).toBe('20');fireEvent.keyDown(handle,{key:'End'});expect(handle.getAttribute('aria-valuenow')).toBe('80');
});
it('copies original source without line numbers or soft wrapping',async()=>{
 const writeText=vi.fn().mockResolvedValue(undefined);Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText}});
 const code='const first = 1;\nconst second = 2;';render(<MaterialFluidProvider motion="minimal"><CodeBlock code={code} lineNumbers wrap/></MaterialFluidProvider>);
 fireEvent.click(screen.getByRole('button',{name:'Copy code'}));expect(writeText).toHaveBeenCalledWith(code);expect(await screen.findByRole('button',{name:'Copied'})).toBeTruthy();
});
it('paginates vertical carousel with vertical keys and exposes only the active slide',()=>{
 render(<MaterialFluidProvider motion="minimal"><Carousel label="Pages" orientation="vertical" slides={['Page one','Page two','Page three']}/></MaterialFluidProvider>);
 const carousel=screen.getByRole('region',{name:'Pages'});fireEvent.keyDown(carousel,{key:'ArrowDown'});expect(screen.getByRole('group',{name:'2 / 3'})).toBeTruthy();expect(screen.queryByRole('group',{name:'1 / 3'})).toBeNull();fireEvent.keyDown(carousel,{key:'ArrowUp'});expect(screen.getByRole('group',{name:'1 / 3'})).toBeTruthy();
});
