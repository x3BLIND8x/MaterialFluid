import type { ButtonSize } from "../kit/component-policy";
import type { ComponentVariant } from "../kit/appearance";
export interface SplitExampleItem {id:string;text:string;icon:string;disabled:boolean;destructive:boolean;}
export interface SplitButtonExample {preset:string;text:string;icon:string;trailingLabel:string;groupLabel:string;ariaLabel:string;variant:ComponentVariant;size:ButtonSize;disabled:boolean;expanded:boolean;layer:"portal"|"top";menuSet:string;items:SplitExampleItem[];type:"button"|"submit"|"reset";name:string;value:string;}
const option=(id:string,text:string,icon="",disabled=false,destructive=false):SplitExampleItem=>({id,text,icon,disabled,destructive});
export const splitMenus:Record<string,SplitExampleItem[]>={save:[option("copy","Save a copy"),option("save-as","Save as…")],send:[option("schedule","Schedule send","schedule"),option("draft","Save draft","draft")],watch:[option("queue","Add to queue","playlist_add"),option("playlist","Save to playlist","bookmark")],download:[option("pdf","Download PDF"),option("svg","Download SVG"),option("archive","Download archive","",true)],manage:[option("duplicate","Duplicate","copy"),option("archive","Archive","archive"),option("delete","Delete","delete",false,true)],none:[]};
export const splitButtonDefaults:SplitButtonExample={preset:"save",text:"Save",icon:"",trailingLabel:"Save options",groupLabel:"Save actions",ariaLabel:"",variant:"filled",size:"md",disabled:false,expanded:false,layer:"portal",menuSet:"save",items:splitMenus.save.map(item=>({...item})),type:"button",name:"action",value:"save"};
export const splitButtonPresets=[["save","Save","ذخیره"],["send","Send","ارسال"],["watch","Watch later","تماشای بعدی"],["download","Download","دریافت"],["manage","Manage","مدیریت"],["external","Custom expansion","بازشدن سفارشی"],["custom","Custom","سفارشی"]] as const;
export function applySplitButtonPreset(preset:string,current:SplitButtonExample):SplitButtonExample{
  if(preset==="custom")return {...current,preset};
  const choices:Record<string,Partial<SplitButtonExample>>={send:{text:"Send",icon:"send",trailingLabel:"Send options",groupLabel:"Send actions",menuSet:"send",value:"send"},watch:{text:"Watch later",icon:"bookmark",trailingLabel:"More watch options",groupLabel:"Watch actions",menuSet:"watch",value:"watch"},download:{text:"Download",icon:"download",trailingLabel:"Download options",groupLabel:"Download actions",variant:"outlined",menuSet:"download",value:"download"},manage:{text:"Manage",icon:"settings",trailingLabel:"Manage options",groupLabel:"Manage actions",variant:"tonal",menuSet:"manage",value:"manage"},external:{text:"Create",icon:"plus",trailingLabel:"More create options",groupLabel:"Create actions",menuSet:"none",value:"create"}};
  const result={...splitButtonDefaults,...choices[preset],preset};return {...result,items:(splitMenus[result.menuSet]??[]).map(item=>({...item}))};
}
export function localizeSplitButtonExample(value:SplitButtonExample,fa:boolean):SplitButtonExample{
  if(!fa||value.preset==="custom")return value;
  const text:Record<string,string>={Save:"ذخیره",Send:"ارسال","Watch later":"تماشای بعدی",Download:"دریافت",Manage:"مدیریت",Create:"ایجاد","Save a copy":"ذخیره یک نسخه","Save as…":"ذخیره با نام…","Schedule send":"زمان‌بندی ارسال","Save draft":"ذخیره پیش‌نویس","Add to queue":"افزودن به صف","Save to playlist":"ذخیره در فهرست","Download PDF":"دریافت PDF","Download SVG":"دریافت SVG","Download archive":"دریافت بایگانی",Duplicate:"تکثیر",Archive:"بایگانی",Delete:"حذف"};
  return {...value,text:text[value.text]??value.text,trailingLabel:`گزینه‌های ${text[value.text]??value.text}`,groupLabel:`اقدام‌های ${text[value.text]??value.text}`,items:value.items.map(item=>({...item,text:text[item.text]??item.text}))};
}
const html=(value:string)=>value.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");
export function splitButtonExampleCode(value:SplitButtonExample,framework:"react"|"web"){
  const names=[...new Set([value.icon,...value.items.map(item=>item.icon)].filter(Boolean))];
  const icons=names.length?`import { materialIcons } from "materialfluid/icons";
registerMaterialIcons({ ${names.map(name=>`[${JSON.stringify(name)}]: materialIcons[${JSON.stringify(name)}]`).join(", ")} });
`:"";
  if(framework==="web")return `<!-- Load materialfluid/styles.css and materialfluid/fonts.css once. -->
<mf-split-button text="${html(value.text)}" trailing-label="${html(value.trailingLabel)}" group-label="${html(value.groupLabel)}" variant="${value.variant}" size="${value.size}"${value.icon?` icon="${html(value.icon)}"`:""}${value.ariaLabel?` aria-label="${html(value.ariaLabel)}"`:""}${value.disabled?" disabled":""}${value.expanded?" expanded":""}${value.layer==="top"?' layer="top"':""}${value.type!=="button"?` type="${value.type}" name="${html(value.name)}" value="${html(value.value)}"`:""}>
${value.items.map(item=>`  <mf-menu-item value="${html(item.id)}"${item.icon?` icon="${html(item.icon)}"`:""}${item.disabled?" disabled":""}${item.destructive?" destructive":""}>${html(item.text)}</mf-menu-item>`).join("\n")}
</mf-split-button>
<script type="module">
  import { defineMaterialFluidSplitButton } from "materialfluid/elements";
  ${names.length?`import { registerMaterialIcons } from "materialfluid";
  `+icons.replaceAll("\n","\n  "):""}defineMaterialFluidSplitButton();
  const button = document.querySelector("mf-split-button");
  button.addEventListener("click", () => console.log("Primary action"));
  button.addEventListener("select", event => console.log(event.detail.value));
  button.addEventListener("change", event => console.log(event.detail.expanded));
</script>`;
  const items=value.items.map(item=>`    { id: ${JSON.stringify(item.id)}, text: ${JSON.stringify(item.text)}${item.icon?`, icon: <AnimatedIcon name=${JSON.stringify(item.icon)} />`:""}${item.disabled?", disabled: true":""}${item.destructive?", destructive: true":""} }`).join(",\n");
  return `import { useState } from "react";
import { SplitButton${names.length?", AnimatedIcon, registerMaterialIcons":""} } from "materialfluid";
import "materialfluid/styles.css";
import "materialfluid/fonts.css";
${icons}
export default function Example() {
  const [expanded, setExpanded] = useState(${value.expanded});
  return <SplitButton text={${JSON.stringify(value.text)}} trailingLabel={${JSON.stringify(value.trailingLabel)}} groupLabel={${JSON.stringify(value.groupLabel)}} variant=${JSON.stringify(value.variant)} size=${JSON.stringify(value.size)}${value.icon?` icon=${JSON.stringify(value.icon)}`:""}${value.ariaLabel?` ariaLabel={${JSON.stringify(value.ariaLabel)}}`:""}${value.disabled?" disabled":""}${value.layer==="top"?' layer="top"':""}${value.type!=="button"?` type=${JSON.stringify(value.type)} name={${JSON.stringify(value.name)}} value={${JSON.stringify(value.value)}}`:""}
    expanded={expanded} onExpandedChange={setExpanded}
    onClick={() => console.log("Primary action")}
    onSelect={({value}) => console.log(value)}
    onChange={({expanded}) => console.log(expanded)}
    items={[
${items}
    ]}/>;
}`;
}
