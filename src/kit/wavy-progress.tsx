import { useCurveValue } from "./curve-value";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useMotionValueEvent } from "motion/react";

const tau = Math.PI * 2;
export interface ProgressWaveOptions {
  waveLength?: number;
  waveHeight?: number;
  waveVelocity?: number;
  direction?: "head" | "tail";
  waveThickness?: number;
  trackThickness?: number;
  incremental?: boolean;
}
function linearWave(
  start: number,
  end: number,
  phase: number,
  amplitude: number,
  center: number,
  length: number,
  incremental: boolean,
) {
  if (end <= start) return "";
  const point = (x: number) =>
    `${x.toFixed(2)},${(center + Math.sin((x / length - phase) * tau) * amplitude * (incremental ? (x - start) / (end - start) : 1)).toFixed(2)}`;
  let path = `M${point(start)}`;
  for (let x = start + 2; x < end; x += 2) path += `L${point(x)}`;
  return `${path}L${point(end)}`;
}
function circularWave(phase: number) {
 const points:string[]=[];
 for(let i=0;i<=120;i++){const t=i/120,angle=(t*.72+phase)*tau-Math.PI/2;const radius=15+1.3*Math.sin(t*tau*5-phase*tau)*Math.sin(t*Math.PI);points.push(`${(20+Math.cos(angle)*radius).toFixed(3)},${(20+Math.sin(angle)*radius).toFixed(3)}`);}
 return `M${points.join('L')}`;
}

/** Pause the continuous wave while hidden, offscreen, or motion is reduced. */
function useWaveMotion(
  svg: RefObject<SVGSVGElement | null>,
  draw: (phase: number) => void,
  enabled: boolean,
  cyclesPerSecond = 1 / 1.2,
) {
  const phase = useRef(0);
  const refresh = useCallback(() => draw(phase.current), [draw]);
  useLayoutEffect(refresh, [refresh]);
  useEffect(() => {
    const element = svg.current;
    if (!element || !enabled || typeof requestAnimationFrame !== "function")
      return;
    let frame = 0,
      last = 0,
      visible = true;
    const tick = (time: number) => {
      if (last)
        phase.current =
          (phase.current +
            (Math.min(64, time - last) / 1000) * cyclesPerSecond) %
          1;
      last = time;
      refresh();
      frame = requestAnimationFrame(tick);
    };
    const update = () => {
      cancelAnimationFrame(frame);
      last = 0;
      const running = visible && !document.hidden;
      element.dataset.waveRunning = String(running);
      if (running) frame = requestAnimationFrame(tick);
    };
    const observer =
      typeof IntersectionObserver === "undefined"
        ? undefined
        : new IntersectionObserver((entries) => {
            visible = entries[0]?.isIntersecting ?? false;
            update();
          });
    observer?.observe(element);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [svg, enabled, refresh, cyclesPerSecond]);
  return refresh;
}

export function LinearWave({
  ratio,
  animated,
  options = {},
  segmentEdges,
}: {
  ratio?: number;
  animated: boolean;
  options?: ProgressWaveOptions;
  segmentEdges?: { first: boolean; last: boolean };
}) {
  const {
    waveLength = 60,
    waveHeight = 20,
    waveVelocity = 31,
    direction = "tail",
    waveThickness = 5,
    trackThickness = 20,
    incremental = true,
  } = options;
  const length = Number.isFinite(waveLength) ? Math.max(1, waveLength) : 60,
    thickness = Math.max(1, waveThickness),
    trackSize = Math.max(1, trackThickness);
  const height = Math.max(Math.max(0, waveHeight) + thickness, trackSize);
  const start = 0,
    center = height / 2;
  const svg = useRef<SVGSVGElement>(null),
    wave = useRef<SVGPathElement>(null),
    track = useRef<SVGPathElement>(null);
  const [width, setWidth] = useState(300);
  const amount = useCurveValue(ratio ?? 0.35);
  useLayoutEffect(() => {
    if (animated) amount.setTarget(ratio ?? 0.35);
    else amount.jump(ratio ?? 0.35);
  }, [ratio, amount, animated]);
  useLayoutEffect(() => {
    const element = svg.current;
    if (!element) return;
    const measure = () => {
      if (element.clientWidth > 0) setWidth(element.clientWidth);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const firstEdge = segmentEdges?.first, lastEdge = segmentEdges?.last;
  const draw = useCallback(
    (phase: number) => {
      const value = Math.min(1, Math.max(0, amount.get()));
      const end = start + Math.max(0, width) * value;
      const amplitude =
        waveLength <= 0
          ? 0
          : (Math.max(0, waveHeight) / 2) *
            Math.min(1, value / 0.1, (1 - value) / 0.1);
      wave.current?.setAttribute(
        "d",
        linearWave(start, end, phase, amplitude, center, length, incremental),
      );
      const trackStart = ratio === undefined || value === 0 ? 0 : Math.min(width, end + thickness / 2 + 4);
      const remaining = width - trackStart;
      const leftRadius = Math.min(remaining / 2, firstEdge === false ? 2 : trackSize / 2);
      const rightRadius = Math.min(remaining / 2, lastEdge === false ? 2 : trackSize / 2);
      const top = center - trackSize / 2, bottom = center + trackSize / 2;
      track.current?.setAttribute('d', remaining <= 0 ? '' :
        `M${trackStart + leftRadius},${top}H${width - rightRadius}Q${width},${top} ${width},${top + rightRadius}V${bottom - rightRadius}Q${width},${bottom} ${width - rightRadius},${bottom}H${trackStart + leftRadius}Q${trackStart},${bottom} ${trackStart},${bottom - leftRadius}V${top + leftRadius}Q${trackStart},${top} ${trackStart + leftRadius},${top}Z`);

    },
    [
      width,
      amount,
      ratio,
      start,
      thickness,
      waveLength,
      waveHeight,
      center,
      length,
      incremental,
      trackSize,
      firstEdge,
      lastEdge,
    ],
  );
  const refresh = useWaveMotion(
    svg,
    draw,
    animated &&
      waveLength > 0 &&
      waveHeight > 0 &&
      waveVelocity !== 0 &&
      (ratio === undefined || (ratio > 0 && ratio < 1)),
    (Math.max(0, waveVelocity) / length) * (direction === "tail" ? -1 : 1),
  );
  useMotionValueEvent(amount, "change", refresh);
  return (
    <svg
      ref={svg}
      className="mf-linear-wave"
      viewBox={`0 0 ${width} ${height}`}
      style={{ height }}
      preserveAspectRatio="none"
      aria-hidden="true"
      data-wave-animated={animated}
      data-wave-direction={direction}
    >
      <path
        ref={track}
        className="mf-wave-track"
        style={{ fill: 'var(--mf-secondary-container, var(--mf-primary-container))', stroke: 'none' }}
      />
      <g className={ratio === undefined ? "mf-wave-travel" : undefined}>
        <path
          ref={wave}
          className="mf-progress-fill mf-progress-wave"
          style={{ strokeWidth: thickness }}
          d={linearWave(
            start,
            start + width * (ratio ?? 0.35),
            0,
            Math.max(0, waveHeight) / 2,
            center,
            length,
            incremental,
          )}
        />
      </g>

    </svg>
  );
}
export function CircularWave({animated}:{animated:boolean}) {
 const svg=useRef<SVGSVGElement>(null),wave=useRef<SVGPathElement>(null);
 const draw=useCallback((phase:number)=>{wave.current?.setAttribute('d',circularWave(phase));},[]);
 useWaveMotion(svg,draw,animated);
 return <svg ref={svg} className="mf-circular-wave" viewBox="0 0 40 40" aria-hidden="true" data-wave-animated={animated}><circle className="mf-wave-track" cx={20} cy={20} r={15} fill="none" strokeWidth={3}/><path ref={wave} className="mf-spinner-wave" d={circularWave(0)} fill="none" strokeWidth={3} strokeLinecap="round"/></svg>;
}
