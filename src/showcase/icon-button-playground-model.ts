import { isButtonToggleVariant, type ButtonSize, type IconButtonWidth } from "../kit/component-policy.ts";
import type { ComponentVariant } from "../kit/appearance";

export type IconButtonPreset = "default" | "edit" | "favorite" | "emphasize" | "wide" | "disabled" | "custom";
export interface IconButtonExample {
  preset: IconButtonPreset; variant: ComponentVariant; size: ButtonSize; width: IconButtonWidth;
  icon: string; selectedIcon: string | null; selectedLabel: string; label: string; toggle: boolean; selected: boolean;
  emphasize: boolean; toggleOnClick: boolean; disabled: boolean; active: boolean; loading: boolean;
  progressMode: "off" | "determinate" | "indeterminate"; progress: number;
  type: "button" | "submit" | "reset"; name: string; value: string;
}
export const iconButtonExampleDefaults: IconButtonExample = {
  preset:"default",variant:"ghost",size:"md",width:"default",icon:"menu",selectedIcon:null,selectedLabel:"",label:"Open menu",
  toggle:false,selected:false,emphasize:false,toggleOnClick:true,disabled:false,active:false,loading:false,
  progressMode:"off",progress:60,type:"button",name:"action",value:"menu",
};
export const iconButtonPresetNames: [IconButtonPreset,string,string][] = [
  ["default","Menu","منو"],["edit","Edit","ویرایش"],["favorite","Favorite","علاقه‌مندی"],
  ["emphasize","Emphasize","تأکیدی"],["wide","Wide action","اقدام عریض"],["disabled","Disabled","غیرفعال"],["custom","Custom","سفارشی"],
];
export function applyIconButtonPreset(preset: IconButtonPreset,current:IconButtonExample):IconButtonExample {
  if(preset==="custom")return {...current,preset};
  const values:Partial<Record<IconButtonPreset,Partial<IconButtonExample>>>={
    edit:{variant:"tonal",icon:"edit",label:"Edit"},
    favorite:{variant:"tonal",icon:"heart",selectedIcon:"check",label:"Favorite",toggle:true,value:"favorite"},
    emphasize:{variant:"tonal",emphasize:true,icon:"play_arrow",selectedIcon:"pause",selectedLabel:"Pause",label:"Play",toggle:true},
    wide:{variant:"outlined",icon:"edit",label:"Edit",width:"wide"},
    disabled:{icon:"delete",label:"Delete",disabled:true},
  };
  return {...iconButtonExampleDefaults,...values[preset],preset};
}
export function iconButtonExampleLabel(value:IconButtonExample,fa:boolean) {
  if(!fa||value.preset==="custom")return value.label;
  return value.preset==="emphasize"?"پخش":({default:"باز کردن منو",edit:"ویرایش",favorite:"علاقه‌مندی",wide:"ویرایش",disabled:"حذف"} as const)[value.preset];
}
export function iconButtonSelectedLabel(value:IconButtonExample,fa:boolean) {
  return fa&&value.preset==="emphasize"?"مکث":value.selectedLabel;
}
const html=(value:string)=>value.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");
export function iconButtonExampleCode(input:IconButtonExample,framework:"react"|"web",fa=false) {
  const toggle=input.toggle&&isButtonToggleVariant(input.variant,input.emphasize),value={...input,toggle,selected:toggle&&input.selected};
  const label=iconButtonExampleLabel(value,fa)||"Icon action",selectedLabel=iconButtonSelectedLabel(value,fa);
  const icons=[...new Set([value.icon,value.selectedIcon].filter((name):name is string=>!!name))];
  const iconImport=icons.length?'\nimport { materialIcons } from "materialfluid/icons";':"";
  const register=icons.length?`\nregisterMaterialIcons({ ${icons.map(name=>`[${JSON.stringify(name)}]: materialIcons[${JSON.stringify(name)}]`).join(", ")} });\n`:"";
  const formFields=value.type!=="button"?'<input name="project" value="MaterialFluid" aria-label="Project" />':"";
  if(framework==="web"){
    const attrs=[`aria-label="${html(label)}"`,`variant="${value.variant}"`,`size="${value.size}"`,`width="${value.width}"`];
    if(toggle&&value.emphasize)attrs.push("emphasize");
    if(value.icon)attrs.push(`icon="${html(value.icon)}"`);
    if(value.selectedIcon)attrs.push(`selected-icon="${html(value.selectedIcon)}"`);
    if(selectedLabel)attrs.push(`selected-label="${html(selectedLabel)}"`);
    for(const key of ["toggle","selected","disabled","active","loading"] as const)if(value[key])attrs.push(key);
    if(!value.toggleOnClick)attrs.push('toggle-on-click="false"');
    if(value.progressMode!=="off")attrs.push(`progress="${value.progressMode==="indeterminate"?"indeterminate":value.progress}"`);
    if(value.type!=="button")attrs.push(`type="${value.type}"`,`name="${html(value.name)}"`,`value="${html(value.value)}"`);
    const markup=`<mf-icon-button ${attrs.join(" ")}></mf-icon-button>`;
    const action=value.type==="submit"?'document.querySelector("form").addEventListener("submit", event => { event.preventDefault(); console.log(new FormData(event.currentTarget, event.submitter)); });':toggle?'button.addEventListener("change", event => console.log(event.detail.selected ? "On action" : "Off action"));':'button.addEventListener("click", () => console.log("Action activated"));';
    return `<script type="module">\nimport { defineMaterialFluidIconButton } from "materialfluid/elements";${icons.length?'\nimport { registerMaterialIcons } from "materialfluid";':""}${iconImport}\nimport "materialfluid/styles.css";\nimport "materialfluid/fonts.css";\n${register}\ndefineMaterialFluidIconButton();\n</script>\n\n${formFields?`<form>\n  ${formFields}\n  ${markup}\n</form>`:markup}\n\n<script type="module">\nconst button = document.querySelector("mf-icon-button");\n${action}\n</script>`;
  }
  const attrs=[`label={${JSON.stringify(label)}}`,`variant="${value.variant}"`,`size="${value.size}"`,`width="${value.width}"`];
  if(toggle && value.emphasize) attrs.push("emphasize");
  if(value.icon)attrs.push(`icon={${JSON.stringify(value.icon)}}`);
  if(value.selectedIcon)attrs.push(`selectedIcon={${JSON.stringify(value.selectedIcon)}}`);else if(toggle)attrs.push("selectedIcon={null}");
  if(selectedLabel)attrs.push(`selectedLabel={${JSON.stringify(selectedLabel)}}`);
  if(toggle)attrs.push("toggle","selected={selected}","onSelectedChange={setSelected}",'onSelectionChange={({ selected }) => console.log(selected ? "On action" : "Off action")}');
  if(!value.toggleOnClick)attrs.push("toggleOnClick={false}");
  for(const key of ["disabled","active","loading"] as const)if(value[key])attrs.push(key);
  if(value.progressMode!=="off")attrs.push(`progress={${value.progressMode==="indeterminate"?"null":value.progress}}`);
  if(value.type!=="button")attrs.push(`type="${value.type}"`,`name={${JSON.stringify(value.name)}}`,`value={${JSON.stringify(value.value)}}`);
  else if(!toggle)attrs.push('onClick={() => console.log("Action activated")}');
  const component=`<IconButton ${attrs.join(" ")} />`;
  return `${toggle?'import { useState } from "react";\n':""}import { IconButton, MaterialFluidProvider${icons.length?", registerMaterialIcons":""} } from "materialfluid";${iconImport}\nimport "materialfluid/styles.css";\nimport "materialfluid/fonts.css";\n${register}\nexport default function Example() {\n${toggle?`  const [selected, setSelected] = useState(${value.selected});\n`:""}  return <MaterialFluidProvider>\n    ${formFields?`<form${value.type==="submit"?' onSubmit={event => { event.preventDefault(); console.log(new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter)); }}':""}>\n      <input name="project" defaultValue="MaterialFluid" aria-label="Project" />\n      ${component}\n    </form>`:component}\n  </MaterialFluidProvider>;\n}`;
}
