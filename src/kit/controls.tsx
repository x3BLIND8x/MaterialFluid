import { ButtonRipple } from "./button-ripple";
import {
  useAppearanceProps,
  useComponentAppearance,
  ComponentAppearanceProvider,
  type AppearanceProps,
  type ComponentVariant,
} from "./appearance";
import {
  createContext,
  forwardRef,
  useContext,
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  useCallback,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "motion/react";
import * as Check from "@radix-ui/react-checkbox";
import * as Radio from "@radix-ui/react-radio-group";
import * as Slide from "@radix-ui/react-slider";
import { useMaterialFluid } from "./provider";
import { cx, useControllable, setRef } from "./utils";
import { AnimatedIcon, type AnimatedIconProps } from "./icons";
import { RollingNumber } from "./rolling-number";
import { SwitchIcon, type SwitchStateIcon } from "./switch-icon";
import { useButtonGeometry } from "./button-geometry";

const ButtonPressProgressContext = createContext<MotionValue<number> | null>(
  null,
);

/** Lets nested visual affordances follow the physical press depth of their Button. */
export const useButtonPressProgress = () => useContext(ButtonPressProgressContext);
export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<AppearanceProps, "variant"> {
  variant?: ComponentVariant | "filled" | "tonal" | "outlined" | "text";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  success?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  colorMotion?: { duration?: number } | false;
  sizeMotion?: { stiffness?: number; damping?: number; mass?: number };
  pressMotion?: {
    scale?: number;
    stiffness?: number;
    damping?: number;
    mass?: number;
    radiusDepthRatio?: number;
  };
  ripple?:
    | {
        duration?: number;
        opacity?: number;
        easeOutStrength?: number;
        releaseSpeed?: number;
      }
    | false;
}
// Keep the same compositing surface at rest and during a press. Dropping to
// transform:none repaints fractional-height buttons with different edge rounding.
function ButtonColorReveal({
  from,
  duration,
  strength,
  minimal,
  onFinished,
}: {
  from: string;
  duration: number;
  strength: number;
  minimal: boolean;
  onFinished: () => void;
}) {
  const element = useRef<HTMLSpanElement>(null);
  const radius = useMotionValue(-1);
  const mask = useTransform(
    radius,
    (value) =>
      `radial-gradient(circle at 50% 50%, transparent ${value}px, #000 ${value + 1}px)`,
  );
  const finished = useRef(onFinished);
  useLayoutEffect(() => {
    finished.current = onFinished;
  });
  useEffect(() => {
    if (minimal) return;
    const el = element.current;
    const extent = el ? Math.hypot(el.offsetWidth, el.offsetHeight) / 2 : 500;
    const animation = animate(radius, extent + 1, {
      duration,
      ease: [1 - Math.min(0.95, Math.max(0, strength)), 1, 0.3, 1],
      onComplete: () => finished.current(),
    });
    return () => animation.stop();
  }, [radius, duration, strength, minimal]);
  return (
    <motion.span
      ref={element}
      className="mf-button-color-reveal"
      aria-hidden="true"
      style={{
        background: from,
        ...(minimal ? {} : { maskImage: mask, WebkitMaskImage: mask }),
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: minimal ? 0 : 1 }}
      transition={{ duration: Math.min(duration, 0.16) }}
      onAnimationComplete={minimal ? () => finished.current() : undefined}
    />
  );
}
function buttonTransform(_values: unknown, transform: string) {
  return transform === "none" ? "translateZ(0)" : `translateZ(0) ${transform}`;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(rawProps, ref) {
    const {
      variant = "filled",
      size = "md",
      loading = false,
      success = false,
      leading,
      trailing,
      children,
      className,
      pressMotion,
      colorMotion,
      sizeMotion,
      ripple: rippleOptions,
      ...props
    } = useAppearanceProps(rawProps, {
      preserveVariant: true,
      preserveSize: true,
    });

    const { motion: mode, reducedMotion, buttonMotion } = useMaterialFluid();
    const effectivePressMotion = pressMotion ?? {
      scale: 1 - buttonMotion.pressDepth / 100,
      stiffness: buttonMotion.stiffness,
      damping: buttonMotion.damping,
      mass: buttonMotion.mass,
      radiusDepthRatio: buttonMotion.radiusDepthRatio,
    };
    const effectiveSizeMotion = sizeMotion ?? {
      damping: buttonMotion.sizeDamping,
    };
    const effectiveColorMotion = colorMotion ?? {
      duration: buttonMotion.colorDuration / 1000,
    };
    const effectiveRipple = rippleOptions ?? {
      duration: buttonMotion.rippleDuration / 1000,
      opacity: buttonMotion.rippleOpacity / 100,
      easeOutStrength: buttonMotion.rippleFastStart / 100,
      releaseSpeed: buttonMotion.rippleReleaseSpeed,
    };
    const expressive = mode === "expressive" && !reducedMotion;
    const node = useRef<HTMLButtonElement | null>(null);
    const geometry = useButtonGeometry(node, {
      expressive,
      stiffness: effectiveSizeMotion?.stiffness ?? effectivePressMotion?.stiffness,
      damping: effectiveSizeMotion?.damping ?? 40,
      mass: effectiveSizeMotion?.mass ?? effectivePressMotion?.mass,
      className,
      style: props.style,
      children,
      leading,
      trailing,
      size,
    });
    const previousColor = useRef<string | undefined>(undefined);
    const colorId = useRef(0);
    const [colorReveal, setColorReveal] = useState<{
      id: number;
      from: string;
    }>();
    const captureColor = useCallback(() => {
      if (!node.current) return;
      const button = node.current;
      if (!button.parentElement) return;
      // Read the authored color independently of hover/focus/press pseudo states.
      const probe = button.cloneNode(false) as HTMLButtonElement;
      probe.removeAttribute("id");
      probe.inert = true;
      Object.assign(probe.style, {
        position: "absolute",
        visibility: "hidden",
        pointerEvents: "none",
        transition: "none",
      });
      button.parentElement.append(probe);
      const next = getComputedStyle(probe).backgroundColor;
      probe.remove();
      const previous = previousColor.current;
      if (next === previous) return;
      previousColor.current = next;
      if (previous && !reducedMotion && effectiveColorMotion !== false) {
        setColorReveal({ id: ++colorId.current, from: previous });
      } else {
        setColorReveal(undefined);
      }
    }, [reducedMotion, effectiveColorMotion]);
    useLayoutEffect(captureColor);
    useEffect(() => {
      const root = node.current?.closest(".mf-root");
      if (!root) return;
      const observer = new MutationObserver(captureColor);
      observer.observe(root, {
        attributes: true,
        attributeFilter: ["style", "data-theme"],
      });
      return () => observer.disconnect();
    }, [captureColor]);
    const restRadius = useMotionValue(999);
    const [radiusMeasured, setRadiusMeasured] = useState(false);
    const pressScale = useMotionValue(1);
    const pressProgress = useTransform(pressScale, (value) => {
      const pressedScale = effectivePressMotion?.scale ?? 0.94;
      return Math.max(
        0,
        Math.min(1, (1 - value) / Math.max(0.001, 1 - pressedScale)),
      );
    });
    const rippleProgress = useMotionValue(0);
    const rippleLevels = useRef(new Map<number, number>());
    const updateRippleProgress = useCallback(
      (id: number, value: number) => {
        if (value > 0) rippleLevels.current.set(id, value);
        else rippleLevels.current.delete(id);
        rippleProgress.set(Math.max(0, ...rippleLevels.current.values()));
      },
      [rippleProgress],
    );
    const spaceHeld = useRef(false);
    const linkedRadius = useTransform(() => {
      const radius = restRadius.get();
      const depth = reducedMotion
        ? 0
        : mode === "minimal"
          ? (1 - (effectivePressMotion?.scale ?? 0.94)) * rippleProgress.get()
          : 1 - pressScale.get();
      const reduction = Math.max(
        0,
        Math.min(1, depth * (effectivePressMotion?.radiusDepthRatio ?? 5)),
      );
      return `${Math.max(Math.min(6, radius), radius * (1 - reduction))}px`;
    });
    const [pressed, setPressed] = useState(false);
    const successRippleEnabled = useRef(effectiveRipple !== false);
    successRippleEnabled.current = effectiveRipple !== false;
    useEffect(() => {
      const targetScale =
        expressive && pressed ? (effectivePressMotion?.scale ?? 0.94) : 1;
      const animation = animate(
        pressScale,
        targetScale,
        expressive
          ? {
              type: "spring",
              stiffness: effectivePressMotion?.stiffness ?? 460,
              damping: effectivePressMotion?.damping ?? 12,
              mass: effectivePressMotion?.mass ?? 1,
              restDelta: 0.0001,
              restSpeed: 0.001,
            }
          : { duration: 0 },
      );
      return () => animation.stop();
    }, [
      pressScale,
      expressive,
      pressed,
      effectivePressMotion?.scale,
      effectivePressMotion?.stiffness,
      effectivePressMotion?.damping,
      effectivePressMotion?.mass,
    ]);
    const rippleId = useRef(0);
    const [ripples, setRipples] = useState<
      {
        id: number;
        x: number;
        y: number;
        diameter: number;
        released: boolean;
      }[]
    >([]);
    useEffect(() => {
      if (!success || loading) return;
      const button = node.current;
      if (!button) return;
      setPressed(true);
      const releaseTimer = window.setTimeout(() => setPressed(false), 80);
      if (successRippleEnabled.current) {
        const x = button.offsetWidth / 2;
        const y = button.offsetHeight / 2;
        const diameter =
          2 *
          Math.hypot(
            Math.max(x, button.offsetWidth - x),
            Math.max(y, button.offsetHeight - y),
          );
        setRipples((current) => [
          ...current,
          { id: ++rippleId.current, x, y, diameter, released: true },
        ]);
      }
      return () => window.clearTimeout(releaseTimer);
    }, [success, loading]);
    useLayoutEffect(() => {
      const button = node.current;
      if (!button) return;
      const computed = getComputedStyle(button);
      const authoredRadius =
        parseFloat(computed.getPropertyValue("--mf-button-rest-radius")) ||
        parseFloat(computed.borderTopLeftRadius) || 999;
      const measure = () =>
        restRadius.set(
          Math.min(
            authoredRadius,
            button.offsetHeight / 2,
            button.offsetWidth / 2,
          ),
        );
      measure();
      linkedRadius.set(`${restRadius.get()}px`);
      setRadiusMeasured(true);
      if (typeof ResizeObserver === "undefined") {
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
      }
      const observer = new ResizeObserver(measure);
      observer.observe(button);
      return () => observer.disconnect();
    }, [restRadius, linkedRadius]);
    const release = () => {
      setPressed(false);
      setRipples((current) =>
        current.map((ripple) =>
          ripple.released ? ripple : { ...ripple, released: true },
        ),
      );
    };
    const keyboardPointer = (type: "down" | "up" | "cancel") => {
      node.current?.dispatchEvent(
        new PointerEvent(`pointer${type}`, {
          bubbles: true,
          isPrimary: true,
          pointerId: -1,
        }),
      );
    };
    return (
      <motion.button
        {...props}
        ref={(element) => {
          node.current = element;
          setRef(ref, element);
        }}
        type={props.type ?? "button"}
        disabled={props.disabled || loading}
        aria-busy={loading || undefined}
        data-success={success || undefined}
        className={cx(
          "mf-button",
          `mf-button--${variant}`,
          `mf-size--${size}`,
          className,
        )}
        transformTemplate={expressive ? buttonTransform : undefined}
        data-mf-sized={geometry.ready || undefined}
        style={{
          ...props.style,
          ...geometry.style,
          scale: pressScale,
          transformOrigin: "center",
          borderRadius: radiusMeasured
            ? linkedRadius
            : props.style?.borderRadius,
        }}
        onTapStart={(event) => {
          if (props.disabled || loading) return;
          setPressed(true);
          if (!node.current) return;
          const box = node.current.getBoundingClientRect();
          const trustedPointer = event.isTrusted && "clientX" in event;
          const x = trustedPointer
            ? ((event.clientX - box.left) * node.current.offsetWidth) /
              box.width
            : node.current.offsetWidth / 2;
          const y =
            trustedPointer && "clientY" in event
              ? ((event.clientY - box.top) * node.current.offsetHeight) /
                box.height
              : node.current.offsetHeight / 2;
          if (effectiveRipple === false) return;
          const diameter =
            2 *
            Math.hypot(
              Math.max(x, node.current.offsetWidth - x),
              Math.max(y, node.current.offsetHeight - y),
            );
          setRipples((current) => [
            ...current,
            {
              id: ++rippleId.current,
              x,
              y,
              diameter,
              released: false,
            },
          ]);
        }}
        onTap={release}
        onTapCancel={release}
        onKeyDown={(event) => {
          props.onKeyDown?.(event);
          if ((event.key === "Enter" || event.key === " ") && event.repeat)
            event.preventDefault();
          if (
            event.key === " " &&
            !event.repeat &&
            !event.defaultPrevented &&
            !props.disabled &&
            !loading
          ) {
            spaceHeld.current = true;
            keyboardPointer("down");
          }
        }}
        onKeyUp={(event) => {
          props.onKeyUp?.(event);
          if (event.key === " " && spaceHeld.current) {
            spaceHeld.current = false;
            keyboardPointer("up");
          }
        }}
        onBlur={(event) => {
          props.onBlur?.(event);
          if (spaceHeld.current) {
            spaceHeld.current = false;
            keyboardPointer("cancel");
          }
          release();
        }}
        onAnimationStart={undefined}
        onDrag={undefined}
        onDragStart={undefined}
        onDragEnd={undefined}
      >
        <ButtonPressProgressContext.Provider value={pressProgress}>
        {colorReveal && (
          <ButtonColorReveal
            key={colorReveal.id}
            from={colorReveal.from}
            duration={effectiveColorMotion ? (effectiveColorMotion.duration ?? 0.55) : 0.55}
            strength={
              effectiveRipple ? (effectiveRipple.easeOutStrength ?? 0.85) : 0.85
            }
            minimal={!expressive}
            onFinished={() =>
              setColorReveal((current) =>
                current?.id === colorReveal.id ? undefined : current,
              )
            }
          />
        )}
        {ripples.map((ripple) => (
          <ButtonRipple
            key={ripple.id}
            {...ripple}
            animated={!reducedMotion}
            onProgress={(value) => updateRippleProgress(ripple.id, value)}
            options={effectiveRipple || undefined}
            onFinished={() =>
              setRipples((current) =>
                current.filter((item) => item.id !== ripple.id),
              )
            }
          />
        ))}
        {loading ? (
          <span className="mf-button-loader" aria-hidden="true" />
        ) : (
          leading
        )}
        {children}
        {trailing}
        </ButtonPressProgressContext.Provider>
      </motion.button>
    );
  },
);
export interface IconButtonProps extends Omit<
  ButtonProps,
  "leading" | "trailing"
> {
  label: string;
}
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ label, className, variant, ...props }, ref) {
    const defaults = useComponentAppearance();
    return (
      <Button
        {...props}
        ref={ref}
        variant={variant ?? defaults.variant ?? "ghost"}
        aria-label={label}
        className={cx("mf-icon-button", className)}
      />
    );
  },
);
export const FAB = forwardRef<HTMLButtonElement, ButtonProps>(function FAB(
  { className, ...props },
  ref,
) {
  const defaults = useComponentAppearance();
  return (
    <Button
      {...props}
      ref={ref}
      className={cx("mf-fab", className)}
      size={props.size ?? defaults.size ?? "lg"}
    />
  );
});
export interface ToggleProps extends Omit<ButtonProps, "variant"> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  function Toggle(
    {
      pressed,
      defaultPressed = false,
      onPressedChange,
      className,
      onClick,
      ...props
    },
    ref,
  ) {
    const [active, set] = useControllable(
      pressed,
      defaultPressed,
      onPressedChange,
    );
    return (
      <Button
        {...props}
        ref={ref}
        aria-pressed={active}
        variant={active ? "primary" : "outline"}
        className={cx("mf-toggle", className)}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) set(!active);
        }}
      />
    );
  },
);
/** A labelled collection of related actions; each button retains native keyboard behavior. */
export interface ButtonGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "color">, AppearanceProps {
  label: string;
}
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(rawProps, ref) {
  const defaults = useComponentAppearance();
  const { label, className, children, ...props } = useAppearanceProps(rawProps);
  return <div {...props} ref={ref} role="group" aria-label={label} className={cx("mf-button-group", className)}>
    <ComponentAppearanceProvider variant={rawProps.variant ?? "ghost"} size={rawProps.size ?? defaults.size}>{children}</ComponentAppearanceProvider>
  </div>;
});

export interface ChoiceOption {
  value: string;
  label: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
}
export interface ToggleGroupProps extends Omit<AppearanceProps, "variant"> {
  iconOnly?: boolean;
  options: ChoiceOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label: string;
  className?: string;
}
export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  function ToggleGroup(rawProps, ref) {
    const {
      iconOnly = false,
      options,
      value,
      defaultValue = "",
      onValueChange,
      label,
      className,
    } = useAppearanceProps({
      ...rawProps,
      variant: "primary",
    });

    const [selected, set] = useControllable(value, defaultValue, onValueChange);
    const { motion: mode, reducedMotion, dir } = useMaterialFluid();
    const [preview, setPreview] = useState<string | null>(null);
    const [held, setHeld] = useState(false);
    const pointer = useRef<{ id: number; startX: number; startY: number } | null>(null);
    const suppressClickUntil = useRef(0);
    const displayed = preview ?? selected;
    const optionAt = (group: HTMLDivElement, x: number, y: number) =>
      Array.from(group.querySelectorAll<HTMLButtonElement>(".mf-segment")).find(button => {
        const bounds = button.getBoundingClientRect();
        return !button.disabled && x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
      })?.dataset.value;
    const finish = (group: HTMLDivElement, cancel: boolean, x?: number, y?: number) => {
      const active = pointer.current;
      if (!active) return;
      pointer.current = null;
      if (!cancel && x !== undefined && y !== undefined) {
        const next = optionAt(group, x, y);
        if (next !== undefined) set(next);
      }
      suppressClickUntil.current = performance.now() + 400;
      setPreview(null);
      setHeld(false);
      if (group.hasPointerCapture(active.id)) group.releasePointerCapture(active.id);
    };
    const groupId = useRef(`tg-${Math.random().toString(36).slice(2)}`);
    return (
      <motion.div
        ref={ref}
        role="group"
        aria-label={label}
        className={cx("mf-toggle-group", className)}
        onPointerDown={event => {
          if (!event.isPrimary || event.button !== 0) return;
          const next = optionAt(event.currentTarget, event.clientX, event.clientY);
          if (next === undefined) return;
          pointer.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
          setPreview(next);
          setHeld(true);
        }}
        onPointerMove={event => {
          const active = pointer.current;
          if (active?.id !== event.pointerId) return;
          if (event.pointerType === "touch" && Math.abs(event.clientY - active.startY) > Math.max(8, Math.abs(event.clientX - active.startX))) {
            finish(event.currentTarget, true);
            return;
          }
          const next = optionAt(event.currentTarget, event.clientX, event.clientY);
          if (next !== undefined) setPreview(next);
        }}
        onPointerUp={event => finish(event.currentTarget, false, event.clientX, event.clientY)}
        onPointerCancel={event => finish(event.currentTarget, true)}
        onLostPointerCapture={event => finish(event.currentTarget, true)}
        onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false); }}
      >
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            disabled={option.disabled}
            aria-pressed={displayed === option.value}
            aria-label={option.ariaLabel}
            title={iconOnly ? option.ariaLabel : undefined}
            data-icon-only={iconOnly || undefined}
            data-value={option.value}
            onClick={event => { if (event.detail === 0 || performance.now() >= suppressClickUntil.current) set(option.value); }}
            onKeyDown={event => { if (!event.repeat && (event.key === " " || event.key === "Enter")) setHeld(true); }}
            onKeyUp={event => { if (event.key === " " || event.key === "Enter") setHeld(false); }}
            className="mf-segment"
          >
            {displayed === option.value && (
              <motion.span
                className="mf-selection"
                aria-hidden="true"
                initial={false}
                animate={{
                  scaleX: held && mode === "expressive" && !reducedMotion ? 1.025 : 1,
                  scaleY: held && mode === "expressive" && !reducedMotion ? 1.05 : 1,
                }}
                style={{ transformOrigin: index === 0
                  ? `${dir === "rtl" ? "right" : "left"} center`
                  : index === options.length - 1
                    ? `${dir === "rtl" ? "left" : "right"} center`
                    : "center" }}
                transition={{ type: "spring", stiffness: 420, damping: 28, mass: .8 }}
                layoutId={
                  mode === "expressive" && !reducedMotion
                    ? groupId.current
                    : undefined
                }
              />
            )}
            <span>{option.label}</span>
          </button>
        ))}
      </motion.div>
    );
  },
);
/** Selection fill blends selected state and physical press depth, like Toggle. */
function ChoiceFill({ active, partial = false, radio = false, onReadyChange }: { active: boolean; partial?: boolean; radio?: boolean; onReadyChange?: (ready: boolean) => void }) {
  const element = useRef<Element | null>(null);
  const selected = useMotionValue(active ? 1 : 0);
  const pressed = useMotionValue(0);
  const { motion: mode, reducedMotion } = useMaterialFluid();
  const fluid = mode === "expressive" && !reducedMotion;
  const radius = useTransform([selected, pressed], ([value, depth]: number[]) =>
    Math.max(0, Math.min(75, 75 * (value * (1 - depth * .75) + (1 - value) * depth * .25))),
  );
  const clipPath = useTransform(radius, value => `circle(${value}% at 50% 50%)`);
  const dotRadius = useTransform(radius, value => value * 6 / 75);
  useMotionValueEvent(radius, "change", value => {
    onReadyChange?.(active && value >= Math.SQRT1_2 * 100);
  });
  useEffect(() => {
    if (!fluid || partial || (selected.get() === (active ? 1 : 0) && pressed.get() === 0)) {
      selected.set(active ? 1 : 0);
      onReadyChange?.(active);
      return;
    }
    onReadyChange?.(active && radius.get() >= Math.SQRT1_2 * 100);
    const animation = animate(selected, active ? 1 : 0, fluid && !partial
      ? { type: "spring", stiffness: 420, damping: 28, mass: .8 }
      : { duration: 0 });
    return () => animation.stop();
  }, [active, fluid, partial, selected, pressed, radius, onReadyChange]);
  useEffect(() => {
    const button = element.current?.closest<HTMLButtonElement>("button");
    if (!button) return;
    let animation: ReturnType<typeof animate> | undefined;
    pressed.set(0);
    const down = (event: Event) => {
      if (!fluid || button.disabled || partial) return;
      if (event instanceof KeyboardEvent && (event.repeat || ![" ", "Enter"].includes(event.key))) return;
      if (event instanceof PointerEvent && event.button !== 0) return;
      animation?.stop();
      animation = animate(pressed, 1, { type: "spring", stiffness: 420, damping: 28, mass: .8 });
    };
    const up = () => {
      animation?.stop();
      animation = animate(pressed, 0, { type: "spring", stiffness: 420, damping: 28, mass: .8 });
    };
    button.addEventListener("pointerdown", down);
    button.addEventListener("keydown", down);
    button.addEventListener("blur", up);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("keyup", up);
    return () => {
      animation?.stop();
      button.removeEventListener("pointerdown", down);
      button.removeEventListener("keydown", down);
      button.removeEventListener("blur", up);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("keyup", up);
    };
  }, [fluid, partial, pressed]);
  if (radio) return <svg ref={node => { element.current = node; }} className="mf-radio-artwork" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="mf-radio-ring" cx="12" cy="12" r="11" strokeWidth="2" />
    <motion.circle className="mf-radio-center" cx="12" cy="12" r={dotRadius} />
  </svg>;
  return <motion.span ref={node => { element.current = node; }} aria-hidden="true" className="mf-choice-fill" style={{ clipPath }} />;
}

export interface CheckboxProps
  extends
    Omit<Check.CheckboxProps, "checked" | "onCheckedChange">,
    Omit<AppearanceProps, "variant"> {
  label: ReactNode;
  checked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
}
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  function Checkbox(rawProps, ref) {
    const { label, className, checked, defaultChecked = false, onCheckedChange, ...props } = useAppearanceProps({ ...rawProps, variant: "outline" });
    const [current, setChecked] = useControllable<boolean | "indeterminate">(checked, defaultChecked, onCheckedChange);
    const [fillReady, setFillReady] = useState(current === true);
    const { motion: mode, reducedMotion } = useMaterialFluid();
    const animated = mode === "expressive" && !reducedMotion;

    return (
      <label className={cx("mf-choice", className)}>
        <Check.Root {...props} checked={current} onCheckedChange={setChecked} ref={ref} className="mf-checkbox">
          <ChoiceFill active={current === true} partial={current === "indeterminate"} onReadyChange={setFillReady} />
          <Check.Indicator forceMount className="mf-checkbox-mark" data-ready={current === "indeterminate" || (current === true && fillReady) ? "true" : undefined}>
            {current === true && fillReady && (
              <svg className="mf-checkbox-tick" data-icon-name="check" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <motion.path
                  d="M5 13l4 4L19 7"
                  fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  initial={animated ? { pathLength: 0, opacity: 0 } : false}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: animated ? .18 : 0, ease: "easeOut" }}
                />
              </svg>
            )}
            {current === "indeterminate" && (
              <svg className="mf-checkbox-minus" data-icon-name="minus" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M6 12h12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
          </Check.Indicator>
        </Check.Root>
        <span>{label}</span>
      </label>
    );
  },
);
export interface RadioGroupProps
  extends Radio.RadioGroupProps, Omit<AppearanceProps, "variant"> {
  options: ChoiceOption[];
  label: string;
}
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup(rawProps, ref) {
    const { options, label, className, value, defaultValue = "", onValueChange, ...props } =
      useAppearanceProps({ ...rawProps, variant: "outline" });
    const [selected, setSelected] = useControllable(value === null ? "" : value, defaultValue ?? "", onValueChange);
    const [preview, setPreview] = useState<string | null>(null);
    useEffect(() => {
      const reset = () => setPreview(null);
      window.addEventListener("pointerup", reset);
      window.addEventListener("pointercancel", reset);
      return () => { window.removeEventListener("pointerup", reset); window.removeEventListener("pointercancel", reset); };
    }, []);

    return (
      <Radio.Root
        {...props}
        orientation={props.orientation ?? "horizontal"}
        value={selected}
        onValueChange={setSelected}
        ref={ref}
        aria-label={label}
        className={cx("mf-radio-group", className)}
      >
        {options.map((o) => (
          <label key={o.value} className="mf-choice">
            <Radio.Item
              className="mf-radio"
              value={o.value}
              disabled={o.disabled}
              onPointerDown={event => { if (event.button === 0 && !o.disabled && !props.disabled) setPreview(o.value); }}
              onPointerUp={event => { if (event.button === 0 && preview === o.value) { setSelected(o.value); setPreview(null); } }}
              onPointerCancel={() => setPreview(null)}
            >
              <Radio.Indicator forceMount className="mf-radio-dot"><ChoiceFill radio active={(preview ?? selected) === o.value} /></Radio.Indicator>
            </Radio.Item>
            <span>{o.label}</span>
          </label>
        ))}
      </Radio.Root>
    );
  },
);
export interface SwitchProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value">,
    Omit<AppearanceProps, "variant"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (value: boolean) => void;
  label: ReactNode;
  icon?: "wifi" | "bluetooth" | SwitchStateIcon;
  languageLabels?: { off: string; on: string };
  iconMotion?: Pick<
    AnimatedIconProps,
    "duration" | "stagger" | "slashDelay" | "strokeWidth" | "animated"
  >;
  name?: string;
  value?: string;
}
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch(rawProps, ref) {
    const defaults = useComponentAppearance();
    const {
      checked,
      defaultChecked = false,
      onCheckedChange,
      label,
      size,
      icon,
      languageLabels,
      iconMotion,
      name,
      value = "on",
      className,
      disabled,
      onClick,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      ...props
    } = useAppearanceProps({ ...rawProps, variant: "primary", size: rawProps.size ?? defaults.size ?? "md" }, { preserveSize: true });

    const [active, set] = useControllable(
      checked,
      defaultChecked,
      onCheckedChange,
    );
    const travel = size === "sm" ? 16 : size === "lg" ? 22 : 20;
    const { dir, motion: mode, reducedMotion } = useMaterialFluid();
    const pointer = useRef<{
      id: number;
      start: number;
      last: number;
      moved: boolean;
      base: number;
    } | null>(null);
    const suppressClick = useRef(false);
    const [dragPosition, setDragPosition] = useState<number | null>(null);
    const [pressing, setPressing] = useState(false);
    const position = (state: NonNullable<typeof pointer.current>) =>
      Math.max(
        0,
        Math.min(
          travel,
          state.base + (state.last - state.start) * (dir === "rtl" ? -1 : 1),
        ),
      );
    const stop = (element: HTMLButtonElement, cancel: boolean) => {
      const state = pointer.current;
      if (!state) return;
      pointer.current = null;
      setDragPosition(null);
      setPressing(false);
      if (element.hasPointerCapture(state.id))
        element.releasePointerCapture(state.id);
      if (cancel) {
        suppressClick.current = false;
        return;
      }
      suppressClick.current = true;
      set(state.moved ? position(state) >= travel / 2 : !active);
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 400);
    };
    return (
      <label className={cx("mf-choice", className)}>
        <button
          {...props}
          type="button"
          ref={ref}
          role="switch"
          aria-checked={active}
          disabled={disabled}
          className="mf-switch"
          data-state={active ? "checked" : "unchecked"}
          onClick={(e) => {
            onClick?.(e);
            if (e.detail > 0 && suppressClick.current) {
              suppressClick.current = false;
              return;
            }
            if (!e.defaultPrevented) set(!active);
          }}
          onPointerDown={(e) => {
            onPointerDown?.(e);
            if (
              e.defaultPrevented ||
              disabled ||
              !e.isPrimary ||
              e.button !== 0
            )
              return;
            suppressClick.current = false;
            setPressing(true);
            pointer.current = {
              id: e.pointerId,
              start: e.clientX,
              last: e.clientX,
              moved: false,
              base: active ? travel : 0,
            };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            onPointerMove?.(e);
            if (pointer.current?.id === e.pointerId) {
              pointer.current.last = e.clientX;
              pointer.current.moved ||=
                Math.abs(e.clientX - pointer.current.start) > 7;
              if (pointer.current.moved)
                setDragPosition(position(pointer.current));
            }
          }}
          onPointerUp={(e) => {
            onPointerUp?.(e);
            stop(e.currentTarget, false);
          }}
          onPointerCancel={(e) => {
            onPointerCancel?.(e);
            stop(e.currentTarget, true);
          }}
          onLostPointerCapture={() => {
            pointer.current = null;
            setDragPosition(null);
            setPressing(false);
          }}
        >
          <motion.span
            className="mf-switch-thumb"
            animate={{
              x:
                (dragPosition === null
                  ? (active ? travel : 0) + (pressing ? (active ? -1 : 1) * travel * .18 : 0)
                  : (dragPosition >= travel / 2 ? travel : 0)) *
                (dir === "rtl" ? -1 : 1),
            }}
            transition={
              mode === "expressive" && !reducedMotion
                ? { duration: .14, ease: [.2, .65, .3, 1] }
                : { duration: 0 }
            }
          >
            {languageLabels ? (
              <motion.span key={active ? "on" : "off"} className="mf-switch-language" dir="auto"
                initial={mode === "expressive" && !reducedMotion ? { opacity: 0, scale: .75 } : false}
                animate={{ opacity: 1, scale: 1 }} transition={{ duration: .16 }}>
                {active ? languageLabels.on : languageLabels.off}
              </motion.span>
            ) : icon && icon !== "wifi" && icon !== "bluetooth" ? (
              <SwitchIcon {...iconMotion} name={icon} active={active} animated={mode === "expressive" && !reducedMotion && iconMotion?.animated !== false} />
            ) : icon ? (
              <AnimatedIcon
                {...iconMotion}
                name={active ? icon : `${icon}-off`}
                animateOnMount
                animated={iconMotion?.animated ?? true}
                active={active}
                size={18}
              />
            ) : (
              active && <AnimatedIcon name="check" size={14} />
            )}
          </motion.span>
        </button>
        <span>{label}</span>
        {name && (
          <input
            type="checkbox"
            className="mf-sr"
            tabIndex={-1}
            aria-hidden="true"
            name={name}
            value={value}
            checked={active}
            disabled={disabled}
            readOnly
          />
        )}
      </label>
    );
  },
);
export interface SliderProps extends Slide.SliderProps, Omit<AppearanceProps, "variant"> {
  label: string;
  showValue?: boolean;
  mode?: "continuous" | "stepped";
}
export const Slider = forwardRef<HTMLSpanElement, SliderProps>(
  function Slider(rawProps, ref) {
    const {
      label,
      showValue = true,
      mode: requestedMode,
      "aria-valuetext": ariaValueText,
      value,
      defaultValue = [40],
      onValueChange,
      className,
      ...props
    } = useAppearanceProps({ ...rawProps, variant: "outline" });

    const [current, set] = useControllable(value, defaultValue, onValueChange);
    const [positionReady, setPositionReady] = useState(false);
    useEffect(() => {
      let second = 0;
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setPositionReady(true));
      });
      return () => { cancelAnimationFrame(first); cancelAnimationFrame(second); };
    }, []);
    const {dir, motion: mode, reducedMotion} = useMaterialFluid();
    const fluid = mode === "expressive" && !reducedMotion;
    const sliderMode = requestedMode ?? (props.step === undefined ? "continuous" : "stepped");
    const step = sliderMode === "stepped" ? (props.step ?? 1) : ((props.max ?? 100) - (props.min ?? 0)) / 10000;
    const sliderElement = useRef<HTMLSpanElement | null>(null);
    const attachSlider = useCallback((node: HTMLSpanElement | null) => {
      sliderElement.current = node;
      setRef(ref, node);
    }, [ref]);
    const [usableLength, setUsableLength] = useState(0);
    useLayoutEffect(() => {
      const element = sliderElement.current;
      if (!element) return;
      const thumbs = Array.from(element.querySelectorAll<HTMLElement>(".mf-slider-thumb"));
      const measure = () => {
        const vertical = props.orientation === "vertical";
        const length = vertical ? element.clientHeight : element.clientWidth;
        const handle = Math.max(0, ...thumbs.map(thumb => vertical ? thumb.offsetHeight : thumb.offsetWidth));
        setUsableLength(Math.max(0, length - handle));
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(element);
      thumbs.forEach(thumb => observer.observe(thumb));
      return () => observer.disconnect();
    }, [props.orientation, current.length]);
    const intervals = Math.ceil(((props.max ?? 100) - (props.min ?? 0)) / step);
    const snapMotion = sliderMode === "stepped" && intervals > 0 && Number.isFinite(intervals) && usableLength / intervals >= 16;
    const [dragging, setDragging] = useState(false);
    const wheelDelta = useRef(0);
    const activeThumb = useRef(0);
    useEffect(() => {
      const element = sliderElement.current;
      if (!element || props.disabled || !current.length) return;
      const wheel = (event: WheelEvent) => {
        if (event.ctrlKey || (!event.deltaY && !event.deltaX)) return;
        event.preventDefault();
        const delta = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? -event.deltaX : event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1);
        if (Math.sign(delta) !== Math.sign(wheelDelta.current)) wheelDelta.current = 0;
        wheelDelta.current += delta;
        if (Math.abs(wheelDelta.current) < 40) return;
        const direction = wheelDelta.current > 0 ? -1 : 1;
        wheelDelta.current = 0;
        const thumbs = Array.from(element.querySelectorAll<HTMLElement>(".mf-slider-thumb"));
        const targetIndex = thumbs.findIndex(thumb => thumb === event.target || thumb.contains(event.target as Node));
        const vertical = props.orientation === "vertical";
        const pointerPosition = vertical ? event.clientY : event.clientX;
        const nearest = thumbs.reduce((best, thumb, i) => {
          const rect = thumb.getBoundingClientRect();
          const center = vertical ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
          const distance = Math.abs(center - pointerPosition);
          if (distance < best.distance - .5) return { index: i, distance };
          if (Math.abs(distance - best.distance) <= .5) {
            // Coincident handles choose the endpoint on the pointer's side.
            const higher = Math.abs(pointerPosition - center) <= .5 ? direction > 0 : vertical
              ? pointerPosition < center
              : (props.dir ?? dir) === "rtl" ? pointerPosition < center : pointerPosition > center;
            if (higher ? i > best.index : i < best.index) return { index: i, distance };
          }
          return best;
        }, { index: activeThumb.current, distance: Infinity });
        const index = Math.min(current.length - 1, targetIndex < 0 ? nearest.index : targetIndex);
        const increment = sliderMode === "stepped" ? step : ((props.max ?? 100) - (props.min ?? 0)) / 100;
        const gap = step * (props.minStepsBetweenThumbs ?? 0);
        const low = index > 0 ? current[index - 1] + gap : props.min ?? 0;
        const high = index < current.length - 1 ? current[index + 1] - gap : props.max ?? 100;
        const base = props.min ?? 0;
        const allowedLow = sliderMode === "stepped" ? base + Math.ceil((low - base) / step - 1e-8) * step : low;
        const allowedHigh = sliderMode === "stepped" ? base + Math.floor((high - base) / step + 1e-8) * step : high;
        const next = Math.min(allowedHigh, Math.max(allowedLow, Number((current[index] + direction * increment).toFixed(8))));
        if (next === current[index]) return;
        const values = current.map((value, i) => i === index ? next : value);
        activeThumb.current = index;
        set(values);
        props.onValueCommit?.(values);
      };
      element.addEventListener("wheel", wheel, { passive: false });
      return () => element.removeEventListener("wheel", wheel);
    });
    return (
      <div className={cx("mf-slider-field", className)}>
        <div className="mf-field-heading">
          <span>{label}</span>
          {showValue && <output>{current.map((value, index) => <span key={index}>{index > 0 && " – "}<RollingNumber value={Number(value.toFixed(2))} /></span>)}</output>}
        </div>
        <Slide.Root
          {...props}
          dir={props.dir ?? dir}
          step={step}
          data-slider-mode={sliderMode}
          data-snap-motion={snapMotion ? "true" : "false"}
          data-fluid={fluid || undefined}
          data-position-ready={positionReady || undefined}
          data-dragging={dragging || undefined}
          onFocusCapture={event => {
            props.onFocusCapture?.(event);
            const thumbs = Array.from(event.currentTarget.querySelectorAll(".mf-slider-thumb"));
            const index = thumbs.indexOf(event.target);
            if (index >= 0) activeThumb.current = index;
          }}
          onPointerDownCapture={(event) => {
            props.onPointerDownCapture?.(event);
            if (!props.disabled) setDragging(true);
          }}
          onPointerUpCapture={(event) => {
            props.onPointerUpCapture?.(event);
            setDragging(false);
          }}
          onPointerCancel={(event) => {
            props.onPointerCancel?.(event);
            setDragging(false);
          }}
          ref={attachSlider}
          value={current}
          onValueChange={set}
          onValueCommit={(values) => {
            setDragging(false);
            props.onValueCommit?.(values);
          }}
          className="mf-slider"
        >
          <Slide.Track className="mf-slider-track">
            <Slide.Range className="mf-slider-range" />
          </Slide.Track>
          {current.map((_, i) => (
            <Slide.Thumb
              key={i}
              className="mf-slider-thumb"
              aria-valuetext={ariaValueText}
              aria-label={
                current.length > 1
                  ? `${label} ${i === 0 ? "minimum" : "maximum"}`
                  : label
              }
            />
          ))}
        </Slide.Root>
      </div>
    );
  },
);
export interface NativeInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
// Internal utility keeps native refs composable across public field wrappers.
export { setRef };
