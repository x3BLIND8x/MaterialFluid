import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { AnimatedIcon } from "./icons";
import { useMaterialFluid } from "./provider";
import { useButtonPressAnimation } from "./button-press";
import { ButtonRipple } from "./button-ripple";

/** IconButton feedback for an icon inside a field that is already a button. */
export function FieldTriggerIcon() {
  const element = useRef<HTMLSpanElement>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; diameter: number; released: boolean }[]>([]);
  const sequence = useRef(0);
  const levels = useRef(new Map<number, number>());
  const { motion: mode, reducedMotion, buttonMotion } = useMaterialFluid();
  const expressive = mode === "expressive" && !reducedMotion;
  const scale = useMotionValue(1);
  const rippleProgress = useMotionValue(0);
  const restRadius = useMotionValue(20);
  const { press: startPressMotion, release: releasePressMotion } = useButtonPressAnimation(scale, expressive, {
    scale: 1 - buttonMotion.pressDepth / 100,
    stiffness: buttonMotion.stiffness,
    damping: buttonMotion.damping,
    mass: buttonMotion.mass,
  });
  const radius = useTransform(() => {
    const rest = restRadius.get();
    const depth = reducedMotion ? 0 : mode === "minimal"
      ? buttonMotion.pressDepth / 100 * rippleProgress.get() : 1 - scale.get();
    return Math.max(Math.min(6, rest), rest * (1 - Math.max(0, Math.min(1, depth * buttonMotion.radiusDepthRatio))));
  });
  useLayoutEffect(() => {
    const node = element.current;
    if (!node) return;
    const measure = () => restRadius.set(Math.min(node.offsetWidth, node.offsetHeight) / 2);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [restRadius]);
  useEffect(() => {
    const trigger = element.current?.closest("button");
    if (!trigger) return;
    let held = false;
    let paintedAt: number | null = null;
    let frame = 0;
    const settle = () => {
      if (paintedAt === null) return;
      releasePressMotion();
      setRipples(current => current.map(ripple => ({ ...ripple, released: true })));
    };
    const press = (event?: PointerEvent) => {
      if (trigger.disabled || held) return;
      cancelAnimationFrame(frame);
      held = true;
      paintedAt = null;
      startPressMotion();
      const node = element.current!;
      const box = node.getBoundingClientRect();
      const inside = event && event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
      const x = inside ? (event.clientX - box.left) * node.offsetWidth / box.width : node.offsetWidth / 2;
      const y = inside ? (event.clientY - box.top) * node.offsetHeight / box.height : node.offsetHeight / 2;
      const diameter = 2 * Math.hypot(Math.max(x, node.offsetWidth - x), Math.max(y, node.offsetHeight - y));
      setRipples(current => [...current, { id: ++sequence.current, x, y, diameter, released: false }]);
      // Popup mounting can occupy the first frame. Measure the visible press
      // from paint so focus moving into the popup cannot swallow the animation.
      frame = requestAnimationFrame(() => {
        paintedAt = performance.now();
        if (!held) settle();
      });
    };
    const release = () => {
      if (!held) return;
      held = false;
      settle();
    };
    const down = (event: PointerEvent) => { if (event.button === 0) press(event); };
    const key = (event: KeyboardEvent) => {
      if (!event.repeat && ["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) press();
    };
    trigger.addEventListener("pointerdown", down);
    trigger.addEventListener("keydown", key);
    trigger.addEventListener("blur", release);
    document.addEventListener("pointerup", release, true);
    document.addEventListener("pointercancel", release, true);
    document.addEventListener("keyup", release, true);
    return () => {
      cancelAnimationFrame(frame);
      trigger.removeEventListener("pointerdown", down);
      trigger.removeEventListener("keydown", key);
      trigger.removeEventListener("blur", release);
      document.removeEventListener("pointerup", release, true);
      document.removeEventListener("pointercancel", release, true);
      document.removeEventListener("keyup", release, true);
    };
  }, [startPressMotion, releasePressMotion]);
  return <motion.span ref={element} className="mf-field-adornment mf-field-trigger-icon mf-button mf-button--ghost mf-size--sm mf-scale--sm mf-icon-button mf-variant--ghost" aria-hidden="true" style={{ scale, borderRadius: radius }}>
    {ripples.map(ripple => <ButtonRipple key={ripple.id} {...ripple} animated={!reducedMotion}
      options={{ duration: buttonMotion.rippleDuration / 1000, opacity: buttonMotion.rippleOpacity / 100, easeOutStrength: buttonMotion.rippleFastStart / 100, releaseSpeed: buttonMotion.rippleReleaseSpeed }}
      onProgress={value => { if (value > 0) levels.current.set(ripple.id, value); else levels.current.delete(ripple.id); rippleProgress.set(Math.max(0, ...levels.current.values())); }}
      onFinished={() => setRipples(current => current.filter(item => item.id !== ripple.id))} />)}
    <AnimatedIcon name="chevron-down" size={28} />
  </motion.span>;
}
