import type { DemoState } from "../catalogue";
import { useId, useState, type ReactNode } from "react";
import { Button } from "../../kit/controls";
import {
  buttonMotionDefaults,
  textMorphMotionDefaults,
  type ButtonMotionSettings,
} from "../../kit/provider";
import { AnimatedIcon } from "../../kit/icons";
import { ComponentAppearanceProvider } from "../../kit/appearance";
export interface DemoProps {
  id: string;
  states: Partial<Record<DemoState, boolean>>;
  locale: "en" | "fa";
  fabMotion: FABMotionSettings;
  onFabMotionChange: (patch: Partial<FABMotionSettings>) => void;
}
export interface FABMotionSettings extends ButtonMotionSettings {
  loadingDuration: number;
  textDuration: number;
  textBlur: number;
  textFade: number;
  toggleFillOnDepth: number;
  toggleFillOffDepth: number;
}
export const fabMotionDefaults: FABMotionSettings = {
  ...buttonMotionDefaults,
  loadingDuration: 650,
  textDuration: textMorphMotionDefaults.duration,
  textBlur: textMorphMotionDefaults.blur,
  textFade: textMorphMotionDefaults.fade,
  toggleFillOnDepth: 25,
  toggleFillOffDepth: 75,
};
export const fabOnlyMotionDefaults = {
  loadingDuration: fabMotionDefaults.loadingDuration,
};
export const textMorphDefaults = {
  textDuration: fabMotionDefaults.textDuration,
  textBlur: fabMotionDefaults.textBlur,
  textFade: fabMotionDefaults.textFade,
  toggleFillOnDepth: fabMotionDefaults.toggleFillOnDepth,
  toggleFillOffDepth: fabMotionDefaults.toggleFillOffDepth,
};
export const translate = (locale: "en" | "fa") => (en: string, fa: string) =>
  locale === "fa" ? fa : en;

export function AdvancedTuning({
  locale,
  children,
}: {
  locale: "en" | "fa";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  const label = translate(locale);
  return (
    <ComponentAppearanceProvider>
      <section className="advanced-tuning">
        <Button
          type="button"
          variant="outlined"
          className="advanced-tuning-trigger"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((value) => !value)}
        >
          <span>{label("Advanced", "پیشرفته")}</span>
          <span
            className="advanced-tuning-chevron"
            data-open={open || undefined}
            aria-hidden="true"
          >
            <AnimatedIcon name="chevron-down" size={18} />
          </span>
        </Button>
        {open && (
          <div className="advanced-tuning-content" id={contentId}>
            {children}
          </div>
        )}
      </section>
    </ComponentAppearanceProvider>
  );
}
