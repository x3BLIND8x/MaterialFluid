import type { ButtonGroupDensity, ButtonGroupKind, ButtonGroupSelection } from "../kit/button-group";
import type { ButtonSize } from "../kit/component-policy";
import type { ComponentVariant } from "../kit/appearance";
export interface GroupExampleItem { value: string; text: string; icon: string; selectedIcon: string | null; ariaLabel: string; disabled: boolean; }
export interface ButtonGroupExample {
  preset: string; label: string; kind: ButtonGroupKind; selection: ButtonGroupSelection; required: boolean;
  variant: ComponentVariant; size: ButtonSize; labels: "always" | "selected"; orientation: "horizontal" | "vertical";
  density: ButtonGroupDensity; equalWidth: boolean; disabled: boolean; emphasize: boolean;
  items: GroupExampleItem[]; values: string[];
}
const item=(value:string,text:string,icon=""):GroupExampleItem=>({value,text,icon,selectedIcon:null,ariaLabel:text,disabled:false});
export const buttonGroupDefaults:ButtonGroupExample={preset:"actions",label:"Editing actions",kind:"standard",selection:"none",required:false,variant:"outlined",size:"md",labels:"always",orientation:"horizontal",density:"default",equalWidth:false,disabled:false,emphasize:false,items:[item("cut","Cut"),item("copy","Copy"),item("paste","Paste")],values:[]};
export const buttonGroupPresets=[ ["actions","Actions","اقدام‌ها"],["single","Single selection","انتخاب تکی"],["multi","Multiple selection","انتخاب چندتایی"],["labels","Selected labels","برچسب انتخاب‌شده"],["icons","Icon actions","اقدام‌های آیکونی"],["vertical","Vertical","عمودی"],["custom","Custom","سفارشی"] ] as const;
export function applyButtonGroupPreset(preset:string,current:ButtonGroupExample):ButtonGroupExample {
  if(preset==="custom")return {...current,preset};
  const examples:Record<string,Partial<ButtonGroupExample>>={
    single:{kind:"connected",variant:"tonal",selection:"single",required:true,label:"Calendar view",items:[item("day","Day"),item("week","Week"),item("month","Month")],values:["week"]},
    multi:{selection:"multi",label:"Text formatting",items:[item("bold","Bold"),item("italic","Italic"),item("underline","Underline")],values:["bold"]},
    labels:{kind:"connected",variant:"tonal",selection:"single",required:true,labels:"selected",label:"Explore mode",items:[item("explore","Explore","search"),item("nearby","Nearby","location_on"),item("settings","Settings","settings")],values:["explore"]},
    icons:{kind:"connected",selection:"multi",label:"Quick actions",items:[{...item("favorite","","heart"),ariaLabel:"Favorite"},{...item("edit","","edit"),ariaLabel:"Edit"},{...item("done","","check"),ariaLabel:"Done"}]},
    vertical:{kind:"connected",selection:"single",orientation:"vertical",label:"Alignment",items:[item("start","Start"),item("center","Center"),item("end","End")],values:["start"]},
  };
  return {...buttonGroupDefaults,...examples[preset],preset,items:(examples[preset]?.items??buttonGroupDefaults.items).map(item=>({...item}))};
}
export function localizeButtonGroupExample(value:ButtonGroupExample,fa:boolean):ButtonGroupExample {
  if(!fa||value.preset==="custom")return value;
  const labels:Record<string,string>={actions:"اقدام‌های ویرایش",single:"نمای تقویم",multi:"قالب‌بندی متن",labels:"حالت کاوش",icons:"اقدام‌های سریع",vertical:"تراز"};
  const names:Record<string,string>={cut:"برش",copy:"کپی",paste:"چسباندن",day:"روز",week:"هفته",month:"ماه",bold:"پررنگ",italic:"کج",underline:"زیرخط",explore:"کاوش",nearby:"نزدیک",settings:"تنظیمات",favorite:"علاقه‌مندی",edit:"ویرایش",done:"انجام",start:"آغاز",center:"مرکز",end:"پایان"};
  return {...value,label:labels[value.preset]??value.label,items:value.items.map(item=>({...item,text:item.text?names[item.value]??item.text:"",ariaLabel:names[item.value]??item.ariaLabel}))};
}
const html=(value:string)=>value.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");
export function buttonGroupExampleCode(value:ButtonGroupExample,framework:"react"|"web") {
  const icons=[...new Set(value.items.flatMap(item=>[item.icon,item.selectedIcon]).filter((name):name is string=>!!name))];
  const iconImport=icons.length?'\nimport { materialIcons } from "materialfluid/icons";':"";
  const register=icons.length?`\nregisterMaterialIcons({ ${icons.map(name=>`[${JSON.stringify(name)}]: materialIcons[${JSON.stringify(name)}]`).join(", ")} });\n`:"";
  const selected=value.selection==="multi"?value.values:value.selection==="single"?value.values[0]??null:null;
  if(framework==="web"){
    const attrs=[`aria-label="${html(value.label)}"`,`kind="${value.kind}"`,`variant="${value.variant}"`,`size="${value.size}"`,`selection="${value.selection}"`,`orientation="${value.orientation}"`,`density="${value.density}"`,`labels="${value.labels}"`];
    if(value.selection!=="none")attrs.push(`value="${html(Array.isArray(selected)?JSON.stringify(selected):selected??"")}"`);
    for(const [key,attr]of [["required","required"],["equalWidth","equal-width"],["disabled","disabled"],["emphasize","emphasize"]] as const)if(value[key])attrs.push(attr);
    const items=value.items.map(item=>`  <mf-button-group-item value="${html(item.value)}" aria-label="${html(item.ariaLabel||item.text||item.value)}"${item.icon?` icon="${html(item.icon)}"`:""}${item.selectedIcon?` selected-icon="${html(item.selectedIcon)}"`:""}${item.disabled?" disabled":""}>${html(item.text)}</mf-button-group-item>`).join("\n");
    return `<script type="module">\nimport { defineMaterialFluidButtonGroup } from "materialfluid/elements";${icons.length?'\nimport { registerMaterialIcons } from "materialfluid";':""}${iconImport}\nimport "materialfluid/styles.css";\nimport "materialfluid/fonts.css";\n${register}\ndefineMaterialFluidButtonGroup();\n</script>\n\n<mf-button-group ${attrs.join(" ")}>\n${items}\n</mf-button-group>\n\n<script type="module">\nconst group = document.querySelector("mf-button-group");\ngroup.addEventListener("action", event => console.log(event.detail.value, event.detail.index));\ngroup.addEventListener("change", event => console.log(event.detail.value));\n</script>`;
  }
  const attrs=[`label={${JSON.stringify(value.label)}}`,`kind="${value.kind}"`,`variant="${value.variant}"`,`size="${value.size}"`,`selection="${value.selection}"`,`orientation="${value.orientation}"`,`density="${value.density}"`,`labels="${value.labels}"`];
  for(const key of ["required","equalWidth","disabled","emphasize"] as const)if(value[key])attrs.push(key);
  if(value.selection!=="none")attrs.push("value={value}","onValueChange={setValue}");
  attrs.push('onAction={({ value, index }) => console.log(value, index)}');
  const items=value.items.map(item=>`        <ButtonGroupItem value={${JSON.stringify(item.value)}} ariaLabel={${JSON.stringify(item.ariaLabel||item.text||item.value)}}${item.icon?` icon={${JSON.stringify(item.icon)}}`:""}${item.selectedIcon?` selectedIcon={${JSON.stringify(item.selectedIcon)}}`:value.selection!=="none"?" selectedIcon={null}":""}${item.disabled?" disabled":""}>${item.text?`{${JSON.stringify(item.text)}}`:""}</ButtonGroupItem>`).join("\n");
  return `${value.selection!=="none"?'import { useState } from "react";\n':""}import { ButtonGroup, ButtonGroupItem, MaterialFluidProvider${value.selection!=="none"?", type ButtonGroupValue":""}${icons.length?", registerMaterialIcons":""} } from "materialfluid";${iconImport}\nimport "materialfluid/styles.css";\nimport "materialfluid/fonts.css";\n${register}\nexport default function Example() {\n${value.selection!=="none"?`  const [value, setValue] = useState<ButtonGroupValue>(${JSON.stringify(selected)});\n`:""}  return <MaterialFluidProvider>\n      <ButtonGroup ${attrs.join(" ")}>\n${items}\n      </ButtonGroup>\n  </MaterialFluidProvider>;\n}`;
}
