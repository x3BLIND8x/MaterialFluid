import { useRef, useEffect, useLayoutEffect } from "react";
import { animate, motion, useMotionValue, useTransform, useMotionValueEvent } from "motion/react";


export function ButtonRipple({
  x,
  y,
  diameter,
  released,
  animated,
  onProgress,
  options,
  onFinished,
}: {
  x: number;
  y: number;
  diameter: number;
  released: boolean;
  animated: boolean;
  onProgress: (value: number) => void;
  options?: { duration?: number; opacity?: number; easeOutStrength?: number; releaseSpeed?: number };
  onFinished: () => void;
}) {
  const scale = useMotionValue(animated ? 0 : 1);
  const element = useRef<HTMLSpanElement>(null);
  const extent = useMotionValue(diameter);
  const left = useTransform(extent, value => x - value / 2);
  const top = useTransform(extent, value => y - value / 2);
  useLayoutEffect(() => {
    const button = element.current?.closest("button");
    if (!button) return;
    // Follow the unscaled layout box; pressing scales the surface separately.
    const measure = () => extent.set(2 * Math.hypot(
      Math.max(x, button.offsetWidth - x),
      Math.max(y, button.offsetHeight - y),
    ));
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(button, {box: "border-box"});
    return () => observer.disconnect();
  }, [x, y, extent]);
  const opacity = useMotionValue(0);
  const expansion = useRef<ReturnType<typeof animate> | null>(null);
  const finished = useRef(onFinished);
  useEffect(() => {
    finished.current = onFinished;
  }, [onFinished]);
  const duration = options?.duration ?? 0.55;
  const strength = options?.easeOutStrength ?? 0.85;
  const alpha = options?.opacity ?? 0.2;
  const releaseSpeed = options?.releaseSpeed ?? 2;
  const envelope = useTransform(
    () => scale.get() * Math.min(1, opacity.get() / Math.max(alpha, 0.001)),
  );
  const reportProgress = useRef(onProgress);
  useEffect(() => {
    reportProgress.current = onProgress;
  }, [onProgress]);
  useMotionValueEvent(envelope, "change", (value) =>
    reportProgress.current(value),
  );
  useEffect(() => () => reportProgress.current(0), []);
  useEffect(() => {
    expansion.current = animate(scale, 1, {
      duration: animated ? duration : 0,
      ease: [1 - Math.min(0.95, Math.max(0, strength)), 1, 0.3, 1],
    });
    const appear = animate(opacity, alpha, { duration: 0.08 });
    return () => {
      expansion.current?.stop();
      appear.stop();
    };
  }, [scale, opacity, animated, duration, strength, alpha]);
  useEffect(() => {
    if (!released || !expansion.current) return;
    let cancelled = false;
    let fade: ReturnType<typeof animate> | undefined;
    // Continue the existing timeline from its current position, at a faster rate.
    expansion.current.speed = Math.max(1, releaseSpeed);
    void expansion.current.then(async () => {
      if (cancelled) return;
      fade = animate(opacity, 0, { duration: 0.16 });
      await fade;
      if (!cancelled) finished.current();
    });
    return () => {
      cancelled = true;
      fade?.stop();
    };
  }, [released, releaseSpeed, opacity, animated, duration, strength, alpha]);
  return (
    <motion.span
      ref={element}
      className="mf-button-ripple"
      aria-hidden="true"
      style={{
        left,
        top,
        width: extent,
        height: extent,
        scale,
        opacity,
      }}
    />
  );
}
