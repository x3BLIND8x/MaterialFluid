import { useEffect, useRef } from "react";
import { animate, type MotionValue } from "motion/react";

/** Shared by native buttons and non-interactive affordances inside triggers. */
export function useButtonPressAnimation(
  scale: MotionValue<number>,
  pressed: boolean,
  expressive: boolean,
  settings?: { scale?: number; stiffness?: number; damping?: number; mass?: number } | false,
) {
  const depth = settings ? (settings.scale ?? .94) : .94;
  const stiffness = settings ? (settings.stiffness ?? 460) : 460;
  const damping = settings ? (settings.damping ?? 12) : 12;
  const mass = settings ? (settings.mass ?? 1) : 1;
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  const sequence = useRef(0);
  useEffect(() => {
    const current = ++sequence.current;
    if (!expressive) {
      animation.current?.stop();
      animation.current = null;
      scale.set(1);
      return;
    }
    if (pressed) {
      animation.current?.stop();
      animation.current = animate(scale, depth,
        { type: "spring", stiffness, damping, mass, restDelta: .0001, restSpeed: .001 });
      return;
    }
    const finishRelease = () => {
      if (sequence.current !== current) return;
      animation.current = animate(scale, 1,
        { type: "spring", stiffness, damping, mass, restDelta: .0001, restSpeed: .001 });
    };
    const inward = animation.current;
    if (inward && Math.abs(scale.get() - depth) > .005) {
      // Keep the same trajectory on a quick release, then return from its full depth.
      inward.speed = 2.5;
      void inward.then(finishRelease);
    } else {
      inward?.stop();
      finishRelease();
    }
  }, [scale, pressed, expressive, depth, stiffness, damping, mass]);
  useEffect(() => () => {
    sequence.current++;
    animation.current?.stop();
  }, []);
}
