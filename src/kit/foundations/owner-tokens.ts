import { defaultTypeScale, defaultFonts, codeFont, type TypeScale } from "./typography";
import { defaultSpacing } from "./spacing";

/** The reference supplies the role structure; MaterialFluid owns every visual default. */
export const foundationFonts = { ...defaultFonts, code: codeFont } as const;
export const foundationTypeScale: TypeScale = Object.fromEntries(Object.entries(defaultTypeScale).map(([role, style]) => {
  const emphasis = role.endsWith("-emphasized");
  const body = role.startsWith("body-");
  return [role, { ...style, weight: emphasis ? 800 : body ? 400 : 750, tracking: 0,
    ...(role.startsWith("body-large") ? { size: 15, lineHeight: 23.25 } : {}),
    ...(role.startsWith("title-large") ? { size: 22, lineHeight: 26.4 } : {}),
  }];
})) as TypeScale;

export const foundationCorners = { xs: 12, sm: 14, md: 24, lg: 29, xl: 48, full: 999 } as const;
export const foundationSpacing = { ...defaultSpacing, comfortable: 16, inset: 20, section: 28 } as const;
export const foundationInteraction = {
  stateLayer: { hover: .08, focus: .08, pressed: .1, dragged: .16 },
  focusRing: { width: 3, offset: 4, color: "var(--mf-primary)" },
  disabled: { opacity: .48 },
  target: { minimum: 24, touch: 44 },
  ripple: { duration: 550, opacity: .2, fastStart: .85, releaseSpeed: 2 },
} as const;

/** No elevation system: tone, border, overlap and scrim express hierarchy. */
export const foundationDepth = { shadow: "none", surface: "var(--mf-surface)", floating: "var(--mf-surface-container)", scrim: .4 } as const;

export function foundationVariables(): Record<string, string> {
  const tokens: Record<string, string> = {
    "--mf-font-brand": foundationFonts.brand, "--mf-font-plain": foundationFonts.plain, "--mf-font-code": foundationFonts.code,
    "--mf-focus-ring-width": "3px", "--mf-focus-ring-offset": "4px", "--mf-focus-ring-color": foundationInteraction.focusRing.color,
    "--mf-target-minimum": "24px", "--mf-target-touch": "44px", "--mf-depth-shadow": "none",
  };
  for (const [role, style] of Object.entries(foundationTypeScale)) {
    tokens[`--mf-type-${role}-size`] = `${style.size / 16}rem`;
    tokens[`--mf-type-${role}-line-height`] = String(style.lineHeight / style.size);
    tokens[`--mf-type-${role}-weight`] = String(style.weight);
    tokens[`--mf-type-${role}-tracking`] = `${style.tracking}px`;
  }
  for (const [role, value] of Object.entries(foundationCorners)) tokens[`--mf-corner-${role}`] = `${value}px`;
  for (const [role, value] of Object.entries(foundationSpacing)) tokens[`--mf-space-${role}`] = `${value}px`;
  for (const [role, value] of Object.entries(foundationInteraction.stateLayer)) tokens[`--mf-state-${role}`] = String(value);
  return tokens;
}
