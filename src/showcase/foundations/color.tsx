import { useMemo } from "react";
import { Select } from "../../kit/forms";
import { useMaterialFluid } from "../../kit/provider";
import { generateScheme, paletteNames, paletteTones } from "../../kit/foundations/color-engine";
import { foregroundForColor } from "../../kit/foundations/accessibility";
import { colorSchemes, type ColorScheme } from "../../kit/theme";
import "./styles.css";
export function FoundationColor({ onSchemeChange }: { onSchemeChange: (value: ColorScheme) => void }) {
  const { accentSeed, colorScheme, colorBehavior, locale } = useMaterialFluid(), fa = locale === "fa";
  const palette = useMemo(() => generateScheme({ seed: accentSeed, contrast: colorBehavior.contrast / 100, variant: colorScheme === "tonalSpot" ? "tonal-spot" : colorScheme === "fruitSalad" ? "fruit-salad" : colorScheme }), [accentSeed, colorScheme, colorBehavior.contrast]);
  return <section className="foundation-color-configuration"><h2>{fa ? "الگوریتم رنگ و پالت‌های تونال" : "Color algorithm and tonal palettes"}</h2><Select label={fa ? "الگوریتم رنگ" : "Color algorithm"} value={colorScheme} onValueChange={value => onSchemeChange(value as ColorScheme)} options={colorSchemes.map(value => ({ value, label: value === "tonalSpot" ? "Tonal Spot" : value === "fruitSalad" ? "Fruit Salad" : value[0].toUpperCase() + value.slice(1) }))}/><p>{fa ? "تونال اسپات پیش‌فرض شماست. تنظیمات روشنایی، اشباع، پالت خنثی و وضعیت‌ها همچنان پس از تولید رنگ اعمال می‌شوند. این طیف‌ها خروجی پایه الگوریتم‌اند." : "Tonal Spot remains your default. Brightness, saturation, Neutral + seed and status roles still apply after generation. These ramps show the algorithm's base palettes."}</p>{paletteNames.map(name => <div key={name}><h3>{name}</h3><div className="foundation-tone-grid">{paletteTones.map(tone => { const background = palette.palettes[name][tone], ink = foregroundForColor(background); return <span key={tone} className="foundation-tone" style={{ background, color: ink }} title={`${name} ${tone}: ${background}`}>{tone}</span>; })}</div></div>)}</section>;
}
