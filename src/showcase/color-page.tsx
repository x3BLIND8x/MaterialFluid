import { type Ref } from "react";
import { Button, Checkbox } from "../kit/controls";
import { Badge, CardGroup } from "../kit/surfaces";
import { useMaterialFluid } from "../kit/provider";
import { AccentSeed } from "./accent-seed";
import { ColorSchemeControl } from "./color-scheme-control";
import { type ColorScheme } from "../kit/theme";

type Role = { token: string; en: string; fa: string; fallback?: string };
const accents: Role[] = [
  { token: "primary", en: "Primary", fa: "اصلی" }, { token: "on-primary", en: "On primary", fa: "روی اصلی" },
  { token: "primary-container", en: "Primary container", fa: "زمینه اصلی" }, { token: "on-primary-container", en: "On primary container", fa: "روی زمینه اصلی" },
  { token: "secondary", en: "Secondary", fa: "ثانویه" }, { token: "on-secondary", en: "On secondary", fa: "روی ثانویه" },
  { token: "secondary-container", en: "Secondary container", fa: "زمینه ثانویه" }, { token: "on-secondary-container", en: "On secondary container", fa: "روی زمینه ثانویه" },
];
const surfaces: Role[] = [
  { token: "canvas", en: "Canvas", fa: "بوم" }, { token: "surface", en: "Surface", fa: "سطح" },
  { token: "surface-container-lowest", en: "Container lowest", fa: "زمینه پایین‌ترین" , fallback: "surface" },
  { token: "surface-container-low", en: "Container low", fa: "زمینه پایین", fallback: "surface" },
  { token: "surface-container", en: "Container", fa: "زمینه" }, { token: "surface-high", en: "Container high", fa: "زمینه بالا" },
  { token: "surface-container-highest", en: "Container highest", fa: "زمینه بالاترین", fallback: "surface-high" },
  { token: "surface-dim", en: "Surface dim", fa: "سطح تیره‌تر", fallback: "surface" }, { token: "surface-bright", en: "Surface bright", fa: "سطح روشن‌تر", fallback: "surface" },
  { token: "background", en: "Background", fa: "پس‌زمینه" }, { token: "on-background", en: "On background", fa: "روی پس‌زمینه" },
  { token: "on-surface", en: "On surface", fa: "روی سطح" }, { token: "on-surface-variant", en: "On surface variant", fa: "روی سطح متغیر" },
  { token: "outline", en: "Outline", fa: "خط دور" }, { token: "outline-variant", en: "Outline variant", fa: "خط دور متغیر" },
  { token: "inverse-surface", en: "Inverse surface", fa: "سطح معکوس" }, { token: "inverse-on-surface", en: "On inverse surface", fa: "روی سطح معکوس" },
  { token: "inverse-primary", en: "Inverse primary", fa: "اصلی معکوس" }, { token: "surface-tint", en: "Surface tint", fa: "ته‌رنگ سطح", fallback: "primary" },
];
const errors: Role[] = [
  { token: "error", en: "Error", fa: "خطا" }, { token: "on-error", en: "On error", fa: "روی خطا" },
  { token: "error-container", en: "Error container", fa: "زمینه خطا" }, { token: "on-error-container", en: "On error container", fa: "روی زمینه خطا" },
];
const actions = [
  { variant: "filled", en: "Primary", fa: "اصلی", description: ["Filled action for the strongest emphasis.", "دکمه پر برای بیشترین تأکید."], material: "primary role → HCT hue, chroma and tone adjustments → contrast-safe foreground", previous: "primary palette → action brightness tone → contrast-safe foreground" },
  { variant: "tonal", en: "Secondary", fa: "ثانویه", description: ["Tonal action for supporting emphasis.", "دکمه تونال برای تأکید کمکی."], material: "secondaryContainer role → HCT hue, chroma and tone adjustments → contrast-safe foreground", previous: "secondary palette → action brightness tone → contrast-safe foreground" },
  { variant: "outlined", en: "Outlined", fa: "خطی", description: ["Transparent action with a visible outline.", "دکمه شفاف با خط دور مشخص."], material: "onSurfaceVariant → HCT adjustments; border: outlineVariant", previous: "outline ink and outline stroke from the previous palette" },
  { variant: "ghost", en: "Ghost", fa: "شفاف", description: ["Transparent action with color on its label and icon.", "دکمه شفاف با متن و آیکن رنگی."], material: "primary role → HCT adjustments → contrast-safe ink", previous: "primary palette ink; dark mode uses primary fill" },
  { variant: "danger", en: "Danger", fa: "خطر", description: ["Filled action for destructive operations.", "دکمه پر برای اقدامات مخرب."], material: "error palette → danger brightness tone → contrast-safe foreground", previous: "error palette → danger brightness tone → contrast-safe foreground" },
] as const;
const descriptions: Record<string, [string, string]> = {
  primary: ["Main accent for emphasized controls and focus.", "رنگ تأکیدی اصلی برای کنترل‌های مهم و تمرکز."],
  "on-primary": ["Text and icons placed on primary.", "متن و آیکن روی رنگ اصلی."],
  "primary-container": ["Softer primary-colored background.", "زمینه ملایم با رنگ اصلی."],
  "on-primary-container": ["Text and icons on the primary container.", "متن و آیکن روی زمینه اصلی."],
  secondary: ["Secondary accent for supporting controls and indicators.", "رنگ تأکیدی ثانویه برای کنترل‌ها و نشانگرهای کمکی."],
  "on-secondary": ["Text and icons placed on secondary.", "متن و آیکن روی رنگ ثانویه."],
  "secondary-container": ["Background for tonal controls and selected items.", "زمینه کنترل‌های تونال و موارد انتخاب‌شده."],
  "on-secondary-container": ["Text and icons on the secondary container.", "متن و آیکن روی زمینه ثانویه."],
  canvas: ["Base canvas color used by the kit.", "رنگ پایه بوم در کیت."], surface: ["Default surface for content and components.", "سطح پیش‌فرض محتوا و کامپوننت‌ها."],
  "surface-container-lowest": ["Lowest neutral surface layer.", "پایین‌ترین لایه سطح خنثی."], "surface-container-low": ["Low neutral surface layer.", "لایه پایین سطح خنثی."],
  "surface-container": ["Neutral container background.", "زمینه خنثی برای محفظه‌ها."], "surface-high": ["Higher-emphasis neutral container.", "زمینه خنثی با تأکید بیشتر."],
  "surface-container-highest": ["Highest neutral container layer.", "بالاترین لایه محفظه خنثی."], "surface-dim": ["Dim end of the neutral surface range.", "انتهای کم‌نور طیف سطح خنثی."],
  "surface-bright": ["Bright end of the neutral surface range.", "انتهای روشن طیف سطح خنثی."], background: ["Material background role.", "نقش پس‌زمینه متریال."],
  "on-background": ["Foreground intended for the background role.", "رنگ نوشته و آیکن روی پس‌زمینه."], "on-surface": ["Main text and icons on neutral surfaces.", "متن و آیکن اصلی روی سطوح خنثی."],
  "on-surface-variant": ["Supporting text and lower-emphasis icons.", "متن کمکی و آیکن‌های کم‌تأکید."], outline: ["Visible borders and control outlines.", "خطوط قابل مشاهده و دور کنترل‌ها."],
  "outline-variant": ["Subtle borders and dividers.", "خطوط و جداکننده‌های ملایم."], "inverse-surface": ["Contrasting surface for elements such as toast messages.", "سطح متضاد برای مواردی مانند پیام شناور."],
  "inverse-on-surface": ["Text and icons on an inverse surface.", "متن و آیکن روی سطح معکوس."], "inverse-primary": ["Primary accent for inverse surfaces.", "رنگ تأکیدی اصلی برای سطوح معکوس."],
  "surface-tint": ["Accent tint supplied by the Material scheme.", "ته‌رنگ تأکیدی ارائه‌شده توسط طرح متریال."], error: ["Error accent and destructive actions.", "رنگ خطا و اقدامات مخرب."],
  "on-error": ["Text and icons placed on error.", "متن و آیکن روی رنگ خطا."], "error-container": ["Softer background for error messages.", "زمینه ملایم پیام‌های خطا."],
  "on-error-container": ["Text and icons on the error container.", "متن و آیکن روی زمینه خطا."],
};
function roleFormula(token: string, previous: boolean): string {
  const shared = ({
    "surface-container-lowest": "surface", "surface-container-low": "surface-container",
    "surface-container-highest": "surface-high", "surface-dim": "surface-high",
    "surface-bright": "surface", background: "canvas", "on-background": "on-surface",
    "inverse-surface": "on-surface", "inverse-on-surface": "surface",
    "inverse-primary": "on-primary", "surface-tint": "primary",
  } as Record<string, string>)[token];
  if (!previous && shared) return `Shared color · --mf-${shared}`;
  const role = ({ canvas: "background", "surface-high": "surface-container-high" } as Record<string, string>)[token] ?? token;
  const camel = role.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
  if (previous) {
    if (token === "canvas" || token === "surface" || token === "surface-container" || token === "surface-high") return `neutral palette N1 · ${token} surface tone`;
    return `Scheme.${camel} · palette + contrast/settings adjustments`;
  }
  return `colors.${camel}().getArgb(scheme) · applicable settings`;
}
function Swatches({ roles, fa, previous }: { roles: Role[]; fa: boolean; previous: boolean }) {
  return <div className="palette-roles">{roles.filter(role => !previous || !role.fallback).map(role => <div className="palette-role" key={role.token}>
    <span className="palette-swatch" style={{ background: `var(--mf-${role.token})` }} aria-hidden="true" />
    <span><strong>{fa ? role.fa : role.en}</strong><span className="palette-description">{descriptions[role.token][fa ? 1 : 0]}</span><code dir="ltr">--mf-{role.token}</code><code dir="ltr">{roleFormula(role.token, previous)}</code></span>
  </div>)}</div>;
}
function AccentExamples({ fa, previous }: { fa: boolean; previous: boolean }) {
  const t = (en: string, persian: string) => fa ? persian : en;
  return <div className="palette-usage-examples">
    <section className="palette-usage-example"><h3>{t("Checked checkbox", "چک‌باکس انتخاب‌شده")}</h3>
      <Checkbox label={t("Selected", "انتخاب‌شده")} defaultChecked />
      <p>{previous ? t("In the previous design, the box and check use the legacy primary fill and foreground.", "در طرح قبلی، زمینه و علامت از رنگ پر اصلی و رنگ نوشته قدیمی استفاده می‌کنند.") : t("Primary colors the box; on-primary colors the checkmark.", "رنگ اصلی زمینه مربع و رنگ روی اصلی علامت را رنگ می‌کند.")}</p>
      <a href="#/components/checkbox">{t("View checkbox", "مشاهده چک‌باکس")}</a>
    </section>
    <section className="palette-usage-example"><h3>{t("Information badge", "نشان اطلاعات")}</h3>
      <Badge tone="info">{t("Information", "اطلاعات")}</Badge>
      <p>{t("Primary container colors the badge background; on-primary-container colors its text.", "زمینه اصلی رنگ پس‌زمینه نشان و رنگ روی زمینه اصلی رنگ متن آن است.")}</p>
      <a href="#/components/badge">{t("View badge", "مشاهده نشان")}</a>
    </section>
    <section className="palette-usage-example"><h3>{t("Selected card", "کارت انتخاب‌شده")}</h3>
      <CardGroup label={t("Choose a view", "انتخاب نما")} size="sm" defaultValue="overview" options={[{ value: "overview", label: t("Overview", "نمای کلی") }]} />
      <p>{previous ? t("The previous design uses primary container for the selected card and its text, with a primary border. Secondary roles are not used by this example in that design.", "در طرح قبلی، کارت و متن آن از زمینه اصلی و خط دور از رنگ اصلی استفاده می‌کنند. این نمونه در آن طرح از رنگ ثانویه استفاده نمی‌کند.") : t("Secondary container colors the card; on-secondary-container colors its text. Secondary colors the border and checkmark background; on-secondary colors the checkmark.", "زمینه ثانویه رنگ کارت و رنگ روی زمینه ثانویه رنگ متن است. رنگ ثانویه خط دور و زمینه علامت و رنگ روی ثانویه خود علامت را رنگ می‌کند.")}</p>
      <a href="#/components/card-group">{t("View card group", "مشاهده گروه کارت")}</a>
    </section>
  </div>;
}
export function ColorPage({ seed, onSeedChange, onSchemeChange, heading }: { seed: string; onSeedChange: (seed: string) => void; onSchemeChange: (scheme: ColorScheme) => void; heading: Ref<HTMLHeadingElement> }) {
  const { locale, colorDesign, colorScheme } = useMaterialFluid();
  const fa = locale === "fa";
  const t = (en: string, persian: string) => fa ? persian : en;
  return <div className="palette-page">
    <div className="component-intro"><div><h1 ref={heading} tabIndex={-1}>{t("Color system", "سیستم رنگ")}</h1><p>{t("Explore the colors generated for your current theme and seed. Related roles share one color wherever possible.", "رنگ‌های ساخته‌شده برای پوسته و رنگ پایه فعلی را ببینید. نقش‌های مرتبط تا جای ممکن از یک رنگ مشترک استفاده می‌کنند.")}</p></div></div>
    <section className="palette-seed"><div><h2>{t("Seed hue", "فام پایه")}</h2><p>{t("The hue control uses HSV degrees; the palette is generated using Material color roles.", "کنترل فام بر حسب درجه HSV است؛ پالت با نقش‌های رنگی متریال ساخته می‌شود.")}</p></div><AccentSeed value={seed} onChange={onSeedChange} fa={fa} /></section>
    <section className="palette-section palette-scheme"><h2>{t("Theme color scheme", "گونه رنگ پوسته")}</h2><ColorSchemeControl value={colorScheme} onChange={onSchemeChange} locale={locale} disabled={colorDesign === "previous"} /></section>
    <section className="palette-section"><h2>{t("Action variants", "گونه‌های دکمه")}</h2><p>{t("These treatments use the primary, secondary, neutral and error roles. Their colors can be adjusted in settings.", "این گونه‌ها از نقش‌های اصلی، ثانویه، خنثی و خطا استفاده می‌کنند و رنگشان در تنظیمات قابل تغییر است.")}</p><div className="palette-actions">{actions.map(action => <div className="palette-action" key={action.variant}><Button variant={action.variant}>{t(action.en, action.fa)}</Button><span>{action.description[fa ? 1 : 0]}</span><code dir="ltr">{colorDesign === "previous" ? action.previous : action.material}</code></div>)}</div></section>
    <section className="palette-section"><h2>{t("Seed-derived accents", "رنگ‌های تأکیدی از فام پایه")}</h2><p>{t("Primary and secondary provide accent colors and matching foregrounds. These examples show where the showcase uses them together.", "رنگ‌های اصلی و ثانویه به همراه رنگ متن مناسب تولید می‌شوند. نمونه‌ها کاربرد آن‌ها را در کامپوننت‌ها نشان می‌دهند.")}</p><AccentExamples fa={fa} previous={colorDesign === "previous"} /><Swatches roles={accents} fa={fa} previous={colorDesign === "previous"} /></section>
    <section className="palette-section"><h2>{t("Seed-tinted neutrals", "رنگ‌های خنثی با ته‌رنگ پایه")}</h2><p>{t("Surfaces, text and outlines use neutral palettes influenced by the seed and surface settings.", "سطوح، متن و خطوط از پالت‌های خنثی تأثیرگرفته از رنگ پایه و تنظیمات سطح استفاده می‌کنند.")}</p><Swatches roles={surfaces} fa={fa} previous={colorDesign === "previous"} /></section>
    <section className="palette-section"><h2>{t("Error and danger", "خطا و خطر")}</h2><p>{t("The error palette is separate from the seed-derived accents. Its displayed tones can still change with the theme and settings.", "پالت خطا از رنگ‌های تأکیدی پایه جداست؛ درجه روشنایی آن با پوسته و تنظیمات تغییر می‌کند.")}</p><Swatches roles={errors} fa={fa} previous={colorDesign === "previous"} /></section>
    <p className="palette-footnote">{colorDesign === "previous" ? t("Previous design starts from Material's legacy CorePalette and Scheme. Brightness, saturation and contrast settings adjust the resulting roles.", "طرح قبلی از CorePalette و Scheme قدیمی متریال استفاده می‌کند و تنظیمات روشنایی، اشباع و کنتراست رنگ‌ها را تغییر می‌دهند.") : t("Material design converts the seed to HCT and uses the selected scheme. The library uses the 2025 spec for Tonal spot, Expressive, Vibrant and Neutral, and 2021 for the other schemes. For adjusted action colors: hue = role hue + shift; chroma = role chroma × saturation / 100; tone = role tone + tone offset, clamped to 0–100. Foregrounds are chosen for contrast. Brightness and contrast settings may adjust the base roles.", "طرح متریال رنگ پایه را به HCT تبدیل و از گونه انتخاب‌شده استفاده می‌کند. کتابخانه برای تونال، بیانگر، زنده و خنثی از نسخه ۲۰۲۵ و برای سایر گونه‌ها از نسخه ۲۰۲۱ استفاده می‌کند. برای رنگ دکمه: فام = فام نقش + چرخش؛ کروما = کرومای نقش × اشباع ÷ ۱۰۰؛ روشنایی = روشنایی نقش + تغییر روشنایی، محدود به ۰ تا ۱۰۰. رنگ نوشته بر اساس کنتراست انتخاب می‌شود. تنظیمات روشنایی و کنتراست ممکن است رنگ نقش پایه را تغییر دهند.")}</p>
  </div>;
}
