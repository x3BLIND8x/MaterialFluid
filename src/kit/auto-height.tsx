import { forwardRef, useLayoutEffect, useRef, type HTMLAttributes } from "react";
import { useMotionValueEvent, useSpring } from "motion/react";
import { useMaterialFluid } from "./provider";
import { cx, setRef } from "./utils";

/** Animate measured content height without scaling its text or controls. */
export const AutoHeight = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function AutoHeight({ children, className, style, ...props }, ref) {
  const element = useRef<HTMLDivElement | null>(null);
  const content = useRef<HTMLDivElement | null>(null);
  const initialized = useRef(false);
  const height = useSpring(0, { stiffness: 420, damping: 32, mass: .8 });
  const { motion: mode, reducedMotion } = useMaterialFluid();
  useMotionValueEvent(height, "change", value => { if (element.current) element.current.style.height = `${value}px`; });
  useLayoutEffect(() => {
    const inner = content.current;
    if (!inner) return;
    const measure = () => {
      const contentHeight = inner.offsetHeight;
      if (contentHeight <= 0 || !element.current) return;
      const computed = getComputedStyle(element.current);
      const number = (value: string) => parseFloat(value) || 0;
      const inset = number(computed.paddingTop) + number(computed.paddingBottom) + number(computed.borderTopWidth) + number(computed.borderBottomWidth);
      const next = Math.max(contentHeight + inset, number(computed.minHeight));
      if (Math.abs(height.get() - next) < .5) return;
      if (!initialized.current || mode !== "expressive" || reducedMotion) height.jump(next);
      else height.set(next);
      initialized.current = true;
      if (element.current) element.current.style.height = `${height.get()}px`;
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [children, height, mode, reducedMotion]);
  return <div {...props} ref={node => { element.current = node; setRef(ref, node); }} className={cx("mf-auto-height", className)} style={style}>
    <div ref={content} className="mf-auto-height-content">{children}</div>
  </div>;
});
