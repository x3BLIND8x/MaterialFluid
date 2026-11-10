import type {FABMenuColor,FABMenuPlacement,FABMenuPresentation} from "../kit/fab-menu";
export interface FABMenuExampleItem {id:string;text:string;icon:string;disabled:boolean;}
export interface FABMenuExample {preset:string;label:string;icon:string;closeIcon:string;color:FABMenuColor;size:"default"|"medium"|"large";presentation:FABMenuPresentation;placement:FABMenuPlacement;disabled:boolean;active:boolean;open:boolean;items:FABMenuExampleItem[];}
const item=(id:string,text:string,icon=""):FABMenuExampleItem=>({id,text,icon,disabled:false});
export const fabMenuDefaults:FABMenuExample={preset:"create",label:"Create",icon:"plus",closeIcon:"close",color:"primary",size:"default",presentation:"auto",placement:"none",disabled:false,active:false,open:false,items:[item("document","Document","draft"),item("folder","Folder","folder"),item("image","Image","image")]};
export const fabMenuPresets=[["create","Create","ایجاد"],["compose","Compose","نوشتن"],["share","Share","هم‌رسانی"],["expressive","Expressive list","فهرست گویا"],["menu","Menu","منو"],["floating","Floating","شناور"],["custom","Custom","سفارشی"]] as const;
export function applyFABMenuPreset(preset:string,current:FABMenuExample):FABMenuExample {if(preset==="custom")return {...current,preset};const changes:Record<string,Partial<FABMenuExample>>={compose:{label:"Compose",icon:"edit",color:"secondary",items:[item("reply","Reply","reply"),item("forward","Forward","forward"),item("archive","Archive","archive")]},share:{label:"Share",icon:"share",color:"tertiary",size:"medium",items:[item("link","Copy link","link"),item("send","Send","send")]},expressive:{presentation:"list",size:"large"},menu:{presentation:"menu"},floating:{placement:"bottom-end",presentation:"list"}};return {...fabMenuDefaults,...changes[preset],preset,items:(changes[preset]?.items??fabMenuDefaults.items).map(item=>({...item}))};}
export function localizeFABMenuExample(value:FABMenuExample,fa:boolean):FABMenuExample {if(!fa||value.preset==="custom")return value;const labels:Record<string,string>={Create:"ایجاد",Compose:"نوشتن",Share:"هم‌رسانی",Document:"سند",Folder:"پوشه",Image:"تصویر",Reply:"پاسخ",Forward:"ارسال به دیگری",Archive:"بایگانی","Copy link":"کپی پیوند",Send:"ارسال"};return {...value,label:labels[value.label]??value.label,items:value.items.map(item=>({...item,text:labels[item.text]??item.text}))};}
const html=(value:string)=>value.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");
export function fabMenuExampleCode(value:FABMenuExample,framework:"react"|"web"){
  const icons=[...new Set([value.icon,value.closeIcon,...value.items.map(item=>item.icon)].filter(Boolean))];
  const registration=icons.length?`import { materialIcons } from "materialfluid/icons";\nregisterMaterialIcons({ ${icons.map(name=>`[${JSON.stringify(name)}]: materialIcons[${JSON.stringify(name)}]`).join(", ")} });\n`:"";
  if(framework==="web")return `<!-- Load materialfluid/styles.css and materialfluid/fonts.css once. -->
<mf-fab-menu aria-label="${html(value.label)}" icon="${html(value.icon)}" close-icon="${html(value.closeIcon)}" color="${value.color}" size="${value.size}" presentation="${value.presentation}" placement="${value.placement}"${value.disabled?" disabled":""}${value.active?" active":""}${value.open?" open":""}>
${value.items.map(item=>`  <mf-fab-menu-item value="${html(item.id)}"${item.icon?` icon="${html(item.icon)}"`:""}${item.disabled?" disabled":""}>${html(item.text)}</mf-fab-menu-item>`).join("\n")}
</mf-fab-menu>
<script type="module">
import { defineMaterialFluidFABMenu } from "materialfluid/elements";
${icons.length?'import { registerMaterialIcons } from "materialfluid";\n'+registration:""}defineMaterialFluidFABMenu();
const menu = document.querySelector("mf-fab-menu");
menu.on("select", event => console.log(event.detail.value));
</script>`;
  return `import { useState } from "react";
import { FABMenu${icons.length?", registerMaterialIcons":""} } from "materialfluid";
import "materialfluid/styles.css";
import "materialfluid/fonts.css";
${registration}
export default function Example() {
  const [open, setOpen] = useState(${value.open});
  return <FABMenu ariaLabel={${JSON.stringify(value.label)}}${value.icon?` icon={${JSON.stringify(value.icon)}}`:' icon={null}'}${value.closeIcon?` closeIcon={${JSON.stringify(value.closeIcon)}}`:' closeIcon={null}'} color="${value.color}" size="${value.size}" presentation="${value.presentation}" placement="${value.placement}"${value.disabled?" disabled":""}${value.active?" active":""}
    open={open} onOpenChange={setOpen} onSelect={({value}) => console.log(value)}
    items={[
${value.items.map(item=>`      { id: ${JSON.stringify(item.id)}, text: ${JSON.stringify(item.text)}${item.icon?`, icon: ${JSON.stringify(item.icon)}`:""}${item.disabled?", disabled: true":""} }`).join(",\n")}
    ]}/>;
}`;
}
