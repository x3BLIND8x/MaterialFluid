import { useEffect, useRef, useState } from "react";
import { Button, ButtonGroup, Slider, ToggleGroup } from "../../kit/controls";
import { useMaterialFluid } from "../../kit/provider";
import { foundationMotion, foundationMotionCurve, type MotionPurpose } from "../../kit/foundations/motion";
import "./styles.css";

const purposes = Object.keys(foundationMotion) as MotionPurpose[];
const curves = Object.fromEntries(purposes.map(name => [name, foundationMotionCurve(name)])) as Record<MotionPurpose, ReturnType<typeof foundationMotionCurve>>;
const duration = Math.ceil(Math.max(...purposes.map(name => curves[name].duration)));
export function FoundationMotionOverview() {
  const env = useMaterialFluid(), fa = env.locale === "fa";
  const [playing, setPlaying] = useState(false), [time, setTime] = useState(0), [speed, setSpeed] = useState("1"), [run, setRun] = useState(0);
  const clock = useRef(0), epoch = useRef(0);
  const reduced = env.reducedMotion || env.motion !== "expressive";
  useEffect(() => {
    if (!playing) return;
    if (reduced) return;
    epoch.current = performance.now();
    const start = clock.current;
    let frame = 0;
    const tick = (now: number) => {
      const next = Math.min(duration, start + (now - epoch.current) * Number(speed));
      clock.current = next; setTime(next);
      if (next < duration) frame = requestAnimationFrame(tick); else setPlaying(false);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, reduced, run]);
  useEffect(() => {
    if (!reduced) return;
    // The preference can change in the middle of playback.
    const frame = requestAnimationFrame(() => { clock.current = duration; setTime(duration); setPlaying(false); });
    return () => cancelAnimationFrame(frame);
  }, [reduced]);
  const play = (restart: boolean) => {
    if (reduced) { clock.current = duration; setTime(duration); setPlaying(false); return; }
    if (restart || clock.current >= duration) { clock.current = 0; setTime(0); }
    if (playing && restart) epoch.current = performance.now();
    setRun(value => value + 1);
    setPlaying(true);
  };
  return <section className="foundation-motion-overview" aria-label={fa ? "منحنی‌های حرکت فعلی" : "Authored motion curves"}>
    <h2>{fa ? "حرکت با منحنی‌های شما" : "Motion with your curves"}</h2>
    <p>{fa ? "زمان مشترک، نشانگر منحنی و موقعیت نمونه را هم‌زمان حرکت می‌دهد. فنرهای اصلی شما حفظ شده‌اند." : "One clock drives the curve playheads and sample positions together. Your spring profiles use a finite ease-out finish."}</p>
    <div className="foundation-timeline">
      <div className="section-heading"><ButtonGroup label={fa ? "کنترل پخش" : "Playback controls"} size="sm"><Button onClick={() => playing ? setPlaying(false) : play(false)}>{playing ? (fa ? "مکث" : "Pause") : (fa ? "پخش" : "Play")}</Button><Button variant="outlined" onClick={() => play(true)}>{fa ? "اجرای دوباره" : "Replay curves"}</Button></ButtonGroup><output className="foundation-timecode" aria-live="off" dir="ltr">{Math.round(time)} / {duration} ms</output></div>
      <Slider label={fa ? "موقعیت پخش" : "Playback position"} min={0} max={duration} step={1} showValue={false} value={[Math.round(time)]} aria-valuetext={`${Math.round(time)} milliseconds`} onValueChange={([next]) => { setPlaying(false); clock.current = next; setTime(next); }}/>
      <ToggleGroup label={fa ? "سرعت پخش" : "Playback speed"} value={speed} onValueChange={setSpeed} options={[{value:"0.5",label:"0.5×"},{value:"1",label:"1×"},{value:"2",label:"2×"}]} size="sm"/>
      {reduced && <p>{fa ? "کاهش حرکت یا حالت کمینه روشن است؛ نشانگر مستقیم به پایان می‌رود." : "Reduced motion or Minimal mode is on; playback goes directly to the endpoint."}</p>}
    </div>
    <div className="foundation-motion-roles">{purposes.map(purpose => {
      const curve = curves[purpose], settings = foundationMotion[purpose];
      const local = Math.min(time, curve.duration), progress = local / curve.duration;
      const value = curve.at(local);
      const path = curve.points.map(([x, y], index) => `${index ? "L" : "M"}${x * 300},${112 - y * 80}`).join(" ");
      return <div className="foundation-motion-role" key={purpose}><div className="section-heading"><h3>{purpose}</h3><output className="foundation-curve-time" aria-live="off" dir="ltr">{Math.round(local)} ms</output></div><svg viewBox="-16 -24 332 188" style={{ direction: "ltr" }} role="img" aria-label={`${purpose} spring curve, ${Math.round(local)} of ${Math.round(curve.duration)} milliseconds`}><path className="curve-axis" d="M0 112H300M0 32H300"/><path className="curve-path" d={path}/><line className="curve-playhead" x1={progress * 300} x2={progress * 300} y1="0" y2="125"/><circle className="curve-cursor" cx={progress * 300} cy={112 - value * 80} r="4"/>{[0,.5,1].map(fraction => <text key={fraction} x={fraction * 300} y="149" textAnchor={fraction === 0 ? "start" : fraction === 1 ? "end" : "middle"}>{Math.round(curve.duration * fraction)} ms</text>)}</svg><div className="foundation-motion-track foundation-curve-track" aria-hidden="true"><span className="foundation-motion-dot" style={{ insetInlineStart: `calc(8px + ${value * 100}% - ${value * 38}px)` }}/></div><code dir="ltr">{settings.stiffness} · {settings.damping} · {settings.mass}</code><span className="mf-muted"> {fa ? "سختی · میرایی · جرم" : "stiffness · damping · mass"}</span></div>;
    })}</div>
  </section>;
}
