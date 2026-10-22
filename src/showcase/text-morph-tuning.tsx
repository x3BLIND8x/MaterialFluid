import { Button, Slider } from "../kit/controls";
import type { Locale } from "../kit/theme";
import {
  AdvancedTuning,
  textMorphDefaults,
  type FABMotionSettings,
  translate,
} from "./demos/shared";

export function TextMorphTuning({
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
        <Slider
          label={t("Text morph duration (ms)", "زمان تغییر متن (میلی‌ثانیه)")}
          value={[value.textDuration]}
          min={100}
          max={600}
          step={10}
          onValueChange={([next]) => onChange({ textDuration: next })}
        />
        <Slider
          label={t("Text blur strength (px)", "شدت تاری متن (پیکسل)")}
          value={[value.textBlur]}
          min={0}
          max={16}
          step={1}
          onValueChange={([next]) => onChange({ textBlur: next })}
        />
        <Slider
          label={t("Text fade (%)", "محو شدن متن (٪)")}
          value={[value.textFade]}
          min={0}
          max={100}
          step={1}
          onValueChange={([next]) => onChange({ textFade: next })}
        />
        <Slider
          label={t("Off to on icon fill at maximum press depth (%)", "پرشدن آیکن از خاموش به روشن در بیشینه عمق فشار (٪)")}
          value={[value.toggleFillOnDepth]}
          min={0}
          max={100}
          step={1}
          onValueChange={([next]) => onChange({ toggleFillOnDepth: next })}
        />
        <Slider
          label={t("On to off icon shrink at maximum press depth (%)", "کوچک شدن آیکن از روشن به خاموش در بیشینه عمق فشار (٪)")}
          value={[value.toggleFillOffDepth]}
          min={0}
          max={100}
          step={1}
          onValueChange={([next]) => onChange({ toggleFillOffDepth: next })}
        />
        <Button variant="text" onClick={() => onChange(textMorphDefaults)}>
          {t("Reset text morph", "بازنشانی تغییر متن")}
        </Button>
      </div>
    </AdvancedTuning>
  );
}
