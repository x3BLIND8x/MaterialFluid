import { Select } from "../kit/forms";
import { type ColorScheme, type Locale } from "../kit/theme";

const schemes: { value: ColorScheme; en: string; fa: string; detail: [string, string] }[] = [
  { value: "tonalSpot", en: "Tonal spot", fa: "تونال", detail: ["Balanced color based on the seed.", "رنگ متعادل بر اساس فام پایه."] },
  { value: "expressive", en: "Expressive", fa: "بیانگر", detail: ["More varied hues across the palette.", "فام‌های متنوع‌تر در سراسر پالت."] },
  { value: "vibrant", en: "Vibrant", fa: "زنده", detail: ["A more vivid primary palette.", "پالت اصلی زنده‌تر."] },
  { value: "neutral", en: "Neutral", fa: "خنثی", detail: ["Subdued, low-chroma colors.", "رنگ‌های ملایم و کم‌اشباع."] },
  { value: "monochrome", en: "Monochrome", fa: "تک‌رنگ", detail: ["A grayscale theme.", "پوسته‌ای در طیف خاکستری."] },
  { value: "fidelity", en: "Fidelity", fa: "وفادار", detail: ["Keeps the seed color closer to its original appearance.", "ظاهر رنگ پایه را نزدیک‌تر به رنگ اصلی نگه می‌دارد."] },
  { value: "content", en: "Content", fa: "محتوا", detail: ["Derives a scheme that retains the source color's character.", "طرحی با حفظ ویژگی رنگ پایه می‌سازد."] },
  { value: "rainbow", en: "Rainbow", fa: "رنگین‌کمان", detail: ["Uses a colorful accent palette with neutral surfaces.", "پالت تأکیدی رنگارنگ با سطوح خنثی."] },
  { value: "fruitSalad", en: "Fruit salad", fa: "ترکیب میوه‌ای", detail: ["Shifts accent hues for a more varied palette.", "فام‌های تأکیدی را برای پالت متنوع‌تر تغییر می‌دهد."] },
];
export function ColorSchemeControl({ value, onChange, locale, disabled = false }: { value: ColorScheme; onChange: (value: ColorScheme) => void; locale: Locale; disabled?: boolean }) {
  const fa = locale === "fa";
  const selected = schemes.find(scheme => scheme.value === value) ?? schemes[0];
  const spec = ["tonalSpot", "expressive", "vibrant", "neutral"].includes(value) ? "2025" : "2021";
  return <div className="scheme-control"><Select label={fa ? "گونه رنگ پوسته" : "Theme color scheme"} size="sm" value={value} disabled={disabled} onValueChange={next => onChange(next as ColorScheme)} options={schemes.map(scheme => ({ value: scheme.value, label: fa ? scheme.fa : scheme.en }))} />
    <p className="settings-note">{disabled ? (fa ? "گونه‌های رنگ در طراحی متریال فعال هستند." : "Color schemes apply to the Material design.") : `${selected.detail[fa ? 1 : 0]} ${fa ? "نسخه رنگ متریال:" : "Material color spec:"} ${spec}`}</p>
  </div>;
}
