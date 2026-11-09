import {afterEach,beforeAll,describe,expect,it,vi} from "vitest";
import {cleanup,fireEvent,render,screen} from "@testing-library/react";
import {IconButton} from "../src/kit/controls";
import {MaterialFluidProvider} from "../src/kit/provider";
import {applyIconButtonPreset,iconButtonExampleDefaults,iconButtonExampleCode,iconButtonPresetNames} from "../src/showcase/icon-button-playground-model";
afterEach(cleanup);
beforeAll(()=>Object.defineProperty(window,"matchMedia",{configurable:true,value:vi.fn(()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()}))}));
const wrap=(node:React.ReactNode)=><MaterialFluidProvider motion="minimal">{node}</MaterialFluidProvider>;
describe("additive IconButton API",()=>{
  it("uses official outline/fill geometry when selectedIcon is null and keeps Emphasize a normal toggle",()=>{
    const changed=vi.fn();const {rerender}=render(wrap(<IconButton label="Favorite" variant="tonal" icon="heart" selectedIcon={null} toggle onSelectedChange={changed}/>));
    const button=screen.getByRole('button',{name:'Favorite'}),outline=button.querySelector('.mf-selection-icon-outline')!.getAttribute('d'),fill=button.querySelector('.mf-selection-icon-fill')!.getAttribute('d');
    expect(outline).not.toBe(fill);expect(button.querySelector('[data-icon-fill="outlined"]')).not.toBeNull();fireEvent.click(button);expect(button.querySelector('[data-icon-fill="filled"]')).not.toBeNull();expect(changed).toHaveBeenCalledExactlyOnceWith(true);
    rerender(wrap(<IconButton label="Play" selectedLabel="Pause" variant="emphasize" icon="play_arrow" selectedIcon="pause" toggle defaultSelected={false}/>));
    expect(button.className).toContain('mf-variant--emphasize');expect(button.querySelector('[data-icon-name="pause"]')).not.toBeNull();fireEvent.click(button);expect(screen.getByRole('button',{name:'Play'}).getAttribute('aria-pressed')).toBe('false');fireEvent.click(button);expect(screen.getByRole('button',{name:'Pause'}).getAttribute('aria-pressed')).toBe('true');
  });
  it("swaps selected icons in uncontrolled toggles and emits one payload per activation",()=>{
    const changed=vi.fn();render(wrap(<IconButton label="Favorite" variant="tonal" icon="heart" selectedIcon="check" toggle value="favorite" onSelectionChange={changed}/>));
    const button=screen.getByRole("button",{name:"Favorite"});expect(button.querySelector('[data-icon-name="heart"]')).not.toBeNull();
    fireEvent.click(button);expect(button.getAttribute('aria-pressed')).toBe('true');expect(button.querySelector('[data-icon-name="check"]')).not.toBeNull();expect(changed).toHaveBeenCalledExactlyOnceWith({selected:true,value:'favorite'});
    fireEvent.click(button);expect(button.querySelector('[data-icon-name="heart"]')).not.toBeNull();expect(changed).toHaveBeenCalledTimes(2);
  });
  it("supports controlled parent-owned selection, cancellation, and disabled activation",()=>{
    const changed=vi.fn();const {rerender}=render(wrap(<IconButton label="Action" icon="heart" selectedIcon="check" toggle selected variant="ghost" toggleOnClick={false} onSelectedChange={changed}/>));
    const button=screen.getByRole('button',{name:'Action'});fireEvent.click(button);expect(changed).not.toHaveBeenCalled();expect(button.getAttribute('aria-pressed')).toBe('true');
    rerender(wrap(<IconButton label="Action" icon="heart" selectedIcon="check" toggle variant="ghost" onSelectedChange={changed} onClick={event=>event.preventDefault()}/>));fireEvent.click(button);expect(changed).not.toHaveBeenCalled();
    rerender(wrap(<IconButton label="Action" icon="heart" selectedIcon="check" toggle variant="ghost" disabled onSelectedChange={changed}/>));fireEvent.click(button);expect(changed).not.toHaveBeenCalled();
  });
  it("does not infer toggle mode from selected or selectedIcon, and rejects unsupported treatments",()=>{
    const {rerender}=render(wrap(<IconButton ariaLabel="Action" icon="heart" selectedIcon="check" selected/>));
    const button=screen.getByRole('button',{name:'Action'});expect(button.hasAttribute('aria-pressed')).toBe(false);expect(button.querySelector('[data-icon-name="heart"]')).not.toBeNull();
    for(const variant of ['filled','danger'] as const){rerender(wrap(<IconButton label="Action" variant={variant} icon="heart" selectedIcon="check" selected toggle/>));expect(button.hasAttribute('aria-pressed')).toBe(false);expect(button.querySelector('[data-icon-name="check"]')).toBeNull();}
  });
  it("keeps existing children/ref/native attributes and supports custom selected content and name aliases",()=>{
    const ref={current:null as HTMLButtonElement|null};const {rerender}=render(wrap(<IconButton ref={ref} aria-label="Send" type="submit" name="send" value="draft" width="wide"><svg data-testid="original"/></IconButton>));
    const button=screen.getByRole('button',{name:'Send'});expect(button).toBe(ref.current);expect(button.getAttribute('type')).toBe('submit');expect(screen.getByTestId('original')).toBeTruthy();expect(button.className).toContain('mf-icon-button--wide');
    rerender(wrap(<IconButton label="Send" toggle selected variant="outlined" selectedIcon={<svg data-testid="selected"/>}><svg data-testid="original"/></IconButton>));expect(screen.getByTestId('selected')).toBeTruthy();expect(screen.queryByTestId('original')).toBeNull();
  });
  it("restores the selected icon after progress or loading and preserves its accessible name",()=>{
    const {rerender}=render(wrap(<IconButton label="Save" variant="tonal" toggle selected icon="heart" selectedIcon="check" progress={42}/>));
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('42');expect(screen.getByRole('button',{name:'Save'})).toBeTruthy();
    rerender(wrap(<IconButton label="Save" variant="tonal" toggle selected icon="heart" selectedIcon="check" loading/>));expect(screen.getByRole('button',{name:'Save'}).hasAttribute('disabled')).toBe(true);
    rerender(wrap(<IconButton label="Save" variant="tonal" toggle selected icon="heart" selectedIcon="check"/>));expect(screen.queryByRole('progressbar')).toBeNull();expect(screen.getByRole('button',{name:'Save'}).querySelector('[data-icon-name="check"]')).not.toBeNull();
  });
  it("generates both formats for every preset and escapes free-form labels",()=>{
    for(const [preset] of iconButtonPresetNames){const value=applyIconButtonPreset(preset,iconButtonExampleDefaults);expect(iconButtonExampleCode(value,'react')).toContain('<IconButton');expect(iconButtonExampleCode(value,'web')).toContain('<mf-icon-button');expect(iconButtonExampleCode(value,'react')).not.toMatch(/shape=|ripple=|elevated|square/);}
    const label='Save "draft" <now>';const value={...iconButtonExampleDefaults,label,preset:'custom' as const};expect(iconButtonExampleCode(value,'react')).toContain(`label={${JSON.stringify(label)}}`);expect(iconButtonExampleCode(value,'web')).toContain('aria-label="Save &quot;draft&quot; &lt;now&gt;"');
    const invalid={...value,variant:'filled' as const,toggle:true,selected:true};expect(iconButtonExampleCode(invalid,'react')).not.toContain('useState');expect(iconButtonExampleCode(invalid,'web')).not.toContain(' selected');
  });
});
