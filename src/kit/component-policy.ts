import type { ComponentSize } from "./appearance";

/** Sizes describe useful layouts, not an obligation to render three copies. */
export const componentSizePolicy: Record<string, { sizes: readonly ComponentSize[]; reason: string }> = {
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
export function sizesForComponent(component: string): readonly ComponentSize[] {
  return componentSizePolicy[component]?.sizes ?? ["sm", "md", "lg"];
}
export function normalizeComponentSize(component: string, size?: ComponentSize): ComponentSize {
  const sizes = sizesForComponent(component);
  return size && sizes.includes(size) ? size : sizes.includes("md") ? "md" : sizes[0];
}
