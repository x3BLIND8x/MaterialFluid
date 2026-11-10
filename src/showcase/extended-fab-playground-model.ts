import type {FABColor,FABPlacement,FABPosition} from "../kit/fab";
export interface ExtendedFABExample {preset:string;label:string;text:string;iconPosition:"start"|"end";width:"fixed"|"fluid";collapsed:boolean;collapseOnScroll:boolean;icon:string;color:FABColor;size:"small"|"medium"|"large";placement:FABPlacement;position:FABPosition|"none";physical:boolean;disabled:boolean;active:boolean;type:"button"|"submit"|"reset";name:string;value:string;}
export const extendedFABDefaults:ExtendedFABExample={preset:"create",label:"",text:"Create",iconPosition:"start",width:"fixed",collapsed:false,collapseOnScroll:false,icon:"plus",color:"primary-container",size:"small",placement:"none",position:"none",physical:false,disabled:false,active:false,type:"button",name:"action",value:"create"};
export const extendedFABPresets=[["create","Create","ایجاد"],["edit","Edit","ویرایش"],["navigate","Navigate","مسیریابی"],["fixed","Floating action","اقدام شناور"],["submit","Submit","ارسال"],["reset","Reset","بازنشانی"],["custom","Custom","سفارشی"]] as const;
export function applyExtendedFABPreset(preset:string,current:ExtendedFABExample):ExtendedFABExample {if(preset==="custom")return {...current,preset};const changes:Record<string,Partial<ExtendedFABExample>>={edit:{text:"Edit",icon:"edit",color:"secondary-container",value:"edit"},navigate:{text:"Navigate",icon:"navigation",color:"tertiary",size:"large",value:"navigate"},fixed:{text:"Create",placement:"bottom-end",collapseOnScroll:true},submit:{text:"Send",icon:"send",color:"primary",type:"submit",value:"send"},reset:{text:"Reset",icon:"refresh",color:"secondary-container",type:"reset",value:"reset"}};return {...extendedFABDefaults,...changes[preset],preset};}
export function localizeExtendedFABExample(value:ExtendedFABExample,fa:boolean):ExtendedFABExample {const labels:Record<string,string>={Create:"ایجاد",Edit:"ویرایش",Navigate:"مسیریابی",Send:"ارسال",Reset:"بازنشانی"};return fa&&value.preset!=="custom"?{...value,text:labels[value.text]??value.text}:value;}
const html=(value:string)=>value.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");
export function extendedFABExampleCode(value:ExtendedFABExample,framework:"react"|"web"){
  const registration=value.icon?`import { materialIcons } from "materialfluid/icons";\nregisterMaterialIcons({ [${JSON.stringify(value.icon)}]: materialIcons[${JSON.stringify(value.icon)}] });\n`:"";
  const placed=value.physical?(value.position!=="none"?` position="${value.position}"`:""):` placement="${value.placement}"`;
  if(framework==="web")return `<!-- Load materialfluid/styles.css and materialfluid/fonts.css once. -->
<mf-extended-fab icon="${html(value.icon)}" icon-position="${value.iconPosition}" color="${value.color}" size="${value.size}" width="${value.width}"${placed}${value.label?` aria-label="${html(value.label)}"`:""}${value.collapsed?" collapsed":""}${value.collapseOnScroll?" collapse-on-scroll":""}${value.disabled?" disabled":""}${value.active?" active":""} type="${value.type}" name="${html(value.name)}" value="${html(value.value)}">${html(value.text)}</mf-extended-fab>
<script type="module">
import { defineMaterialFluidExtendedFAB } from "materialfluid/elements";
${value.icon?'import { registerMaterialIcons } from "materialfluid";\n'+registration:""}defineMaterialFluidExtendedFAB();
const fab = document.querySelector("mf-extended-fab");
fab.on("click", () => console.log("Action activated"));
fab.on("collapse", () => console.log("Collapsed"));
</script>`;
  return `import { useState } from "react";
import { ExtendedFAB${value.icon?", registerMaterialIcons":""} } from "materialfluid";
import "materialfluid/styles.css";
import "materialfluid/fonts.css";
${registration}
export default function Example() {
  const [collapsed, setCollapsed] = useState(${value.collapsed});
  return <ExtendedFAB text={${JSON.stringify(value.text)}}${value.label?` ariaLabel={${JSON.stringify(value.label)}}`:""}${value.icon?` icon={${JSON.stringify(value.icon)}}`:' icon={null}'} iconPosition="${value.iconPosition}" color="${value.color}" size="${value.size}" width="${value.width}"${placed}${value.collapseOnScroll?" collapseOnScroll":""}${value.disabled?" disabled":""}${value.active?" active":""} type="${value.type}" name={${JSON.stringify(value.name)}} value={${JSON.stringify(value.value)}}
    collapsed={collapsed} onCollapsedChange={setCollapsed} onClick={() => console.log("Action activated")} />;
}`;
}
