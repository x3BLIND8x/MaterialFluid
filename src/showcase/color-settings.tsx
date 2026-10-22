import { Button, Slider } from "../kit/controls";
import { AnimatedIcon } from "../kit/icons";
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
    key: "tertiarySaturation",
    en: "Tertiary saturation",
    fa: "اشباع رنگ سوم",
    unit: "%",
  },
  {
    key: "secondaryHueShift",
    en: "Secondary hue shift",
    fa: "چرخش فام ثانویه",
    unit: "°",
  },
  {
    key: "tertiaryHueShift",
    en: "Tertiary hue shift",
    fa: "چرخش فام سوم",
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
export function ColorSettings({
  value,
  onChange,
  locale,
}: {
  value: ColorBehavior;
  onChange: (value: ColorBehavior) => void;
  locale: Locale;
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
        aria-valuetext={`${value[key]}${unit}`}
        onValueChange={([next]) => onChange({ ...value, [key]: next })}
      />
      <output aria-hidden="true" dir="ltr">
        {value[key]}
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
          onClick={() => onChange({ ...colorBehaviorDefaults })}
        >
          {fa ? "بازنشانی رنگ‌ها" : "Reset colors"}
        </Button>
      </div>
      <div
        className="color-preview"
        aria-label={fa ? "پیش‌نمایش پالت" : "Palette preview"}
      >
        {(["primary", "secondary", "tertiary", "error"] as const).map(
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
                  ? ["اصلی", "ثانویه", "سوم", "خطر"]
                  : ["Primary", "Secondary", "Tertiary", "Danger"])[index]
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
      {controls.slice(0, 9).map(renderControl)}
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
        {controls.slice(9).map(renderControl)}
      </details>
    </section>
  );
}
