export interface CheckboxExample {preset:string;size:"sm"|"md"|"lg";labelPosition:"start"|"end";label:string;ariaLabel:string;name:string;value:string;state:"unchecked"|"checked"|"mixed";error:boolean;required:boolean;disabled:boolean;parent:boolean;options:string;items:{id:string;label:string;checked:boolean}[];}
export const checkboxOptions={updates:[{id:"email",label:"Email updates",checked:true},{id:"sms",label:"SMS updates",checked:false},{id:"push",label:"Push notifications",checked:false}],permissions:[{id:"read",label:"Read",checked:true},{id:"write",label:"Write",checked:true},{id:"share",label:"Share",checked:false}]};
export const checkboxDefaults:CheckboxExample={preset:"updates",size:"md",labelPosition:"end",label:"Receive updates",ariaLabel:"",name:"updates",value:"yes",state:"unchecked",error:false,required:false,disabled:false,parent:false,options:"updates",items:checkboxOptions.updates.map(item=>({...item}))};
export const checkboxPresets=[["updates","Updates","به‌روزرسانی‌ها"],["checked","Selected","انتخاب‌شده"],["mixed","Partial selection","انتخاب جزئی"],["required","Required / error","الزامی / خطا"],["parent","Parent and children","والد و فرزندان"],["custom","Custom","سفارشی"]]as const;
export function applyCheckboxPreset(preset:string,current:CheckboxExample):CheckboxExample{if(preset==="custom")return{...current,preset};const changes:Record<string,Partial<CheckboxExample>>={checked:{state:"checked"},mixed:{state:"mixed"},required:{label:"Accept the terms",required:true,error:true,name:"terms",value:"accepted"},parent:{label:"All notifications",parent:true}};return {...checkboxDefaults,...changes[preset],preset,items:checkboxDefaults.items.map(item=>({...item}))};}
export function checkboxState(value:CheckboxExample){return value.parent?(value.items.every(item=>item.checked)?"checked":value.items.some(item=>item.checked)?"mixed":"unchecked"):value.state;}
export function localizeCheckbox(value:CheckboxExample,fa:boolean):CheckboxExample{if(!fa||value.preset==="custom")return value;const labels:Record<string,string>={"Receive updates":"دریافت به‌روزرسانی‌ها","Accept the terms":"پذیرش شرایط","All notifications":"همه اعلان‌ها","Email updates":"به‌روزرسانی ایمیل","SMS updates":"به‌روزرسانی پیامکی","Push notifications":"اعلان‌ها",Read:"خواندن",Write:"نوشتن",Share:"هم‌رسانی"};return{...value,label:labels[value.label]??value.label,items:value.items.map(item=>({...item,label:labels[item.label]??item.label}))};}
const html=(s:string)=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function checkboxExampleCode(v:CheckboxExample,framework:"react"|"web"){
 const state=checkboxState(v),attrs=` size="${v.size}" label-position="${v.labelPosition}"${v.ariaLabel?` aria-label="${html(v.ariaLabel)}"`:""}${v.error?" error":""}${v.required?" required":""}${v.disabled?" disabled":""}`;
 if(framework==="web")return `<!-- Load materialfluid/styles.css and materialfluid/fonts.css once. -->
${v.parent?'<div id="checkbox-tree">':''}<mf-checkbox id="choice"${attrs}${state==="checked"?" checked":""}${v.parent?'':` name="${html(v.name)}" value="${html(v.value)}"`}>${html(v.label)}</mf-checkbox>
${v.parent?v.items.map(item=>`<mf-checkbox data-child name="${html(v.name)}" value="${html(item.id)}"${item.checked?' checked':''}${v.disabled?' disabled':''}>${html(item.label)}</mf-checkbox>`).join('\n')+'\n</div>':''}
<script type="module">
import { defineMaterialFluidCheckbox } from "materialfluid/elements";
defineMaterialFluidCheckbox();
const parent = document.querySelector("#choice");
${v.parent?`const children = [...document.querySelectorAll("[data-child]")];
const sync = () => { parent.checked = children.every(item => item.checked); parent.indeterminate = children.some(item => item.checked) && !parent.checked; };
parent.addEventListener("change", event => { children.forEach(item => item.checked = event.detail.checked); sync(); });
children.forEach(item => item.addEventListener("change", sync)); sync();`: `parent.indeterminate = ${state==="mixed"};
parent.addEventListener("change", event => console.log(event.detail.checked, event.detail.valueAttribute));`}
</script>`;
 if(!v.parent)return `import { useState } from "react";
import { Checkbox } from "materialfluid";
import "materialfluid/styles.css";
import "materialfluid/fonts.css";
export default function Example() {
 const [checked,setChecked] = useState<boolean | "indeterminate">(${state==="mixed"?'"indeterminate"':String(state==="checked")});
 return <Checkbox label={${JSON.stringify(v.label)}}${v.ariaLabel?` ariaLabel={${JSON.stringify(v.ariaLabel)}}`:""} size="${v.size}" labelPosition="${v.labelPosition}" name={${JSON.stringify(v.name)}} value={${JSON.stringify(v.value)}} checked={checked} onCheckedChange={setChecked}${v.error?' error':''}${v.required?' required':''}${v.disabled?' disabled':''} onChange={event=>console.log(event.checked,event.valueAttribute)}/>;
}`;
 return `import { useState } from "react";
import { Checkbox } from "materialfluid";
import "materialfluid/styles.css";
import "materialfluid/fonts.css";
export default function Example(){
 const [items,setItems]=useState(${JSON.stringify(v.items)});
 const all=items.every(item=>item.checked),some=items.some(item=>item.checked);
 return <div role="group" aria-label={${JSON.stringify(v.label)}}>
  <Checkbox label={${JSON.stringify(v.label)}} size="${v.size}" labelPosition="${v.labelPosition}"${v.ariaLabel?` ariaLabel={${JSON.stringify(v.ariaLabel)}}`:""}${v.required?' required':''}${v.error?' error':''}${v.disabled?' disabled':''} checked={all?true:some?"indeterminate":false} onCheckedChange={checked=>setItems(items.map(item=>({...item,checked:checked===true})))}/>
  {items.map((item,index)=><Checkbox key={item.id} label={item.label} name={${JSON.stringify(v.name)}} value={item.id} size="${v.size}" labelPosition="${v.labelPosition}"${v.disabled?' disabled':''} checked={item.checked} onCheckedChange={checked=>setItems(items.map((entry,i)=>i===index?{...entry,checked:checked===true}:entry))}/>)}
 </div>;
}`;
}
