import {afterEach,beforeAll,describe,expect,it,vi} from "vitest";
import {act,cleanup,fireEvent,render,screen} from "@testing-library/react";
import {createRef} from "react";
import {SplitButton,SplitButtonItem,type SplitButtonHandle,type SplitButtonEvent} from "../src/kit/compositions";
import {MaterialFluidProvider} from "../src/kit/provider";
import {applySplitButtonPreset,localizeSplitButtonExample,splitButtonDefaults,splitButtonPresets,splitButtonExampleCode} from "../src/showcase/split-button-playground-model";
beforeAll(()=>Object.defineProperty(window,"matchMedia",{configurable:true,value:vi.fn(()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()}))}));afterEach(cleanup);
const wrap=(children:React.ReactNode)=><MaterialFluidProvider motion="minimal">{children}</MaterialFluidProvider>;
describe("additive SplitButton API",()=>{
  it("keeps the old label/menuLabel and native leading ref",()=>{
    const ref=createRef<HTMLButtonElement>(),click=vi.fn();render(wrap(<SplitButton ref={ref} label="Save" menuLabel="Save options" items={[{id:"copy",label:"Save a copy"}]} onClick={click}/>));
    expect(ref.current).toBe(screen.getByRole('button',{name:'Save'}));fireEvent.click(ref.current!);expect(click).toHaveBeenCalledTimes(1);expect(screen.getByRole('group',{name:'Save'})).not.toBeNull();expect(screen.getByRole('button',{name:'Save options'}).getAttribute('aria-haspopup')).toBe('menu');
  });
  it("supports custom expansion without a menu and reports each transition once",()=>{
    const ref=createRef<SplitButtonHandle>(),events:string[]=[];render(wrap(<SplitButton ref={ref} text="Create" onExpand={()=>events.push('expand')} onCollapse={()=>events.push('collapse')} onChange={()=>events.push('change')}/>));
    const trailing=screen.getByRole('button',{name:'More options'});fireEvent.click(trailing);expect(trailing.getAttribute('aria-expanded')).toBe('true');expect(screen.queryByRole('menu')).toBeNull();fireEvent.click(trailing);expect(events).toEqual(['expand','change','collapse','change']);expect(ref.current!.element.getAttribute('role')).toBe('group');
  });
  it("opens and closes imperatively, updates content and items, and releases on destroy",()=>{
    const ref=createRef<SplitButtonHandle>();render(wrap(<SplitButton ref={ref} text="Save"/>));const handle=ref.current!;
    act(()=>{handle.expand();expect(handle.isExpanded()).toBe(true);handle.collapse();expect(handle.isExpanded()).toBe(false);handle.setText('Publish').setIcon('check').setItems([{id:'draft',text:'Draft'}]);});
    expect(handle.getText()).toBe('Publish');expect(handle.getItems()[0].id).toBe('draft');expect(screen.getByRole('button',{name:'Publish'})).not.toBeNull();
    act(()=>handle.disable());expect(handle.isDisabled()).toBe(true);expect(screen.getAllByRole('button').every(button=>(button as HTMLButtonElement).disabled)).toBe(true);act(()=>handle.enable());expect(handle.isDisabled()).toBe(false);
    act(()=>handle.destroy());expect(screen.queryByRole('group')).toBeNull();
  });
  it("preserves controlled expansion and disabled activation",()=>{
    const changed=vi.fn(),expanded=vi.fn();const {rerender}=render(wrap(<SplitButton text="Save" expanded={false} onExpandedChange={changed} onExpand={expanded}/>));fireEvent.click(screen.getByRole('button',{name:'More options'}));expect(changed).toHaveBeenCalledWith(true);expect(screen.getByRole('button',{name:'More options'}).getAttribute('aria-expanded')).toBe('false');
    rerender(wrap(<SplitButton text="Save" disabled onExpand={expanded}/>));fireEvent.click(screen.getByRole('button',{name:'More options'}));expect(expanded).toHaveBeenCalledTimes(1);
  });
  it("supports listener maps, subscriptions, unsubscription and primary cancellation",()=>{
    const ref=createRef<SplitButtonHandle>(),listener=vi.fn<(event:SplitButtonEvent)=>void>(),mapped=vi.fn();render(wrap(<SplitButton ref={ref} text="Save" on={{expand:mapped}} onClick={event=>event.preventDefault()}/>));
    ref.current!.on('expand',listener);act(()=>ref.current!.expand());expect(listener).toHaveBeenCalledTimes(1);expect(mapped).toHaveBeenCalledTimes(1);ref.current!.off('expand',listener);act(()=>{ref.current!.collapse();ref.current!.expand();});expect(listener).toHaveBeenCalledTimes(1);
    const primary=vi.fn();ref.current!.on('click',primary);fireEvent.click(screen.getByRole('button',{name:'Save'}));expect(primary).not.toHaveBeenCalled();
  });
  it("accepts declarative alternatives and switches declarative menus to external expansion",()=>{
    const ref=createRef<SplitButtonHandle>();const {rerender}=render(wrap(<SplitButton ref={ref}>Save<SplitButtonItem value="copy">Copy<SplitButtonItem value="pdf">PDF</SplitButtonItem></SplitButtonItem></SplitButton>));expect(ref.current!.getItems()[0].id).toBe('copy');expect(ref.current!.getItems()[0].items?.[0].id).toBe('pdf');expect(screen.getByRole('button',{name:'Save'})).not.toBeNull();
    rerender(wrap(<SplitButton ref={ref} text="Create" items={[]}/>));fireEvent.click(screen.getByRole('button',{name:'More options'}));expect(screen.queryByRole('menu')).toBeNull();expect(ref.current!.isExpanded()).toBe(true);
  });
  it("generates both framework recipes for every preset and owner size",()=>{
    for(const [preset]of splitButtonPresets){const model=applySplitButtonPreset(preset,splitButtonDefaults);expect(splitButtonExampleCode(model,'react')).toContain('SplitButton');expect(splitButtonExampleCode(model,'web')).toContain('defineMaterialFluidSplitButton');}
    for(const size of ['xs','sm','md','lg','xl']as const){const code=splitButtonExampleCode({...splitButtonDefaults,size},'react');expect(code).toContain(`size="${size}"`);expect(code).not.toMatch(/elevated|Square/);}
    const escaped=splitButtonExampleCode({...splitButtonDefaults,text:'Save "draft" <now>'},'web');expect(escaped).toContain('&quot;draft&quot; &lt;now&gt;');expect(splitButtonExampleCode({...splitButtonDefaults,text:'Save "draft" <now>'},'react')).toContain('text={');expect(localizeSplitButtonExample(splitButtonDefaults,true).text).toBe('ذخیره');
  });
});
