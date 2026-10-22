import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import {
  animate,
  useMotionValue,
  useTransform,
  type MotionStyle,
} from "motion/react";

/** Animate the layout box itself so adjacent content participates in the spring. */
export function useButtonGeometry(
  node: RefObject<HTMLButtonElement | null>,
  {
    expressive,
    stiffness = 460,
    damping = 40,
    mass = 1,
    className,
    style,
    children,
    leading,
    trailing,
    size,
  }: {
    expressive: boolean;
    stiffness?: number;
    damping?: number;
    mass?: number;
    className?: string;
    style?: CSSProperties;
    children: unknown;
    leading: unknown;
    trailing: unknown;
    size: string;
  },
) {
  const width = useMotionValue(0),
    height = useMotionValue(0);
  const paddingTop = useMotionValue(0),
    paddingBottom = useMotionValue(0);
  const paddingLeft = useMotionValue(0),
    paddingRight = useMotionValue(0);
  const fontSize = useMotionValue(0),
    lineHeight = useMotionValue(0),
    gap = useMotionValue(0);
  const iconSize = useMotionValue(0);
  const values = useMemo(
    () => ({
      width,
      height,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight,
      fontSize,
      lineHeight,
      gap,
      iconSize,
    }),
    [
      width,
      height,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight,
      fontSize,
      lineHeight,
      gap,
      iconSize,
    ],
  );
  const lineHeightStyle = useTransform(lineHeight, (value) => `${value}px`);
  const iconStyle = useTransform(iconSize, (value) => `${value}px`);
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);
  const goals = useRef<string>("");
  const animations = useRef<ReturnType<typeof animate>[]>([]);
  const measure = useCallback(() => {
    const button = node.current;
    if (!button?.parentElement) return;
    // Measure authored CSS without the inline geometry currently being animated.
    // The clone is inert, invisible and removed synchronously before paint.
    const probe = button.cloneNode(true) as HTMLButtonElement;
    probe.removeAttribute("id");
    probe.removeAttribute("data-mf-sized");
    probe.inert = true;
    for (const key of [
      ...Object.keys(values).filter((key) => key !== "iconSize"),
      "minHeight",
    ]) {
      const cssKey = key.replace(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`,
      );
      probe.style.removeProperty(cssKey);
      const authored = style?.[key as keyof CSSProperties];
      if (authored !== undefined)
        probe.style.setProperty(
          cssKey,
          typeof authored === "number" && key !== "lineHeight"
            ? `${authored}px`
            : String(authored),
        );
    }
    probe.style.removeProperty("--mf-button-icon-size");
    Object.assign(probe.style, {
      position: "absolute",
      visibility: "hidden",
      pointerEvents: "none",
      transform: "none",
      transition: "none",
      animation: "none",
    });
    button.parentElement.append(probe);
    const css = getComputedStyle(probe);
    const next = Object.fromEntries(
      Object.keys(values).map((key) => [
        key,
        key === "iconSize"
          ? (probe.querySelector(".mf-animated-icon")?.getBoundingClientRect()
              .width ?? 0)
          : parseFloat(css[key as keyof CSSStyleDeclaration] as string) || 0,
      ]),
    ) as Record<keyof typeof values, number>;
    probe.remove();
    const signature = JSON.stringify([next, expressive]);
    if (goals.current === signature) return;
    goals.current = signature;
    animations.current.forEach((animation) => animation.stop());
    const shouldAnimate = initialized.current && expressive;
    animations.current = (Object.keys(values) as (keyof typeof values)[]).map(
      (key) => {
        if (!shouldAnimate) values[key].jump(next[key]);
        return animate(
          values[key],
          next[key],
          shouldAnimate
            ? {
                type: "spring",
                stiffness,
                damping,
                mass,
                restDelta: 0.001,
                restSpeed: 0.01,
              }
            : { duration: 0 },
        );
      },
    );
    initialized.current = true;
    setReady(true);
  }, [node, values, style, expressive, stiffness, damping, mass]);
  useLayoutEffect(() => {
    let cancelled = false;
    const button = node.current;
    const contentObserver =
      button && typeof MutationObserver !== "undefined"
        ? new MutationObserver(measure)
        : undefined;
    contentObserver?.observe(button!, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    measure();
    window.addEventListener("resize", measure);
    void document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
      contentObserver?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, className, children, leading, trailing, size]);
  useLayoutEffect(
    () => () => animations.current.forEach((animation) => animation.stop()),
    [],
  );
  return {
    ready,
    style: ready
      ? ({
          ...values,
          iconSize: undefined,
          lineHeight: lineHeightStyle,
          "--mf-button-icon-size": iconStyle,
          minHeight: 0,
        } as MotionStyle)
      : {},
  };
}
