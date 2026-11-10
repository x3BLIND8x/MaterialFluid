import type {FABColor,FABPlacement,FABPosition} from "../kit/fab";
export interface FABExample {preset:string;label:string;icon:string;color:FABColor;size:"default"|"medium"|"large";placement:FABPlacement;position:FABPosition|"none";physical:boolean;disabled:boolean;active:boolean;type:"button"|"submit"|"reset";name:string;value:string;}
export const fabDefaults:FABExample={preset:"create",label:"Create",icon:"plus",color:"primary-container",size:"default",placement:"none",position:"none",physical:false,disabled:false,active:false,type:"button",name:"action",value:"create"};
export const fabPresets=[["create","Create","ایجاد"],["edit","Edit","ویرایش"],["navigate","Navigate","مسیریابی"],["fixed","Floating action","اقدام شناور"],["submit","Submit","ارسال"],["reset","Reset","بازنشانی"],["custom","Custom","سفارشی"]] as const;
export function applyFABPreset(preset:string,current:FABExample):FABExample {if(preset==="custom")return {...current,preset};const changes:Record<string,Partial<FABExample>>={edit:{label:"Edit",icon:"edit",color:"secondary-container",value:"edit"},navigate:{label:"Navigate",icon:"navigation",color:"tertiary",size:"large",value:"navigate"},fixed:{label:"Create",placement:"bottom-end"},submit:{label:"Send",icon:"send",color:"primary",type:"submit",value:"send"},reset:{label:"Reset",icon:"refresh",color:"secondary-container",type:"reset",value:"reset"}};return {...fabDefaults,...changes[preset],preset};}
export function localizeFABExample(value:FABExample,fa:boolean):FABExample {const labels:Record<string,string>={Create:"ایجاد",Edit:"ویرایش",Navigate:"مسیریابی",Send:"ارسال",Reset:"بازنشانی"};return fa&&value.preset!=="custom"?{...value,label:labels[value.label]??value.label}:value;}
const html=(value:string)=>value.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");
export function fabExampleCode(value:FABExample,framework:"react"|"web") {
  const register=value.icon?`import { materialIcons } from "materialfluid/icons";\nregisterMaterialIcons({ [${JSON.stringify(value.icon)}]: materialIcons[${JSON.stringify(value.icon)}] });\n`:"";
  const placed=value.physical?(value.position!=="none"?` position="${value.position}"`:""):` placement="${value.placement}"`;
  if(framework==="web")return `<!-- Load materialfluid/styles.css and materialfluid/fonts.css once. -->
<mf-fab aria-label="${html(value.label)}" icon="${html(value.icon)}" color="${value.color}" size="${value.size}"${placed}${value.disabled?" disabled":""}${value.active?" active":""} type="${value.type}" name="${html(value.name)}" value="${html(value.value)}"></mf-fab>
<script type="module">
import { defineMaterialFluidFAB } from "materialfluid/elements";
${value.icon?'import { registerMaterialIcons } from "materialfluid";\n'+register:""}defineMaterialFluidFAB();
const fab = document.querySelector("mf-fab");
fab.on("click", () => console.log("Action activated"));
</script>`;
  return `import { FAB${value.icon?", registerMaterialIcons":""} } from "materialfluid";
import "materialfluid/styles.css";
import "materialfluid/fonts.css";
${register}
export default function Example() {
  return <FAB ariaLabel={${JSON.stringify(value.label)}}${value.icon?` icon={${JSON.stringify(value.icon)}}`:""} color="${value.color}" size="${value.size}"${placed}${value.disabled?" disabled":""}${value.active?" active":""} type="${value.type}" name={${JSON.stringify(value.name)}} value={${JSON.stringify(value.value)}} onClick={() => console.log("Action activated")} />;
}`;
}
