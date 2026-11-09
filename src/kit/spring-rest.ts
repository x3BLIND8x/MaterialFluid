import type { Transition } from 'motion/react';
import { motionTransition } from './bounded-motion';

/** Stop subpixel tails at the exact target without rounding the moving frames. */
export const springRest = {
  pixel: { restDelta: .2, restSpeed: 4 },
  unit: { restDelta: .0005, restSpeed: .01 },
  angle: { restDelta: .1, restSpeed: 2 },
} as const;

/** Convert the pixel settling budget to a progress/value channel's visible extent. */
export function springRestForExtent(pixelsPerUnit: number) {
  const extent = Math.max(1, Math.abs(pixelsPerUnit));
  return { restDelta: springRest.pixel.restDelta / extent, restSpeed: springRest.pixel.restSpeed / extent };
}

/** Mixed transform/layout animations need separate tolerances for each unit. */
export function settledSpring(options: Transition): Transition {
  const base = { ...options, ...motionTransition("resize") };
  return {
    ...base,
    scale: { ...base, ...springRest.unit },
    scaleX: { ...base, ...springRest.unit },
    scaleY: { ...base, ...springRest.unit },
    rotate: { ...base, ...springRest.angle },
    rotateX: { ...base, ...springRest.angle },
    rotateY: { ...base, ...springRest.angle },
    opacity: { duration: .15, ease: "easeOut" },
    color: { duration: .33, ease: "easeOut" },
    backgroundColor: { duration: .33, ease: "easeOut" },
    filter: { duration: .15, ease: "easeOut" },
  };
}
