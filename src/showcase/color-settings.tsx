import { Button, Slider, ToggleGroup } from "../kit/controls";
import { AnimatedIcon } from "../kit/icons";
import { Select } from "../kit/forms";
import { neutralColorDefaults, type ColorPreset, type NeutralColorSettings } from "../kit/theme-neutral";
import { localizeDigits } from "../kit/numerals";
import {
  colorBehaviorDefaults,
  colorBehaviorRanges,
  type ColorBehavior,
  type Locale,
} from "../kit/theme";

const controls: {
  key: keyof ColorBehavior;
  en: string;
  fa: string;
  unit: string;
}[] = [
  {
    key: "lightBrightness",
    en: "Light action brightness",
    fa: "روشنایی دکمه‌ها در حالت روشن",
    unit: "%",
  },
  {
    key: "darkBrightness",
    en: "Dark action brightness",
    fa: "روشنایی دکمه‌ها در حالت تیره",
    unit: "%",
  },
  {
    key: "primarySaturation",
    en: "Primary saturation",
    fa: "اشباع رنگ اصلی",
    unit: "%",
  },
  {
    key: "secondarySaturation",
    en: "Secondary saturation",
    fa: "اشباع رنگ ثانویه",
    unit: "%",
  },
  {
    key: "secondaryHueShift",
    en: "Secondary hue shift",
    fa: "چرخش فام ثانویه",
    unit: "°",
  },
  { key: "surfaceTint", en: "Surface tint", fa: "رنگ‌مایه سطوح", unit: "%" },
  { key: "contrast", en: "Contrast", fa: "کنتراست", unit: "%" },
  {
    key: "lightInkBrightness",
    en: "Light icon & accent ink",
    fa: "رنگ آیکن و نوشته رنگی در حالت روشن",
    unit: "%",
  },
  {
    key: "darkInkBrightness",
    en: "Dark icon & accent ink",
    fa: "رنگ آیکن و نوشته رنگی در حالت تیره",
    unit: "%",
  },
  {
    key: "lightPlainInkBrightness",
    en: "Light Outline / Ghost ink",
    fa: "رنگ آیکن بدون زمینه در حالت روشن",
    unit: "%",
  },
  {
    key: "darkPlainInkBrightness",
    en: "Dark Outline / Ghost ink",
    fa: "رنگ آیکن بدون زمینه در حالت تیره",
    unit: "%",
  },
  {
    key: "lightDangerBrightness",
    en: "Light Danger brightness",
    fa: "روشنایی رنگ خطر در حالت روشن",
    unit: "%",
  },
  {
    key: "darkDangerBrightness",
    en: "Dark Danger brightness",
    fa: "روشنایی رنگ خطر در حالت تیره",
    unit: "%",
  },
  {
    key: "lightContainerBrightness",
    en: "Light selection & containers",
    fa: "روشنایی انتخاب و سطوح رنگی در حالت روشن",
    unit: "%",
  },
  {
    key: "darkContainerBrightness",
    en: "Dark selection & containers",
    fa: "روشنایی انتخاب و سطوح رنگی در حالت تیره",
    unit: "%",
  },
  {
    key: "lightSurfaceBrightness",
    en: "Light neutral backgrounds",
    fa: "روشنایی پس‌زمینه خنثی در حالت روشن",
    unit: "%",
  },
  {
    key: "darkSurfaceBrightness",
    en: "Dark neutral backgrounds",
    fa: "روشنایی پس‌زمینه خنثی در حالت تیره",
    unit: "%",
  },
  {
    key: "lightTextBrightness",
    en: "Light neutral text",
    fa: "روشنایی متن خنثی در حالت روشن",
    unit: "%",
  },
  {
    key: "darkTextBrightness",
    en: "Dark neutral text",
    fa: "روشنایی متن خنثی در حالت تیره",
    unit: "%",
  },
  {
    key: "lightBorderBrightness",
    en: "Light borders",
    fa: "روشنایی حاشیه‌ها در حالت روشن",
    unit: "%",
  },
  {
    key: "darkBorderBrightness",
    en: "Dark borders",
    fa: "روشنایی حاشیه‌ها در حالت تیره",
    unit: "%",
  },
];
const actionGroups: {
  variant: "filled" | "tonal" | "outlined" | "ghost" | "danger";
  en: string;
  fa: string;
  fields: { key: keyof ColorBehavior; en: string; fa: string; unit: string }[];
}[] = [
  { variant: "filled", en: "Filled", fa: "پر", fields: [
    { key: "filledHueShift", en: "Hue shift", fa: "چرخش فام", unit: "°" },
    { key: "filledSaturation", en: "Saturation", fa: "اشباع رنگ", unit: "%" },
    { key: "lightFilledTone", en: "Light brightness adjustment", fa: "تنظیم روشنایی حالت روشن", unit: "%" },
    { key: "darkFilledTone", en: "Dark brightness adjustment", fa: "تنظیم روشنایی حالت تیره", unit: "%" },
  ] },
  { variant: "tonal", en: "Tonal", fa: "تونال", fields: [
    { key: "tonalHueShift", en: "Hue shift", fa: "چرخش فام", unit: "°" },
    { key: "tonalSaturation", en: "Light saturation", fa: "اشباع رنگ در حالت روشن", unit: "%" },
    { key: "darkTonalSaturation", en: "Dark saturation", fa: "اشباع رنگ در حالت تیره", unit: "%" },
    { key: "lightTonalTone", en: "Light brightness adjustment", fa: "تنظیم روشنایی حالت روشن", unit: "%" },
    { key: "darkTonalTone", en: "Dark brightness adjustment", fa: "تنظیم روشنایی حالت تیره", unit: "%" },
  ] },
  { variant: "outlined", en: "Outlined", fa: "خطی", fields: [
    { key: "outlinedHueShift", en: "Hue shift", fa: "چرخش فام", unit: "°" },
    { key: "outlinedSaturation", en: "Saturation", fa: "اشباع رنگ", unit: "%" },
    { key: "lightOutlinedTone", en: "Light ink adjustment", fa: "تنظیم رنگ نوشته در حالت روشن", unit: "%" },
    { key: "darkOutlinedTone", en: "Dark ink adjustment", fa: "تنظیم رنگ نوشته در حالت تیره", unit: "%" },
  ] },
  { variant: "ghost", en: "Ghost", fa: "شفاف", fields: [
    { key: "ghostHueShift", en: "Hue shift", fa: "چرخش فام", unit: "°" },
    { key: "ghostSaturation", en: "Saturation", fa: "اشباع رنگ", unit: "%" },
    { key: "lightGhostTone", en: "Light ink adjustment", fa: "تنظیم رنگ نوشته در حالت روشن", unit: "%" },
    { key: "darkGhostTone", en: "Dark ink adjustment", fa: "تنظیم رنگ نوشته در حالت تیره", unit: "%" },
  ] },
  { variant: "danger", en: "Danger", fa: "خطر", fields: controls.filter(({ key }) => key === "lightDangerBrightness" || key === "darkDangerBrightness") },
];
export function ColorSettings({
  value,
  onChange,
  locale,
  colorDesign,
  onColorDesignChange,
  colorPreset,
  onColorPresetChange,
  neutralColors,
  onNeutralColorsChange,
}: {
  value: ColorBehavior;
  onChange: (value: ColorBehavior) => void;
  locale: Locale;
  colorDesign: "material" | "previous";
  onColorDesignChange: (design: "material" | "previous") => void;
  colorPreset: ColorPreset;
  onColorPresetChange: (preset: ColorPreset) => void;
  neutralColors: NeutralColorSettings;
  onNeutralColorsChange: (value: NeutralColorSettings) => void;
}) {
  const fa = locale === "fa";
  const renderControl = ({
    key,
    en,
    fa: persian,
    unit,
  }: (typeof controls)[number]) => (
    <div className="color-setting" key={key}>
      <Slider
        label={fa ? persian : en}
        size="sm"
        value={[value[key]]}
        min={colorBehaviorRanges[key][0]}
        max={colorBehaviorRanges[key][1]}
        step={1}
        showValue={false}
        aria-valuetext={`${localizeDigits(String(value[key]), locale)}${unit}`}
        onValueChange={([next]) => onChange({ ...value, [key]: next })}
      />
      <output aria-hidden="true" dir="ltr">
        {localizeDigits(String(value[key]), locale)}
        {unit}
      </output>
    </div>
  );
  return (
    <section
      className="color-settings"
      aria-label={fa ? "رفتار رنگ‌ها" : "Color behavior"}
    >
      <div className="color-settings-heading">
        <h4>{fa ? "رفتار رنگ‌ها" : "Color behavior"}</h4>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => { onChange({ ...colorBehaviorDefaults }); onNeutralColorsChange({ ...neutralColorDefaults }); }}
        >
          {fa ? "بازنشانی رنگ‌ها" : "Reset colors"}
        </Button>
      </div>
      <Select label={fa ? "پالت رنگ" : "Palette preset"} size="sm" value={colorPreset}
        onValueChange={value => { onColorPresetChange(value as ColorPreset); if (value === 'neutral') onColorDesignChange('material'); }}
        options={[{value:'neutral',label:fa?'خنثی + رنگ پایه':'Neutral + seed'},{value:'standard',label:fa?'پالت اصلی':'Original palette'}]} />
      {colorPreset === 'neutral' && colorDesign === 'material' && <>
        <p className="settings-note">{fa ? "سطوح خنثی، رنگ اصلی روشن و متن تیره. اشباع رنگ تأکیدی و ته‌رنگ سطح را جدا تنظیم کنید." : "Neutral surfaces with light primary fills and dark text. Tune accent strength and surface tint independently."}</p>
        {(['surfaceTint','accentStrength'] as const).map(key => <div className="color-setting" key={key}><Slider size="sm" label={key === 'surfaceTint' ? (fa?'ته‌رنگ سطوح خنثی':'Surface tint') : (fa?'شدت رنگ تأکیدی':'Accent strength')} min={0} max={100} step={1} value={[neutralColors[key]]} showValue={false} onValueChange={([next])=>onNeutralColorsChange({...neutralColors,[key]:next})}/><output dir="ltr">{neutralColors[key]}%</output></div>)}
      </>}
      <div className="color-design-control">
        <span>{fa ? "طراحی رنگ کامپوننت‌ها" : "Component colors"}</span>
        <ToggleGroup label={fa ? "طراحی رنگ کامپوننت‌ها" : "Component colors"} size="sm"
          value={colorDesign} onValueChange={value => onColorDesignChange(value as "material" | "previous")}
          options={[{ value: "material", label: fa ? "متریال" : "Material" }, { value: "previous", label: fa ? "قبلی" : "Previous" }]} />
      </div>
      <div
        className="color-preview"
        aria-label={fa ? "پیش‌نمایش پالت" : "Palette preview"}
      >
        {(["primary", "secondary", "error"] as const).map(
          (role, index) => (
            <span
              key={role}
              style={{
                background: `var(--mf-${role}-fill)`,
                color: `var(--mf-on-${role}-fill)`,
              }}
            >
              {
                (fa
                  ? ["اصلی", "ثانویه", "خطر"]
                  : ["Primary", "Secondary", "Danger"])[index]
              }
            </span>
          ),
        )}
      </div>
      <p className="settings-note">
        {fa
          ? "تغییرات زنده‌اند. کنتراست بیشتر، نوشته‌ها و سطوح را از هم متمایزتر می‌کند."
          : "Changes apply live. More contrast increases separation between text and surfaces."}
      </p>
      {colorPreset !== 'neutral' || colorDesign === 'previous' ? controls.slice(0, 9).filter(control => colorDesign === "previous" || !["lightBrightness", "darkBrightness"].includes(control.key)).map(renderControl) : null}
      {(colorPreset !== "neutral" || colorDesign === "previous") && <>
      <details className="color-role-settings action-color-settings">
        <summary className="mf-variant--outline">
          <span>{fa ? "رنگ دکمه‌ها" : "Action colors"}</span>
          <AnimatedIcon name="chevron-down" size={18} animated={false} />
        </summary>
        <p className="settings-note">{fa
          ? "هر گونه را جداگانه تنظیم کنید؛ روشنایی نسبت به رنگ پالت تغییر می‌کند."
          : "Tune each treatment independently. Brightness adjustments are relative to the palette."}</p>
        {actionGroups.map(group => (
          <details className="color-role-settings action-color-group" key={group.variant}>
            <summary className="mf-variant--outline">
              <span>{fa ? group.fa : group.en}</span>
              <AnimatedIcon name="chevron-down" size={18} animated={false} />
            </summary>
            <div className="action-color-preview"><Button size="sm" variant={group.variant}>{fa ? group.fa : group.en}</Button></div>
            {group.fields.map(renderControl)}
          </details>
        ))}
      </details>
      <details className="color-role-settings">
        <summary className="mf-variant--outline">
          <span>{fa ? "نقش‌های رنگی پیشرفته" : "Advanced color roles"}</span>
          <AnimatedIcon name="chevron-down" size={18} animated={false} />
        </summary>
        <p className="settings-note">
          {fa
            ? "آیکن داخل سطوح رنگی از مقدار اول استفاده می‌کند. آیکن بدون زمینه، نوار بالا و جستجو از مقدار Outline / Ghost استفاده می‌کند. خطر زمینه قرمز و نوشته و آیکن با کنتراست مناسب دارد."
            : "Colored components use the icon ink values. Outline, Ghost, toolbar and search icons use separate plain ink values. Danger uses a solid red fill with a readable foreground."}
        </p>
        {controls.slice(9).filter(({ key }) => key !== "lightDangerBrightness" && key !== "darkDangerBrightness").map(renderControl)}
      </details>
      </>}
    </section>
  );
}
