import { useCallback, useEffect, useRef } from "react";
import { animate, type MotionValue } from "motion/react";

export const QUICK_PRESS_THRESHOLD_MS = 50;
export const QUICK_PRESS_DURATION_MS = 100;

/** Event-driven press motion so rapid down/up pairs cannot be merged by React rendering. */
export function useButtonPressAnimation(
  scale: MotionValue<number>,
  expressive: boolean,
  settings?: { scale?: number; stiffness?: number; damping?: number; mass?: number } | false,
) {
  const options = useRef({ expressive, depth: settings ? (settings.scale ?? .94) : .94,
    stiffness: settings ? (settings.stiffness ?? 460) : 460,
    damping: settings ? (settings.damping ?? 12) : 12,
    mass: settings ? (settings.mass ?? 1) : 1 });
  options.current = { expressive, depth: settings ? (settings.scale ?? .94) : .94,
    stiffness: settings ? (settings.stiffness ?? 460) : 460,
    damping: settings ? (settings.damping ?? 12) : 12,
    mass: settings ? (settings.mass ?? 1) : 1 };
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressedAt = useRef(0);
  const holding = useRef(false);
  const sequence = useRef(0);

  const press = useCallback(() => {
    if (holding.current) return;
    sequence.current++;
    if (releaseTimer.current !== null) clearTimeout(releaseTimer.current);
    releaseTimer.current = null;
    const { expressive, depth, stiffness, damping, mass } = options.current;
    if (!expressive) return;
    holding.current = true;
    pressedAt.current = performance.now();
    const from = scale.get();
    animation.current?.stop();
    if (from < .985 && depth < .985) {
      // A new tap needs a fresh contour even while the previous one is still held.
      animation.current = animate(scale, [from, 1, depth], { duration: .08, times: [0, .25, 1], ease: "easeOut" });
    } else {
      animation.current = animate(scale, depth,
        { type: "spring", stiffness, damping, mass, restDelta: .0001, restSpeed: .001 });
    }
  }, [scale]);

  const release = useCallback(() => {
    if (!holding.current) return;
    holding.current = false;
    const current = sequence.current;
    const elapsed = performance.now() - pressedAt.current;
    const returnToRest = () => {
      if (sequence.current !== current) return;
      animation.current?.stop();
      const { stiffness, damping, mass } = options.current;
      animation.current = animate(scale, 1,
        { type: "spring", stiffness, damping, mass, restDelta: .0001, restSpeed: .001 });
      releaseTimer.current = null;
    };
    if (elapsed < QUICK_PRESS_THRESHOLD_MS) {
      releaseTimer.current = setTimeout(returnToRest, Math.max(0, QUICK_PRESS_DURATION_MS - elapsed));
    } else returnToRest();
  }, [scale]);

  useEffect(() => {
    if (expressive) return;
    sequence.current++;
    holding.current = false;
    if (releaseTimer.current !== null) clearTimeout(releaseTimer.current);
    releaseTimer.current = null;
    animation.current?.stop();
    scale.set(1);
  }, [expressive, scale]);
  useEffect(() => () => {
    sequence.current++;
    if (releaseTimer.current !== null) clearTimeout(releaseTimer.current);
    animation.current?.stop();
  }, []);

  return { press, release };
}
