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
  createTheme,
  motionTokens,
  colorBehaviorDefaults,
  normalizeColorBehavior,
  type ColorBehavior,
  type ThemeMode,
  type MotionMode,
  type Locale,
  type Density,
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
  colorDuration: 550,
  sizeDamping: 40,
  pressDepth: 6,
  stiffness: 460,
  damping: 12,
  mass: 1,
  radiusDepthRatio: 5,
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
  accentSeed: string;
  colorBehavior: ColorBehavior;
  density: Density;
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
  accentSeed: "#eedd96",
  colorBehavior: colorBehaviorDefaults,
  density: "comfortable",
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
  density?: Density;
  motion?: MotionMode;
  buttonMotion?: Partial<ButtonMotionSettings>;
  textMorph?: Partial<TextMorphSettings>;
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
    density = "comfortable",
    motion = "expressive",
    buttonMotion,
    textMorph,
    className = "",
    style,
    children,
    ...props
  },
  ref,
) {
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
  const effectiveButtonMotion = useMemo(
    () => ({ ...buttonMotionDefaults, ...buttonMotion }),
    [buttonMotion],
  );
  const effectiveTextMorph = useMemo(
    () => ({ ...textMorphMotionDefaults, ...textMorph }),
    [textMorph],
  );
  const tokens = useMemo(
    () => createTheme(accentSeed, dark, effectiveColors),
    [accentSeed, dark, effectiveColors],
  );
  const value = useMemo(
    () => ({
      locale,
      dir,
      theme,
      accentSeed,
      colorBehavior: effectiveColors,
      density,
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
      accentSeed,
      effectiveColors,
      density,
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
          className={`mf-root ${className}`}
          lang={locale}
          dir={dir}
          data-theme={dark ? "dark" : "light"}
          data-density={density}
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
