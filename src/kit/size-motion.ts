import { useLayoutEffect, type CSSProperties, type RefObject } from "react";
import { spring, useSpring, useMotionValueEvent } from "motion/react";

/** Explicit pixel sizes (Spinner/icons) use the same spring as CSS-size variants. */
export function useSizeDimensions(
  node: RefObject<HTMLElement | null>,
  size: number,
  options: {
    expressive: boolean;
    stiffness: number;
    damping: number;
    mass: number;
    style?: CSSProperties;
  },
) {
  const { expressive, stiffness, damping, mass, style } = options;
  const dimension = useSpring(size, { stiffness, damping, mass });
  const update = () => {
    if (!node.current) return;
    if (style?.width === undefined)
      node.current.style.width = `${dimension.get()}px`;
    if (style?.height === undefined)
      node.current.style.height = `${dimension.get()}px`;
  };
  useMotionValueEvent(dimension, "change", update);
  useLayoutEffect(() => {
    if (expressive && !node.current?.closest("[data-mf-sized]"))
      dimension.set(size);
    else dimension.jump(size);
    if (node.current) {
      if (style?.width === undefined)
        node.current.style.width = `${dimension.get()}px`;
      if (style?.height === undefined)
        node.current.style.height = `${dimension.get()}px`;
    }
  }, [dimension, size, expressive, node, style]);
  return dimension.get();
}

const sizeClass = /\bmf-scale--(?:sm|md|lg)\b/;
const properties = [
  "width",
  "height",
  "min-width",
  "min-height",
  "max-width",
  "max-height",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "row-gap",
  "column-gap",
  "font-size",
  "line-height",
  "letter-spacing",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",
] as const;
type Metric = { property: string; from: number; to: number };

/** Size changes share Button's physical spring without transforming text or hit areas.
 * Only size-class changes trigger measurement; presses, content and viewport changes
 * continue to belong to their existing component animations. */
export function useSizeMotion(
  root: HTMLElement | null,
  options: {
    expressive: boolean;
    stiffness: number;
    damping: number;
    mass: number;
  },
) {
  const { expressive, stiffness, damping, mass } = options;
  useLayoutEffect(() => {
    if (
      !root ||
      typeof MutationObserver === "undefined" ||
      typeof Element.prototype.animate !== "function"
    )
      return;
    const sizes = new WeakMap<Element, { size: string; classes: string }>();
    const active = new Map<Element, Animation>();
    const remember = (element: Element) => {
      for (const child of [element, ...element.querySelectorAll("[class]")]) {
        const classes = child.getAttribute("class") ?? "";
        sizes.set(child, {
          size: classes.match(sizeClass)?.[0] ?? "",
          classes,
        });
      }
    };
    remember(root);
    const cancel = (elements: Iterable<Element> = active.keys()) => {
      for (const element of elements) {
        active.get(element)?.cancel();
        active.delete(element);
      }
    };
    const observer = new MutationObserver((records) => {
      const changes = new Map<
        Element,
        { previous: string; current: string; classes: string }
      >();
      // Newly mounted content appears at its intended size, without an entrance resize.
      for (const record of records)
        if (record.type === "childList") {
          record.addedNodes.forEach((node) => {
            if (node instanceof Element) remember(node);
          });
        }
      for (const record of records) {
        if (record.type !== "attributes" || !(record.target instanceof Element))
          continue;
        const element = record.target;
        const classes = element.getAttribute("class") ?? "";
        const current = classes.match(sizeClass)?.[0] ?? "";
        const previous = sizes.get(element);
        sizes.set(element, { size: current, classes });
        if (
          previous === undefined ||
          current === previous.size ||
          element.closest(".mf-root") !== root
        )
          continue;
        // Button already owns measured geometry, including its nested artwork.
        if (element.closest("[data-mf-sized]")) continue;
        changes.set(element, { previous: previous.classes, current, classes });
      }
      if (!changes.size) return;
      if (!expressive) {
        cancel();
        return;
      }
      const elements = new Set<HTMLElement | SVGSVGElement>();
      for (const [element, { previous }] of changes) {
        element.setAttribute("class", previous);
        for (const child of [element, ...element.querySelectorAll("*")]) {
          if (
            (child instanceof HTMLElement || child instanceof SVGSVGElement) &&
            child.closest(".mf-root") === root &&
            !child.closest("[data-mf-sized]")
          )
            elements.add(child);
        }
      }
      const starts = new Map<Element, Map<string, number>>();
      for (const element of elements) {
        const css = getComputedStyle(element);
        const values = new Map<string, number>();
        const buttonContainer = !!element.querySelector("[data-mf-sized]");
        for (const property of properties) {
          // Preserve inline values owned by press, expansion and selection motion.
          if (
            element.style.getPropertyValue(property) ||
            (buttonContainer && (property === "width" || property === "height"))
          )
            continue;
          const value = css.getPropertyValue(property);
          if (/^-?[\d.]+px$/.test(value))
            values.set(property, parseFloat(value));
        }
        starts.set(element, values);
      }
      for (const [element, { classes }] of changes)
        element.setAttribute("class", classes);
      cancel(elements);
      const targets: {
        element: HTMLElement | SVGSVGElement;
        metrics: Metric[];
      }[] = [];
      for (const element of elements) {
        const css = getComputedStyle(element);
        const metrics: Metric[] = [];
        for (const [property, from] of starts.get(element)!) {
          const value = css.getPropertyValue(property);
          const to = parseFloat(value);
          if (/^-?[\d.]+px$/.test(value) && Math.abs(to - from) > 0.05)
            metrics.push({ property, from, to });
        }
        if (metrics.length) targets.push({ element, metrics });
      }
      if (!targets.length) return;
      // Sample once, then let native animations share the same spring timeline.
      const generator = spring({
        keyframes: [0, 1],
        stiffness,
        damping,
        mass,
        restDelta: 0.001,
        restSpeed: 0.01,
      });
      const samples: number[] = [];
      let duration = 0;
      for (; duration < 3000; duration += 1000 / 60) {
        const state = generator.next(duration);
        samples.push(state.value);
        if (state.done) break;
      }
      samples[samples.length - 1] = 1;
      for (const { element, metrics } of targets) {
        const frames = samples.map((progress) =>
          Object.fromEntries(
            metrics.map(({ property, from, to }) => [
              property.replace(/-([a-z])/g, (_match, letter: string) =>
                letter.toUpperCase(),
              ),
              `${property.startsWith("margin") || property === "letter-spacing" ? from + (to - from) * progress : Math.max(0, from + (to - from) * progress)}px`,
            ]),
          ),
        );
        const animation = element.animate(frames, {
          duration,
          easing: "linear",
          fill: "both",
        });
        active.set(element, animation);
        void animation.finished.then(
          () => {
            if (active.get(element) === animation) {
              active.delete(element);
              animation.cancel();
            }
          },
          () => {},
        );
      }
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
      childList: true,
      subtree: true,
    });
    return () => {
      observer.disconnect();
      cancel();
    };
  }, [root, expressive, stiffness, damping, mass]);
}
