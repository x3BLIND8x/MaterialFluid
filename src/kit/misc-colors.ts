import type { CSSProperties } from "react";

/** Identity and status colors are deliberately independent of the accent seed. */
export const miscColors = ["blue", "teal", "green", "amber", "rose", "violet"] as const;
export type MiscColor = (typeof miscColors)[number];
const pairs: Record<MiscColor, readonly [string, string, string, string]> = {
  blue: ["#dbeafe", "#1e3a8a", "#172d50", "#bfdbfe"],
  teal: ["#ccfbf1", "#134e4a", "#143c37", "#99f6e4"],
  green: ["#dcfce7", "#14532d", "#183d28", "#bbf7d0"],
  amber: ["#fef3c7", "#78350f", "#493315", "#fde68a"],
  rose: ["#ffe4e6", "#881337", "#4c2130", "#fecdd3"],
  violet: ["#ede9fe", "#4c1d95", "#352653", "#ddd6fe"],
};
export function createMiscColorTokens(dark: boolean): Record<string, string> {
  return Object.fromEntries(miscColors.flatMap(color => [
    [`--mf-misc-${color}`, pairs[color][dark ? 2 : 0]],
    [`--mf-on-misc-${color}`, pairs[color][dark ? 3 : 1]],
  ]));
}
export function identityColor(identity: string): MiscColor {
  let hash = 0;
  for (const character of identity.normalize("NFC")) hash = (hash * 31 + character.codePointAt(0)!) >>> 0;
  return miscColors[hash % miscColors.length];
}
export function miscColorStyle(color: MiscColor): CSSProperties {
  return { background: `var(--mf-misc-${color})`, color: `var(--mf-on-misc-${color})` };
}
export const statusColors = { success: "green", warning: "amber", info: "blue", error: "rose" } as const;
