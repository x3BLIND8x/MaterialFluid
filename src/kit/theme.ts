import {
  argbFromHex,
  hexFromArgb,
  TonalPalette,
  Contrast,
  lstarFromArgb,
  Hct,
  SchemeTonalSpot,
  DynamicScheme,
} from "@material/material-color-utilities";
export type ThemeMode = "light" | "dark" | "system";
export type MotionMode = "expressive" | "minimal";
export type Locale = "en" | "fa";
export const colorSchemes = ["tonalSpot"] as const;
export type ColorScheme = (typeof colorSchemes)[number];
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
  filledHueShift: number;
  filledSaturation: number;
  lightFilledTone: number;
  darkFilledTone: number;
  tonalHueShift: number;
  tonalSaturation: number;
  darkTonalSaturation: number;
  lightTonalTone: number;
  darkTonalTone: number;
  outlinedHueShift: number;
  outlinedSaturation: number;
  lightOutlinedTone: number;
  darkOutlinedTone: number;
  ghostHueShift: number;
  ghostSaturation: number;
  lightGhostTone: number;
  darkGhostTone: number;
}
export const colorBehaviorDefaults: Readonly<ColorBehavior> = {
  primarySaturation: 50,
  secondarySaturation: 75,
  tertiarySaturation: 100,
  secondaryHueShift: 0,
  tertiaryHueShift: 30,
  surfaceTint: 25,
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
  filledHueShift: 0, filledSaturation: 100, lightFilledTone: 0, darkFilledTone: 10,
  tonalHueShift: 0, tonalSaturation: 100, darkTonalSaturation: 150, lightTonalTone: 0, darkTonalTone: -10,
  outlinedHueShift: 0, outlinedSaturation: 100, lightOutlinedTone: 0, darkOutlinedTone: 0,
  ghostHueShift: 0, ghostSaturation: 100, lightGhostTone: 0, darkGhostTone: 0,
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
  filledHueShift: [-180, 180], filledSaturation: [0, 300], lightFilledTone: [-50, 50], darkFilledTone: [-50, 50],
  tonalHueShift: [-180, 180], tonalSaturation: [0, 300], darkTonalSaturation: [0, 300], lightTonalTone: [-50, 50], darkTonalTone: [-50, 50],
  outlinedHueShift: [-180, 180], outlinedSaturation: [0, 300], lightOutlinedTone: [-50, 50], darkOutlinedTone: [-50, 50],
  ghostHueShift: [-180, 180], ghostSaturation: [0, 300], lightGhostTone: [-50, 50], darkGhostTone: [-50, 50],
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
  _colorScheme: ColorScheme = "tonalSpot",
): Record<string, string> {
  if (!/^#[0-9a-f]{6}$/i.test(seed))
    throw new Error("Accent seed must be a six-digit hex color.");
  const behavior = normalizeColorBehavior(colorBehavior);
  const strength = behavior.contrast / 100;
  const sourceColorHct = Hct.fromInt(argbFromHex(seed));
  const base = new SchemeTonalSpot(sourceColorHct, dark, strength, "2025");
  const adjustPalette = (source: TonalPalette, saturation: number, defaultSaturation: number, hueShift = 0) =>
    TonalPalette.fromHueAndChroma((source.hue + hueShift + 360) % 360, source.chroma * saturation / defaultSaturation);
  const palette = {
    a1: adjustPalette(base.primaryPalette, behavior.primarySaturation, 50),
    a2: adjustPalette(base.secondaryPalette, behavior.secondarySaturation, 75, behavior.secondaryHueShift),
    a3: adjustPalette(base.tertiaryPalette, behavior.tertiarySaturation, 100, behavior.tertiaryHueShift - 30),
    n1: adjustPalette(base.neutralPalette, behavior.surfaceTint, 75),
    n2: adjustPalette(base.neutralVariantPalette, behavior.surfaceTint, 75),
    error: base.errorPalette,
  };
  // Use the same palettes for every system role, including derived surfaces.
  const material = new DynamicScheme({
    sourceColorHct, variant: base.variant, isDark: dark, contrastLevel: strength, specVersion: base.specVersion,
    primaryPalette: palette.a1, secondaryPalette: palette.a2, tertiaryPalette: palette.a3,
    neutralPalette: palette.n1, neutralVariantPalette: palette.n2,
  });
  const roles = material.colors;
  const scheme: Record<string, number> = {};
  for (const role of [...roles.allColors, roles.surfaceVariant(), roles.surfaceTint(), roles.shadow(), roles.scrim()])
    scheme[role.name.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())] = role.getArgb(material);
  const tone = (value: number) => Math.max(0, Math.min(100, value));
  const surfaceOffset = dark ? behavior.darkSurfaceBrightness - 5 : behavior.lightSurfaceBrightness - 90;
  const adjustedSurface = (role: ReturnType<typeof roles.surface>) => {
    const original = Hct.fromInt(role.getArgb(material));
    return surfaceOffset === 0 ? original.toInt()
      : TonalPalette.fromHueAndChroma(original.hue, original.chroma).tone(tone(original.tone + surfaceOffset));
  };
  const neutralSurfaces = [roles.background(), roles.surface(), roles.surfaceContainer(), roles.surfaceContainerHigh()].map(adjustedSurface);
  for (const [name, role] of [
    ["surfaceDim", roles.surfaceDim()],
    ["surfaceBright", roles.surfaceBright()],
    ["surfaceContainerLowest", roles.surfaceContainerLowest()],
    ["surfaceContainerLow", roles.surfaceContainerLow()],
    ["surfaceContainerHighest", roles.surfaceContainerHighest()],
  ] as const) scheme[name] = adjustedSurface(role);
  scheme.background = neutralSurfaces[0];
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
  for (const [role, tones, dynamicRole, onRole, containerRole, onContainerRole] of [
    ["primary", palette.a1, roles.primary(), roles.onPrimary(), roles.primaryContainer(), roles.onPrimaryContainer()],
    ["secondary", palette.a2, roles.secondary(), roles.onSecondary(), roles.secondaryContainer(), roles.onSecondaryContainer()],
    ["tertiary", palette.a3, roles.tertiary(), roles.onTertiary(), roles.tertiaryContainer(), roles.onTertiaryContainer()],
    ["error", palette.error, roles.error(), roles.onError(), roles.errorContainer(), roles.onErrorContainer()],
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
    const inkOffset = dark ? behavior.darkInkBrightness - 50 : behavior.lightInkBrightness - 40;
    const containerOffset = dark ? behavior.darkContainerBrightness - 80 : behavior.lightContainerBrightness - 90;
    if (inkOffset !== 0 || surfaceOffset !== 0) {
      const original = Hct.fromInt(dynamicRole.getArgb(material));
      const inkPalette = TonalPalette.fromHueAndChroma(original.hue, original.chroma);
      scheme[role] = readable(inkPalette, tone(original.tone + inkOffset), neutralSurfaces);
      scheme[`on${name}`] = readable(tones, onRole.getTone(material), [scheme[role]]);
    }
    if (containerOffset !== 0) {
      const original = Hct.fromInt(containerRole.getArgb(material));
      const containerPalette = TonalPalette.fromHueAndChroma(original.hue, original.chroma);
      scheme[`${role}Container`] = containerPalette.tone(tone(original.tone + containerOffset));
      scheme[`on${name}Container`] = readable(tones, onContainerRole.getTone(material), [scheme[`${role}Container`]]);
    }
  }
  const textOffset = dark ? behavior.darkTextBrightness - 90 : behavior.lightTextBrightness - 25;
  if (textOffset !== 0 || surfaceOffset !== 0) {
    for (const [name, role] of [["onSurface", roles.onSurface()], ["onBackground", roles.onBackground()], ["onSurfaceVariant", roles.onSurfaceVariant()]] as const) {
      const original = Hct.fromInt(role.getArgb(material));
      scheme[name] = readable(TonalPalette.fromHueAndChroma(original.hue, original.chroma), tone(original.tone + textOffset), neutralSurfaces);
    }
  }
  const borderOffset = dark ? behavior.darkBorderBrightness - 90 : behavior.lightBorderBrightness - 20;
  if (borderOffset !== 0) {
    for (const [name, role] of [["outline", roles.outline()], ["outlineVariant", roles.outlineVariant()]] as const) {
      const original = Hct.fromInt(role.getArgb(material));
      scheme[name] = TonalPalette.fromHueAndChroma(original.hue, original.chroma).tone(tone(original.tone + borderOffset));
    }
  }
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
  // Action variants start from the selected Material scheme's roles.
  const actionPrimary = palette.a1;
  const actionSecondary = palette.a2;
  const actionNeutral = palette.n2;
  for (const [name, _base, role, inkRole, hueOffset, saturation, lightOffset, darkOffset, surface] of [
    ["Filled", actionPrimary, roles.primary(), roles.onPrimary(), behavior.filledHueShift, behavior.filledSaturation, behavior.lightFilledTone, behavior.darkFilledTone, true],
    ["Tonal", actionSecondary, roles.secondaryContainer(), roles.onSecondaryContainer(), behavior.tonalHueShift, dark ? behavior.darkTonalSaturation : behavior.tonalSaturation, behavior.lightTonalTone, behavior.darkTonalTone, true],
    ["Outlined", actionNeutral, roles.onSurfaceVariant(), roles.onSurfaceVariant(), behavior.outlinedHueShift, behavior.outlinedSaturation, behavior.lightOutlinedTone, behavior.darkOutlinedTone, false],
    ["Ghost", actionPrimary, roles.primary(), roles.primary(), behavior.ghostHueShift, behavior.ghostSaturation, behavior.lightGhostTone, behavior.darkGhostTone, false],
  ] as const) {
    const offset = dark ? darkOffset : lightOffset;
    const original = Hct.fromInt(role.getArgb(material));
    const unchanged = hueOffset === 0 && saturation === 100 && offset === 0;
    const colors = TonalPalette.fromHueAndChroma((original.hue + hueOffset + 360) % 360, original.chroma * saturation / 100);
    const requested = tone(original.tone + offset);
    const action = unchanged ? original.toInt() : surface ? colors.tone(requested) : readable(colors, requested, neutralSurfaces);
    const ink = unchanged ? inkRole.getArgb(material) : surface ? readable(colors, inkRole.getTone(material), [action]) : action;
    scheme[`action${name}`] = action;
    scheme[`onAction${name}`] = ink;
    if (name === "Outlined") {
      const border = Hct.fromInt(roles.outlineVariant().getArgb(material));
      scheme.actionOutlinedBorder = hueOffset === 0 && saturation === 100
        ? scheme.outlineVariant
        : TonalPalette.fromHueAndChroma((border.hue + hueOffset + 360) % 360, border.chroma * saturation / 100).tone(tone(border.tone + borderOffset));
    }
  }
  // Keep semantic role names for consumers, but share actual colors wherever a
  // separate tone adds no distinction to MaterialFluid's components. The previous
  // color design remains available through createPreviousTheme.
  scheme.surface = neutralSurfaces[1];
  scheme.surfaceContainer = neutralSurfaces[2];
  scheme.surfaceContainerHigh = neutralSurfaces[3];
  const sharedRoles: Record<string, string> = {
    onBackground: "onSurface",
    surfaceDim: "surfaceContainerHigh", surfaceBright: "surface",
    surfaceContainerLowest: "surface", surfaceContainerLow: "surfaceContainer",
    surfaceContainerHighest: "surfaceContainerHigh", surfaceVariant: "surfaceContainerHigh",
    surfaceTint: "primary", shadow: "scrim",
    inverseSurface: "onSurface", inverseOnSurface: "surface", inversePrimary: "onPrimary",
    primaryDim: "primary", primaryFixed: "primaryContainer", primaryFixedDim: "primaryFill",
    onPrimaryFixed: "onPrimaryContainer", onPrimaryFixedVariant: "onPrimaryContainer",
    primaryInk: "primary", primaryPlainInk: "primary",
    secondaryDim: "secondary", secondaryFixed: "secondaryContainer", secondaryFixedDim: "secondaryFill",
    onSecondaryFixed: "onSecondaryContainer", onSecondaryFixedVariant: "onSecondaryContainer",
    secondaryInk: "secondary", secondaryPlainInk: "secondary",
    tertiary: "secondary", onTertiary: "onSecondary",
    tertiaryContainer: "secondaryContainer", onTertiaryContainer: "onSecondaryContainer",
    tertiaryDim: "secondary", tertiaryFixed: "secondaryContainer", tertiaryFixedDim: "secondaryFill",
    onTertiaryFixed: "onSecondaryContainer", onTertiaryFixedVariant: "onSecondaryContainer",
    tertiaryInk: "secondary", tertiaryPlainInk: "secondary",
    tertiaryFill: "secondaryFill", onTertiaryFill: "onSecondaryFill",
    tertiaryFillHover: "secondaryFill", onTertiaryFillHover: "onSecondaryFill",
    errorDim: "error", errorInk: "error", errorPlainInk: "error",
    primaryFillHover: "primaryFill", onPrimaryFillHover: "onPrimaryFill",
    secondaryFillHover: "secondaryFill", onSecondaryFillHover: "onSecondaryFill",
    errorFillHover: "errorFill", onErrorFillHover: "onErrorFill",
  };
  for (const [role, source] of Object.entries(sharedRoles)) scheme[role] = scheme[source];
  // One legibility floor across every neutral layer, including table headers and overlays.
  // A quieter neutral chroma lets the seed distinguish actions rather than tinting all text.
  const surfaces = [scheme.background, scheme.surface, scheme.surfaceContainer, scheme.surfaceContainerHigh];
  scheme.onSurface = readable(palette.n1, tone((dark ? 94 : 18) + textOffset), surfaces, 7);
  scheme.onBackground = scheme.onSurface;
  scheme.onSurfaceVariant = readable(palette.n2, tone((dark ? 80 : 34) + textOffset), surfaces, 7);
  scheme.outline = readable(palette.n2, tone((dark ? 65 : 48) + borderOffset), surfaces, 3);
  scheme.outlineVariant = scheme.outline;
  // Transparent actions must be readable on both the page and the example canvas.
  for (const [name, colors] of [["primary", palette.a1], ["secondary", palette.a2]] as const) {
    scheme[name] = readable(colors, lstarFromArgb(scheme[name]), surfaces, 7);
    scheme[`${name}Ink`] = readable(colors, dark ? behavior.darkInkBrightness : behavior.lightInkBrightness, surfaces, 7);
    scheme[`${name}PlainInk`] = readable(colors, dark ? behavior.darkPlainInkBrightness : behavior.lightPlainInkBrightness, surfaces, 7);
  }
  const plainInkOffset = dark ? behavior.darkPlainInkBrightness - 90 : behavior.lightPlainInkBrightness - 40;
  scheme.actionGhost = readable(TonalPalette.fromInt(scheme.actionGhost), tone(lstarFromArgb(scheme.actionGhost) + plainInkOffset), surfaces, 7);
  scheme.onActionGhost = scheme.actionGhost;
  scheme.actionOutlined = readable(TonalPalette.fromInt(scheme.actionOutlined), tone(lstarFromArgb(scheme.actionOutlined) + plainInkOffset), surfaces, 7);
  scheme.onActionOutlined = scheme.actionOutlined;
  scheme.inverseSurface = scheme.onSurface;
  scheme.inverseOnSurface = scheme.surface;
  scheme.actionOutlinedBorder = readable(TonalPalette.fromInt(scheme.actionOutlinedBorder), tone(lstarFromArgb(scheme.actionOutlinedBorder) + borderOffset), surfaces, 3);

  const tokens: Record<string, string> = {};
  for (const [key, value] of Object.entries(scheme))
    tokens[`--mf-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`] =
      hexFromArgb(value);
  tokens["--mf-canvas"] = hexFromArgb(neutralSurfaces[0]);
  tokens["--mf-surface"] = hexFromArgb(neutralSurfaces[1]);
  tokens["--mf-surface-container"] = hexFromArgb(neutralSurfaces[2]);
  tokens["--mf-surface-high"] = hexFromArgb(neutralSurfaces[3]);
  // Include adjusted neutral layers in the immutable palette aliases too.
  for (const [key, value] of Object.entries(tokens))
    tokens[key.replace("--mf-", "--mf-palette-")] = value;
  tokens["--mf-accent-seed"] = seed;
  tokens["--mf-color-scheme"] = dark ? "dark" : "light";
  return tokens;
}
