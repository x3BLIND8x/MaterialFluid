import type { ComponentSize } from "./appearance";

export type ButtonSize = ComponentSize | "xs" | "xl";
export type ButtonSizeInput = ButtonSize | "s" | "m" | "l";
export type IconButtonWidth = "narrow" | "default" | "wide";
export const fabSizes = ["default", "medium", "large"] as const;
export const buttonSizes = ["xs", "sm", "md", "lg", "xl"] as const;
/** Filled and destructive actions do not represent persistent selections. */
export function isButtonToggleVariant(variant: string, emphasize = false) {
  return ["tonal", "secondary", "outlined", "outline", "ghost", "text"].includes(variant) || emphasize && ["filled", "primary"].includes(variant);
}
export function normalizeButtonSize(size: ButtonSizeInput = "md"): ButtonSize {
  return size === "s" ? "sm" : size === "m" ? "md" : size === "l" ? "lg" : size;
}

/** Sizes describe useful layouts, not an obligation to render three copies. */
export const componentSizePolicy: Record<string, { sizes: readonly ButtonSize[]; reason: string; referenceSizes?:readonly string[] }> = {
  "fab-menu": {sizes:["sm","md","lg"],referenceSizes:fabSizes,reason:"Reference FAB sizes and expressive list/menu presentations; legacy density sizes remain compatible."},
  "extended-fab": {sizes:["sm","md","lg"],referenceSizes:["small","medium","large"],reason:"Labelled primary actions with 56/80/96px compact and extended states."},
  fab: {sizes:["sm","md","lg"],referenceSizes:fabSizes,reason:"Existing action sizes stay compatible; explicit FAB sizes add 56, 80 and 96px footprints."},
  button: { sizes: buttonSizes, reason: "Extra Small for compact actions; Extra Large for prominent standalone actions. Existing sizes retain their geometry." },
  "split-button": { sizes: buttonSizes, reason: "Both halves share the owner action sizes from XS through XL." },
  "button-group": { sizes: buttonSizes, reason: "Shared action sizes from XS through XL." },
  "icon-button": { sizes: buttonSizes, reason: "Compact through prominent icon actions; existing Small, Medium and Large metrics remain unchanged." },
  carousel: { sizes: ["md"], reason: "Responsive viewport; slide content owns its geometry." },
  sidebar: { sizes: ["md"], reason: "Responsive workspace composition manages its own layout." },
  "code-block": { sizes: ["md"], reason: "Code wraps or scrolls within its container." },
  shape: { sizes: ["md"], reason: "SVG dimensions are controlled by standard width and height props." },
  "file-input": { sizes: ["sm", "md"], reason: "Compact and standard upload layouts; no Large variant." },
  "otp-input": { sizes: ["sm", "md"], reason: "Compact and standard digit cells fit six-digit codes on narrow screens." },
  badge: { sizes: ["sm", "md"], reason: "Status labels need compact and standard text, not a large action target." },
  breadcrumbs: { sizes: ["sm", "md"], reason: "Supporting navigation stays subordinate to the page heading." },
  divider: { sizes: ["md"], reason: "A separator has one stroke; spacing belongs to its layout." },
  progress: { sizes: ["md"], reason: "Progress has one readable track; width follows its container." },
  skeleton: { sizes: ["md"], reason: "Placeholder geometry is controlled by width, height, and rounded." },
  "empty-state": { sizes: ["md"], reason: "One responsive content layout adapts to the available space." },
  "top-app-bar": { sizes: ["md"], reason: "One responsive toolbar manages its own overflow." },
  "notification-center": { sizes: ["md"], reason: "One responsive history panel; individual toasts retain size options." },
};
export function sizesForComponent(component: string): readonly ButtonSize[] {
  return componentSizePolicy[component]?.sizes ?? ["sm", "md", "lg"];
}
export function normalizeComponentSize(component: string, size?: ButtonSize): ComponentSize {
  const sizes = sizesForComponent(component);
  return size && (size === "sm" || size === "md" || size === "lg") && sizes.includes(size) ? size : "md";
}
