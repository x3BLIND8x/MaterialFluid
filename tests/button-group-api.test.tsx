import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { Button, ButtonGroup, ButtonGroupItem, type ButtonGroupHandle } from "../src/kit/controls";
import { MaterialFluidProvider } from "../src/kit/provider";
import { applyButtonGroupPreset, buttonGroupDefaults, buttonGroupExampleCode, buttonGroupPresets } from "../src/showcase/button-group-playground-model";
beforeAll(()=>Object.defineProperty(window,"matchMedia",{configurable:true,value:vi.fn(()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()}))}));
afterEach(cleanup);
const wrap=(children:React.ReactNode)=><MaterialFluidProvider motion="minimal">{children}</MaterialFluidProvider>;
describe("ButtonGroup additive API",()=>{
  it("keeps emphasis as a toggle behavior independent of appearance",()=>{
    const {rerender}=render(wrap(<Button variant="filled" toggle emphasize>Favorite</Button>));
    const button=screen.getByRole("button");expect(button.className).toContain("mf-variant--filled");expect(button.hasAttribute("data-emphasize")).toBe(true);
    expect(button.getAttribute("aria-pressed")).toBe("false");fireEvent.click(button);expect(button.getAttribute("aria-pressed")).toBe("true");
    rerender(wrap(<Button variant="outlined" emphasize>Favorite</Button>));expect(button.hasAttribute("data-emphasize")).toBe(false);expect(button.hasAttribute("aria-pressed")).toBe(false);
  });
  it("supports single required selection, action-before-change, and a filled appearance",()=>{
    const events:string[]=[],changed=vi.fn();
    render(wrap(<ButtonGroup label="View" kind="connected" variant="filled" selection="single" required defaultValue="week" onAction={()=>events.push("action")} onSelectionChange={detail=>{events.push("change");changed(detail);}}><ButtonGroupItem value="day">Day</ButtonGroupItem><ButtonGroupItem value="week">Week</ButtonGroupItem></ButtonGroup>));
    const day=screen.getByRole("button",{name:"Day"}),week=screen.getByRole("button",{name:"Week"});
    fireEvent.click(week);expect(changed).not.toHaveBeenCalled();fireEvent.click(day);expect(events).toEqual(["action","action","change"]);
    expect(day.getAttribute("aria-pressed")).toBe("true");expect(week.getAttribute("aria-pressed")).toBe("false");expect(changed.mock.calls[0][0].value).toBe("day");
  });
  it("orders multi values, supports methods, and preserves individual disabled state",()=>{
    const ref=createRef<ButtonGroupHandle>(),changed=vi.fn();
    render(wrap(<ButtonGroup ref={ref} selection="multi" defaultValue={["c","a"]} onValueChange={changed} buttons={[{value:"a",text:"A"},{value:"b",text:"B",disabled:true},{value:"c",text:"C"}]}/>));
    expect(ref.current!.getSelected()).toEqual(["a","c"]);
    act(()=>{ref.current!.deselect("a").select("b");});expect(ref.current!.getSelected()).toEqual(["b","c"]);expect(changed).toHaveBeenLastCalledWith(["b","c"]);
    act(()=>{ref.current!.disable();});expect(screen.getAllByRole("button").every(button=>(button as HTMLButtonElement).disabled)).toBe(true);
    act(()=>{ref.current!.enable();});expect((screen.getByRole("button",{name:"B"}) as HTMLButtonElement).disabled).toBe(true);
    act(()=>{ref.current!.enableButton(1).setOrientation("vertical").setDensity("compact").setVariant("tonal");});
    expect(ref.current!.getOrientation()).toBe("vertical");expect(ref.current!.getDensity()).toBe("compact");expect(ref.current!.getButtonById("b")).toBe(screen.getByRole("button",{name:"B"}));expect(ref.current!.getButton(1)?.disabled).toBe(false);
  });
  it("supports controlled state, prevented actions and disabled items",()=>{
    const changed=vi.fn();const {rerender}=render(wrap(<ButtonGroup kind="standard" selection="single" value="a" onValueChange={changed} buttons={[{value:"a",text:"A"},{value:"b",text:"B"}]}/>));
    fireEvent.click(screen.getByRole("button",{name:"B"}));expect(changed).toHaveBeenCalledWith("b");expect(screen.getByRole("button",{name:"A"}).getAttribute("aria-pressed")).toBe("true");
    changed.mockClear();rerender(wrap(<ButtonGroup kind="standard" selection="single" onClick={event=>event.preventDefault()} onValueChange={changed} buttons={[{value:"a",text:"A"},{value:"b",text:"B",disabled:true}]}/>));
    fireEvent.click(screen.getByRole("button",{name:"A"}));fireEvent.click(screen.getByRole("button",{name:"B"}));expect(changed).not.toHaveBeenCalled();
  });
  it("keeps ordinary actions unselected, supports fallback identifiers and nullable icons",()=>{
    const action=vi.fn(),ref=createRef<ButtonGroupHandle>();
    const {rerender}=render(wrap(<ButtonGroup kind="standard" ref={ref} onAction={action} buttons={[{id:"save",text:"Save"},{text:"Copy"}]}/>));
    fireEvent.click(screen.getByRole("button",{name:"Copy"}));expect(action.mock.calls[0][0].value).toBe("1");expect(ref.current!.getSelected()).toEqual([]);
    rerender(wrap(<ButtonGroup selection="multi" buttons={[{value:"favorite",icon:"heart",ariaLabel:"Favorite",selectedIcon:null}]}/>));const button=screen.getByRole("button",{name:"Favorite"});expect(button.querySelector('[data-icon-fill="outlined"]')).not.toBeNull();fireEvent.click(button);expect(button.querySelector('[data-icon-fill="filled"]')).not.toBeNull();
  });
  it("preserves the existing arbitrary-child composition",()=>{
    render(wrap(<ButtonGroup label="Stepper"><Button>Decrease</Button><span>10</span><Button>Increase</Button></ButtonGroup>));
    expect(screen.getByRole("group",{name:"Stepper"}).hasAttribute("data-kind")).toBe(false);expect(screen.getByRole("button",{name:"Decrease"}).hasAttribute("aria-pressed")).toBe(false);
  });
  it("generates all presets in both frameworks with escaped item labels and no excluded options",()=>{
    for(const [preset]of buttonGroupPresets){const value=applyButtonGroupPreset(preset,buttonGroupDefaults);expect(buttonGroupExampleCode(value,"react")).toContain("<ButtonGroup");expect(buttonGroupExampleCode(value,"web")).toContain("defineMaterialFluidButtonGroup");expect(buttonGroupExampleCode(value,"react")).not.toMatch(/elevated|shape=|ripple=|expandedRatio/);}
    const value={...applyButtonGroupPreset("single",buttonGroupDefaults),label:'View "mode" <now>',items:[{...buttonGroupDefaults.items[0],text:'<script>"x"</script>'}]};
    expect(buttonGroupExampleCode(value,"web")).toContain("&lt;script&gt;&quot;x&quot;&lt;/script&gt;");expect(buttonGroupExampleCode(value,"react")).toContain(`{${JSON.stringify(value.label)}}`);
  });
});
