import { animate } from "motion";
import { buttonMotionDefaults } from "../provider";
import { dialogMotionDefaults } from "../motion-engine";
import { savedMotionPresets } from "../motion-presets";
import type { Spring } from "./spring";
import { boundedMotionCurve } from "../bounded-motion";

export const foundationMotion = {
  press: { stiffness: buttonMotionDefaults.stiffness, damping: buttonMotionDefaults.damping, mass: buttonMotionDefaults.mass },
  resize: { stiffness: buttonMotionDefaults.stiffness, damping: buttonMotionDefaults.sizeDamping, mass: buttonMotionDefaults.mass },
  dialog: { stiffness: dialogMotionDefaults.stiffness, damping: dialogMotionDefaults.damping, mass: dialogMotionDefaults.mass },
  popup: { stiffness: savedMotionPresets.menu.values.stiffness, damping: savedMotionPresets.menu.values.damping, mass: savedMotionPresets.menu.values.mass },
} as const;
export type MotionPurpose = keyof typeof foundationMotion;
export const foundationEffects = { color: buttonMotionDefaults.colorDuration, text: 100, dialogFade: dialogMotionDefaults.fadeDuration * 1000 } as const;

/** Convert mass-based owner physics to the reference engine's normalized form. */
export function foundationSpring(purpose: MotionPurpose): Spring {
  const { stiffness, damping, mass } = foundationMotion[purpose];
  return { stiffness: stiffness / mass, dampingRatio: damping / (2 * Math.sqrt(stiffness * mass)) };
}
export const foundationMotionCurve = boundedMotionCurve;
export interface FoundationMotionControls { finished: Promise<void>; cancel(): void; }
export type FoundationKeyframes = Record<string, (number | string)[]>;
const running = new WeakMap<Element, FoundationMotionControls>();
function finish(element: HTMLElement | SVGElement, frames: FoundationKeyframes) {
  for (const [property, values] of Object.entries(frames)) {
    if (!values.length) continue;
    element.style.setProperty(property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`), String(values[values.length - 1]));
  }
}
/** Adapter contract adapted from Expressive; authored curves and Motion stay fixed. */
export const foundationMotionEngine = {
  name: "motion" as const,
  animate(element: HTMLElement | SVGElement, frames: FoundationKeyframes, purpose: MotionPurpose = "resize", enabled = true): FoundationMotionControls {
    running.get(element)?.cancel();
    const root = element.closest<HTMLElement>(".mf-root");
    const media = typeof matchMedia !== "undefined" ? matchMedia("(prefers-reduced-motion: reduce)") : undefined;
    const reduce = media?.matches;
    if (!enabled || reduce || root?.dataset.motion === "minimal" || root?.dataset.motion === "reduced") {
      finish(element, frames); return { finished: Promise.resolve(), cancel() {} };
    }
    const curve = foundationMotionCurve(purpose);
    const controls = animate(element, frames, { type: "tween", duration: curve.duration / 1000, ease: curve.ease,
      opacity: { duration: foundationEffects.dialogFade / 1000, ease: "easeOut" },
      backgroundColor: { duration: foundationEffects.color / 1000, ease: "easeOut" },
      color: { duration: foundationEffects.color / 1000, ease: "easeOut" },
    });
    let resolve: () => void;
    let done = false;
    const finished = new Promise<void>(complete => { resolve = complete; });
    const cleanup = () => {
      if (done) return;
      done = true;
      media?.removeEventListener("change", reduced);
      if (running.get(element) === result) running.delete(element);
      resolve();
    };
    const cancel = () => {
      if (done) return;
      const css = getComputedStyle(element);
      const snapshot = Object.fromEntries(Object.keys(frames).map(key => [key, css.getPropertyValue(key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`))]));
      controls.cancel();
      for (const [property, value] of Object.entries(snapshot)) element.style.setProperty(property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`), value);
      cleanup();
    };
    const reduced = () => { if (media?.matches) { cancel(); finish(element, frames); } };
    const result = { finished, cancel };
    running.set(element, result);
    media?.addEventListener("change", reduced);
    void controls.finished.then(cleanup, cleanup);
    return result;
  },
};
