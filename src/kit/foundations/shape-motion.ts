import { animate } from "motion";
import { foundationMotionCurve } from "./motion";
import { align, lerpPoints, samplePath, smoothPath } from "./shape-morph";
import { shapePaths, type MaterialShapeName } from "./material-shapes";
import { shapeSamples } from "./shape-samples";
import type { Point } from "./shape-morph";
import type { FoundationMotionControls } from "./motion";
const running = new WeakMap<SVGPathElement, FoundationMotionControls>();
const rendered = new WeakMap<SVGPathElement, { d: string; points: Point[] }>();
const outlines = new Map(Object.entries(shapePaths).map(([name, d]) => [d, shapeSamples[name as MaterialShapeName]]));

export function morphFoundationShape(path: SVGPathElement, target: MaterialShapeName, enabled = true) {
  running.get(path)?.cancel();
  const destination = shapePaths[target];
  const current = path.getAttribute("d") || destination;
  if (current === destination) return { finished: Promise.resolve(), cancel() {} };
  const media = typeof matchMedia !== "undefined" ? matchMedia("(prefers-reduced-motion: reduce)") : undefined;
  const reduce = media?.matches;
  const mode = path.closest<HTMLElement>(".mf-root")?.dataset.motion;
  const visible = rendered.get(path);
  // Built-in outlines are sampled at build time. Interrupted morphs reuse their
  // actual visible points, avoiding expensive SVG geometry reads on activation.
  const from = enabled && !reduce && mode !== "minimal" && mode !== "reduced"
    ? (visible?.d === current ? visible.points : outlines.get(current) ?? samplePath(current)) : null;
  const sampled = from ? shapeSamples[target] : null;
  if (!from || !sampled) {
    path.setAttribute("d", destination);
    return { finished: Promise.resolve(), cancel() {} };
  }
  const to = align(from, sampled);
  let resolve: () => void;
  let done = false;
  const finished = new Promise<void>(complete => { resolve = complete; });
  const cleanup = () => {
    if (done) return;
    done = true;
    media?.removeEventListener("change", reduced);
    if (running.get(path) === result) running.delete(path);
    resolve();
  };
  const curve = foundationMotionCurve("resize");
  const controls = animate(0, 1, { type: "tween", duration: curve.duration / 1000, ease: curve.ease,
    onUpdate: progress => {
      const points = lerpPoints(from, to, progress), d = smoothPath(points);
      rendered.set(path, { d, points });
      path.setAttribute("d", d);
    },
    onComplete: () => { path.setAttribute("d", destination); rendered.delete(path); cleanup(); },
  });
  const cancel = () => { controls.stop(); cleanup(); };
  const reduced = () => { if (media?.matches) { cancel(); path.setAttribute("d", destination); } };
  const result = { finished, cancel };
  running.set(path, result);
  media?.addEventListener("change", reduced);
  return result;
}
