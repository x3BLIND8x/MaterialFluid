import type { Locale, ThemeMode, MotionMode, ColorScheme } from "../kit/theme";
import {
  colorSchemes,
  colorBehaviorDefaults,
  normalizeColorBehavior,
  type ColorBehavior,
} from "../kit/theme";
export interface Preferences {
  locale: Locale;
  theme: ThemeMode;
  motion: MotionMode;
  accentSeed: string;
  colorBehavior: ColorBehavior;
  colorDesign: "material" | "previous";
  colorScheme: ColorScheme;
}
export const preferenceDefaults: Preferences = {
  locale: "en",
  theme: "system",
  motion: "expressive",
  accentSeed: "#eedd96",
  colorBehavior: { ...colorBehaviorDefaults },
  colorDesign: "material",
  colorScheme: "tonalSpot",
};
export function loadPreferences(
  storage?: Pick<Storage, "getItem">,
): Preferences {
  try {
    const source =
      storage ??
      (typeof window !== "undefined" ? window.localStorage : undefined);
    const data = JSON.parse(
      source?.getItem("materialfluid.preferences") ?? "{}",
    );
    const colorBehavior = normalizeColorBehavior(data?.colorBehavior);
    // Apply the requested defaults once; later edits remain under user control.
    if (data?.actionColorVersion !== 1) {
      colorBehavior.darkFilledTone = 10;
      colorBehavior.darkTonalTone = -10;
      colorBehavior.darkTonalSaturation = 150;
    }
    // The former global default becomes the new colored-component default.
    // Preserve explicit tuning once the split roles have been saved.
    if (
      data?.colorBehavior?.darkPlainInkBrightness === undefined &&
      data?.colorBehavior?.darkInkBrightness === 85
    ) {
      colorBehavior.darkInkBrightness = 50;
    }
    // Move the previous Light Outline / Ghost default to the newly requested 40%.
    if (data?.colorBehavior?.lightPlainInkBrightness === 60) {
      colorBehavior.lightPlainInkBrightness = 40;
    }
    // Update former defaults while preserving values the user tuned differently.
    if (data?.colorBehavior?.surfaceTint === 100) colorBehavior.surfaceTint = 75;
    if (data?.colorBehavior?.lightSurfaceBrightness === 97) colorBehavior.lightSurfaceBrightness = 90;
    return {
      locale: data?.locale === "fa" ? "fa" : "en",
      theme: ["light", "dark", "system"].includes(data?.theme)
        ? data.theme
        : "system",
      motion: data?.motion === "minimal" ? "minimal" : "expressive",
      colorBehavior,
      colorDesign: data?.colorDesign === "previous" ? "previous" : "material",
      colorScheme: colorSchemes.includes(data?.colorScheme) ? data.colorScheme : "tonalSpot",
      accentSeed: /^#[0-9a-f]{6}$/i.test(data?.accentSeed ?? "")
        ? data.accentSeed
        : "#eedd96",
    };
  } catch {
    return { ...preferenceDefaults };
  }
}
export function savePreferences(
  preferences: Preferences,
  storage?: Pick<Storage, "setItem">,
) {
  try {
    (storage ?? window.localStorage).setItem(
      "materialfluid.preferences",
      JSON.stringify({ ...preferences, actionColorVersion: 1 }),
    );
  } catch {
    /* Browsing remains usable when storage is blocked. */
  }
}
