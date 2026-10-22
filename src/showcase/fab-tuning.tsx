import { Button, Slider } from "../kit/controls";
import type { Locale } from "../kit/theme";
import {
  AdvancedTuning,
  fabOnlyMotionDefaults,
  type FABMotionSettings,
  translate,
} from "./demos/shared";

type FABOnlyMotionSetting = "loadingDuration";
const controls: {
  key: FABOnlyMotionSetting;
  en: string;
  fa: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: "loadingDuration", en: "Loading duration (ms)", fa: "مدت بارگذاری (میلی‌ثانیه)", min: 150, max: 1600, step: 50 },
];

export function FABTuning({
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
        {controls.map(({ key, en, fa, min, max, step }) => (
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
        <Button variant="text" onClick={() => onChange(fabOnlyMotionDefaults)}>
          {t("Reset FAB tuning", "بازنشانی تنظیمات فب")}
        </Button>
      </div>
    </AdvancedTuning>
  );
}
