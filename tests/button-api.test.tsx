import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Button } from "../src/kit/controls";
import { MaterialFluidProvider } from "../src/kit/provider";
import { buttonSizes, normalizeButtonSize, sizesForComponent } from "../src/kit/component-policy";
import { applyButtonPreset, buttonExampleCode, buttonExampleDefaults, buttonPresetNames } from "../src/showcase/button-playground-model";
beforeAll(() => { Object.defineProperty(window, "matchMedia", { configurable: true, value: vi.fn(() => ({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()})) }); });
afterEach(cleanup);
const wrap = (element: React.ReactNode) => <MaterialFluidProvider motion="minimal">{element}</MaterialFluidProvider>;
describe("additive Button API", () => {
  it("animates its own symbol when selectedIcon is null and supports a separate selected icon",()=>{
    const {rerender}=render(wrap(<Button variant="tonal" emphasize toggle icon="heart" selectedIcon={null}>Favorite</Button>));
    const button=screen.getByRole('button',{name:'Favorite'});expect(button.querySelector('[data-icon-fill="outlined"]')).not.toBeNull();fireEvent.click(button);expect(button.querySelector('[data-icon-fill="filled"]')).not.toBeNull();
    rerender(wrap(<Button variant="tonal" emphasize toggle selected icon="heart" selectedIcon="check">Favorite</Button>));expect(button.querySelector('[data-icon-name="check"]')).not.toBeNull();expect(button.querySelector('.mf-selection-icon')).toBeNull();
  });
  it("restricts persistent toggles to tonal, outlined and text treatments, including aliases", () => {
    const change=vi.fn();
    const {rerender}=render(wrap(<Button variant="filled" toggle defaultSelected onSelectedChange={change}>Action</Button>));
    const button=screen.getByRole('button',{name:'Action'});
    for(const variant of ['filled','primary','danger','tertiary'] as const){
      rerender(wrap(<Button variant={variant} toggle selected onSelectedChange={change}>Action</Button>));
      fireEvent.click(button);expect(button.hasAttribute('data-toggle')).toBe(false);expect(button.hasAttribute('aria-pressed')).toBe(false);
    }
    expect(change).not.toHaveBeenCalled();
    for(const variant of ['tonal','secondary','outlined','outline','ghost','text'] as const){
      rerender(wrap(<Button variant={variant} toggle selected={false} onSelectedChange={change}>Action</Button>));
      fireEvent.click(button);expect(change).toHaveBeenLastCalledWith(true);expect(button.getAttribute('aria-pressed')).toBe('false');
    }
  });
  it("supports uncontrolled selection, payload values and prevented/parent-owned toggles", () => {
    const change=vi.fn();
    const { rerender }=render(wrap(<Button variant="tonal" text="Favorite" toggle value="favorite" onSelectionChange={change}/>));
    const button=screen.getByRole("button",{name:"Favorite"});
    expect(button.getAttribute("aria-pressed")).toBe("false");fireEvent.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("true");expect(change).toHaveBeenLastCalledWith({selected:true,value:"favorite"});
    rerender(wrap(<Button variant="tonal" text="Favorite" toggle selected={false} toggleOnClick={false} onSelectionChange={change}/>));
    fireEvent.click(button);expect(button.getAttribute("aria-pressed")).toBe("false");expect(change).toHaveBeenCalledTimes(1);
    rerender(wrap(<Button variant="tonal" text="Favorite" toggle onClick={event=>event.preventDefault()} onSelectionChange={change}/>));
    fireEvent.click(button);expect(change).toHaveBeenCalledTimes(1);
  });
  it("keeps controlled selection owned by the consumer and blocks disabled clicks", () => {
    const selected=vi.fn();const {rerender}=render(wrap(<Button variant="ghost" toggle selected={false} onSelectedChange={selected}>Choose</Button>));
    const button=screen.getByRole("button",{name:"Choose"});fireEvent.click(button);expect(selected).toHaveBeenCalledWith(true);expect(button.getAttribute("aria-pressed")).toBe("false");
    rerender(wrap(<Button variant="ghost" toggle selected disabled onSelectedChange={selected}>Choose</Button>));fireEvent.click(button);expect(selected).toHaveBeenCalledTimes(1);
  });
  it("shows clamped/indeterminate progress and restores text/icon after loading", () => {
    const {rerender}=render(wrap(<Button text="Save" icon="check" progress={150}/>));
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
    expect(screen.getByRole("button",{name:"Save"}).hasAttribute("disabled")).toBe(false);
    rerender(wrap(<Button text="Save" icon="check" loading loadingText="Saving" progress={null}/>));
    expect(screen.getByRole("button",{name:"Saving"}).getAttribute("aria-busy")).toBe("true");expect(screen.getByRole("progressbar").hasAttribute("aria-valuenow")).toBe(false);
    expect(screen.getByRole("button",{name:"Saving"}).hasAttribute("disabled")).toBe(true);
    rerender(wrap(<Button text="Save" icon="check"/>));expect(screen.queryByRole("progressbar")).toBeNull();expect(screen.getByRole("button",{name:"Save"}).querySelector('[data-icon-name="check"]')).not.toBeNull();
  });
  it("supports trailing/custom icons, icon-only naming, aliases and native form/ref attributes", () => {
    const ref={current:null as HTMLButtonElement|null};render(wrap(<Button ref={ref} ariaLabel="Save document" size="m" type="submit" name="action" value="save" icon={<svg data-testid="custom-icon"/>} iconPosition="end"/>));
    const button=screen.getByRole("button",{name:"Save document"});expect(button).toBe(ref.current);expect(button.className).toContain("mf-size--md");expect(button.className).toContain("mf-button--icon-only");expect(button.getAttribute("type")).toBe("submit");expect(button.getAttribute("value")).toBe("save");expect(screen.getByTestId("custom-icon").parentElement?.style.width).toBe("");
  });
  it("exposes five Button sizes while preserving three-size defaults for other families", () => {
    expect(sizesForComponent("button")).toEqual(buttonSizes);expect(sizesForComponent("checkbox")).toEqual(["sm","md","lg"]);expect(["s","m","l"].map(size=>normalizeButtonSize(size as "s"|"m"|"l"))).toEqual(["sm","md","lg"]);
  });
  it("generates both frameworks for every preset without Square or Elevated and escapes content", () => {
    for(const [preset] of buttonPresetNames){const value=applyButtonPreset(preset,buttonExampleDefaults);expect(buttonExampleCode(value,"react")).toContain('from "materialfluid"');expect(buttonExampleCode(value,"web")).toContain("defineMaterialFluidButton()");expect(buttonExampleCode(value,"web")).not.toMatch(/elevated|square/);}
    const value={...buttonExampleDefaults,preset:"custom" as const,variant:"tonal" as const,text:'<script>"hello"</script>',toggle:true,selected:true,progressMode:"determinate" as const,progress:45};
    expect(buttonExampleCode(value,"web")).toContain("&lt;script&gt;&quot;hello&quot;&lt;/script&gt;");expect(buttonExampleCode(value,"react")).toContain("useState(true)");expect(buttonExampleCode(value,"react")).toContain("progress={45}");
    const quoted=buttonExampleCode({...value,type:"submit",name:'action "name"',loadingText:'Saving "draft"'},"react");
    expect(quoted).toContain(`name={${JSON.stringify('action "name"')}}`);
    expect(quoted).toContain(`loadingText={${JSON.stringify('Saving "draft"')}}`);
  });
});
