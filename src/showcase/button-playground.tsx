import { useEffect, useState } from "react";
import { Button, Slider, Switch } from "../kit/controls";
import { TextField } from "../kit/forms";
import { ComponentAppearanceProvider, type ComponentVariant } from "../kit/appearance";
import { buttonSizes, isButtonToggleVariant, type ButtonSize } from "../kit/component-policy";
import { buttonExampleDefaults, buttonExampleText, applyButtonPreset, buttonPresetNames, type ButtonExample, type ButtonPreset } from "./button-playground-model";
import { IconPicker, loadIconChoices } from "./icon-picker";
import { Choice } from "./foundations/frame";
import { materialIcons as coreIcons } from "../kit/icon-map";
export default function ButtonPlayground({ value, onChange, fa }: { value: ButtonExample; onChange: (value: ButtonExample) => void; fa: boolean }) {
  const t = (en: string, persian: string) => fa ? persian : en;
  const [iconsReady, setIconsReady] = useState(false), [status, setStatus] = useState("");
  useEffect(() => { let live = true; if (!iconsReady && [value.icon,value.selectedIcon].some(name=>name&&!coreIcons[name])) void loadIconChoices().then(() => { if (live) setIconsReady(true); }).catch(() => { if (live) setStatus(t("Icon could not load. Choose it again to retry.", "آیکون بارگیری نشد؛ دوباره آن را انتخاب کنید.")); }); return () => { live = false; }; }, [value.icon,value.selectedIcon,iconsReady,fa]);
  const toggleAllowed = isButtonToggleVariant(value.variant), toggle = value.toggle && toggleAllowed;
  const update = (patch: Partial<ButtonExample>) => {
    const next = { ...value, text: buttonExampleText(value, fa), ...patch, preset: "custom" as const };
    if (!isButtonToggleVariant(next.variant)) { next.toggle = false; next.selected = false; }
    onChange(next);
  };
  const label = buttonExampleText(value, fa);
  return <section id="examples" aria-label={t("Live examples", "نمونه‌های زنده")}>
    <div className="live-stage"><div className="showcase-canvas"><div className="demo-primary"><form className="demo-stack button-preview-form" onSubmit={event => { event.preventDefault(); setStatus(t("Form submitted", "فرم ارسال شد")); }} onReset={() => setStatus(t("Form reset", "فرم بازنشانی شد"))}>
      {value.type !== "button" && <TextField label={t("Project", "پروژه")} name="project" defaultValue="MaterialFluid" />}
      <Button variant={value.variant} size={value.size} icon={value.icon&&(iconsReady||coreIcons[value.icon])?value.icon:undefined} selectedIcon={value.selectedIcon&&(iconsReady||coreIcons[value.selectedIcon])?value.selectedIcon:null} iconPosition={value.iconPosition}
        aria-label={!label ? t("Action", "اقدام") : undefined} toggle={toggle} selected={value.selected} onSelectedChange={selected => update({ selected })} toggleOnClick={value.toggleOnClick}
        disabled={value.disabled} active={value.active} loading={value.loading} loadingText={value.loadingText || undefined}
        progress={value.progressMode === "off" ? undefined : value.progressMode === "indeterminate" ? null : value.progress}
        type={value.type} name={value.name} value={value.value} onClick={() => setStatus(t("Action activated", "اقدام اجرا شد"))}>{label}</Button>
      <output className="button-preview-status" role="status">{status}</output>
    </form></div></div></div>
    <ComponentAppearanceProvider size="sm" variant="outline"><div className="button-configuration">
      <section id="example-presets"><div className="section-heading"><h2>{t("Configuration", "پیکربندی")}</h2><Button variant="ghost" size="sm" onClick={() => { onChange({ ...buttonExampleDefaults }); setStatus(""); }}>{t("Reset example", "بازنشانی نمونه")}</Button></div>
        <Choice label={t("Example Presets", "نمونه‌های آماده")} value={value.preset} onValueChange={preset => { onChange(applyButtonPreset(preset as ButtonPreset, { ...value, text: label })); setStatus(""); }} options={buttonPresetNames.map(([preset, en, persian]) => ({ value: preset, label: t(en, persian) }))} /></section>
      <section id="button-appearance"><h3>{t("Appearance", "ظاهر")}</h3><div className="button-configuration-fields">
        <Choice label={t("Variant", "گونه")} value={value.variant} onValueChange={variant => update({ variant: variant as ComponentVariant })} options={[["filled",t("Filled","پر")],["emphasize",t("Emphasize","تأکیدی")],["tonal",t("Tonal","تونال")],["outlined",t("Outlined","خطی")],["ghost",t("Text / Ghost","متنی / شفاف")],["danger",t("Danger","خطر")]].map(([key,label])=>({value:key,label}))}/>
        <Choice label={t("Size", "اندازه")} value={value.size} onValueChange={size => update({ size: size as ButtonSize })} options={buttonSizes.map(size => ({ value: size, label: ({xs:"XS",sm:"S",md:"M",lg:"L",xl:"XL"})[size], ariaLabel: ({xs:t("Extra Small","خیلی کوچک"),sm:t("Small","کوچک"),md:t("Medium","متوسط"),lg:t("Large","بزرگ"),xl:t("Extra Large","خیلی بزرگ")})[size] }))}/>
      </div></section>
      <section id="button-content"><h3>{t("Content", "محتوا")}</h3><div className="button-configuration-fields">
        <TextField label={t("Button text", "متن دکمه")} value={label} onChange={event => update({ text: event.target.value })}/>
        <div className="button-icon-control"><span>{t("Icon", "آیکون")}</span><IconPicker value={value.icon} onChange={icon => update({ icon })} fa={fa}/></div>
        <div className="button-icon-control" role="group" aria-label={t("Selected icon", "آیکون انتخاب‌شده")}><span>{t("Selected icon", "آیکون انتخاب‌شده")}</span><IconPicker value={value.selectedIcon??""} onChange={name => update({ selectedIcon:name||null })} fa={fa}/></div>
        {value.icon && <Choice label={t("Icon position", "جای آیکون")} value={value.iconPosition} onValueChange={position => update({ iconPosition: position as "start" | "end" })} options={[{value:"start",label:t("Start","ابتدا")},{value:"end",label:t("End","انتها")}]}/>}
      </div></section>
      <section id="button-behavior"><h3>{t("Behavior", "رفتار")}</h3><div className="button-behavior-switches">
        <Switch label={t("Toggle button", "دکمه انتخابی")} checked={toggle} disabled={!toggleAllowed} onCheckedChange={toggle => update({toggle})}/>
        <Switch label={t("Selected", "انتخاب‌شده")} checked={toggle && value.selected} disabled={!toggle} onCheckedChange={selected => update({selected})}/>
        <Switch label={t("Toggle on click", "تغییر انتخاب با کلیک")} checked={value.toggleOnClick} disabled={!toggle} onCheckedChange={toggleOnClick => update({toggleOnClick})}/>
        <Switch label={t("Disabled", "غیرفعال")} checked={value.disabled} onCheckedChange={disabled => update({disabled})}/>
        <Switch label={t("Active", "فعال")} checked={value.active} onCheckedChange={active => update({active})}/>
        <Switch label={t("Loading", "در حال بارگذاری")} checked={value.loading} onCheckedChange={loading => update({loading})}/>
      </div><div className="button-configuration-fields">
        <Choice label={t("Progress", "پیشرفت")} value={value.progressMode} onValueChange={mode => update({progressMode:mode as ButtonExample["progressMode"]})} options={[{value:"off",label:t("Off","خاموش")},{value:"indeterminate",label:t("Indeterminate","نامعین")},{value:"determinate",label:t("Determinate","معین")}]}/>
        <Choice label={t("Action type", "نوع اقدام")} value={value.type} onValueChange={type=>update({type:type as ButtonExample["type"]})} options={[{value:"button",label:t("Button","دکمه")},{value:"submit",label:t("Submit form","ارسال فرم")},{value:"reset",label:t("Reset form","بازنشانی فرم")}]}/>
        {value.loading && <TextField label={t("Loading text", "متن بارگذاری")} value={value.loadingText} onChange={event => update({loadingText:event.target.value})}/>}
        {value.type !== "button" && <><TextField label={t("Action name", "نام اقدام")} value={value.name} onChange={event=>update({name:event.target.value})}/><TextField label={t("Action value", "مقدار اقدام")} value={value.value} onChange={event=>update({value:event.target.value})}/></>}
      </div>{value.progressMode === "determinate" && <Slider label={t("Progress value", "مقدار پیشرفت")} min={0} max={100} step={1} value={[value.progress]} onValueChange={next => update({progress:next[0]})}/>}</section>
    </div></ComponentAppearanceProvider>
  </section>;
}
