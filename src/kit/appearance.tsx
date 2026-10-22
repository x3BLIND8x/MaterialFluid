import { createContext, useContext, type ReactNode } from "react";
import { cx } from "./utils";

export const componentVariants = [
  "primary",
  "secondary",
  "tertiary",
  "outline",
  "ghost",
  "danger",
] as const;
export const componentSizes = ["sm", "md", "lg"] as const;
export type ComponentVariant = (typeof componentVariants)[number];
export type ComponentSize = (typeof componentSizes)[number];
export interface AppearanceProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
}
export type LegacyVariant = "filled" | "tonal" | "outlined" | "text";
const aliases: Record<LegacyVariant, ComponentVariant> = {
  filled: "primary",
  tonal: "secondary",
  outlined: "outline",
  text: "ghost",
};
const AppearanceContext = createContext<AppearanceProps>({});
export const useComponentAppearance = () => useContext(AppearanceContext);

/** Optional defaults for a group of components, including their portal content. */
export function ComponentAppearanceProvider({
  children,
  variant,
  size,
}: AppearanceProps & { children: ReactNode }) {
  return (
    <AppearanceContext.Provider value={{ variant, size }}>
      {children}
    </AppearanceContext.Provider>
  );
}

/** Consume presentation props before forwarding native DOM/Radix props. */
type AppearanceInput = {
  variant?: ComponentVariant | LegacyVariant;
  size?: ComponentSize | number;
  className?: string;
};
export function useAppearanceProps<P extends AppearanceInput>(
  props: P,
): Omit<P, "variant" | "size">;
export function useAppearanceProps<P extends AppearanceInput>(
  props: P,
  options: { preserveSize: true; preserveVariant?: false },
): Omit<P, "variant">;
export function useAppearanceProps<P extends AppearanceInput>(
  props: P,
  options: { preserveSize: true; preserveVariant: true },
): P;
export function useAppearanceProps<
  P extends {
    variant?: ComponentVariant | LegacyVariant;
    size?: ComponentSize | number;
    className?: string;
  },
>(
  props: P,
  options: { preserveVariant?: boolean; preserveSize?: boolean } = {},
): P {
  const defaults = useContext(AppearanceContext);
  const { variant, size, className, ...rest } = props;
  const chosenVariant = variant ?? defaults.variant;
  const normalizedVariant =
    chosenVariant && (aliases[chosenVariant as LegacyVariant] ?? chosenVariant);
  const chosenSize = size ?? defaults.size;
  return {
    ...rest,
    ...(options.preserveVariant ? { variant } : {}),
    ...(options.preserveSize ? { size: chosenSize } : {}),
    className: cx(
      normalizedVariant && `mf-variant--${normalizedVariant}`,
      typeof chosenSize === "string" && `mf-scale--${chosenSize}`,
      className,
    ),
  } as P;
}

export function appearanceClasses(className?: string) {
  return className
    ?.split(/\s+/)
    .filter((name) => /^mf-(variant|scale)--/.test(name))
    .join(" ");
}
