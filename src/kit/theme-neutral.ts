import { argbFromHex, hexFromArgb, Hct, TonalPalette, Contrast, lstarFromArgb } from '@material/material-color-utilities';
import { createTheme, type ColorBehavior, type ColorScheme } from './theme';
import { createDynamicScheme } from './foundations/color-engine';

export type ColorPreset = 'standard' | 'neutral';
export interface NeutralColorSettings { surfaceTint: number; accentStrength: number; }
export const neutralColorDefaults: Readonly<NeutralColorSettings> = { surfaceTint: 0, accentStrength: 100 };
export function normalizeNeutralColors(input?: Partial<NeutralColorSettings>): NeutralColorSettings {
  return Object.fromEntries(Object.entries(neutralColorDefaults).map(([key, fallback]) => {
    const value = input?.[key as keyof NeutralColorSettings];
    return [key, typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : fallback];
  })) as unknown as NeutralColorSettings;
}

/** Neutral surface hierarchy with independently seed-derived, light primary fills. */
export function createNeutralTheme(seed = '#eedd96', dark = false, behavior?: Partial<ColorBehavior>, settings?: Partial<NeutralColorSettings>, scheme: ColorScheme = "tonalSpot"): Record<string,string> {
  const tokens = createTheme(seed, dark, behavior, scheme);
  const config = normalizeNeutralColors(settings), source = Hct.fromInt(argbFromHex(seed));
  // Preserve the authored Tonal Spot preset exactly. Other algorithms supply
  // their own hue/chroma families before the owner's lightness rules apply.
  const variant = scheme === 'tonalSpot' ? 'tonal-spot' : scheme === 'fruitSalad' ? 'fruit-salad' : scheme;
  const generated = scheme === 'tonalSpot' ? undefined : createDynamicScheme(seed, variant, dark, 0);
  const neutralSource = generated?.neutralPalette ?? source;
  const neutral = TonalPalette.fromHueAndChroma(neutralSource.hue, Math.min(8, neutralSource.chroma) * config.surfaceTint / 100);
  const accents = Object.fromEntries((['primary','secondary','tertiary'] as const).map(role => {
    const family = generated?.[`${role}Palette`] ?? source;
    return [role, TonalPalette.fromHueAndChroma(family.hue, Math.min(48, family.chroma) * config.accentStrength / 100)];
  }));
  const paletteColor = (palette: TonalPalette, hex: string) => hexFromArgb(palette.tone(lstarFromArgb(argbFromHex(hex))));
  const set = (names: string[], value: string) => names.forEach(name => { tokens[`--mf-${name}`] = value; });
  const surface = (names: string[], light: string, night: string) => set(names, paletteColor(neutral, dark ? night : light));
  surface(['canvas','background','surface','surface-container-lowest'], '#ffffff', '#0a0a0a');
  surface(['surface-container','surface-container-low'], '#fafafa', '#171717');
  surface(['surface-high','surface-container-high','surface-container-highest','surface-variant','surface-dim'], '#f5f5f5', '#262626');
  surface(['surface-bright'], '#ffffff', '#303030');
  surface(['on-surface','on-background'], '#171717', '#fafafa');
  surface(['on-surface-variant'], '#414141', '#cccccc');
  // Functional field boundaries retain 3:1 on every neutral layer.
  surface(['outline','action-outlined-border'], '#777777', '#858585');
  surface(['outline-variant'], '#dedede', '#414141');
  for (const role of ['primary','secondary','tertiary']) {
    const accent = accents[role];
    const fill = hexFromArgb(accent.tone(86));
    const ink = hexFromArgb(accent.tone(12));
    const plain = hexFromArgb(accent.tone(dark ? 86 : 28));
    set([role,`${role}-fill`,`${role}-fill-hover`,`${role}-fixed`,`${role}-fixed-dim`,`${role}-dim`], fill);
    set([`on-${role}`,`on-${role}-fill`,`on-${role}-fill-hover`,`on-${role}-fixed`,`on-${role}-fixed-variant`], ink);
    set([`${role}-ink`,`${role}-plain-ink`], plain);
    set([`${role}-container`], hexFromArgb(accent.tone(dark ? 24 : 94)));
    set([`on-${role}-container`], hexFromArgb(accent.tone(dark ? 94 : 12)));
  }
  const fill = tokens['--mf-primary-fill'], ink = tokens['--mf-on-primary-fill'];
  set(['action-filled'], fill); set(['on-action-filled'], ink);
  set(['action-tonal'], tokens['--mf-secondary-container']); set(['on-action-tonal'], tokens['--mf-on-secondary-container']);
  set(['action-ghost','on-action-ghost','action-outlined','on-action-outlined'], tokens['--mf-on-surface']);
  set(['inverse-surface'], tokens['--mf-on-surface']); set(['inverse-on-surface'], tokens['--mf-surface']);
  set(['inverse-primary','surface-tint'], fill);
  // Verify the actual gamut-mapped pair before exposing it to every component.
  const ratio = Contrast.ratioOfTones(lstarFromArgb(argbFromHex(fill)), lstarFromArgb(argbFromHex(ink)));
  if (ratio < 7) set(['on-primary','on-primary-fill','on-action-filled'], '#000000');
  for (const [key,value] of Object.entries(tokens)) if (!key.startsWith('--mf-palette-')) tokens[key.replace('--mf-','--mf-palette-')] = value;
  return tokens;
}
