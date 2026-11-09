import { createFoundationTheme } from "./foundations/theme";
import { MotionPreviewContext } from "./internal-motion";
import { normalizeNeutralColors, neutralColorDefaults, type NeutralColorSettings, type ColorPreset } from './theme-neutral';
import { useSizeMotion } from "./size-motion";
import { NotificationProvider } from "./notifications";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { setRef } from "./utils";
import { RoundedSelection } from "./rounded-selection";

// Retain the custom selection implementation for optional future use.
const roundedSelectionEnabled = false;
import { MotionConfig } from "motion/react";
import {
  motionTokens,
  colorBehaviorDefaults,
  normalizeColorBehavior,
  type ColorBehavior,
  type ThemeMode,
  type MotionMode,
  type Locale,
  type ColorScheme,
} from "./theme";
export interface ButtonMotionSettings {
  colorDuration: number;
  sizeDamping: number;
  pressDepth: number;
  stiffness: number;
  damping: number;
  mass: number;
  radiusDepthRatio: number;
  rippleDuration: number;
  rippleOpacity: number;
  rippleFastStart: number;
  rippleReleaseSpeed: number;
}
export const buttonMotionDefaults: ButtonMotionSettings = {
  colorDuration: 330,
  sizeDamping: 30,
  pressDepth: 8,
  stiffness: 700,
  damping: 20,
  mass: 1.5,
  radiusDepthRatio: 4,
  rippleDuration: 550,
  rippleOpacity: 20,
  rippleFastStart: 85,
  rippleReleaseSpeed: 2,
};
export interface TextMorphSettings {
  duration: number;
  blur: number;
  fade: number;
}
export const textMorphMotionDefaults: TextMorphSettings = { duration: 100, blur: 6, fade: 0 };
export interface MaterialFluidSettings {
  locale: Locale;
  dir: "ltr" | "rtl";
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  accentSeed: string;
  colorBehavior: ColorBehavior;
  colorDesign: "material" | "previous";
  colorPreset: ColorPreset;
  neutralColors: NeutralColorSettings;
  colorScheme: ColorScheme;
  motion: MotionMode;
  reducedMotion: boolean;
  buttonMotion: ButtonMotionSettings;
  textMorph: TextMorphSettings;
  portalContainer?: HTMLElement | null;
}
const defaults: MaterialFluidSettings = {
  locale: "en",
  dir: "ltr",
  theme: "system",
  resolvedTheme: "light",
  accentSeed: "#eedd96",
  colorBehavior: colorBehaviorDefaults,
  colorDesign: "material",
  colorPreset: "standard",
  neutralColors: neutralColorDefaults,
  colorScheme: "tonalSpot",
  motion: "expressive",
  reducedMotion: false,
  buttonMotion: buttonMotionDefaults,
  textMorph: textMorphMotionDefaults,
};
const Context = createContext(defaults);
export const useMaterialFluid = () => useContext(Context);
export interface MaterialFluidProviderProps extends HTMLAttributes<HTMLDivElement> {
  locale?: Locale;
  dir?: "ltr" | "rtl";
  theme?: ThemeMode;
  accentSeed?: string;
  colorBehavior?: Partial<ColorBehavior>;
  colorDesign?: "material" | "previous";
  colorPreset?: ColorPreset;
  neutralColors?: Partial<NeutralColorSettings>;
  colorScheme?: ColorScheme;
  motion?: MotionMode;
}
export const MaterialFluidProvider = forwardRef<
  HTMLDivElement,
  MaterialFluidProviderProps
>(function MaterialFluidProvider(
  {
    locale = "en",
    dir = locale === "fa" ? "rtl" : "ltr",
    theme = "system",
    accentSeed = "#eedd96",
    colorBehavior,
    colorDesign = "material",
    colorPreset = "standard",
    neutralColors,
    colorScheme = "tonalSpot",
    motion = "expressive",
    className = "",
    style,
    children,
    ...props
  },
  ref,
) {
  const { buttonMotion, textMorph } = useContext(MotionPreviewContext);
  const [systemDark, setSystemDark] = useState(
    () =>
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [reduced, setReduced] = useState(
    () =>
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
    null,
  );
  const providerRef = useCallback(
    (element: HTMLDivElement | null) => {
      setPortalContainer(element);
      setRef(ref, element);
    },
    [ref],
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const dark = theme === "dark" || (theme === "system" && systemDark);
  const effectiveColors = useMemo(
    () => normalizeColorBehavior(colorBehavior),
    [colorBehavior],
  );
  const effectiveNeutralColors = useMemo(() => normalizeNeutralColors(neutralColors), [neutralColors]);
  const effectiveButtonMotion = useMemo(
    () => ({ ...buttonMotionDefaults, ...buttonMotion }),
    [buttonMotion],
  );
  const effectiveTextMorph = useMemo(
    () => ({ ...textMorphMotionDefaults, ...textMorph }),
    [textMorph],
  );
  useSizeMotion(portalContainer, {
    expressive: motion === "expressive" && !reduced,
    stiffness: effectiveButtonMotion.stiffness,
    damping: effectiveButtonMotion.sizeDamping,
    mass: effectiveButtonMotion.mass,
  });
  const tokens = useMemo(
    () => createFoundationTheme({ seed: accentSeed, dark, colorBehavior: effectiveColors, colorDesign, colorPreset, neutralColors: effectiveNeutralColors, colorScheme }),
    [accentSeed, dark, effectiveColors, colorDesign, colorScheme, colorPreset, effectiveNeutralColors],
  );
  const value = useMemo(
    () => ({
      locale,
      dir,
      theme,
      resolvedTheme: dark ? "dark" as const : "light" as const,
      accentSeed,
      colorBehavior: effectiveColors,
      colorDesign,
      colorPreset,
      neutralColors: effectiveNeutralColors,
      colorScheme,
      motion,
      reducedMotion: reduced,
      buttonMotion: effectiveButtonMotion,
      textMorph: effectiveTextMorph,
      portalContainer,
    }),
    [
      locale,
      dir,
      theme,
      dark,
      accentSeed,
      effectiveColors,
      colorDesign,
      colorPreset,
      effectiveNeutralColors,
      colorScheme,
      motion,
      reduced,
      effectiveButtonMotion,
      effectiveTextMorph,
      portalContainer,
    ],
  );
  return (
    <Context.Provider value={value}>
      <MotionConfig
        reducedMotion={reduced ? "always" : "user"}
        transition={
          motion === "expressive" && !reduced
            ? motionTokens.spring
            : { duration: motionTokens.quick }
        }
      >
        <div
          {...props}
          ref={providerRef}
          onPointerDownCapture={event => { event.currentTarget.dataset.inputModality = "pointer"; props.onPointerDownCapture?.(event); }}
          onKeyDownCapture={event => { if (!event.altKey && !event.ctrlKey && !event.metaKey) event.currentTarget.dataset.inputModality = "keyboard"; props.onKeyDownCapture?.(event); }}
          className={`mf-root ${className}`}
          lang={locale}
          dir={dir}
          data-theme={dark ? "dark" : "light"}
          data-color-design={colorDesign}
          data-color-preset={colorDesign === "previous" ? "standard" : colorPreset}
          data-motion={reduced ? "reduced" : motion}
          style={{ ...tokens, ...style } as CSSProperties}
        >
          <NotificationProvider>{children}</NotificationProvider>
          {roundedSelectionEnabled && motion === "expressive" && <RoundedSelection />}
        </div>
      </MotionConfig>
    </Context.Provider>
  );
});
