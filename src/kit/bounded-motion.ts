import type { Transition } from "motion/react";
import { springAt } from "./foundations/spring";

export const motionProfiles = {
  press: { stiffness: 700, damping: 20, mass: 1.5 },
  resize: { stiffness: 700, damping: 30, mass: 1.5 },
  dialog: { stiffness: 500, damping: 30, mass: 1 },
  popup: { stiffness: 460, damping: 20, mass: 1 },
} as const;
export type MotionPurpose = keyof typeof motionProfiles;
export function boundedMotionCurve(purpose: MotionPurpose) {
  const { stiffness, damping, mass } = motionProfiles[purpose];
  const spring = { stiffness: stiffness / mass, dampingRatio: damping / (2 * Math.sqrt(stiffness * mass)) };
  const frequency = Math.sqrt(spring.stiffness) * Math.sqrt(1 - spring.dampingRatio ** 2);
  const settleAt = (purpose === "press" ? 3 : 2) * Math.PI / frequency * 1000;
  const duration = settleAt + 120, peak = springAt(spring, settleAt / 1000);
  const at = (milliseconds: number) => {
    if (milliseconds <= 0) return 0;
    if (milliseconds >= duration) return 1;
    if (milliseconds <= settleAt) return springAt(spring, milliseconds / 1000);
    const u = (milliseconds - settleAt) / 120;
    return 1 + (peak - 1) * (1 - u) ** 3 * (1 + 3 * u);
  };
  const ease = (progress: number) => at(progress * duration);
  const points = Array.from({ length: 121 }, (_, i) => [i / 120, ease(i / 120)] as const);
  return { spring, duration, settleAt, at, ease, points, easing: `linear(${points.map(([, y]) => Math.round(y * 100000) / 100000).join(", ")})` };
}
const curves = { press: boundedMotionCurve("press"), resize: boundedMotionCurve("resize"), dialog: boundedMotionCurve("dialog"), popup: boundedMotionCurve("popup") };
export function motionTransition(purpose: MotionPurpose = "resize"): Transition {
  const curve = curves[purpose];
  return { type: "tween", duration: curve.duration / 1000, ease: curve.ease };
}
