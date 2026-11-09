import { createTheme, type ColorBehavior, type ColorScheme } from "../theme";
import { createTheme as createPreviousTheme } from "../theme-previous";
import { createNeutralTheme, type ColorPreset, type NeutralColorSettings } from "../theme-neutral";
import { createMiscColorTokens } from "../misc-colors";
import { foundationVariables } from "./owner-tokens";

export interface FoundationThemeOptions {
  seed?: string;
  dark?: boolean;
  colorScheme?: ColorScheme;
  colorPreset?: ColorPreset;
  colorDesign?: "material" | "previous";
  colorBehavior?: Partial<ColorBehavior>;
  neutralColors?: Partial<NeutralColorSettings>;
}

const shared = foundationVariables();
/** Foundation architecture with the owner's visual system applied last. */
export function createFoundationTheme({ seed = "#eedd96", dark = false, colorScheme = "tonalSpot", colorPreset = "standard", colorDesign = "material", colorBehavior, neutralColors }: FoundationThemeOptions = {}): Record<string, string> {
  const colors = colorDesign === "previous" ? createPreviousTheme(seed, dark, colorBehavior)
    : colorPreset === "neutral" ? createNeutralTheme(seed, dark, colorBehavior, neutralColors, colorScheme)
      : createTheme(seed, dark, colorBehavior, colorScheme);
  return { ...shared, ...colors, ...createMiscColorTokens(dark) };
}

/** Emit an embeddable, scoped theme; never global :root overrides. */
export function foundationThemeToCss(options: FoundationThemeOptions = {}, selector = ".mf-root"): string {
  if (!/^[.#][a-zA-Z_][\w-]*$/.test(selector)) throw new Error("Use one simple class or ID selector.");
  const block = (suffix: string, dark: boolean) => `${selector}${suffix} {\n${Object.entries(createFoundationTheme({ ...options, dark })).map(([name, value]) => `  ${name}: ${value};`).join("\n")}\n}`;
  return `${block('[data-theme="light"]', false)}\n${block('[data-theme="dark"]', true)}`;
}
