import type { DemoState } from "../catalogue";
import {
  buttonMotionDefaults,
  textMorphMotionDefaults,
  type ButtonMotionSettings,
} from "../../kit/provider";
export interface DemoProps {
  id: string;
  states: Partial<Record<DemoState, boolean>>;
  locale: "en" | "fa";
  fabMotion: FABMotionSettings;
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
