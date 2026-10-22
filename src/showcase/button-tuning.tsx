import { Button, Slider } from "../kit/controls";
import type { Locale } from "../kit/theme";
import { buttonMotionDefaults } from "../kit/provider";
import {
  AdvancedTuning,
  type FABMotionSettings,
  translate,
} from "./demos/shared";

const controls = [
  ["sizeDamping", "Size damping · smoother resize", "میرایی اندازه · تغییر نرم‌تر", 10, 80, 1],
  ["colorDuration", "Color reveal duration (ms)", "زمان نمایان شدن رنگ (میلی‌ثانیه)", 100, 1000, 10],
  ["pressDepth", "Press depth (%)", "میزان کوچک شدن (٪)", 0, 20, 1],
  ["stiffness", "Stiffness · speed", "سختی فنر · سرعت", 100, 1000, 10],
  ["damping", "Damping · less bounce", "میرایی · کاهش نوسان", 5, 50, 1],
  ["mass", "Mass · weight", "جرم · سنگینی", 0.2, 2, 0.1],
  ["radiusDepthRatio", "Radius reduction per 1% depth (%)", "کاهش گردی به ازای هر ۱٪ عمق (٪)", 0, 15, 0.5],
  ["rippleDuration", "Ripple duration (ms)", "زمان موج (میلی‌ثانیه)", 150, 1200, 10],
  ["rippleOpacity", "Ripple opacity (%)", "شدت موج (٪)", 0, 30, 1],
  ["rippleFastStart", "Ripple fast-start strength (%)", "شدت شروع سریع موج (٪)", 0, 95, 1],
  ["rippleReleaseSpeed", "Ripple release speed (×)", "سرعت تکمیل موج پس از رها کردن (برابر)", 1, 5, 0.25],
] as const satisfies readonly (readonly [
  keyof typeof buttonMotionDefaults,
  string,
  string,
  number,
  number,
  number,
])[];

export function ButtonTuning({
  value,
  onChange,
  locale,
}: {
  value: FABMotionSettings;
  onChange: (patch: Partial<FABMotionSettings>) => void;
  locale: Locale;
}) {
  const t = translate(locale);
  return (
    <AdvancedTuning locale={locale}>
      <div className="demo-button-tuning">
        {controls.map(([key, en, fa, min, max, step]) => (
          <Slider
            key={key}
            label={locale === "fa" ? fa : en}
            value={[value[key]]}
            min={min}
            max={max}
            step={step}
            onValueChange={([next]) => onChange({ [key]: next })}
          />
        ))}
        <p className="mf-muted">
          {t(
            "Radius follows press depth in Fluid mode and the ripple in Minimal mode.",
            "گردی در حالت روان از عمق فشار و در حالت کمینه از موج پیروی می‌کند.",
          )}
        </p>
        <Button variant="text" onClick={() => onChange(buttonMotionDefaults)}>
          {t("Reset tuning", "بازنشانی تنظیمات")}
        </Button>
      </div>
    </AdvancedTuning>
  );
}
