import { useCallback, useEffect, useRef } from "react";
import { animate, useMotionValue } from "motion/react";
import { motionTransition, type MotionPurpose } from "./bounded-motion";

/** A retargetable value with the same finite timeline as layout transitions. */
export function useCurveValue(initial: number, purpose: MotionPurpose = "resize") {
  const value = useMotionValue(initial);
  const active = useRef<ReturnType<typeof animate> | null>(null);
  const setTarget = useCallback((next: number) => {
    active.current?.stop();
    active.current = animate(value, next, motionTransition(purpose));
  }, [value, purpose]);
  useEffect(() => () => active.current?.stop(), []);
  return Object.assign(value, { setTarget });
}
