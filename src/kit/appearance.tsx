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
export type LabelPosition = "top" | "bottom" | "start" | "end";
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
  size?: ComponentSize | number;
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
    size?: ComponentSize | number;
    className?: string;
  },
>(
  props: P,
  options: { preserveVariant?: boolean; preserveSize?: boolean } = {},
): P {
  const defaults = useContext(AppearanceContext);
  const { variant, size, labelPosition, className, ...rest } = props;
  const existingPosition = className?.match(/\bmf-label--(top|bottom|start|end)\b/)?.[1];
  const chosenPosition = labelPosition ?? existingPosition ?? defaults.labelPosition;
  const chosenVariant = variant ?? defaults.variant;
  const normalizedVariant =
    chosenVariant && (aliases[chosenVariant as LegacyVariant] ?? chosenVariant);
  const chosenSize = size ?? defaults.size;
  return {
    ...rest,
    ...(options.preserveVariant ? { variant } : {}),
    ...(options.preserveSize ? { size: chosenSize } : {}),
    className: cx(
      chosenPosition && `mf-label--${chosenPosition}`,
      normalizedVariant && `mf-variant--${normalizedVariant}`,
      typeof chosenSize === "string" && `mf-scale--${chosenSize}`,
      className?.replace(/\bmf-label--(top|bottom|start|end)\b/g, ""),
    ),
  } as P;
}

export function appearanceClasses(className?: string) {
  return className
    ?.split(/\s+/)
    .filter((name) => /^mf-(variant|scale|label)--/.test(name))
    .join(" ");
}
