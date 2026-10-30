import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useMotionValueEvent, useSpring } from "motion/react";

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
  const points: string[] = [];
  for (let i = 0; i <= 180; i++) {
    const angle = (i / 180) * tau - Math.PI / 2;
    const radius = 15 + 1.5 * Math.sin(angle * 6 - phase * tau);
    points.push(
      `${(20 + Math.cos(angle) * radius).toFixed(3)},${(20 + Math.sin(angle) * radius).toFixed(3)}`,
    );
  }
  return `M${points.join("L")}Z`;
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
}: {
  ratio?: number;
  animated: boolean;
  options?: ProgressWaveOptions;
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
  const start = thickness / 2,
    center = height / 2;
  const svg = useRef<SVGSVGElement>(null),
    wave = useRef<SVGPathElement>(null),
    track = useRef<SVGLineElement>(null);
  const [width, setWidth] = useState(300);
  const amount = useSpring(ratio ?? 0.35, {
    stiffness: 460,
    damping: 40,
    mass: 1,
  });
  useLayoutEffect(() => {
    if (animated) amount.set(ratio ?? 0.35);
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
  const draw = useCallback(
    (phase: number) => {
      const value = Math.min(1, Math.max(0, amount.get()));
      const end = start + Math.max(0, width - thickness) * value;
      const amplitude =
        waveLength <= 0
          ? 0
          : (Math.max(0, waveHeight) / 2) *
            Math.min(1, value / 0.1, (1 - value) / 0.1);
      wave.current?.setAttribute(
        "d",
        linearWave(start, end, phase, amplitude, center, length, incremental),
      );
      const trackEnd = width - trackSize / 2;
      const trackStart =
        ratio === undefined
          ? trackSize / 2
          : end + thickness / 2 + 4 + trackSize / 2;
      track.current?.setAttribute("x1", String(Math.min(trackEnd, trackStart)));
      track.current?.setAttribute(
        "opacity",
        trackStart >= trackEnd ? "0" : "1",
      );
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
      <line
        ref={track}
        className="mf-wave-track"
        x1={trackSize / 2}
        x2={width - trackSize / 2}
        y1={center}
        y2={center}
        style={{ strokeWidth: trackSize }}
      />
      <g className={ratio === undefined ? "mf-wave-travel" : undefined}>
        <path
          ref={wave}
          className="mf-progress-fill mf-progress-wave"
          style={{ strokeWidth: thickness }}
          d={linearWave(
            start,
            start + (width - thickness) * (ratio ?? 0.35),
            0,
            Math.max(0, waveHeight) / 2,
            center,
            length,
            incremental,
          )}
        />
      </g>
      {ratio !== undefined && ratio < 1 && (
        <circle
          className="mf-wave-stop"
          cx={width - trackSize / 2}
          cy={center}
          r={thickness / 2}
        />
      )}
    </svg>
  );
}
export function CircularWave({ animated }: { animated: boolean }) {
  const svg = useRef<SVGSVGElement>(null),
    wave = useRef<SVGPathElement>(null),
    track = useRef<SVGPathElement>(null);
  const draw = useCallback((phase: number) => {
    const path = circularWave(phase);
    wave.current?.setAttribute("d", path);
    track.current?.setAttribute("d", path);
  }, []);
  useWaveMotion(svg, draw, animated);
  return (
    <svg
      ref={svg}
      className="mf-circular-wave"
      viewBox="0 0 40 40"
      aria-hidden="true"
      data-wave-animated={animated}
    >
      <path
        ref={track}
        className="mf-wave-track"
        d={circularWave(0)}
        pathLength="100"
        strokeDasharray="24 76"
        strokeDashoffset="-76"
      />
      <path
        ref={wave}
        className="mf-spinner-wave"
        d={circularWave(0)}
        pathLength="100"
        strokeDasharray="64 36"
      />
    </svg>
  );
}
