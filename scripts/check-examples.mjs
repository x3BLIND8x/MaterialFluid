import {radiosDefaults,radiosPresets,radiosOptions,applyRadiosPreset,radiosExampleCode} from "../src/showcase/radios-playground-model.ts";
import {switchDefaults,switchPresets,applySwitchPreset,switchExampleCode} from "../src/showcase/switch-playground-model.ts";
import {checkboxDefaults,checkboxPresets,applyCheckboxPreset,checkboxExampleCode} from "../src/showcase/checkbox-playground-model.ts";
import {extendedFABDefaults,extendedFABPresets,applyExtendedFABPreset,extendedFABExampleCode} from "../src/showcase/extended-fab-playground-model.ts";
import {fabMenuDefaults,fabMenuPresets,applyFABMenuPreset,fabMenuExampleCode} from "../src/showcase/fab-menu-playground-model.ts";
import {fabDefaults,fabPresets,applyFABPreset,fabExampleCode} from "../src/showcase/fab-playground-model.ts";
import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { catalogue } from "../src/showcase/catalogue.ts";
import { usageFor } from "../src/showcase/usage.ts";
import { buttonExampleDefaults, applyButtonPreset, buttonPresetNames, buttonExampleCode } from "../src/showcase/button-playground-model.ts";
import { iconButtonExampleDefaults, applyIconButtonPreset, iconButtonPresetNames, iconButtonExampleCode } from "../src/showcase/icon-button-playground-model.ts";
import { buttonGroupDefaults, applyButtonGroupPreset, buttonGroupPresets, buttonGroupExampleCode } from "../src/showcase/button-group-playground-model.ts";
import { splitButtonDefaults, applySplitButtonPreset, splitButtonPresets, splitButtonExampleCode } from "../src/showcase/split-button-playground-model.ts";
import { spawnSync } from "node:child_process";
const folder = ".cache/package-smoke/examples";
await rm(folder, { recursive: true, force: true });
await mkdir(folder, { recursive: true });
for (const entry of catalogue) {
  await writeFile(`${folder}/${entry.id}.tsx`, usageFor(entry));
  await writeFile(`${folder}/${entry.id}-appearance.tsx`, usageFor(entry, {variant:"tertiary", size:"sm"}));
}
const buttonExamples = [
  ...buttonPresetNames.map(([preset]) => applyButtonPreset(preset, buttonExampleDefaults)),
  ...["xs", "sm", "md", "lg", "xl"].map(size => ({ ...buttonExampleDefaults, size })),
  { ...buttonExampleDefaults, toggle: true, selected: true, progressMode: "determinate", progress: 75 },
  { ...buttonExampleDefaults, icon: "rocket_launch", iconPosition: "end", loading: true, loadingText: "Launching", progressMode: "indeterminate" },
  { ...buttonExampleDefaults, type: "submit", name: 'action "name"', value: '<save & "confirm">', loadingText: 'Saving "draft"' }, { ...buttonExampleDefaults, type: "reset" },
];
for (const [index, example] of buttonExamples.entries()) {
  await writeFile(`${folder}/button-api-${index}.tsx`, buttonExampleCode(example, "react"));
  await writeFile(`${folder}/button-api-${index}.html`, buttonExampleCode(example, "web"));
}
const iconButtonExamples=[
  ...iconButtonPresetNames.map(([preset])=>applyIconButtonPreset(preset,iconButtonExampleDefaults)),
  ...["xs","sm","md","lg","xl"].flatMap(size=>["narrow","default","wide"].map(width=>({...iconButtonExampleDefaults,size,width}))),
  {...applyIconButtonPreset("favorite",iconButtonExampleDefaults),selected:true},
  {...iconButtonExampleDefaults,label:'Save "draft" <now>',preset:"custom",icon:"rocket_launch",type:"submit",name:'action "name"'},
  {...iconButtonExampleDefaults,type:"reset",progressMode:"determinate",progress:42},
  {...applyIconButtonPreset("emphasize",iconButtonExampleDefaults),selected:true},
];
for(const [index,example] of iconButtonExamples.entries()){
  await writeFile(`${folder}/icon-button-api-${index}.tsx`,iconButtonExampleCode(example,"react"));
  await writeFile(`${folder}/icon-button-api-${index}.html`,iconButtonExampleCode(example,"web"));
}
const groupExamples=[...buttonGroupPresets.map(([preset])=>applyButtonGroupPreset(preset,buttonGroupDefaults)),...["xs","sm","md","lg","xl"].flatMap(size=>["default","comfortable","compact"].flatMap(density=>["standard","connected"].map(kind=>({...buttonGroupDefaults,size,density,kind})))),{...applyButtonGroupPreset("multi",buttonGroupDefaults),emphasize:true,equalWidth:true}];
for(const [index,example]of groupExamples.entries()){
  await writeFile(`${folder}/button-group-api-${index}.tsx`,buttonGroupExampleCode(example,"react"));
  await writeFile(`${folder}/button-group-api-${index}.html`,buttonGroupExampleCode(example,"web"));
}
const fabMenuExamples=[...fabMenuPresets.map(([preset])=>applyFABMenuPreset(preset,fabMenuDefaults)),...["primary","secondary","tertiary"].flatMap(color=>["default","medium","large"].flatMap(size=>["auto","list","menu"].map(presentation=>({...fabMenuDefaults,color,size,presentation})))),...["none","bottom-start","bottom-end"].map(placement=>({...fabMenuDefaults,placement,open:true})),{...fabMenuDefaults,label:'Create "draft" <now>',icon:'rocket_launch',items:[{id:'a "b"',text:'A & "B" <C>',icon:'rocket_launch',disabled:true},{id:'next',text:'Next',icon:'',disabled:false}]},{...fabMenuDefaults,disabled:true,active:true,icon:'',closeIcon:''}];
for(const [index,example]of fabMenuExamples.entries()){
  await writeFile(`${folder}/fab-menu-api-${index}.tsx`,fabMenuExampleCode(example,"react"));
  await writeFile(`${folder}/fab-menu-api-${index}.html`,fabMenuExampleCode(example,"web"));
}
await writeFile(`${folder}/fab-menu-methods.tsx`, `
import {createRef} from "react";
import {FABMenu,FABMenuItem,type FABMenuHandle,type FABMenuSurface,type FABMenuEvents} from "materialfluid";
import {defineMaterialFluidFABMenu,type MaterialFluidFABMenuElement} from "materialfluid/elements";
const ref=createRef<FABMenuHandle>();const callback:FABMenuEvents['select']=event=>console.log(event.id,event.value);
const example=<FABMenu ref={ref} ariaLabel="Compose" color="secondary" size="large" presentation="list" placement="bottom-end"><FABMenuItem value="reply" icon="reply">Reply</FABMenuItem><FABMenuItem value="forward">Forward</FABMenuItem></FABMenu>;
ref.current?.open().close().toggle().on("select",callback).off("select",callback).setItems([{id:"archive",text:"Archive"}]).disable().enable().addClass("my-menu");ref.current?.isOpen();ref.current?.getPresentation();ref.current?.getItems();ref.current?.getClass("item");ref.current?.element;ref.current?.fab;ref.current?.list;
const actions:FABMenuItem[]=[{id:"copy",text:"Copy"},{id:"paste",label:"Paste"}];
const native=<FABMenu label="Create" items={actions} size="sm" />;
const customMenu=(opener:HTMLElement,items:FABMenuItem[]):FABMenuSurface=>{let opened=false;const element=document.createElement("div");return {element,open(event,interaction){opened=true;console.log(opener,items,event,interaction);},close(){opened=false;},isOpen(){return opened;},on(event,callback){console.log(event,callback);},destroy(){element.remove();}};};
const custom=<FABMenu label="Actions" items={actions} presentation="menu" menu={customMenu}/>;
defineMaterialFluidFABMenu();const element:MaterialFluidFABMenuElement=document.createElement("mf-fab-menu");element.setAriaLabel("Create").setIcon("plus").setCloseIcon("close").setSize("medium").setColor("tertiary").setPresentation("auto").setPlacement("bottom-start").setItems(actions).show().hide().toggle().disable().enable();element.open=true;element.getPresentation();void element.updateComplete;element.menu=customMenu;
// @ts-expect-error Elevated is excluded.
const elevated=<FABMenu variant="elevated"/>;
// @ts-expect-error Square is excluded.
const square=<FABMenu shape="square"/>;
// @ts-expect-error Icon sizes are authored for the appearance size/state.
const iconSize=<FABMenu iconSize={30}/>;
// @ts-expect-error Ripple controls remain private.
const ripple=<FABMenu ripple={false}/>;
// @ts-expect-error Timing controls remain private.
const timing=<FABMenu pressMotion={{scale:.8}}/>;
// @ts-expect-error Event names are checked.
ref.current?.on("opne",()=>{});
void [example,native,custom,elevated,square,iconSize,ripple,timing];
`);
const extendedExamples=[...extendedFABPresets.map(([preset])=>applyExtendedFABPreset(preset,extendedFABDefaults)),...["primary-container","secondary-container","tertiary-container","primary","secondary","tertiary"].flatMap(color=>["small","medium","large"].flatMap(size=>["fixed","fluid"].map(width=>({...extendedFABDefaults,color,size,width})))),...["none","top-start","top-end","bottom-start","bottom-end"].map(placement=>({...extendedFABDefaults,placement,collapsed:true})),{...extendedFABDefaults,text:'Create "draft" <now>',label:'New & "now"',icon:'rocket_launch',iconPosition:'end',type:'submit',name:'action "name"',value:'<save & "confirm">'},{...extendedFABDefaults,icon:'',type:'reset',disabled:true,active:true}];
for(const [index,example]of extendedExamples.entries()){
 await writeFile(`${folder}/extended-fab-api-${index}.tsx`,extendedFABExampleCode(example,"react"));
 await writeFile(`${folder}/extended-fab-api-${index}.html`,extendedFABExampleCode(example,"web"));
}
await writeFile(`${folder}/extended-fab-methods.tsx`, `
import {createRef} from "react";
import {ExtendedFAB,extendedFABSizes,type ExtendedFABHandle,type ExtendedFABEvents} from "materialfluid";
import {defineMaterialFluidExtendedFAB,type MaterialFluidExtendedFABElement} from "materialfluid/elements";
const ref=createRef<ExtendedFABHandle>();const native=createRef<HTMLButtonElement>();
const example=<ExtendedFAB ref={ref} text="Create" variant="primary-container" icon="plus" size="small" collapseOnScroll/>;
const rich=<ExtendedFAB ref={native}><em>Create</em></ExtendedFAB>;
const callback:ExtendedFABEvents['click']=event=>console.log(event.originalEvent.clientX,event.event.clientY,event.element);
ref.current?.setText("Publish").setIcon("check").setValue("publish").setSize("large").setWidth("fluid").setColor("tertiary").setVariant("secondary-container").setPosition("bottom-right").setPlacement("none").collapse().expand().disable().enable().on("click",callback).off("click",callback);
ref.current?.getText();ref.current?.getIcon();ref.current?.getValue();ref.current?.getSize();ref.current?.getWidth();ref.current?.getColor();ref.current?.getVariant();ref.current?.getPosition();ref.current?.getPlacement();ref.current?.isCollapsed();ref.current?.isDisabled();ref.current?.element;
defineMaterialFluidExtendedFAB();const element:MaterialFluidExtendedFABElement=document.createElement("mf-extended-fab");element.setText("Create").setIcon("plus").setSize("medium").setWidth("fluid").setColor("primary").collapse().expand().setPosition("top-right").setPlacement("none").disable().enable();void element.updateComplete;
// @ts-expect-error Elevated is excluded.
const elevated=<ExtendedFAB variant="elevated"/>;
// @ts-expect-error Square is excluded.
const square=<ExtendedFAB shape="square"/>;
// @ts-expect-error Icon sizing follows appearance.
const iconSize=<ExtendedFAB iconSize={30}/>;
// @ts-expect-error Ripple overrides remain private.
const ripple=<ExtendedFAB ripple={false}/>;
// @ts-expect-error Public motion tuning is excluded.
const timing=<ExtendedFAB pressMotion={{scale:.8}}/>;
// @ts-expect-error Elevation is excluded.
ref.current?.lower();
void [example,rich,elevated,square,iconSize,ripple,timing,extendedFABSizes];
`);
const radiosExamples=[...radiosPresets.map(([preset])=>applyRadiosPreset(preset,radiosDefaults)),...["sm","md","lg"].flatMap(size=>["horizontal","vertical"].flatMap(direction=>["start","end"].map(labelPosition=>({...radiosDefaults,size,direction,labelPosition})))),...Object.entries(radiosOptions).map(([options,items])=>({...radiosDefaults,options,items,selected:items[0].value})),{...radiosDefaults,label:'A "B" <C>',name:'name "test"',selected:null,required:true},{...radiosDefaults,items:radiosDefaults.items.map((item,index)=>({...item,labelBefore:index%2===0,disabled:index===1}))}];
for(const[index,example]of radiosExamples.entries()){await writeFile(`${folder}/radios-api-${index}.tsx`,radiosExampleCode(example,"react"));await writeFile(`${folder}/radios-api-${index}.html`,radiosExampleCode(example,"web"));}
await writeFile(`${folder}/radios-methods.tsx`, `
import {createRef} from "react";
import {RadioGroup,Radios,Radio,type RadioGroupHandle,type RadiosChangePayload} from "materialfluid";
import {defineMaterialFluidRadios,type MaterialFluidRadiosElement} from "materialfluid/elements";
const ref=createRef<RadioGroupHandle>(),native=createRef<HTMLDivElement>();
const callback=(event:RadiosChangePayload)=>console.log(event.value,event.option,event.originalEvent);
const source=<Radios ref={ref} ariaLabel="Choice" required onChange={callback} onValueChange={(value:string|null)=>console.log(value)}><><Radio value="a" labelBefore>Alpha</Radio><Radio value="b" label="Beta" disabled/></></Radios>;
const compatible=<RadioGroup ref={native} label="Choice" options={[{value:"a",label:"Alpha"}]} orientation="horizontal" onValueChange={(value:string)=>console.log(value)}/>;
ref.current?.setValue("a").setValue(null).addOption({value:"b",label:"Beta",labelBefore:true}).disable().enableOption("b").enable().disableOption("a").removeOption("b").on("change",callback).off("change",callback);
ref.current?.radios[0].input.checkValidity();ref.current?.getSelected();ref.current?.getValue();ref.current?.element;ref.current?.getClass("label");ref.current?.lifecycle.destroy();
defineMaterialFluidRadios();const host:MaterialFluidRadiosElement=document.createElement("mf-radios");host.options=[{value:"a",label:"Alpha"}];host.value="a";host.defaultValue="a";host.setValue(null).addOption({value:"b",label:"Beta"}).disable().enableOption("b").enable().disableOption("a").removeOption("b");host.checkValidity();host.reportValidity();host.radios[0]?.input.focus();void host.updateComplete;
// @ts-expect-error Elevated is excluded.
const elevated=<Radios variant="elevated"/>;
// @ts-expect-error Square is excluded.
const square=<RadioGroup shape="square"/>;
// @ts-expect-error Ripple options are private defaults.
const ripple=<Radios ripple={false}/>;
// @ts-expect-error The private model bridge is not public API.
const bridge=<RadioGroup onNullableValueChange={console.log}/>;
// @ts-expect-error Only change is emitted; native focus listeners belong on inputs.
ref.current?.on("focus",console.log);
void[source,compatible,elevated,square,ripple,bridge];
`);
const switchExamples=[...switchPresets.map(([preset])=>applySwitchPreset(preset,switchDefaults)),...["sm","md","lg"].flatMap(size=>["start","end"].flatMap(labelPosition=>[false,true].map(checked=>({...switchDefaults,size,labelPosition,checked})))),{...switchDefaults,label:'A "B" <C>',name:'name "test"',value:'<yes & "ok">',ariaLabel:'Switch "one"',disabled:true},{...switchDefaults,glyphs:"none"},{...switchDefaults,glyphs:"custom",icon:"rocket_launch",unselectedIcon:""}];
for(const[index,example]of switchExamples.entries()){await writeFile(`${folder}/switch-api-${index}.tsx`,switchExampleCode(example,"react"));await writeFile(`${folder}/switch-api-${index}.html`,switchExampleCode(example,"web"));}
await writeFile(`${folder}/switch-methods.tsx`, `
import {createRef} from "react";
import {Switch,type SwitchHandle,type SwitchChangePayload} from "materialfluid";
import {defineMaterialFluidSwitch,type MaterialFluidSwitchElement} from "materialfluid/elements";
const ref=createRef<SwitchHandle>();const native=createRef<HTMLButtonElement>();
const callback=(event:SwitchChangePayload)=>console.log(event.checked,event.value,event.valueAttribute,event.nativeEvent);
const item=<Switch ref={ref} label="Sync" labelPosition="start" supportingText="Uses data" error required onChange={callback}/>;
const compatible=<Switch ref={native} label="Sync" icon="wifi" onCheckedChange={console.log}/>;
ref.current?.check().uncheck().toggle().setValue("true").setValueAttribute("yes").setLabel("New").setSupportingText("Offline",true).removeSupportingText().setError(false).disable().enable().on("change",callback).off("change",callback);
ref.current?.input?.checkValidity();ref.current?.element;ref.current?.supportingTextElement;ref.current?.isError();
defineMaterialFluidSwitch();const host:MaterialFluidSwitchElement=document.createElement("mf-switch");host.checked=true;host.defaultChecked=false;host.setSupportingText("Help",true).removeSupportingText().check().uncheck().toggle().setValue("1");host.checkValidity();host.reportValidity();void host.updateComplete;
// @ts-expect-error Action appearances are excluded.
const elevated=<Switch variant="elevated"/>;
// @ts-expect-error Square is excluded.
const square=<Switch shape="square"/>;
// @ts-expect-error Public animation overrides are excluded.
const animation=<Switch transition={{duration:1}}/>;
// @ts-expect-error Checked value is boolean.
const wrong:SwitchChangePayload={checked:true,value:"yes",valueAttribute:"yes"};
// @ts-expect-error Misspelled event name.
ref.current?.on("chnage",callback);
void[item,compatible,elevated,square,animation,wrong];
`);
const checkboxExamples=[...checkboxPresets.map(([preset])=>applyCheckboxPreset(preset,checkboxDefaults)),...["sm","md","lg"].flatMap(size=>["start","end"].flatMap(labelPosition=>["unchecked","checked","mixed"].map(state=>({...checkboxDefaults,size,labelPosition,state})))),{...applyCheckboxPreset("parent",checkboxDefaults),error:true,required:true},{...checkboxDefaults,label:'A "B" <C>',name:'name "test"',value:'<yes & "ok">',ariaLabel:'Choice "one"',disabled:true}];
for(const[index,example]of checkboxExamples.entries()){await writeFile(`${folder}/checkbox-api-${index}.tsx`,checkboxExampleCode(example,"react"));await writeFile(`${folder}/checkbox-api-${index}.html`,checkboxExampleCode(example,"web"));}
await writeFile(`${folder}/checkbox-methods.tsx`, `
import {createRef} from "react";
import {Checkbox,type CheckboxHandle,type CheckboxChangePayload} from "materialfluid";
import {defineMaterialFluidCheckbox,type MaterialFluidCheckboxElement} from "materialfluid/elements";
const ref=createRef<CheckboxHandle>();const native=createRef<HTMLButtonElement>();
const callback=(event:CheckboxChangePayload)=>console.log(event.checked,event.value,event.valueAttribute,event.nativeEvent);
const item=<Checkbox ref={ref} label="Choice" indeterminate labelPosition="start" error required onChange={callback}/>;
const compatible=<Checkbox ref={native} label="Choice" checked="indeterminate" onCheckedChange={console.log}/>;
ref.current?.check().uncheck().toggle().setValue("true").setValueAttribute("yes").setLabel("New").setIndeterminate(true).setError(false).disable().enable().on("change",callback).off("change",callback);
ref.current?.input?.checkValidity();ref.current?.element;ref.current?.getValue();ref.current?.getValueAttribute();ref.current?.getLabel();ref.current?.isChecked();ref.current?.isDisabled();
defineMaterialFluidCheckbox();const host:MaterialFluidCheckboxElement=document.createElement("mf-checkbox");host.checked=true;host.indeterminate=true;host.defaultChecked=false;host.check().uncheck().toggle().setValue("1").setValueAttribute("yes").setLabel("Choice").setIndeterminate(false).setError(true).disable().enable();host.checkValidity();host.reportValidity();void host.updateComplete;
// @ts-expect-error Action treatments do not belong to Checkbox.
const elevated=<Checkbox variant="elevated"/>;
// @ts-expect-error Square variant is excluded.
const square=<Checkbox shape="square"/>;
// @ts-expect-error Source payload value is boolean.
const wrong:CheckboxChangePayload={checked:true,value:"yes",valueAttribute:"yes"};
// @ts-expect-error Misspelled event names do not subscribe silently.
ref.current?.on("chnage",callback);
void[item,compatible,elevated,square,wrong];
`);
const fabExamples=[...fabPresets.map(([preset])=>applyFABPreset(preset,fabDefaults)),...["primary-container","secondary-container","tertiary-container","primary","secondary","tertiary"].flatMap(color=>["default","medium","large"].map(size=>({...fabDefaults,color,size}))),...["none","top-start","top-end","bottom-start","bottom-end"].map(placement=>({...fabDefaults,placement})),...["top-left","top-right","bottom-left","bottom-right"].map(position=>({...fabDefaults,physical:true,position})),{...fabDefaults,label:'Save "draft" <now>',icon:'rocket_launch',type:"submit",name:'action "name"',value:'<save & "confirm">'},{...fabDefaults,icon:"",disabled:true,active:true}];
for(const [index,example]of fabExamples.entries()){
  await writeFile(`${folder}/fab-api-${index}.tsx`,fabExampleCode(example,"react"));
  await writeFile(`${folder}/fab-api-${index}.html`,fabExampleCode(example,"web"));
}
await writeFile(`${folder}/fab-methods.tsx`, `
import {createRef} from "react";
import {FAB,fabColors,fabSizes,type FABHandle,type FABEvent} from "materialfluid";
import {defineMaterialFluidFAB,type MaterialFluidFABElement} from "materialfluid/elements";
const ref=createRef<FABHandle>();const native=createRef<HTMLButtonElement>();
const source=<FAB ref={ref} color="primary-container" size="large" icon="plus" ariaLabel="Create" placement="bottom-end"/>;
const legacy=<FAB ref={native} size="sm" variant="tonal">Create</FAB>;
const callback=(event:FABEvent)=>console.log(event.originalEvent,event.element);
ref.current?.setValue("save").setIcon("check").setSize("medium").setColor("tertiary").setVariant("tonal").setPosition("top-right").setPlacement("none").disable().enable().on("click",callback).off("click",callback);
ref.current?.getValue();ref.current?.getIcon();ref.current?.getPosition();ref.current?.getPlacement();ref.current?.getColor();ref.current?.getSize();ref.current?.getVariant();ref.current?.isDisabled();ref.current?.element;
defineMaterialFluidFAB();const element:MaterialFluidFABElement=document.createElement("mf-fab");element.setIcon("check").setAriaLabel("Done").setSize("large").setColor("secondary").setPlacement("none").setPosition("bottom-right").setValue("save").disable().enable();void element.updateComplete;
// @ts-expect-error Elevated is excluded.
const elevated=<FAB variant="elevated"/>;
// @ts-expect-error Square is excluded.
const square=<FAB shape="square"/>;
// @ts-expect-error Icon size is derived from appearance.
const iconSize=<FAB iconSize={30}/>;
// @ts-expect-error Ripple tuning is excluded.
const ripple=<FAB ripple={false}/>;
// @ts-expect-error Elevation is excluded.
ref.current?.lower();
// @ts-expect-error Motion tuning stays private.
const motion=<FAB pressMotion={{scale:.8}}/>;
void [source,legacy,elevated,square,iconSize,ripple,motion,fabColors,fabSizes];
`);
const splitExamples=[...splitButtonPresets.map(([preset])=>applySplitButtonPreset(preset,splitButtonDefaults)),...["xs","sm","md","lg","xl"].flatMap(size=>["filled","tonal","outlined","ghost"].map(variant=>({...splitButtonDefaults,size,variant}))),{...splitButtonDefaults,layer:"top",expanded:true},{...splitButtonDefaults,type:"submit",name:'action "name"',value:'<save & "confirm">'},{...splitButtonDefaults,type:"reset"},{...splitButtonDefaults,preset:"custom",text:'Save "draft" <now>',icon:"rocket_launch",disabled:true}];
for(const [index,example]of splitExamples.entries()){
  await writeFile(`${folder}/split-button-api-${index}.tsx`,splitButtonExampleCode(example,"react"));
  await writeFile(`${folder}/split-button-api-${index}.html`,splitButtonExampleCode(example,"web"));
}
await writeFile(`${folder}/split-button-methods.tsx`, `
import {createRef} from "react";
import {SplitButton,SplitButtonItem,type SplitButtonHandle,type SplitButtonEvent} from "materialfluid";
import {defineMaterialFluidSplitButton,type MaterialFluidSplitButtonElement} from "materialfluid/elements";
const ref=createRef<SplitButtonHandle>();const native=createRef<HTMLButtonElement>();
const component=<SplitButton ref={ref} text="Save" trailingLabel="Save options" items={[{id:"copy",text:"Copy"}]}/>;
const compatible=<SplitButton ref={native} label="Save" menuLabel="Options" items={[{id:"copy",label:"Copy"}]}/>;
const callback=(event:SplitButtonEvent)=>console.log(event.expanded);
ref.current?.setText("Publish").setIcon("check").setItems([{id:"draft",text:"Draft"}]).expand().collapse().disable().enable().on("expand",callback).off("expand",callback);
ref.current?.getText();ref.current?.getItems();ref.current?.isExpanded();ref.current?.isDisabled();ref.current?.element;ref.current?.leadingElement;ref.current?.trailingElement;
defineMaterialFluidSplitButton();const element:MaterialFluidSplitButtonElement=document.createElement("mf-split-button");element.setText("Save").setIcon("check").setItems([{id:"draft",text:"Draft"}]).setSize("xl").setVariant("tonal").expand().collapse().disable().enable();element.getText();element.getItems();element.isExpanded();element.isDisabled();void element.updateComplete;
// @ts-expect-error Elevated is excluded.
const elevated=<SplitButton text="Save" variant="elevated"/>;
// @ts-expect-error Square is excluded.
const square=<SplitButton text="Save" shape="square"/>;
// @ts-expect-error Motion tuning stays private.
const motion=<SplitButton text="Save" pressMotion={{scale:.8}}/>;
const declarative=<SplitButton text="Save"><SplitButtonItem value="copy">Copy</SplitButtonItem></SplitButton>;
const nested=<SplitButton text="Export" items={[{id:"formats",text:"Formats",items:[{id:"pdf",text:"PDF"}]}]}/>;
void [component,compatible,declarative,nested,elevated,square,motion];
`);
await writeFile(`${folder}/button-group-methods.tsx`, `
import {createRef} from "react";
import {ButtonGroup, ButtonGroupItem, type ButtonGroupHandle, Button, IconButton} from "materialfluid";
import {defineMaterialFluidButtonGroup, type MaterialFluidButtonGroupElement} from "materialfluid/elements";
const ref=createRef<ButtonGroupHandle>();
const group=<ButtonGroup ref={ref} kind="connected" selection="single" required defaultValue="a"><ButtonGroupItem value="a">A</ButtonGroupItem><ButtonGroupItem value="b" icon="check" ariaLabel="Done" /></ButtonGroup>;
ref.current?.select("b").deselect("a").toggle("b").disableButton(0).enable().setDensity("compact").setOrientation("vertical").setVariant("tonal");
ref.current?.getSelected();ref.current?.getButtonById("a");
const legacyRef=createRef<HTMLDivElement>();
const legacy=<ButtonGroup ref={legacyRef} label="Existing"><Button>Action</Button></ButtonGroup>;
const emphasized=<IconButton label="Favorite" variant="tonal" toggle emphasize icon="heart"/>;
// @ts-expect-error Emphasize is behavior, not an appearance variant.
const wrong=<Button variant="emphasize">Action</Button>;
defineMaterialFluidButtonGroup();
const element:MaterialFluidButtonGroupElement=document.createElement("mf-button-group");
element.select("a").toggle("b").disableButton(1).setDensity("comfortable").setVariant("outlined");
element.getButtonById("a"); void element.updateComplete;
const text=<ButtonGroup kind="standard" variant="text" buttons={[{text:"Copy"}]} />;
// @ts-expect-error Elevated is excluded.
const elevated=<ButtonGroup kind="connected" variant="elevated" />;
// @ts-expect-error Square is excluded.
const square=<ButtonGroup kind="connected" shape="square" />;
void [group,legacy,emphasized,wrong,text,elevated,square];
`);
await writeFile(`${folder}/icon-button-element-api.tsx`, `
import { IconButton } from "materialfluid";
import { defineMaterialFluidIconButton, MaterialFluidIconButtonElement } from "materialfluid/elements";
defineMaterialFluidIconButton();
const button: MaterialFluidIconButtonElement = document.createElement("mf-icon-button");
button.toggle = true;
button.setIcon("heart").setSelectedIcon("check").setAriaLabel("Favorite").setVariant("tonal").setSize("xl").setWidth("wide").select();
button.toggleSelected().deselect().removeClass("example");
button.getSelectedIcon(); button.getWidth(); button.getAriaLabel(); button.isToggle();
void button.updateComplete;
const alternate = <IconButton ariaLabel="Edit" icon="edit" width="narrow" size="xs" />;
// @ts-expect-error An accessible name is required.
const unnamed = <IconButton icon="edit" />;
// @ts-expect-error Square is excluded.
const square = <IconButton label="Edit" shape="square" />;
// @ts-expect-error Elevated is excluded.
const elevated = <IconButton label="Edit" variant="elevated" />;
// @ts-expect-error Authored ripple is not a public tuning option.
const ripple = <IconButton label="Edit" ripple={false} />;
`);
await writeFile(`${folder}/button-element-api.tsx`, `
import { defineMaterialFluidButton, MaterialFluidButtonElement } from "materialfluid/elements";
defineMaterialFluidButton();
const button: MaterialFluidButtonElement = document.createElement("mf-button");
button.setText("Save").setIcon("check").setSize("xl").setVariant("tonal").setSelected(true);
void button.setLoading(true, "Saving");
void button.setProgress(60);
void button.updateComplete;
`);
await writeFile(`${folder}/foundation-api.tsx`, `
import { Foundations, MaterialFluidProvider } from "materialfluid";
const css = Foundations.foundationThemeToCss({colorPreset:"neutral",colorScheme:"expressive"});
const theme = Foundations.createFoundationTheme({seed:"#eedd96",colorScheme:"tonalSpot"});
const palette = Foundations.generateScheme({seed:"#7d9dff",variant:"fidelity"});
const image = <svg viewBox="0 0 100 100"><path d={Foundations.shapePaths.flower}/></svg>;
const screen = <MaterialFluidProvider colorScheme="vibrant"><p className="mf-type-body-large">Foundation</p>{image}</MaterialFluidProvider>;
void [css,theme,palette,screen];
`);
const shadcnExamples = JSON.parse(await readFile("src/showcase/shadcn/usage.json", "utf8"));
for (const [id, source] of Object.entries(shadcnExamples)) await writeFile(`${folder}/shadcn-${id}.tsx`, source);
await writeFile(`${folder}/presentation-policy.tsx`, `
import { Accordion, Dialog, AlertDialog, Menu, AnimatedIcon, Switch, Button, Progress, FileInput, MaterialFluidProvider, Badge, createNeutralTheme, type NeutralColorSettings, type ProgressWaveOptions } from "materialfluid";
// @ts-expect-error Button icons follow the appearance size.
const iconSizeOverride = <Button iconSize={30} />;
// @ts-expect-error Ripple is fixed to the authored default.
const rippleOverride = <Button ripple={false} />;
// @ts-expect-error Button tuning is internal.
const pressOverride = <Button pressMotion={{ scale: .8 }} />;
// @ts-expect-error Button tuning is internal.
const sizeOverride = <Button sizeMotion={false} />;
// @ts-expect-error Button tuning is internal.
const colorOverride = <Button colorMotion={false} />;
// @ts-expect-error Provider tuning is internal.
const providerOverride = <MaterialFluidProvider buttonMotion={{ pressDepth: 20 }} />;
// @ts-expect-error Shared text morph uses its authored defaults.
const textOverride = <MaterialFluidProvider textMorph={{ duration: 500 }} />;
void [iconSizeOverride, rippleOverride, pressOverride, sizeOverride, colorOverride, providerOverride, textOverride];
// @ts-expect-error Icon timing uses authored defaults.
const iconTimingOverride = <AnimatedIcon duration={2} />;
// @ts-expect-error Switch glyph timing uses authored defaults.
const switchTimingOverride = <Switch label="Connection" iconMotion={{ duration: 2 }} />;
void [iconTimingOverride, switchTimingOverride];
// @ts-expect-error Accordion physics are fixed defaults.
const accordionOverride = <Accordion items={[]} motionSettings={{ stiffness: 900 }} />;
// @ts-expect-error Dialog physics are fixed defaults.
const dialogOverride = <Dialog title="Details" motionSettings={{ stiffness: 900 }} />;
// @ts-expect-error AlertDialog physics are fixed defaults.
const alertOverride = <AlertDialog title="Confirm" motionSettings={{ stiffness: 900 }} />;
// @ts-expect-error Menu motion is fixed to the authored defaults.
const menuOverride = <Menu label="Actions" items={[]} motionSettings={{ scale: .8 }} />;
void [accordionOverride, dialogOverride, alertOverride, menuOverride];
const neutral: NeutralColorSettings = { surfaceTint: 0, accentStrength: 100 };
void createNeutralTheme("#7d9dff", false, undefined, neutral);
const palettePreview = <MaterialFluidProvider colorPreset="neutral" neutralColors={neutral}><Badge presentation="dot" size="sm" aria-label="Unread messages" /></MaterialFluidProvider>;
void palettePreview;
const wave: ProgressWaveOptions = { waveLength: 60, waveHeight: 20, waveVelocity: 31, direction: "tail", waveThickness: 5, trackThickness: 20, incremental: true };
// @ts-expect-error FileInput intentionally has no Large variant.
const unsupported = <FileInput label="Attachment" size="lg" />;
void unsupported;
export default function Presentations() { return <>
  <Progress label="Upload" value={65} wave={wave} />
  <Progress label="Upload" value={30} presentation="segmented" segments={8} />
  <Progress label="Update" value={30} presentation="wavy" showStatus status="Updating" remaining="8s left" />
  <FileInput label="Attachment" size="sm" />
  <FileInput label="Attachment" size="md" />
</>; }
`);
await writeFile(
  ".cache/package-smoke/tsconfig.examples.json",
  JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "react-jsx",
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      esModuleInterop: true,
    },
    include: ["examples/*.tsx"],
  }),
);
const result = spawnSync(
  process.execPath,
  [
    "node_modules/typescript/bin/tsc",
    "-p",
    ".cache/package-smoke/tsconfig.examples.json",
  ],
  { encoding: "utf8" },
);
if (result.status !== 0) throw Error(result.stdout || result.stderr);
console.log(
  `All ${catalogue.length} default and ${catalogue.length} size examples, ${buttonExamples.length} Button and ${iconButtonExamples.length} IconButton React examples, ${groupExamples.length} ButtonGroup, ${splitExamples.length} SplitButton, ${fabExamples.length} FAB, ${extendedExamples.length} ExtendedFAB, ${checkboxExamples.length} Checkbox, ${switchExamples.length} Switch, ${radiosExamples.length} Radios, ${fabMenuExamples.length} FABMenu, plus ${Object.keys(shadcnExamples).length} compatibility examples, Progress presentations and the FileInput size policy typecheck against the installed package. Matching Button Web Component HTML recipes were generated; browser checks validate the adapter.`,
);
