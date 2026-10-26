import { useEffect } from "react";
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
  useEffect(() => {
    const animation = animate(scale, expressive && pressed ? depth : 1,
      expressive ? { type: "spring", stiffness, damping, mass, restDelta: .0001, restSpeed: .001 } : { duration: 0 });
    return () => animation.stop();
  }, [scale, pressed, expressive, depth, stiffness, damping, mass]);
}
