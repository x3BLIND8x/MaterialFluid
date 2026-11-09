import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "../../kit/controls";
import { useMaterialFluid } from "../../kit/provider";
import { shapeNames, shapeLabels, shapePaths, type MaterialShapeName } from "../../kit/foundations/material-shapes";
import { morphFoundationShape } from "../../kit/foundations/shape-motion";
import { foundationCorners } from "../../kit/foundations/owner-tokens";
import { FoundationFrame, type FoundationProps } from "./frame";

export function ShapeFoundation({ heading, onEnableMotion }: FoundationProps) {
  const env = useMaterialFluid(), fa = env.locale === "fa", t = (en: string, persian: string) => fa ? persian : en;
  const [shape, setShape] = useState<MaterialShapeName>("flower");
  const path = useRef<SVGPathElement>(null), initial = useRef(shapePaths.flower);
  const animated = env.motion === "expressive" && !env.reducedMotion;
  useLayoutEffect(() => {
    if (!path.current) return;
    const animation = morphFoundationShape(path.current, shape, animated);
    return () => animation.cancel();
  }, [shape, animated]);
  return <FoundationFrame id="shape" heading={heading} configuration={<>
    <div className="foundation-preview"><svg className="foundation-shape-preview" viewBox="0 0 100 100" role="img" aria-label={shapeLabels[shape]}><path ref={path} d={initial.current}/></svg></div>
    <div className="section-heading"><h2>{t("Shape library", "کتابخانه شکل")}</h2><Button variant="outlined" size="sm" disabled={!animated} onClick={() => { if (path.current) { path.current.setAttribute("d", shapePaths.circle); morphFoundationShape(path.current, shape); } }}>{t("Replay morph", "اجرای دوباره تبدیل")}</Button></div>
    <p>{shapeLabels[shape]} · {t("35 outlines. Use arrows to explore, Space to select.", "۳۵ شکل. با جهت‌ها حرکت و با فاصله انتخاب کنید.")}</p>
    <div className="foundation-shapes" role="toolbar" aria-label={t("Shape library", "کتابخانه شکل")} onKeyDown={event => {
      const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button")), index = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const direction = env.dir === "rtl" ? -1 : 1;
      const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : event.key === "ArrowRight" ? (index + direction + buttons.length) % buttons.length : event.key === "ArrowLeft" ? (index - direction + buttons.length) % buttons.length : event.key === "ArrowDown" ? (index + 1) % buttons.length : event.key === "ArrowUp" ? (index - 1 + buttons.length) % buttons.length : -1;
      if (next >= 0) { event.preventDefault(); buttons[next].focus(); }
    }}>{shapeNames.map(name => <Button key={name} variant="ghost" toggle selected={shape === name} toggleOnClick={false} tabIndex={shape === name ? 0 : -1} aria-label={shapeLabels[name]} onClick={() => setShape(name)}><svg viewBox="0 0 100 100" aria-hidden="true"><path d={shapePaths[name]}/></svg></Button>)}</div>
    {!animated && <div className="foundation-motion-notice"><p>{env.reducedMotion ? t("System reduced motion is on. Shapes change immediately.", "کاهش حرکت سیستم روشن است؛ شکل‌ها فوری تغییر می‌کنند.") : t("Minimal mode shows the final shape immediately. Enable animation to see the morph.", "حالت کمینه شکل نهایی را فوری نشان می‌دهد. برای دیدن تبدیل، حرکت را فعال کنید.")}</p><Button variant="outlined" disabled={env.reducedMotion} onClick={onEnableMotion}>{t("Enable animation", "فعال‌سازی حرکت")}</Button></div>}
  </>} documentation={<><h2>{t("Continuous outlines", "مسیرهای پیوسته")}</h2><p>{t("120 samples per outline are aligned, then interpolated using your resize spring. Interruptions continue from the visible path. Selected shapes use the shared Button toggle state and highlight. Minimal mode and system reduced motion intentionally skip interpolation.", "۱۲۰ نقطه هر مسیر هم‌تراز شده و با فنر تغییر اندازه شما تبدیل می‌شوند. وقفه از مسیر دیداری ادامه پیدا می‌کند. انتخاب از وضعیت واقعی دکمه استفاده می‌کند و کاهش حرکت تبدیل را حذف می‌کند.")}</p><pre tabIndex={0}>{JSON.stringify(foundationCorners, null, 2)}</pre></>}/>;
}
