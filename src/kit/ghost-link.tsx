import { forwardRef, useRef, useState, useEffect, type AnchorHTMLAttributes } from "react";
import { useMotionValue, useMotionValueEvent, useSpring, useTransform } from "motion/react";
import { useAppearanceProps, type AppearanceProps } from "./appearance";
import { useMaterialFluid } from "./provider";
import { ButtonRipple } from "./button-ripple";
import { cx, setRef } from "./utils";

/** A real link with the same press, radius, and ripple vocabulary as Ghost Button. */
export const GhostLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & AppearanceProps>(function GhostLink(rawProps, ref) {
  const { className, children, ...props } = useAppearanceProps({ ...rawProps, variant: "ghost" });
  const { motion: mode, reducedMotion, buttonMotion } = useMaterialFluid();
  const expressive = mode === "expressive" && !reducedMotion;
  const node = useRef<HTMLAnchorElement | null>(null);
  const [held, setHeld] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; diameter: number; released: boolean }[]>([]);
  const serial = useRef(0);
  const envelopes = useRef(new Map<number, number>());
  const rippleDepth = useMotionValue(0);
  const restRadius = useMotionValue(24);
  const press = useSpring(0, { stiffness: buttonMotion.stiffness, damping: buttonMotion.damping, mass: buttonMotion.mass });
  useEffect(() => { if (expressive) press.set(held ? 1 : 0); else press.jump(0); }, [held, expressive, press]);
  const radius = useTransform(() => Math.max(6, restRadius.get() * (1 - (expressive ? press.get() : reducedMotion ? 0 : rippleDepth.get()) * buttonMotion.pressDepth * buttonMotion.radiusDepthRatio / 100)));
  useMotionValueEvent(radius, "change", value => { if (node.current) node.current.style.borderRadius = `${value}px`; });
  useMotionValueEvent(press, "change", value => { if (node.current) node.current.style.transform = `scale(${1 - value * buttonMotion.pressDepth / 100})`; });
  const start = (point?: { clientX: number; clientY: number }) => {
    const element = node.current;
    if (!element) return;
    const box = element.getBoundingClientRect();
    const x = point ? point.clientX - box.left : box.width / 2;
    const y = point ? point.clientY - box.top : box.height / 2;
    restRadius.set((element.offsetHeight || box.height || 48) / 2);
    setHeld(true);
    setRipples(current => [...current, { id: ++serial.current, x, y, diameter: 2 * Math.hypot(Math.max(x, box.width - x), Math.max(y, box.height - y)), released: false }]);
  };
  const release = () => { setHeld(false); setRipples(current => current.map(ripple => ({ ...ripple, released: true }))); };
  const update = (id: number, value: number) => { envelopes.current.set(id, value); rippleDepth.set(Math.max(0, ...envelopes.current.values())); };
  return <a {...props} ref={element => { node.current = element; setRef(ref, element); }}
    className={cx("mf-button mf-button--ghost mf-ghost-link", className)}
    style={{ ...props.style, borderRadius: 24 }}
    onPointerDown={event => { props.onPointerDown?.(event); if (!event.defaultPrevented && event.button === 0) start(event); }}
    onPointerUp={event => { props.onPointerUp?.(event); release(); }}
    onPointerCancel={event => { props.onPointerCancel?.(event); release(); }}
    onPointerLeave={event => { props.onPointerLeave?.(event); release(); }}
    onKeyDown={event => { props.onKeyDown?.(event); if (!event.defaultPrevented && event.key === "Enter" && !event.repeat) start(); }}
    onKeyUp={event => { props.onKeyUp?.(event); if (event.key === "Enter") release(); }}
    onBlur={event => { props.onBlur?.(event); release(); }}>
    {ripples.map(ripple => <ButtonRipple key={ripple.id} {...ripple} animated={!reducedMotion}
      options={{ duration: buttonMotion.rippleDuration / 1000, opacity: buttonMotion.rippleOpacity / 100, easeOutStrength: buttonMotion.rippleFastStart / 100, releaseSpeed: buttonMotion.rippleReleaseSpeed }}
      onProgress={value => update(ripple.id, value)} onFinished={() => { envelopes.current.delete(ripple.id); rippleDepth.set(Math.max(0, ...envelopes.current.values())); setRipples(current => current.filter(item => item.id !== ripple.id)); }} />)}
    <span className="mf-ghost-link-label">{children}</span>
  </a>;
});
