import { useEffect, useState } from "react";
import { IconButton, Button, Switch, Slider } from "../kit/controls";
import { TextField } from "../kit/forms";
import { buttonSizes, isButtonToggleVariant, type ButtonSize, type IconButtonWidth } from "../kit/component-policy";
import { ComponentAppearanceProvider, type ComponentVariant } from "../kit/appearance";
import { materialIcons as coreIcons } from "../kit/icon-map";
import { IconPicker, loadIconChoices } from "./icon-picker";
import { Choice } from "./foundations/frame";
import { applyIconButtonPreset, iconButtonExampleDefaults, iconButtonExampleLabel, iconButtonSelectedLabel, iconButtonPresetNames, type IconButtonExample, type IconButtonPreset } from "./icon-button-playground-model";

export default function IconButtonPlayground({value,onChange,fa}:{value:IconButtonExample;onChange:(value:IconButtonExample)=>void;fa:boolean}) {
  const t=(en:string,persian:string)=>fa?persian:en;
  const [packReady,setPackReady]=useState(false),[status,setStatus]=useState("");
  useEffect(()=>{
    if(packReady||![value.icon,value.selectedIcon].some(name=>name&&!coreIcons[name]))return;
    let live=true;void loadIconChoices().then(()=>{if(live)setPackReady(true);}).catch(()=>{if(live)setStatus(t("Icon could not load. Choose it again to retry.","آیکون بارگیری نشد؛ دوباره انتخاب کنید."));});
    return()=>{live=false;};
  },[value.icon,value.selectedIcon,packReady,fa]);
  const update=(patch:Partial<IconButtonExample>)=>{
    const next={...value,label:iconButtonExampleLabel(value,fa),selectedLabel:iconButtonSelectedLabel(value,fa),...patch,preset:"custom" as const};
    if(!isButtonToggleVariant(next.variant)){next.toggle=false;next.selected=false;}
    onChange(next);
  };
  const toggleAllowed=isButtonToggleVariant(value.variant),toggle=toggleAllowed&&value.toggle;
  const available=(name:string|null)=>name&&(packReady||coreIcons[name])?name:undefined;
  return <section id="examples" aria-label={t("Live examples","نمونه‌های زنده")}>
    <div className="live-stage"><div className="showcase-canvas"><div className="demo-primary"><form className="demo-stack button-preview-form icon-button-preview-form" onSubmit={event=>{event.preventDefault();setStatus(t("Form submitted","فرم ارسال شد"));}} onReset={()=>setStatus(t("Form reset","فرم بازنشانی شد"))}>
      {value.type!=="button"&&<TextField label={t("Project","پروژه")} name="project" defaultValue="MaterialFluid"/>}
      <IconButton label={iconButtonExampleLabel(value,fa)||t("Icon action","اقدام آیکون")} selectedLabel={iconButtonSelectedLabel(value,fa)||undefined} icon={available(value.icon)} selectedIcon={available(value.selectedIcon)??null} variant={value.variant} size={value.size} width={value.width}
        toggle={toggle} selected={value.selected} onSelectedChange={selected=>{update({selected});setStatus(selected?t("On action activated","اقدام روشن اجرا شد"):t("Off action activated","اقدام خاموش اجرا شد"));}} toggleOnClick={value.toggleOnClick} disabled={value.disabled} active={value.active} loading={value.loading}
        progress={value.progressMode==="off"?undefined:value.progressMode==="indeterminate"?null:value.progress} type={value.type} name={value.name} value={value.value}
        onClick={()=>setStatus(t("Action activated","اقدام اجرا شد"))}/>
      <output className="button-preview-status" role="status">{status}</output>
    </form></div></div></div>
    <ComponentAppearanceProvider size="sm" variant="outline"><div className="button-configuration icon-button-configuration">
      <section id="example-presets"><div className="section-heading"><h2>{t("Configuration","پیکربندی")}</h2><Button variant="ghost" size="sm" onClick={()=>{onChange({...iconButtonExampleDefaults});setStatus("");}}>{t("Reset example","بازنشانی نمونه")}</Button></div>
        <Choice label={t("Example Presets","نمونه‌های آماده")} value={value.preset} onValueChange={preset=>{onChange(applyIconButtonPreset(preset as IconButtonPreset,value));setStatus("");}} options={iconButtonPresetNames.map(([preset,en,persian])=>({value:preset,label:t(en,persian)}))}/></section>
      <section id="icon-button-appearance"><h3>{t("Appearance","ظاهر")}</h3><div className="button-configuration-fields">
        <Choice label={t("Variant","گونه")} value={value.variant} onValueChange={variant=>update({variant:variant as ComponentVariant})} options={[["filled",t("Filled","پر")],["emphasize",t("Emphasize","تأکیدی")],["tonal",t("Tonal","تونال")],["outlined",t("Outlined","خطی")],["ghost",t("Text / Ghost","متنی / شفاف")],["danger",t("Danger","خطر")]].map(([value,label])=>({value,label}))}/>
        <Choice label={t("Size","اندازه")} value={value.size} onValueChange={size=>update({size:size as ButtonSize})} options={buttonSizes.map(size=>({value:size,label:({xs:"XS",sm:"S",md:"M",lg:"L",xl:"XL"})[size],ariaLabel:({xs:t("Extra Small","خیلی کوچک"),sm:t("Small","کوچک"),md:t("Medium","متوسط"),lg:t("Large","بزرگ"),xl:t("Extra Large","خیلی بزرگ")})[size]}))}/>
        <Choice label={t("Width","عرض")} value={value.width} onValueChange={width=>update({width:width as IconButtonWidth})} options={[["narrow","Narrow","باریک"],["default","Default","پیش‌فرض"],["wide","Wide","عریض"]].map(([value,en,persian])=>({value,label:t(en,persian)}))}/>
      </div></section>
      <section id="icon-button-content"><h3>{t("Content","محتوا")}</h3><div className="button-configuration-fields">
        <div className="button-icon-control" role="group" aria-label={t("Icon","آیکون")}><span>{t("Icon","آیکون")}</span><IconPicker value={value.icon} onChange={icon=>update({icon})} fa={fa}/></div>
        <div className="button-icon-control" role="group" aria-label={t("Selected icon","آیکون انتخاب‌شده")}><span>{t("Selected icon","آیکون انتخاب‌شده")}</span><IconPicker value={value.selectedIcon??""} onChange={name=>update({selectedIcon:name||null})} fa={fa}/></div>
        <TextField label={t("Accessible label","نام دسترس‌پذیر")} value={iconButtonExampleLabel(value,fa)} onChange={event=>update({label:event.target.value})}/>
        <TextField label={t("Selected label","نام هنگام انتخاب")} value={iconButtonSelectedLabel(value,fa)} onChange={event=>update({selectedLabel:event.target.value})}/>
      </div></section>
      <section id="icon-button-behavior"><h3>{t("Behavior","رفتار")}</h3><div className="button-behavior-switches">
        <Switch label={t("Toggle button","دکمه انتخابی")} checked={toggle} disabled={!toggleAllowed} onCheckedChange={toggle=>update({toggle})}/>
        <Switch label={t("Selected","انتخاب‌شده")} checked={toggle&&value.selected} disabled={!toggle} onCheckedChange={selected=>update({selected})}/>
        <Switch label={t("Toggle on click","تغییر انتخاب با کلیک")} checked={value.toggleOnClick} disabled={!toggle} onCheckedChange={toggleOnClick=>update({toggleOnClick})}/>
        <Switch label={t("Disabled","غیرفعال")} checked={value.disabled} onCheckedChange={disabled=>update({disabled})}/>
        <Switch label={t("Active","فعال")} checked={value.active} onCheckedChange={active=>update({active})}/>
        <Switch label={t("Loading","در حال بارگذاری")} checked={value.loading} onCheckedChange={loading=>update({loading})}/>
      </div><div className="button-configuration-fields">
        <Choice label={t("Progress","پیشرفت")} value={value.progressMode} onValueChange={progressMode=>update({progressMode:progressMode as IconButtonExample["progressMode"]})} options={[["off","Off","خاموش"],["indeterminate","Indeterminate","نامعین"],["determinate","Determinate","معین"]].map(([value,en,persian])=>({value,label:t(en,persian)}))}/>
        <Choice label={t("Action type","نوع اقدام")} value={value.type} onValueChange={type=>update({type:type as IconButtonExample["type"]})} options={[["button","Button","دکمه"],["submit","Submit form","ارسال فرم"],["reset","Reset form","بازنشانی فرم"]].map(([value,en,persian])=>({value,label:t(en,persian)}))}/>
        {value.type!=="button"&&<><TextField label={t("Action name","نام اقدام")} value={value.name} onChange={event=>update({name:event.target.value})}/><TextField label={t("Action value","مقدار اقدام")} value={value.value} onChange={event=>update({value:event.target.value})}/></>}
      </div>{value.progressMode==="determinate"&&<Slider label={t("Progress value","مقدار پیشرفت")} min={0} max={100} step={1} value={[value.progress]} onValueChange={next=>update({progress:next[0]})}/>}</section>
    </div></ComponentAppearanceProvider>
  </section>;
}
