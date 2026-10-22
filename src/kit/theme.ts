import {
  argbFromHex,
  hexFromArgb,
  CorePalette,
  Scheme,
  TonalPalette,
  Contrast,
  lstarFromArgb,
} from "@material/material-color-utilities";
export type ThemeMode = "light" | "dark" | "system";
export type MotionMode = "expressive" | "minimal";
export type Locale = "en" | "fa";
export type Density = "comfortable" | "compact";
export interface ColorBehavior {
  primarySaturation: number;
  secondarySaturation: number;
  tertiarySaturation: number;
  secondaryHueShift: number;
  tertiaryHueShift: number;
  surfaceTint: number;
  contrast: number;
  lightBrightness: number;
  darkBrightness: number;
  lightInkBrightness: number;
  darkInkBrightness: number;
  lightPlainInkBrightness: number;
  darkPlainInkBrightness: number;
  lightDangerBrightness: number;
  darkDangerBrightness: number;
  lightContainerBrightness: number;
  darkContainerBrightness: number;
  lightSurfaceBrightness: number;
  darkSurfaceBrightness: number;
  lightTextBrightness: number;
  darkTextBrightness: number;
  lightBorderBrightness: number;
  darkBorderBrightness: number;
}
export const colorBehaviorDefaults: Readonly<ColorBehavior> = {
  primarySaturation: 50,
  secondarySaturation: 75,
  tertiarySaturation: 100,
  secondaryHueShift: 0,
  tertiaryHueShift: 30,
  surfaceTint: 75,
  contrast: 0,
  lightBrightness: 85,
  darkBrightness: 90,
  lightInkBrightness: 40,
  darkInkBrightness: 50,
  lightPlainInkBrightness: 40,
  darkPlainInkBrightness: 90,
  lightDangerBrightness: 49,
  darkDangerBrightness: 49,
  lightContainerBrightness: 90,
  darkContainerBrightness: 80,
  lightSurfaceBrightness: 90,
  darkSurfaceBrightness: 5,
  lightTextBrightness: 25,
  darkTextBrightness: 90,
  lightBorderBrightness: 20,
  darkBorderBrightness: 90,
};
export const colorBehaviorRanges: Record<
  keyof ColorBehavior,
  readonly [number, number]
> = {
  primarySaturation: [0, 200],
  secondarySaturation: [0, 300],
  tertiarySaturation: [0, 300],
  secondaryHueShift: [-180, 180],
  tertiaryHueShift: [-180, 180],
  surfaceTint: [0, 400],
  contrast: [0, 100],
  lightBrightness: [20, 95],
  darkBrightness: [40, 95],
  lightInkBrightness: [0, 100],
  darkInkBrightness: [0, 100],
  lightPlainInkBrightness: [0, 100],
  darkPlainInkBrightness: [0, 100],
  lightDangerBrightness: [20, 80],
  darkDangerBrightness: [20, 80],
  lightContainerBrightness: [0, 100],
  darkContainerBrightness: [0, 100],
  lightSurfaceBrightness: [80, 97],
  darkSurfaceBrightness: [0, 24],
  lightTextBrightness: [0, 50],
  darkTextBrightness: [50, 100],
  lightBorderBrightness: [0, 100],
  darkBorderBrightness: [0, 100],
};
export function normalizeColorBehavior(
  input?: Partial<ColorBehavior> | null,
): ColorBehavior {
  const source = input && typeof input === "object" ? input : {};
  return Object.fromEntries(
    (Object.keys(colorBehaviorDefaults) as (keyof ColorBehavior)[]).map(
      (key) => {
        const value = source[key];
        const [min, max] = colorBehaviorRanges[key];
        return [
          key,
          typeof value === "number" && Number.isFinite(value)
            ? Math.max(min, Math.min(max, value))
            : colorBehaviorDefaults[key],
        ];
      },
    ),
  ) as unknown as ColorBehavior;
}
export const motionTokens = {
  spring: { type: "spring" as const, stiffness: 430, damping: 32, mass: 0.8 },
  quick: 0.16,
  surface: 0.28,
};
export function createTheme(
  seed = "#eedd96",
  dark = false,
  colorBehavior?: Partial<ColorBehavior>,
): Record<string, string> {
  if (!/^#[0-9a-f]{6}$/i.test(seed))
    throw new Error("Accent seed must be a six-digit hex color.");
  const behavior = normalizeColorBehavior(colorBehavior);
  const palette = CorePalette.of(argbFromHex(seed));
  const hue = palette.a1.hue;
  const shift = (value: number) => (((hue + value) % 360) + 360) % 360;
  palette.a1 = TonalPalette.fromHueAndChroma(
    hue,
    (palette.a1.chroma * behavior.primarySaturation) / 100,
  );
  palette.a2 = TonalPalette.fromHueAndChroma(
    shift(behavior.secondaryHueShift),
    (16 * behavior.secondarySaturation) / 100,
  );
  palette.a3 = TonalPalette.fromHueAndChroma(
    shift(behavior.tertiaryHueShift),
    (24 * behavior.tertiarySaturation) / 100,
  );
  palette.n1 = TonalPalette.fromHueAndChroma(
    hue,
    (4 * behavior.surfaceTint) / 100,
  );
  palette.n2 = TonalPalette.fromHueAndChroma(
    hue,
    (8 * behavior.surfaceTint) / 100,
  );
  const scheme: Record<string, number> = (
    dark
      ? Scheme.darkFromCorePalette(palette)
      : Scheme.lightFromCorePalette(palette)
  ).toJSON();
  const strength = behavior.contrast / 100;
  const tone = (value: number) => Math.max(0, Math.min(100, value));
  const surfaceTone = dark
    ? behavior.darkSurfaceBrightness
    : behavior.lightSurfaceBrightness;
  const surfaceTones = [
    surfaceTone,
    tone(surfaceTone + (dark ? 6 : 3)),
    tone(surfaceTone + (dark ? 12 : -2)),
    tone(surfaceTone + (dark ? 18 : -6)),
  ];
  const neutralSurfaces = surfaceTones.map((value) => palette.n1.tone(value));
  scheme.background = palette.n1.tone(tone(surfaceTone + (dark ? 4 : 3)));
  const targetContrast = 4.5 + 2.5 * strength;
  const ratio = (a: number, b: number) =>
    Contrast.ratioOfTones(lstarFromArgb(a), lstarFromArgb(b));
  // Find the closest usable tone so slider changes cannot hide text/icons.
  const readable = (
    tones: TonalPalette,
    requested: number,
    backgrounds: number[],
    minimum = targetContrast,
  ) => {
    const candidates = Array.from({ length: 101 }, (_, index) => index).sort(
      (a, b) => Math.abs(a - requested) - Math.abs(b - requested),
    );
    const match = candidates.find((value) =>
      backgrounds.every(
        (background) => ratio(tones.tone(value), background) >= minimum,
      ),
    );
    if (match !== undefined) return tones.tone(match);
    const score = (value: number) =>
      Math.min(
        ...backgrounds.map((background) =>
          ratio(tones.tone(value), background),
        ),
      );
    return tones.tone(
      candidates.reduce((best, value) =>
        score(value) > score(best) ? value : best,
      ),
    );
  };
  for (const [role, tones] of [
    ["primary", palette.a1],
    ["secondary", palette.a2],
    ["tertiary", palette.a3],
    ["error", palette.error],
  ] as const) {
    const name = role[0].toUpperCase() + role.slice(1);
    const inkTone =
      (dark ? behavior.darkInkBrightness : behavior.lightInkBrightness) +
      (dark ? 10 : -8) * strength;
    // Decorative glyphs honor the requested tone; readable accent text stays separate.
    scheme[`${role}Ink`] = tones.tone(tone(inkTone));
    scheme[`${role}PlainInk`] = tones.tone(
      tone(
        dark
          ? behavior.darkPlainInkBrightness
          : behavior.lightPlainInkBrightness,
      ),
    );
    scheme[role] = readable(tones, tone(inkTone), neutralSurfaces);
    scheme[`on${name}`] = readable(tones, dark ? 20 - 10 * strength : 100, [
      scheme[role],
    ]);
    scheme[`${role}Container`] = tones.tone(
      tone(
        (dark
          ? behavior.darkContainerBrightness
          : behavior.lightContainerBrightness) +
          (dark ? -8 : 4) * strength,
      ),
    );
    const preferred = dark ? (role === "error" ? 80 : 90) : 10;
    scheme[`on${name}Container`] = readable(
      tones,
      dark ? preferred + (96 - preferred) * strength : 10 - 6 * strength,
      [scheme[`${role}Container`]],
    );
  }
  scheme.onSurface = scheme.onBackground = readable(
    palette.n1,
    tone(
      (dark ? behavior.darkTextBrightness : behavior.lightTextBrightness) +
        (dark ? 6 : -6) * strength,
    ),
    neutralSurfaces,
  );
  scheme.onSurfaceVariant = readable(
    palette.n2,
    tone(
      (dark
        ? behavior.darkTextBrightness - 10
        : behavior.lightTextBrightness + 20) +
        (dark ? 10 : -12) * strength,
    ),
    neutralSurfaces,
  );
  const borderTone =
    (dark ? behavior.darkBorderBrightness : behavior.lightBorderBrightness) +
    (dark ? 12 : -12) * strength;
  scheme.outline = palette.n2.tone(tone(borderTone));
  scheme.outlineVariant = palette.n2.tone(
    tone(borderTone + (dark ? -30 - 4 * strength : 30 + 4 * strength)),
  );
  // Filled actions can brighten independently of readable link/focus accents.
  // Select foregrounds from their real, gamut-mapped luminance, not the requested tone.
  for (const [role, tones] of [
    ["primary", palette.a1],
    ["secondary", palette.a2],
    ["tertiary", palette.a3],
    ["error", palette.error],
  ] as const) {
    const name = role[0].toUpperCase() + role.slice(1);
    const brightness =
      role === "error"
        ? dark
          ? behavior.darkDangerBrightness
          : behavior.lightDangerBrightness
        : dark
          ? behavior.darkBrightness
          : behavior.lightBrightness;
    const fill = tones.tone(
      Math.max(0, Math.min(98, brightness + (dark ? 10 : -8) * strength)),
    );
    const targetContrast = 4.5 + 2.5 * strength;
    const candidates = [
      role === "error" ? 100 : dark ? 20 - 10 * strength : 100,
      dark ? 100 : 10,
      0,
      100,
    ].map((tone) => tones.tone(tone));
    const ratio = (color: number) =>
      Contrast.ratioOfTones(lstarFromArgb(fill), lstarFromArgb(color));
    scheme[`${role}Fill`] = fill;
    scheme[`on${name}Fill`] =
      candidates.find((color) => ratio(color) >= targetContrast) ??
      candidates.reduce((best, color) =>
        ratio(color) > ratio(best) ? color : best,
      );
    const foreground = scheme[`on${name}Fill`];
    const hoverTone =
      lstarFromArgb(fill) +
      (lstarFromArgb(foreground) > lstarFromArgb(fill) ? -4 : 4);
    scheme[`${role}FillHover`] = tones.tone(
      Math.max(0, Math.min(100, hoverTone)),
    );
    const inverseHoverTone =
      lstarFromArgb(foreground) +
      (lstarFromArgb(fill) > lstarFromArgb(foreground) ? -4 : 4);
    scheme[`on${name}FillHover`] = tones.tone(tone(inverseHoverTone));
  }
  const tokens: Record<string, string> = {};
  for (const [key, value] of Object.entries(scheme))
    tokens[`--mf-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`] =
      hexFromArgb(value);
  const neutral = palette.n1;
  tokens["--mf-canvas"] = hexFromArgb(neutral.tone(surfaceTones[0]));
  tokens["--mf-surface"] = hexFromArgb(neutral.tone(surfaceTones[1]));
  tokens["--mf-surface-container"] = hexFromArgb(neutral.tone(surfaceTones[2]));
  tokens["--mf-surface-high"] = hexFromArgb(neutral.tone(surfaceTones[3]));
  // Include adjusted neutral layers in the immutable palette aliases too.
  for (const [key, value] of Object.entries(tokens))
    tokens[key.replace("--mf-", "--mf-palette-")] = value;
  tokens["--mf-accent-seed"] = seed;
  tokens["--mf-color-scheme"] = dark ? "dark" : "light";
  return tokens;
}
