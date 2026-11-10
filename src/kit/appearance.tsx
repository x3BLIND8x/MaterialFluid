import { normalizeComponentSize } from "./component-policy";
import { createContext, useContext, type ReactNode } from "react";
import { cx } from "./utils";

export const componentVariants = [
  "filled",
  "tonal",
  "outlined",
  "ghost",
  "danger",
] as const;
export const componentSizes = ["sm", "md", "lg"] as const;
/** Previous color names remain available for existing consumers. */
export type ComponentVariant = (typeof componentVariants)[number] | "primary" | "secondary" | "tertiary" | "outline" | "danger";
export type ComponentSize = (typeof componentSizes)[number];
export type LabelPosition = "top" | "bottom" | "start" | "end" | "none";
export interface AppearanceProps {
  labelPosition?: LabelPosition;
  variant?: ComponentVariant;
  size?: ComponentSize;
}
export type LegacyVariant = "filled" | "tonal" | "outlined" | "text";
const aliases: Partial<Record<LegacyVariant, ComponentVariant>> = {
  text: "ghost",
};
const AppearanceContext = createContext<AppearanceProps>({});
export const useComponentAppearance = () => useContext(AppearanceContext);

/** Optional defaults for a group of components, including their portal content. */
export function ComponentAppearanceProvider({
  children,
  variant,
  size,
  labelPosition,
}: AppearanceProps & { children: ReactNode }) {
  return (
    <AppearanceContext.Provider value={{ variant, size, labelPosition }}>
      {children}
    </AppearanceContext.Provider>
  );
}

/** Consume presentation props before forwarding native DOM/Radix props. */
type AppearanceInput = {
  labelPosition?: LabelPosition;
  variant?: ComponentVariant | LegacyVariant;
  size?: ComponentSize | "xs" | "xl" | number;
  className?: string;
};
export function useAppearanceProps<P extends AppearanceInput>(
  props: P,
): Omit<P, "variant" | "size" | "labelPosition">;
export function useAppearanceProps<P extends AppearanceInput>(
  props: P,
  options: { preserveSize: true; preserveVariant?: false },
): Omit<P, "variant" | "labelPosition">;
export function useAppearanceProps<P extends AppearanceInput>(
  props: P,
  options: { preserveSize: true; preserveVariant: true },
): P;
export function useAppearanceProps<
  P extends {
    labelPosition?: LabelPosition;
    variant?: ComponentVariant | LegacyVariant;
    size?: ComponentSize | "xs" | "xl" | number;
    className?: string;
  },
>(
  props: P,
  options: { preserveVariant?: boolean; preserveSize?: boolean } = {},
): P {
  const defaults = useContext(AppearanceContext);
  const { variant, size, labelPosition, className, ...rest } = props;
  const existingPosition = className?.match(/\bmf-label--(top|bottom|start|end|none)\b/)?.[1];
  const chosenPosition = labelPosition ?? existingPosition ?? defaults.labelPosition;
  const chosenVariant = variant ?? defaults.variant;
  const normalizedVariant =
    chosenVariant && (aliases[chosenVariant as LegacyVariant] ?? chosenVariant);
  const existingSize = className?.match(/\bmf-scale--(xs|sm|md|lg|xl)\b/)?.[1] as ComponentSize | undefined;
  const chosenSize = size ?? existingSize ?? defaults.size;
  return {
    ...rest,
    ...(options.preserveVariant ? { variant } : {}),
    ...(options.preserveSize ? { size: chosenSize } : {}),
    className: cx(
      chosenPosition && `mf-label--${chosenPosition}`,
      normalizedVariant && `mf-variant--${normalizedVariant}`,
      typeof chosenSize === "string" && `mf-scale--${chosenSize}`,
      className?.replace(/\bmf-label--(top|bottom|start|end|none)\b/g, "").replace(/\bmf-scale--(xs|sm|md|lg|xl)\b/g, ""),
    ),
  } as P;
}

export function appearanceClasses(className?: string) {
  return className
    ?.split(/\s+/)
    .filter((name) => /^mf-(variant|scale|label)--/.test(name))
    .join(" ");
}

/** Enforce documented component sizes even under a broader group default. */
export function useSizePolicy<P extends AppearanceInput>(component: string, props: P): P {
  const defaults = useContext(AppearanceContext);
  return { ...props, size: normalizeComponentSize(component, typeof props.size === "string" ? props.size : defaults.size) };
}
