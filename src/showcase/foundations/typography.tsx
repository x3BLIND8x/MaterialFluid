import { createElement, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button, ButtonGroup, Switch } from "../../kit/controls";
import { TextField } from "../../kit/forms";
import { useMaterialFluid } from "../../kit/provider";
import { foundationTypeScale, foundationFonts } from "../../kit/foundations/owner-tokens";
import { typeRoles, type TypeRole } from "../../kit/foundations/typography";
import { Choice, FoundationFrame, type FoundationProps } from "./frame";
import "../../kit/foundations/type.css";

const presets = [["text", "Text", "متن"], ["article", "Article", "مقاله"], ["math", "Math", "ریاضی"], ["code", "Code", "کد"], ["quote", "Quote", "نقل‌قول"], ["keyboard", "Keyboard", "کلیدها"], ["science", "Scientific", "علمی"]] as const;
const families = ["display", "headline", "title", "body", "label"] as const;
const formats = [["bold", "Bold", "ضخیم"], ["italic", "Italic", "مورب"], ["underline", "Underline", "زیرخط"], ["strike", "Strikethrough", "خط‌خورده"], ["highlight", "Highlight", "برجسته"], ["sub", "Subscript", "زیرنویس"], ["sup", "Superscript", "بالانویس"], ["kbd", "Keyboard key", "کلید صفحه‌کلید"]] as const;
const math = createElement("math", { display: "block", "aria-label": "The integral from zero to one of x squared is one third" },
  createElement("mrow", {}, createElement("msubsup", {}, createElement("mo", {}, "∫"), createElement("mn", {}, "0"), createElement("mn", {}, "1")), createElement("msup", {}, createElement("mi", {}, "x"), createElement("mn", {}, "2")), createElement("mi", {}, "d"), createElement("mi", {}, "x"), createElement("mo", {}, "="), createElement("mfrac", {}, createElement("mn", {}, "1"), createElement("mn", {}, "3"))));
export function TypographyFoundation({ heading, onEnableMotion }: FoundationProps) {
  const env = useMaterialFluid(), fa = env.locale === "fa", t = (en: string, faText: string) => fa ? faText : en;
  const [preset, setPreset] = useState("text"), [role, setRole] = useState<TypeRole>("body-large"), [sample, setSample] = useState("");
  const [emphasized, setEmphasized] = useState(false), [format, setFormat] = useState<string[]>([]), [align, setAlign] = useState("start");
  const animated = env.motion === "expressive" && !env.reducedMotion;
  const style = foundationTypeScale[emphasized ? `${role}-emphasized` as const : role];
  const typeStyle: CSSProperties = { fontSize: `${style.size / 16}rem`, lineHeight: `${style.lineHeight / 16}rem`, fontWeight: format.includes("bold") ? 800 : style.weight, letterSpacing: `${style.tracking}px`, textAlign: align as CSSProperties["textAlign"] };
  const decorations = [format.includes("underline") && "underline", format.includes("strike") && "line-through"].filter(Boolean).join(" ");
  const contentStyle: CSSProperties = { fontStyle: format.includes("italic") ? "italic" : "normal", textDecorationLine: decorations || "none" };
  const text = (value: ReactNode) => {
    let result = value;
    if (format.includes("kbd")) result = <kbd className="mf-kbd">{result}</kbd>;
    if (format.includes("sub")) result = <sub>{result}</sub>;
    if (format.includes("sup")) result = <sup>{result}</sup>;
    return format.includes("highlight") ? <mark className="mf-text-highlight">{result}</mark> : result;
  };
  const [family, scale] = role.split("-");
  const content = preset === "math" ? <div className="foundation-math" dir="ltr">{math}<p><var>E</var> = <var>mc</var><sup>2</sup></p></div>
    : preset === "code" ? <pre className="foundation-code-sample"><code>{text("// Shared roles. One source of truth.\nconst theme = Foundations.createFoundationTheme({\n  seed: '#eedd96',\n  colorScheme: 'expressive',\n});")}</code></pre>
    : preset === "article" ? <article><h2>{text(t("Make space for the words.", "به واژه‌ها فضا بدهید."))}</h2><p>{text(sample || t("Typography gives an interface its voice. A clear hierarchy makes a long passage easier to follow, while considered spacing lets the reader move at their own pace.", "تایپوگرافی به رابط کاربری صدا می‌دهد. سلسله‌مراتب روشن، خواندن متن بلند را آسان‌تر می‌کند و فاصله‌گذاری سنجیده به خواننده فرصت می‌دهد."))}</p><p>{text(t("A good paragraph has rhythm, contrast, and room to breathe.", "یک پاراگراف خوب آهنگ، کنتراست و فضای کافی دارد."))}</p></article>
    : preset === "quote" ? <blockquote><p>{text(sample || t("The details are not the details. They make the design.", "جزئیات، طراحی را می‌سازند."))}</p><cite>Charles Eames</cite></blockquote>
    : preset === "keyboard" ? <div className="foundation-keyboard-sample"><p>{t("Open search", "باز کردن جستجو")} · <kbd className="mf-kbd">Ctrl</kbd> + <kbd className="mf-kbd">K</kbd></p><p>{t("Function key", "کلید عملکرد")} · <kbd className="mf-kbd">Fn</kbd> + <kbd className="mf-kbd">F2</kbd></p><p><kbd className="mf-kbd">Esc</kbd> · <kbd className="mf-kbd">Enter</kbd> · <kbd className="mf-kbd">⌘</kbd></p></div>
    : preset === "science" ? <div className="foundation-science" dir="ltr"><p>{text(<>H<sub>2</sub>O · CO<sub>2</sub> · x<sup>2</sup> + y<sup>2</sup> = r<sup>2</sup></>)}</p><p>{text(<>a<sub>n+1</sub> = a<sub>n</sub> + d</>)}</p></div>
    : <p>{text(sample || t("A clear action. A considered rhythm.", "یک اقدام روشن، با آهنگی سنجیده."))}</p>;
  return <FoundationFrame id="typography" heading={heading} configuration={<>
    <div className="foundation-preview foundation-type-preview"><div className="foundation-type-specimen mf-type-transition" style={typeStyle} data-animated={animated}>
      <AnimatePresence initial={false} mode="popLayout"><motion.div key={`${preset}-${format.filter(value => value !== "bold").join()}`} initial={{ opacity: animated ? 0 : 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: animated ? .18 : 0, ease: "easeOut" }} style={contentStyle}>{content}</motion.div></AnimatePresence>
    </div></div>
    <Choice label={t("Example Presets", "نمونه‌های آماده")} value={preset} onValueChange={setPreset} options={presets.map(([value, en, persian]) => ({ value, label: t(en, persian) }))}/>
    <h2>{t("Appearance", "ظاهر")}</h2><div className="foundation-control-rows">
      <Choice label={t("Type family", "خانواده متن")} value={family} onValueChange={value => setRole(`${value}-${scale}` as TypeRole)} options={families.map(value => ({ value, label: value }))}/>
      <Choice label={t("Type size", "اندازه متن")} value={scale} onValueChange={value => setRole(`${family}-${value}` as TypeRole)} options={[["small", "S"], ["medium", "M"], ["large", "L"]].map(([value, label]) => ({ value, label }))}/>
      <Switch label={t("Emphasized", "تأکیدشده")} checked={emphasized} onCheckedChange={setEmphasized}/>
    </div>
    <fieldset className="foundation-control-group"><legend>{t("Formatting", "قالب‌بندی")}</legend><ButtonGroup label={t("Formatting", "قالب‌بندی")} size="sm">{formats.map(([key, en, persian]) => <Button key={key} toggle selected={format.includes(key)} onSelectedChange={selected => setFormat(values => selected ? [...values.filter(value => !(key === "sub" && value === "sup") && !(key === "sup" && value === "sub")), key] : values.filter(value => value !== key))}>{t(en, persian)}</Button>)}</ButtonGroup></fieldset>
    <Choice label={t("Alignment", "تراز")} value={align} onValueChange={setAlign} options={[["start", "Start", "ابتدا"], ["center", "Center", "وسط"], ["end", "End", "انتها"], ["justify", "Justify", "هم‌تراز"]].map(([value, en, persian]) => ({ value, label: t(en, persian) }))}/>
    <h2>{t("Content", "محتوا")}</h2><TextField label={t("Sample text", "متن نمونه")} value={sample} onChange={event => setSample(event.target.value)}/>
    <p className="mf-muted">{t("Type changes ease smoothly over 240 ms, without a spring. Formatting and example changes crossfade.", "تغییر اندازه و وزن متن طی ۲۴۰ میلی‌ثانیه نرم و بدون فنر است. قالب و نمونه با محوشدگی تغییر می‌کنند.")}</p>
    {!animated && <Button variant="outlined" size="sm" disabled={env.reducedMotion} onClick={onEnableMotion}>{env.reducedMotion ? t("System reduced motion is on", "کاهش حرکت سیستم روشن است") : t("Enable animation", "فعال‌سازی حرکت")}</Button>}
  </>} documentation={<><h2>{t("Type roles and examples", "نقش‌ها و نمونه‌های متن")}</h2><p>{t("Fifteen semantic roles with normal and emphasized weights. Plain text, paragraphs, quotes, native MathML fractions and integrals, and code have their own semantic markup. Code stays LTR in JetBrains Mono. Formatting is local to the specimen.", "پانزده نقش معنایی با وزن عادی و تأکیدی. متن، مقاله، نقل‌قول، فرمول بومی MathML و کد نشانه‌گذاری معنایی دارند. کد با جت‌برینز مونو چپ‌به‌راست می‌ماند.")}</p><div className="foundation-type-list">{typeRoles.map(name => <div key={name}><code>{name}</code><p style={{ fontSize: `${foundationTypeScale[name].size / 16}rem`, fontWeight: foundationTypeScale[name].weight }}>{t("MaterialFluid", "متریال‌فلوید")}</p></div>)}</div><pre tabIndex={0}>{Object.entries(foundationFonts).map(([name, value]) => `${name}: ${value}`).join("\n")}</pre></>}/>;
}
