import { Contrast, argbFromHex, lstarFromArgb } from "@material/material-color-utilities";

export const accessibilityPolicy = {
  text: 4.5, neutralText: 7, boundary: 3, touchTarget: 44,
  keyboard: ["Tab / Shift+Tab", "Enter / Space", "Escape", "Arrow keys / Home / End"],
} as const;

export function contrastRatio(foreground: string, background: string): number {
  return Contrast.ratioOfTones(lstarFromArgb(argbFromHex(foreground)), lstarFromArgb(argbFromHex(background)));
}
/** Black/white endpoints guarantee a readable label on raw palette swatches. */
export function foregroundForColor(background: string) {
  return contrastRatio("#000000", background) >= contrastRatio("#ffffff", background) ? "#000000" : "#ffffff";
}
export function colorPair(foreground: string, background: string, target: number = accessibilityPolicy.text) {
  const ratio = contrastRatio(foreground, background);
  return { foreground, background, ratio, target, passes: ratio >= target };
}
export function auditFoundationColors(tokens: Record<string, string>) {
  return [
    ["Body", "on-surface", "surface", 7],
    ["Supporting text", "on-surface-variant", "surface", 4.5],
    ["Primary action", "on-primary-fill", "primary-fill", 4.5],
    ["Primary container", "on-primary-container", "primary-container", 4.5],
    ["Error", "on-error", "error", 4.5],
  ].map(([name, foreground, background, target]) => ({ name: String(name), ...colorPair(tokens[`--mf-${foreground}`], tokens[`--mf-${background}`], Number(target)) }));
}
