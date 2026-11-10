import { useEffect, useLayoutEffect, useState, useMemo, useCallback, useRef } from "react";
import { Button, ButtonGroup, Switch } from "../kit/controls";
import { TextField } from "../kit/forms";
import { ComponentAppearanceProvider, type ComponentVariant } from "../kit/appearance";
import { buttonSizes } from "../kit/component-policy";
import { materialIcons as coreIcons } from "../kit/icon-map";
import { Choice } from "./foundations/frame";
import { IconPicker, loadIconChoices } from "./icon-picker";
import { applyButtonGroupPreset, localizeButtonGroupExample, buttonGroupDefaults, buttonGroupPresets, type ButtonGroupExample, type GroupExampleItem } from "./button-group-playground-model";
export default function ButtonGroupPlayground({value:input,onChange,fa}:{value:ButtonGroupExample;onChange:(value:ButtonGroupExample)=>void;fa:boolean}) {
  const localized=useMemo(()=>localizeButtonGroupExample({...buttonGroupDefaults,preset:input.preset,label:input.label,items:input.items},fa),[input.preset,input.label,input.items,fa]);
  const value=useMemo(()=>({...input,label:localized.label,items:localized.items}),[input,localized]);
  const t=useCallback((en:string,persian:string)=>fa?persian:en,[fa]);
  const latest=useRef(value);
  useLayoutEffect(()=>{latest.current=value;},[value]);
  const [iconsReady,setIconsReady]=useState(false),[status,setStatus]=useState("");
  useEffect(()=>{if(iconsReady||!value.items.some(item=>[item.icon,item.selectedIcon].some(name=>name&&!coreIcons[name])))return;let live=true;void loadIconChoices().then(()=>{if(live)setIconsReady(true);}).catch(()=>{if(live)setStatus(t("Icon could not load. Choose it again to retry.","آیکون بارگیری نشد؛ دوباره انتخاب کنید."));});return()=>{live=false;};},[value.items,iconsReady,fa]);
  const update=useCallback((patch:Partial<ButtonGroupExample>)=>onChange({...latest.current,...patch,preset:"custom"}),[onChange]);
  const updateItem=useCallback((index:number,patch:Partial<GroupExampleItem>)=>update({items:latest.current.items.map((item,i)=>i===index?{...item,...patch}:item)}),[update]);
  const available=(name:string|null)=>name&&(iconsReady||coreIcons[name])?name:undefined;
  // Selection updates the preview without reconciling every configuration field.
  const configuration=useMemo(()=>(
    <ComponentAppearanceProvider size="sm" variant="outline"><div className="button-configuration button-group-configuration">
      <section id="example-presets"><div className="section-heading"><h2>{t("Configuration","پیکربندی")}</h2><Button size="sm" variant="ghost" onClick={()=>{onChange({...buttonGroupDefaults,items:buttonGroupDefaults.items.map(item=>({...item}))});setStatus("");}}>{t("Reset example","بازنشانی نمونه")}</Button></div>
        <Choice label={t("Example Presets","نمونه‌های آماده")} value={value.preset} onValueChange={preset=>{onChange(applyButtonGroupPreset(preset,latest.current));setStatus("");}} options={buttonGroupPresets.map(([value,en,persian])=>({value,label:t(en,persian)}))}/></section>
      <section id="button-group-appearance"><h3>{t("Appearance","ظاهر")}</h3><div className="button-configuration-fields">
        <Choice label={t("Kind","ساختار")} value={value.kind} onValueChange={kind=>update({kind:kind as ButtonGroupExample["kind"]})} options={[{value:"standard",label:t("Standard","جدا")},{value:"connected",label:t("Connected","پیوسته")}]}/>
        <Choice label={t("Variant","گونه")} value={value.variant} onValueChange={variant=>update({variant:variant as ComponentVariant})} options={[["filled","Filled","پر"],["tonal","Tonal","تونال"],["outlined","Outlined","خطی"],["ghost","Text / Ghost","متنی / شفاف"]].map(([value,en,persian])=>({value,label:t(en,persian)}))}/>
        <Choice label={t("Size","اندازه")} value={value.size} onValueChange={size=>update({size:size as ButtonGroupExample["size"]})} options={buttonSizes.map(value=>({value,label:({xs:"XS",sm:"S",md:"M",lg:"L",xl:"XL"})[value]}))}/>
        <Choice label={t("Orientation","جهت")} value={value.orientation} onValueChange={orientation=>update({orientation:orientation as ButtonGroupExample["orientation"]})} options={[{value:"horizontal",label:t("Horizontal","افقی")},{value:"vertical",label:t("Vertical","عمودی")}]}/>
        <Choice label={t("Density","تراکم")} value={value.density} onValueChange={density=>update({density:density as ButtonGroupExample["density"]})} options={[["default","Default","پیش‌فرض"],["comfortable","Comfortable","راحت"],["compact","Compact","فشرده"]].map(([value,en,persian])=>({value,label:t(en,persian)}))}/>
        <Switch label={t("Equal width","عرض یکسان")} checked={value.equalWidth} onCheckedChange={equalWidth=>update({equalWidth})}/>
      </div></section>
      <section id="button-group-content"><h3>{t("Content","محتوا")}</h3><div className="button-configuration-fields">
        <TextField label={t("Group label","نام گروه")} value={value.label} onChange={event=>update({label:event.target.value})}/>
        <Choice label={t("Labels","برچسب‌ها")} value={value.labels} onValueChange={labels=>update({labels:labels as ButtonGroupExample["labels"]})} options={[{value:"always",label:t("Always","همیشه")},{value:"selected",label:t("Selected only","فقط انتخاب‌شده")}]}/>
      </div><div className="button-group-item-editors">{value.items.map((item,index)=><fieldset className="foundation-control-group" key={index}><legend>{t(`Button ${index+1}`,`دکمه ${index+1}`)}</legend><div className="button-configuration-fields">
        <TextField label={t(`Button ${index+1} text`,`متن دکمه ${index+1}`)} value={item.text} onChange={event=>updateItem(index,{text:event.target.value})}/>
        <TextField label={t(`Button ${index+1} accessible label`,`نام دسترس‌پذیر دکمه ${index+1}`)} value={item.ariaLabel} onChange={event=>updateItem(index,{ariaLabel:event.target.value})}/>
        <TextField label={t(`Button ${index+1} value`,`مقدار دکمه ${index+1}`)} value={item.value} onChange={event=>updateItem(index,{value:event.target.value,ariaLabel:item.ariaLabel})}/>
        <div className="button-icon-control" role="group" aria-label={t(`Button ${index+1} icon`,`آیکون دکمه ${index+1}`)}><span>{t("Icon","آیکون")}</span><IconPicker value={item.icon} onChange={icon=>updateItem(index,{icon})} fa={fa}/></div>
        <div className="button-icon-control" role="group" aria-label={t(`Button ${index+1} selected icon`,`آیکون انتخاب دکمه ${index+1}`)}><span>{t("Selected icon","آیکون انتخاب‌شده")}</span><IconPicker value={item.selectedIcon??""} onChange={selectedIcon=>updateItem(index,{selectedIcon:selectedIcon||null})} fa={fa}/></div>
        <Switch label={t(`Button ${index+1} disabled`,`دکمه ${index+1} غیرفعال`)} checked={item.disabled} onCheckedChange={disabled=>updateItem(index,{disabled})}/>
        <Button size="sm" variant="ghost" onClick={()=>update({items:value.items.filter((_,i)=>i!==index),values:latest.current.values.filter(selected=>selected!==item.value)})}>{t(`Remove button ${index+1}`,`حذف دکمه ${index+1}`)}</Button>
      </div></fieldset>)}</div><Button size="sm" variant="outlined" onClick={()=>{let suffix=value.items.length+1;while(value.items.some(item=>item.value===`action-${suffix}`))suffix++;update({items:[...value.items,{value:`action-${suffix}`,text:t("Action","اقدام"),ariaLabel:t("Action","اقدام"),icon:"",selectedIcon:null,disabled:false}]});}}>{t("Add button","افزودن دکمه")}</Button></section>
      <section id="button-group-behavior"><h3>{t("Behavior","رفتار")}</h3><Choice label={t("Selection","انتخاب")} value={value.selection} onValueChange={selection=>update({selection:selection as ButtonGroupExample["selection"],values:selection==="none"?[]:selection==="single"?latest.current.values.slice(0,1):latest.current.values})} options={[["none","Actions","اقدام‌ها"],["single","Single","تکی"],["multi","Multiple","چندتایی"]].map(([value,en,persian])=>({value,label:t(en,persian)}))}/>
        <div className="button-behavior-switches"><Switch label={t("Required selection","انتخاب الزامی")} checked={value.required} disabled={value.selection==="none"} onCheckedChange={required=>update({required})}/><Switch label={t("Emphasize","تأکید")} checked={value.emphasize} disabled={value.selection==="none"} onCheckedChange={emphasize=>update({emphasize})}/><Switch label={t("Disabled","غیرفعال")} checked={value.disabled} onCheckedChange={disabled=>update({disabled})}/></div>
      </section>
    </div></ComponentAppearanceProvider>
  ),[value.preset,value.label,value.kind,value.selection,value.required,value.variant,value.size,value.labels,value.orientation,value.density,value.equalWidth,value.disabled,value.emphasize,value.items,fa,t,onChange,update,updateItem]);
  return <section id="examples" aria-label={t("Live examples","نمونه‌های زنده")}>
    <div className="live-stage"><div className="showcase-canvas"><div className="demo-primary"><div className="demo-stack button-group-preview">
      <ButtonGroup label={value.label} kind={value.kind} selection={value.selection} required={value.required} variant={value.variant} size={value.size} labels={value.labels} orientation={value.orientation} density={value.density} equalWidth={value.equalWidth} disabled={value.disabled} emphasize={value.emphasize}
        value={value.selection==="multi"?value.values:value.values[0]??null} onValueChange={selected=>onChange({...input,values:selected==null?[]:Array.isArray(selected)?selected:[selected]})}
        onAction={({value:action})=>setStatus(`${t("Action","اقدام")}: ${action}`)}
        buttons={value.items.map(item=>({...item,text:item.text||undefined,ariaLabel:item.ariaLabel||item.text||item.value,icon:available(item.icon),selectedIcon:available(item.selectedIcon)??null}))}/>
      <output className="button-preview-status" role="status">{status}</output>
    </div></div></div></div>
    {configuration}
  </section>;
}
