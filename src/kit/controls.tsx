import { motionTransition } from "./bounded-motion";
import { SelectionIcon } from "./selection-icon";
import { useCurveValue } from "./curve-value";
import { ButtonCompositionContext } from "./internal-motion";
import {
  isButtonToggleVariant,
  normalizeButtonSize,
  type ButtonSizeInput,
  type IconButtonWidth,
} from "./component-policy";
import { selectionTransition } from "./selection-motion";
import { motionEngine } from "./motion-engine";
import { ButtonRipple } from "./button-ripple";
import {
  QUICK_PRESS_DURATION_MS,
  QUICK_PRESS_THRESHOLD_MS,
  useButtonPressAnimation,
} from "./button-press";
import {
  useAppearanceProps,
  useComponentAppearance,
  type AppearanceProps,
  type ComponentVariant,
} from "./appearance";
import {
  createContext,
  Children,
  isValidElement,
  forwardRef,
  useContext,
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  useCallback,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
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
import { AnimatedIcon, type IconName } from "./icons";
import { RollingNumber } from "./rolling-number";
import { SwitchIcon, type SwitchStateIcon } from "./switch-icon";
import { useButtonGeometry } from "./button-geometry";
import { CircularWave } from "./wavy-progress";

const ButtonPressProgressContext = createContext<MotionValue<number> | null>(
  null,
);

/** Lets nested visual affordances follow the physical press depth of their Button. */
export const useButtonPressProgress = () =>
  useContext(ButtonPressProgressContext);
export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<AppearanceProps, "variant" | "size"> {
  variant?: ComponentVariant | "filled" | "tonal" | "outlined" | "text";
  size?: ButtonSizeInput;
  text?: string;
  icon?: ReactNode;
  selectedIcon?: ReactNode;
  iconPosition?: "start" | "end";
  ariaLabel?: string;
  toggle?: boolean;
  /** Keep a toggle Primary in both states, independently of its appearance. */
  emphasize?: boolean;
  selected?: boolean;
  defaultSelected?: boolean;
  toggleOnClick?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  onSelectionChange?: (detail: { selected: boolean; value: string }) => void;
  active?: boolean;
  progress?:
    | number
    | null
    | boolean
    | { value?: number; indeterminate?: boolean; label?: string };
  showProgress?: boolean;
  indeterminate?: boolean;
  progressLabel?: string;
  loadingText?: string;
  loading?: boolean;
  success?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
}
// Keep the same compositing surface at rest and during a press. Dropping to
// transform:none repaints fractional-height buttons with different edge rounding.
function buttonTransform(_values: unknown, transform: string) {
  return transform === "none" ? "translateZ(0)" : `translateZ(0) ${transform}`;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(rawProps, ref) {
    const defaults = useComponentAppearance();
    const composition = useContext(ButtonCompositionContext);
    const sizeMotion = composition.size ? undefined : false;
    const pressMotion:
      | {
          scale?: number;
          stiffness?: number;
          damping?: number;
          mass?: number;
          radiusDepthRatio?: number;
        }
      | undefined = composition.press ? undefined : { scale: 1 };
    const rippleOptions = composition.ripple ? undefined : false;
    const {
      variant = "filled",
      size = "md",
      loading = false,
      success = false,
      leading,
      trailing,
      children,
      text,
      icon,
      selectedIcon,
      iconPosition = "start",
      ariaLabel,
      toggle: toggleRequested = false,
      emphasize = false,
      selected: controlledSelected,
      defaultSelected = false,
      toggleOnClick = true,
      onSelectedChange,
      onSelectionChange,
      active = false,
      progress,
      showProgress,
      indeterminate,
      progressLabel,
      loadingText,
      className,
      ...props
    } = useAppearanceProps(
      {
        ...rawProps,
        size: normalizeButtonSize(rawProps.size ?? defaults.size ?? "md"),
        variant: rawProps.variant ?? defaults.variant ?? "filled",
      },
      {
        preserveVariant: true,
        preserveSize: true,
      },
    );

    const toggle =
      toggleRequested &&
      (composition.selection || isButtonToggleVariant(variant, emphasize));
    const {
      motion: mode,
      reducedMotion,
      buttonMotion,
      locale,
      dir,
    } = useMaterialFluid();
    const [selected, setSelected] = useControllable(
      controlledSelected,
      defaultSelected,
      onSelectedChange,
    );
    const progressVisible =
      loading ||
      (showProgress ?? (progress !== undefined && progress !== false));
    const progressOptions =
      typeof progress === "object" && progress !== null ? progress : undefined;
    const progressValue = Math.max(
      0,
      Math.min(
        100,
        Number.isFinite(progressOptions?.value ?? progress)
          ? Number(progressOptions?.value ?? progress)
          : 0,
      ),
    );
    const progressUnknown =
      indeterminate ??
      progressOptions?.indeterminate ??
      (typeof progress !== "number" && progressOptions?.value === undefined);
    const label =
      loading && loadingText !== undefined ? loadingText : (children ?? text);
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
    const effectiveRipple =
      rippleOptions === false
        ? false
        : (rippleOptions ?? {
            duration: buttonMotion.rippleDuration / 1000,
            opacity: buttonMotion.rippleOpacity / 100,
            easeOutStrength: buttonMotion.rippleFastStart / 100,
            releaseSpeed: buttonMotion.rippleReleaseSpeed,
          });
    const expressive = mode === "expressive" && !reducedMotion;
    const progressIndicator = (
      <span
        className="mf-button-loader"
        role="progressbar"
        aria-label={
          progressLabel ??
          progressOptions?.label ??
          (locale === "fa" ? "پیشرفت" : "Progress")
        }
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressUnknown ? undefined : progressValue}
      >
        {progressUnknown ? (
          <CircularWave animated={expressive} />
        ) : (
          <svg
            className="mf-button-determinate"
            viewBox="0 0 40 40"
            aria-hidden="true"
          >
            <circle className="mf-wave-track" cx="20" cy="20" r="15" />
            <circle
              cx="20"
              cy="20"
              r="15"
              strokeDasharray={`${progressValue * 0.9424778} 94.24778`}
            />
          </svg>
        )}
      </span>
    );
    const node = useRef<HTMLButtonElement | null>(null);
    const geometry = useButtonGeometry(node, {
      expressive,
      enabled: sizeMotion !== false,
      stiffness: effectivePressMotion.stiffness,
      damping:
        (effectiveSizeMotion === false
          ? undefined
          : effectiveSizeMotion.damping) ?? 40,
      mass: effectivePressMotion.mass,
      className,
      style: props.style,
      size,
    });
    const restRadius = useMotionValue(999);
    const [radiusMeasured, setRadiusMeasured] = useState(false);
    const pressScale = useMotionValue(1);
    // Keep the content's final transform at identity while the surface compresses.
    const contentScale = useTransform(pressScale, (value) =>
      value > 0 ? 1 / value : 1,
    );
    const pressProgress = useTransform(pressScale, (value) => {
      const pressedScale = effectivePressMotion?.scale ?? 0.94;
      return Math.max(
        0,
        Math.min(1, (1 - value) / Math.max(0.001, 1 - pressedScale)),
      );
    });
    const autoFill = toggle && (selectedIcon == null || selectedIcon === "");
    const selectionContent = (content: ReactNode): ReactNode =>
      !autoFill
        ? content
        : Children.map(content, (child) => {
            if (
              isValidElement<import("./icons").AnimatedIconProps>(child) &&
              child.type === AnimatedIcon
            )
              return (
                <SelectionIcon
                  name={child.props.name ?? "plus"}
                  selected={selected}
                  className={child.props.className}
                  style={child.props.style}
                />
              );
            return child;
          });
    const displayedIcon =
      toggle && selected && selectedIcon != null && selectedIcon !== ""
        ? selectedIcon
        : icon;
    const renderedIcon =
      typeof displayedIcon === "string" ? (
        autoFill ? (
          <SelectionIcon name={displayedIcon as IconName} selected={selected} />
        ) : (
          <AnimatedIcon name={displayedIcon as IconName} />
        )
      ) : (
        selectionContent(displayedIcon)
      );
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
      const radius =
        composition.radius === undefined
          ? restRadius.get()
          : typeof composition.radius === "number"
            ? composition.radius
            : composition.radius.get();
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
    const shapeRadius = useTransform(() => {
      const radius = linkedRadius.get(),
        depth = pressProgress.get();
      const corners = composition.corners;
      if (!corners) return String(radius);
      const outer = parseFloat(String(radius)),
        inner = Math.max(
          4,
          (typeof corners.inner === "number"
            ? corners.inner
            : corners.inner.get()) *
            (1 - Number(depth) * 0.5),
        );
      const first =
        corners.vertical || dir !== "rtl" ? corners.first : corners.last;
      const last =
        corners.vertical || dir !== "rtl" ? corners.last : corners.first;
      const values = corners.vertical
        ? [
            first ? outer : inner,
            first ? outer : inner,
            last ? outer : inner,
            last ? outer : inner,
          ]
        : [
            first ? outer : inner,
            last ? outer : inner,
            last ? outer : inner,
            first ? outer : inner,
          ];
      return values.map((value) => `${value}px`).join(" ");
    });
    const successRippleEnabled = useRef(effectiveRipple !== false);
    successRippleEnabled.current = effectiveRipple !== false;
    const { press: startPressMotion, release: releasePressMotion } =
      useButtonPressAnimation(pressScale, expressive, effectivePressMotion);
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
      startPressMotion();
      const releaseTimer = window.setTimeout(releasePressMotion, 80);
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
    }, [success, loading, startPressMotion, releasePressMotion]);
    useLayoutEffect(() => {
      const button = node.current;
      if (!button) return;
      const measure = () => {
        const computed = getComputedStyle(button);
        const authoredRadius = button.classList.contains("mf-icon-button")
          ? Number.POSITIVE_INFINITY
          : parseFloat(computed.getPropertyValue("--mf-ui-radius")) || 24;
        restRadius.set(
          Math.min(
            authoredRadius,
            button.offsetHeight / 2,
            button.offsetWidth / 2,
          ),
        );
      };
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
      releasePressMotion();
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
        aria-label={
          props["aria-label"] ??
          ariaLabel ??
          (progressVisible && typeof label === "string" ? label : undefined)
        }
        aria-busy={
          loading ||
          (progressVisible && (progressUnknown || progressValue < 100)) ||
          undefined
        }
        aria-pressed={toggle ? selected : props["aria-pressed"]}
        data-toggle={toggle || undefined}
        data-emphasize={(toggle && emphasize) || undefined}
        data-active={active || undefined}
        onClick={(event) => {
          props.onClick?.(event);
          if (
            event.defaultPrevented ||
            props.disabled ||
            loading ||
            !toggle ||
            !toggleOnClick
          )
            return;
          setSelected(!selected);
          onSelectionChange?.({
            selected: !selected,
            value: String(props.value ?? ""),
          });
        }}
        data-success={success || undefined}
        className={cx(
          "mf-button",
          renderedIcon &&
            (label === undefined || label === null || label === "") &&
            !leading &&
            !trailing &&
            "mf-button--icon-only",
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
            ? shapeRadius
            : props.style?.borderRadius,
        }}
        onTapStart={(event) => {
          if (props.disabled || loading) return;
          startPressMotion();
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
          {ripples.map((ripple) => (
            <ButtonRipple
              key={ripple.id}
              {...ripple}
              animated={!reducedMotion}
              onProgress={(value) => updateRippleProgress(ripple.id, value)}
              options={effectiveRipple || undefined}
              onFinished={() => {
                setRipples((current) =>
                  current.filter((item) => item.id !== ripple.id),
                );
              }}
            />
          ))}
          <motion.span
            className="mf-button-content"
            style={{ scale: contentScale }}
          >
            {iconPosition === "start"
              ? progressVisible
                ? progressIndicator
                : (selectionContent(leading) ??
                  (renderedIcon && (
                    <span className="mf-action-icon">{renderedIcon}</span>
                  )))
              : selectionContent(leading)}
            {selectionContent(label)}
            {iconPosition === "end" &&
              (progressVisible
                ? progressIndicator
                : renderedIcon && (
                    <span className="mf-action-icon">{renderedIcon}</span>
                  ))}
            {selectionContent(trailing)}
          </motion.span>
        </ButtonPressProgressContext.Provider>
      </motion.button>
    );
  },
);
export type IconButtonProps = Omit<
  ButtonProps,
  "leading" | "trailing" | "ariaLabel"
> & {
  width?: IconButtonWidth;
  selectedLabel?: string;
} & (
    | { label: string; ariaLabel?: string }
    | { label?: string; ariaLabel: string }
    | { label?: string; ariaLabel?: string; "aria-label": string }
  );
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      label,
      ariaLabel,
      selectedLabel,
      className,
      variant,
      width = "default",
      selectedIcon,
      icon,
      children,
      selected: controlledSelected,
      defaultSelected = false,
      onSelectedChange,
      ...props
    },
    ref,
  ) {
    const defaults = useComponentAppearance();
    const effectiveVariant = variant ?? defaults.variant ?? "ghost";
    const [selected, setSelected] = useControllable(
      controlledSelected,
      defaultSelected,
      onSelectedChange,
    );
    const toggled =
      props.toggle &&
      isButtonToggleVariant(effectiveVariant, props.emphasize) &&
      selected;
    const showSelectedIcon =
      toggled && selectedIcon != null && selectedIcon !== "";
    return (
      <Button
        {...props}
        ref={ref}
        variant={effectiveVariant}
        aria-label={
          toggled && selectedLabel
            ? selectedLabel
            : (label ?? ariaLabel ?? props["aria-label"])
        }
        icon={showSelectedIcon ? selectedIcon : icon}
        selectedIcon={selectedIcon}
        selected={selected}
        onSelectedChange={setSelected}
        className={cx("mf-icon-button", `mf-icon-button--${width}`, className)}
      >
        {showSelectedIcon ? undefined : children}
      </Button>
    );
  },
);
export { FAB, fabColors } from "./fab";
export type {
  FABProps,
  FABHandle,
  FABColor,
  FABSize,
  FABVariant,
  FABPosition,
  FABPlacement,
  FABEvent,
  FABEventType,
} from "./fab";
export interface ToggleProps extends Omit<ButtonProps, "variant"> {
  /** Use the shared square icon-action surface; provide an aria-label. */
  iconOnly?: boolean;
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  function Toggle(
    {
      iconOnly = false,
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
        className={cx("mf-toggle", iconOnly && "mf-icon-button", className)}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) set(!active);
        }}
      />
    );
  },
);
export { ButtonGroup, ButtonGroupItem } from "./button-group";
export type {
  ButtonGroupProps,
  ButtonGroupItemProps,
  ButtonGroupHandle,
  ButtonGroupValue,
  ButtonGroupChangeDetail,
  ButtonGroupVariant,
  ButtonGroupKind,
  ButtonGroupDensity,
  ButtonGroupSelection,
} from "./button-group";

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
      size,
    } = useAppearanceProps(
      {
        ...rawProps,
        variant: "primary",
      },
      { preserveSize: true },
    );

    const [selected, set] = useControllable(value, defaultValue, onValueChange);
    const { motion: mode, reducedMotion, buttonMotion } = useMaterialFluid();
    const [preview, setPreview] = useState<string | null>(null);
    const pillPress = useMotionValue(1);
    const pillScale = useTransform(pillPress, (value) => Math.min(1, value));
    const pillRadius = useMotionValue(999);
    const pressedRadius = useTransform(() => {
      const radius = pillRadius.get();
      const depth = Math.max(
        0,
        Math.min(1, (1 - pillPress.get()) * buttonMotion.radiusDepthRatio),
      );
      return `${Math.max(Math.min(6, radius), radius * (1 - depth))}px`;
    });
    const { press: startPillPress, release: releasePillPress } =
      useButtonPressAnimation(
        pillPress,
        mode === "expressive" && !reducedMotion,
        {
          scale: 1 - buttonMotion.pressDepth / 100,
          stiffness: buttonMotion.stiffness,
          damping: buttonMotion.damping,
          mass: buttonMotion.mass,
        },
      );
    const pointer = useRef<{
      id: number;
      startX: number;
      startY: number;
      moved: boolean;
    } | null>(null);
    const suppressClickUntil = useRef(0);
    const displayed = preview ?? selected;
    const resetValue = useRef(rawProps.defaultValue ?? rawProps.value ?? "");
    const choose = (next: string) =>
      set(next === selected ? resetValue.current : next);
    const groupElement = useRef<HTMLDivElement | null>(null);
    const attachGroup = useCallback(
      (element: HTMLDivElement | null) => {
        groupElement.current = element;
        setRef(ref, element);
      },
      [ref],
    );
    const [pillBounds, setPillBounds] = useState<{
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>(null);
    useLayoutEffect(() => {
      if (pillBounds) {
        const radius = groupElement.current
          ? parseFloat(
              getComputedStyle(groupElement.current).getPropertyValue(
                "--mf-ui-radius",
              ),
            )
          : 24;
        pillRadius.set(
          Math.min(radius || 24, pillBounds.width / 2, pillBounds.height / 2),
        );
      }
    }, [pillBounds, pillRadius]);
    useLayoutEffect(() => {
      const group = groupElement.current;
      if (!group) return;
      const items = Array.from(
        group.querySelectorAll<HTMLButtonElement>(".mf-segment"),
      );
      const measure = () => {
        const item = items.find((button) => button.dataset.value === displayed);
        const next = item
          ? {
              x: item.offsetLeft,
              y: item.offsetTop,
              width: item.offsetWidth,
              height: item.offsetHeight,
            }
          : null;
        setPillBounds((previous) =>
          JSON.stringify(previous) === JSON.stringify(next) ? previous : next,
        );
      };
      measure();
      if (typeof ResizeObserver === "undefined") {
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
      }
      const observer = new ResizeObserver(measure);
      observer.observe(group);
      items.forEach((item) => observer.observe(item));
      return () => observer.disconnect();
    }, [displayed, options, size]);
    const optionAt = (group: HTMLDivElement, x: number, y: number) =>
      Array.from(group.querySelectorAll<HTMLButtonElement>(".mf-segment")).find(
        (button) => {
          const bounds = button.getBoundingClientRect();
          return (
            !button.disabled &&
            x >= bounds.left &&
            x <= bounds.right &&
            y >= bounds.top &&
            y <= bounds.bottom
          );
        },
      )?.dataset.value;
    const finish = (
      group: HTMLDivElement,
      cancel: boolean,
      x?: number,
      y?: number,
    ) => {
      const active = pointer.current;
      if (!active) return;
      pointer.current = null;
      if (!cancel && x !== undefined && y !== undefined) {
        const next = optionAt(group, x, y);
        if (next !== undefined) {
          if (active.moved) set(next);
          else choose(next);
        }
      }
      suppressClickUntil.current = performance.now() + 400;
      setPreview(null);
      releasePillPress();
      if (group.hasPointerCapture(active.id))
        group.releasePointerCapture(active.id);
    };
    return (
      <motion.div
        ref={attachGroup}
        role="group"
        aria-label={label}
        className={cx("mf-toggle-group", className)}
        onPointerDown={(event) => {
          // Button's keyboard press animation emits pointer events without a pointer type.
          if (!event.pointerType || !event.isPrimary || event.button !== 0)
            return;
          const next = optionAt(
            event.currentTarget,
            event.clientX,
            event.clientY,
          );
          if (next === undefined) return;
          pointer.current = {
            id: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            moved: false,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
          setPreview(next);
          startPillPress();
        }}
        onPointerMove={(event) => {
          const active = pointer.current;
          if (active?.id !== event.pointerId) return;
          if (
            Math.hypot(
              event.clientX - active.startX,
              event.clientY - active.startY,
            ) > 4
          )
            active.moved = true;
          if (
            event.pointerType === "touch" &&
            Math.abs(event.clientY - active.startY) >
              Math.max(8, Math.abs(event.clientX - active.startX))
          ) {
            finish(event.currentTarget, true);
            return;
          }
          const next = optionAt(
            event.currentTarget,
            event.clientX,
            event.clientY,
          );
          if (next !== undefined) setPreview(next);
        }}
        onPointerUp={(event) =>
          finish(event.currentTarget, false, event.clientX, event.clientY)
        }
        onPointerCancel={(event) => finish(event.currentTarget, true)}
        onLostPointerCapture={(event) => finish(event.currentTarget, true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            releasePillPress();
        }}
      >
        {pillBounds && (
          <motion.span
            className="mf-selection mf-toggle-group-selection"
            aria-hidden="true"
            initial={false}
            animate={pillBounds}
            style={{
              borderRadius: pressedRadius,
              scale: pillScale,
              transformOrigin: "center",
            }}
            transition={
              mode === "expressive" && !reducedMotion
                ? selectionTransition
                : { duration: 0 }
            }
          />
        )}
        <ButtonCompositionContext.Provider
          value={{ size: true, color: false, press: false, ripple: false }}
        >
          {options.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              size={size}
              type="button"
              disabled={option.disabled}
              aria-pressed={displayed === option.value}
              aria-label={option.ariaLabel}
              title={iconOnly ? option.ariaLabel : undefined}
              data-icon-only={iconOnly || undefined}
              data-value={option.value}
              onClick={(event) => {
                if (
                  event.detail === 0 ||
                  performance.now() >= suppressClickUntil.current
                )
                  choose(option.value);
              }}
              onKeyDown={(event) => {
                if (
                  !event.repeat &&
                  (event.key === " " || event.key === "Enter")
                )
                  startPillPress();
              }}
              onKeyUp={(event) => {
                if (event.key === " " || event.key === "Enter")
                  releasePillPress();
              }}
              className="mf-segment"
            >
              <span className="mf-segment-label">{option.label}</span>
            </Button>
          ))}
        </ButtonCompositionContext.Provider>
      </motion.div>
    );
  },
);
/** Selection fill blends selected state and physical press depth, like Toggle. */
function ChoiceFill({
  active,
  partial = false,
  radio = false,
  radioPreview,
  onReadyChange,
}: {
  active: boolean;
  partial?: boolean;
  radio?: boolean;
  radioPreview?: "incoming" | "outgoing";
  onReadyChange?: (ready: boolean) => void;
}) {
  const element = useRef<Element | null>(null);
  const selected = useMotionValue(active ? 1 : 0);
  const pressed = useMotionValue(0);
  const outerScale = useMotionValue(1);
  const radioEmphasis = useMotionValue(1);
  const partialRef = useRef(partial);
  partialRef.current = partial;
  const { motion: mode, reducedMotion, buttonMotion } = useMaterialFluid();
  const fluid = mode === "expressive" && !reducedMotion;
  const radius = useTransform([selected, pressed], ([value, depth]: number[]) =>
    Math.max(
      0,
      Math.min(
        75,
        75 * (value * (1 - depth * 0.75) + (1 - value) * depth * 0.25),
      ),
    ),
  );
  const clipPath = useTransform(
    radius,
    (value) => `circle(${value}% at 50% 50%)`,
  );
  const dotRadius = useTransform(
    [selected, pressed, radioEmphasis],
    ([value, depth, emphasis]: number[]) =>
      Math.min(6, Math.max(0, value * 6 * emphasis * (1 - depth * 0.3))),
  );
  useEffect(() => {
    const animation = animate(
      radioEmphasis,
      fluid && radioPreview === "outgoing" ? 0.9 : 1,
      fluid ? motionTransition("resize") : { duration: 0 },
    );
    return () => animation.stop();
  }, [radioPreview, fluid, radioEmphasis]);
  const previousPreview = useRef(radioPreview);
  useEffect(() => {
    const wasOutgoing = previousPreview.current === "outgoing";
    previousPreview.current = radioPreview;
    if (!radio || (radioPreview !== "outgoing" && !wasOutgoing)) return;
    const animation = animate(
      outerScale,
      fluid && radioPreview === "outgoing" ? 0.96 : 1,
      fluid ? motionTransition("press") : { duration: 0 },
    );
    return () => animation.stop();
  }, [radioPreview, radio, fluid, outerScale, buttonMotion]);
  useMotionValueEvent(radius, "change", (value) => {
    onReadyChange?.(active && value >= Math.SQRT1_2 * 100);
  });
  useEffect(() => {
    if (
      !fluid ||
      partial ||
      (selected.get() === (active ? 1 : 0) && pressed.get() === 0)
    ) {
      selected.set(active ? 1 : 0);
      onReadyChange?.(active);
      return;
    }
    onReadyChange?.(active && radius.get() >= Math.SQRT1_2 * 100);
    const animation = animate(
      selected,
      active ? 1 : 0,
      fluid && !partial ? motionTransition("resize") : { duration: 0 },
    );
    return () => animation.stop();
  }, [active, fluid, partial, selected, pressed, radius, onReadyChange, radio]);
  useEffect(() => {
    const button = element.current?.closest<HTMLButtonElement>("button");
    if (!button) return;
    const pressTarget = button;
    let animation: ReturnType<typeof animate> | undefined;
    let outerAnimation: ReturnType<typeof animate> | undefined;
    let sequence = 0;
    let pressedAt = 0;
    let releaseTimer: ReturnType<typeof setTimeout> | undefined;
    let holding = false;
    let pointerHeld = false;
    const originalTransform = button.style.transform;
    const spring = motionTransition("press");
    outerScale.set(1);
    const unsubscribeOuter = outerScale.on("change", (value) => {
      button.style.transform =
        `${originalTransform} scale(${radio ? Math.min(1, value) : value})`.trim();
    });
    const depth = Math.min(0.18, buttonMotion.pressDepth / 50);
    pressed.set(0);
    const down = (event: Event) => {
      if (!fluid || button.disabled) return;
      if (
        event instanceof KeyboardEvent &&
        (event.repeat || ![" ", "Enter"].includes(event.key))
      )
        return;
      if (event instanceof PointerEvent && event.button !== 0) return;
      sequence++;
      clearTimeout(releaseTimer);
      pressedAt = performance.now();
      holding = true;
      pointerHeld = event instanceof PointerEvent;
      const outerFrom = outerScale.get();
      outerAnimation?.stop();
      outerAnimation =
        outerFrom < 0.98
          ? animate(outerScale, [outerFrom, 1, 1 - depth], {
              duration: 0.08,
              times: [0, 0.25, 1],
              ease: "easeOut",
            })
          : animate(outerScale, 1 - depth, spring);
      if (partialRef.current) return;
      const fillFrom = pressed.get();
      animation?.stop();
      animation =
        fillFrom > 0.1
          ? animate(pressed, [fillFrom, 0, 1], {
              duration: 0.08,
              times: [0, 0.25, 1],
              ease: "easeOut",
            })
          : animate(pressed, 1, motionTransition("resize"));
    };
    const up = (event: Event) => {
      // Clicking label text can blur its button while the pointer is still held.
      if (event.type === "blur" && pointerHeld) return;
      if (event instanceof KeyboardEvent && ![" ", "Enter"].includes(event.key))
        return;
      if (!holding) return;
      holding = false;
      pointerHeld = false;
      const current = sequence;
      const elapsed = performance.now() - pressedAt;
      const release = () => {
        if (sequence !== current) return;
        outerAnimation?.stop();
        outerAnimation = animate(outerScale, 1, spring);
        if (!partialRef.current) {
          animation?.stop();
          animation = animate(pressed, 0, motionTransition("resize"));
        }
      };
      if (elapsed < QUICK_PRESS_THRESHOLD_MS) {
        releaseTimer = setTimeout(
          release,
          Math.max(0, QUICK_PRESS_DURATION_MS - elapsed),
        );
      } else release();
    };
    pressTarget.addEventListener("pointerdown", down);
    button.addEventListener("keydown", down);
    button.addEventListener("blur", up);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("keyup", up);
    return () => {
      animation?.stop();
      outerAnimation?.stop();
      clearTimeout(releaseTimer);
      sequence++;
      unsubscribeOuter();
      outerScale.set(1);
      button.style.transform = originalTransform;
      pressTarget.removeEventListener("pointerdown", down);
      button.removeEventListener("keydown", down);
      button.removeEventListener("blur", up);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("keyup", up);
    };
  }, [fluid, pressed, radio, buttonMotion, outerScale]);
  if (radio)
    return (
      <svg
        ref={(node) => {
          element.current = node;
        }}
        className="mf-radio-artwork"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="mf-radio-ring"
          cx="12"
          cy="12"
          r="11"
          strokeWidth="2"
        />
        <motion.circle
          className="mf-radio-center"
          cx="12"
          cy="12"
          r={dotRadius}
        />
      </svg>
    );
  return (
    <motion.span
      ref={(node) => {
        element.current = node;
      }}
      aria-hidden="true"
      className="mf-choice-fill"
      style={{ clipPath }}
    />
  );
}

const CheckboxSurface=motion.create(forwardRef<HTMLButtonElement,{nativeProps:ButtonHTMLAttributes<HTMLButtonElement>} & Omit<ButtonHTMLAttributes<HTMLButtonElement>,"onDrag"|"onDragStart"|"onDragEnd"|"onAnimationStart">>(function CheckboxSurface({nativeProps,...props},ref){return <button {...nativeProps} {...props} ref={ref}/>;}));
export interface CheckboxChangePayload {
  checked: boolean;
  value: boolean;
  valueAttribute: string;
  nativeEvent?: Event;
}
export interface CheckboxTapPayload {
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  target: EventTarget;
  preventDefault: () => void;
  stopPropagation: () => void;
  type: string;
}
export interface CheckboxSwipePayload {
  direction: "left" | "right";
  deltaX: number;
  deltaY: number;
}
export interface CheckboxEvents {
  change: (payload: CheckboxChangePayload) => void;
  tap: (payload: CheckboxTapPayload) => void;
  swipe: (payload: CheckboxSwipePayload) => void;
}
export interface CheckboxProps
  extends
    Omit<Check.CheckboxProps, "checked" | "onCheckedChange" | "onChange">,
    Omit<AppearanceProps, "variant" | "labelPosition"> {
  labelPosition?: "start" | "end";
  label?: ReactNode;
  ariaLabel?: string;
  error?: boolean;
  indeterminate?: boolean;
  checked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  onChange?: (payload: CheckboxChangePayload) => void;
}
export interface CheckboxHandle extends HTMLButtonElement {
  element: HTMLLabelElement | null;
  input: HTMLInputElement | null;
  check(): CheckboxHandle;
  uncheck(): CheckboxHandle;
  toggle(): CheckboxHandle;
  isChecked(): boolean;
  setIndeterminate(state: boolean): CheckboxHandle;
  setError(error: boolean): CheckboxHandle;
  getValue(): boolean;
  setValue(value: boolean | string): CheckboxHandle;
  getValueAttribute(): string;
  setValueAttribute(value: string): CheckboxHandle;
  getLabel(): string;
  setLabel(label: ReactNode): CheckboxHandle;
  enable(): CheckboxHandle;
  disable(): CheckboxHandle;
  isDisabled(): boolean;
  on<K extends keyof CheckboxEvents>(
    event: K,
    listener: CheckboxEvents[K],
  ): CheckboxHandle;
  off<K extends keyof CheckboxEvents>(
    event: K,
    listener: CheckboxEvents[K],
  ): CheckboxHandle;
  destroy(): void;
}
export const Checkbox = forwardRef<
  HTMLButtonElement | CheckboxHandle,
  CheckboxProps
>(function Checkbox(rawProps, ref) {
  const [overrides, setOverrides] = useState<Partial<CheckboxProps>>({}),
    [destroyed, setDestroyed] = useState(false);
  const appearance:CheckboxProps & {variant:"outline"}={...rawProps,...overrides,labelPosition:overrides.labelPosition??rawProps.labelPosition??"end",variant:"outline"};
  const labelPosition=appearance.labelPosition??"end";
  const {
    label,
    children,
    ariaLabel,
    className,
    checked,
    defaultChecked = false,
    onCheckedChange,
    onChange,
    indeterminate = false,
    error = false,
    name,
    value = "on",
    required = false,
    disabled = false,
    form,
    asChild: _asChild,
    ...props
  } = useAppearanceProps(appearance);
  const [state, setChecked] = useControllable<boolean | "indeterminate">(
      checked,
      defaultChecked,
      onCheckedChange,
    ),
    [marker, setMarker] = useState(indeterminate);
  useLayoutEffect(() => setMarker(indeterminate), [indeterminate]);
  const current = state === "indeterminate" || marker ? "indeterminate" : state,
    selected = state === true;
  const initial = useRef({
    state: rawProps.defaultChecked ?? rawProps.checked ?? false,
    mixed: rawProps.indeterminate ?? false,
  });
  const root = useRef<HTMLLabelElement>(null),
    button = useRef<HTMLButtonElement>(null),
    input = useRef<HTMLInputElement>(null),
    alive = useRef(true);
  const snapshot = useRef({
    selected,
    mixed: current === "indeterminate",
    disabled,
    value,
    label: label ?? children,
    controlled: checked !== undefined,
  });
  snapshot.current = {
    selected,
    mixed: current === "indeterminate",
    disabled,
    value,
    label: label ?? children,
    controlled: checked !== undefined,
  };
  const callbacks = useRef({ onChange, setChecked });
  callbacks.current = { onChange, setChecked };
  const listeners = useRef(
    new Map<keyof CheckboxEvents, Set<CheckboxEvents[keyof CheckboxEvents]>>(),
  );
  const [fillReady, setFillReady] = useState(current === true);
  const { motion: mode, reducedMotion, colorDesign } = useMaterialFluid(),
    animated = mode === "expressive" && !reducedMotion;
  const gesture = useRef<{ x: number; y: number; at: number } | null>(null);
  function emit<K extends keyof CheckboxEvents>(
    event: K,
    payload: Parameters<CheckboxEvents[K]>[0],
  ) {
    if (!alive.current) return;
    for (const listener of listeners.current.get(event) ?? [])
      (listener as (data: Parameters<CheckboxEvents[K]>[0]) => void)(payload);
  }
  function update(next: boolean) {
    if (!alive.current) return;
    setMarker(false);
    snapshot.current.mixed = false;
    if(input.current){input.current.indeterminate=false;if(!snapshot.current.controlled)input.current.checked=next;}
    if (!snapshot.current.controlled) snapshot.current.selected = next;
    callbacks.current.setChecked(next);
  }
  useLayoutEffect(() => {
    if (input.current) {
      input.current.defaultChecked = initial.current.state === true;
      input.current.checked = selected;
      input.current.indeterminate = current === "indeterminate";
    }
  }, [selected, current]);
  useEffect(() => {
    const owner = input.current?.form;
    if (!owner) return;
    const reset = () => {
      setMarker(initial.current.mixed);
      callbacks.current.setChecked(initial.current.state);
    };
    owner.addEventListener("reset", reset);
    return () => owner.removeEventListener("reset", reset);
  }, [form]);
  useLayoutEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      listeners.current.clear();
    };
  }, []);
  if (destroyed) return null;
  return (
    <label
      ref={root}
      className={cx("mf-choice", className)}
      data-checkbox=""
      data-label-position={labelPosition}
      data-error={error || undefined}
      onClick={(event) => {
        if (
          !(event.target as Element).closest("button,input,a,select,textarea")
        ) {
          event.preventDefault();
          if (!disabled) input.current?.click();
        }
      }}
    >
      <CheckboxSurface
        nativeProps={props} style={props.style}
        ref={(node) => {
          button.current = node;
          if (!node) {
            setRef(ref, null);
            return;
          }
          const handle = node as CheckboxHandle;
          const patch = (change: Partial<CheckboxProps>) => {
            if (alive.current)
              setOverrides((previous) => ({ ...previous, ...change }));
            return handle;
          };
          Object.assign(handle, {
            check: () => {
              update(true);
              return handle;
            },
            uncheck: () => {
              update(false);
              return handle;
            },
            toggle: () => {
              update(!snapshot.current.selected);
              return handle;
            },
            isChecked: () => snapshot.current.selected,
            getValue: () => snapshot.current.selected,
            setValue: (next: boolean | string) => {
              update(next === true || next === "true" || next === "1");
              return handle;
            },
            getValueAttribute: () => snapshot.current.value,
            setValueAttribute: (next: string) => {
              snapshot.current.value = next;
              return patch({ value: next });
            },
            setIndeterminate: (next: boolean) => {
              snapshot.current.mixed = next;
              if(input.current)input.current.indeterminate=next;
              setMarker(next);
              if (state === "indeterminate" && !next)
                callbacks.current.setChecked(snapshot.current.selected);
              return handle;
            },
            setError: (next: boolean) => patch({ error: next }),
            getLabel: () =>
              typeof snapshot.current.label === "string"
                ? snapshot.current.label
                : (root.current?.querySelector(".mf-checkbox-label")
                    ?.textContent ?? ""),
            setLabel: (next: ReactNode) => {
              snapshot.current.label = next;
              return patch({ label: next });
            },
            enable: () => {
              snapshot.current.disabled = false;
              if(input.current)input.current.disabled=false;
              node.disabled = false;
              return patch({ disabled: false });
            },
            disable: () => {
              snapshot.current.disabled = true;
              if(input.current)input.current.disabled=true;
              node.disabled = true;
              return patch({ disabled: true });
            },
            isDisabled: () => snapshot.current.disabled,
            on: <K extends keyof CheckboxEvents>(
              name: K,
              listener: CheckboxEvents[K],
            ) => {
              if (alive.current) {
                if (!listeners.current.has(name))
                  listeners.current.set(name, new Set());
                listeners.current.get(name)!.add(listener);
              }
              return handle;
            },
            off: <K extends keyof CheckboxEvents>(
              name: K,
              listener: CheckboxEvents[K],
            ) => {
              listeners.current.get(name)?.delete(listener);
              return handle;
            },
            destroy: () => {
              alive.current = false;
              listeners.current.clear();
              setDestroyed(true);
            },
          });
          Object.defineProperties(handle,{element:{configurable:true,get:()=>root.current},input:{configurable:true,get:()=>input.current}});
          setRef(ref, handle);
        }}
        type="button" value={value} form={form}
        role="checkbox"
        aria-checked={current === "indeterminate" ? "mixed" : selected}
        aria-required={required || undefined}
        aria-invalid={error || props["aria-invalid"]}
        aria-label={props["aria-label"] ?? ariaLabel}
        disabled={disabled}
        data-state={
          current === "indeterminate"
            ? "indeterminate"
            : selected
              ? "checked"
              : "unchecked"
        }
        data-disabled={disabled || undefined}
        className="mf-checkbox"
        initial={false}
        animate={{ borderRadius: current === false ? "25%" : "50%" }}
        transition={motionEngine.layout(animated)}
        onClick={(event) => {
          props.onClick?.(event);
          if (!event.defaultPrevented && !disabled) {
            // Cancel the label's implicit activation, including clicks on SVG marks.
            event.preventDefault();
            input.current?.click();
          }
        }}
        onKeyDown={(event) => {
          props.onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === "Enter") {
            event.preventDefault();
            input.current?.form?.requestSubmit();
          } else if (event.key === " ") {
            event.preventDefault();
            if (!event.repeat && !disabled) input.current?.click();
          }
        }}
        onPointerDown={(event) => {
          props.onPointerDown?.(event);
          gesture.current =
            !disabled && event.pointerType === "touch"
              ? { x: event.clientX, y: event.clientY, at: performance.now() }
              : null;
        }}
        onPointerUp={(event) => {
          props.onPointerUp?.(event);
          const start = gesture.current;
          gesture.current = null;
          if (!start || disabled) return;
          const dx = event.clientX - start.x,
            dy = event.clientY - start.y;
          if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy))
            emit("swipe", {
              direction: dx < 0 ? "left" : "right",
              deltaX: dx,
              deltaY: dy,
            });
          else if (
            Math.hypot(dx, dy) < 10 &&
            performance.now() - start.at < 250
          )
            emit("tap", {
              clientX: event.clientX,
              clientY: event.clientY,
              pageX: event.pageX,
              pageY: event.pageY,
              target: event.target,
              preventDefault: () => event.preventDefault(),
              stopPropagation: () => event.stopPropagation(),
              type: event.type,
            });
        }}
        onPointerCancel={(event) => {
          gesture.current = null;
          props.onPointerCancel?.(event);
        }}
      >
        <ChoiceFill
          active={
            current === true ||
            (current === "indeterminate" && colorDesign === "material")
          }
          partial={current === "indeterminate" && colorDesign !== "material"}
          onReadyChange={setFillReady}
        />
        <span
          className="mf-checkbox-mark"
          data-state={current === "indeterminate" ? "indeterminate" : undefined}
          data-ready={
            (current === "indeterminate" &&
              (colorDesign !== "material" || fillReady)) ||
            (current === true && fillReady)
              ? "true"
              : undefined
          }
        >
          {current === true && fillReady && (
            <svg
              className="mf-checkbox-tick"
              data-icon-name="check"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              aria-hidden="true"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={animated ? { pathLength: 0, opacity: 0 } : false}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: animated ? 0.18 : 0, ease: "easeOut" }}
              />
            </svg>
          )}
          {current === "indeterminate" && (
            <svg
              className="mf-checkbox-minus"
              data-icon-name="minus"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              aria-hidden="true"
            >
              <motion.path
                d="M6 12h12"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                initial={animated ? { pathLength: 0, opacity: 0 } : false}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: animated ? 0.18 : 0, ease: "easeOut" }}
              />
            </svg>
          )}
        </span>
      </CheckboxSurface>
      <input
        ref={input}
        className="mf-checkbox-native"
        type="checkbox"
        tabIndex={-1}
        aria-hidden="true"
        name={name}
        value={value}
        form={form}
        checked={selected}
        disabled={disabled}
        required={required}
        aria-invalid={error || undefined}
        onInvalid={(event) => {
          event.preventDefault();
          button.current?.focus();
        }}
        onChange={(event) => {
          const next = event.currentTarget.checked;
          update(next);
          const payload: CheckboxChangePayload = {
            checked: next,
            value: next,
            valueAttribute: event.currentTarget.value,
            nativeEvent: event.nativeEvent,
          };
          callbacks.current.onChange?.(payload);
          emit("change", payload);
        }}
      />
      {label !== undefined || children !== undefined ? (
        <span className="mf-checkbox-label">{label ?? children}</span>
      ) : null}
    </label>
  );
});
export interface RadioGroupProps
  extends
    Radio.RadioGroupProps,
    Omit<AppearanceProps, "variant" | "labelPosition"> {
  labelPosition?: "end";
  options: ChoiceOption[];
  label: string;
}
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup(rawProps, ref) {
    const {
      options,
      label,
      className,
      value,
      defaultValue = "",
      onValueChange,
      ...props
    } = useAppearanceProps({
      ...rawProps,
      labelPosition: "end",
      variant: "outline",
    });
    const [selected, setSelected] = useControllable(
      value === null ? "" : value,
      defaultValue ?? "",
      onValueChange,
    );
    const [preview, setPreview] = useState<string | null>(null);
    useEffect(() => {
      const reset = () => setPreview(null);
      window.addEventListener("pointerup", reset);
      window.addEventListener("pointercancel", reset);
      return () => {
        window.removeEventListener("pointerup", reset);
        window.removeEventListener("pointercancel", reset);
      };
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
          <label
            key={o.value}
            className="mf-choice"
            onClick={(event) => {
              if (!(event.target as Element).closest("button, input"))
                event.preventDefault();
            }}
            onPointerDown={(event) => {
              if (
                event.button === 0 &&
                (event.target as Element).closest(".mf-radio") &&
                !o.disabled &&
                !props.disabled
              )
                setPreview(o.value);
            }}
            onPointerUp={(event) => {
              if (event.button === 0 && preview === o.value) {
                setSelected(o.value);
                setPreview(null);
              }
            }}
            onPointerCancel={() => setPreview(null)}
          >
            <Radio.Item
              className="mf-radio"
              value={o.value}
              disabled={o.disabled}
            >
              <Radio.Indicator forceMount className="mf-radio-dot">
                <ChoiceFill
                  radio
                  active={selected === o.value || preview === o.value}
                  radioPreview={
                    preview !== null && preview !== selected
                      ? preview === o.value
                        ? "incoming"
                        : selected === o.value
                          ? "outgoing"
                          : undefined
                      : undefined
                  }
                />
              </Radio.Indicator>
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
    Omit<AppearanceProps, "variant" | "labelPosition"> {
  labelPosition?: "end";
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (value: boolean) => void;
  label: ReactNode;
  icon?: "wifi" | "bluetooth" | SwitchStateIcon;
  languageLabels?: { off: string; on: string };
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
    } = useAppearanceProps(
      {
        ...rawProps,
        labelPosition: "end",
        variant: "primary",
        size: rawProps.size ?? defaults.size ?? "md",
      },
      { preserveSize: true },
    );

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
      <label
        className={cx("mf-choice", className)}
        onClick={(event) => {
          if (!(event.target as Element).closest("button, input"))
            event.preventDefault();
        }}
      >
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
                  ? (active ? travel : 0) +
                    (pressing ? (active ? -1 : 1) * travel * 0.18 : 0)
                  : dragPosition >= travel / 2
                    ? travel
                    : 0) * (dir === "rtl" ? -1 : 1),
            }}
            transition={
              mode === "expressive" && !reducedMotion
                ? { duration: 0.14, ease: [0.2, 0.65, 0.3, 1] }
                : { duration: 0 }
            }
          >
            {languageLabels ? (
              <motion.span
                key={active ? "on" : "off"}
                className="mf-switch-language"
                dir="auto"
                initial={
                  mode === "expressive" && !reducedMotion
                    ? { opacity: 0, scale: 0.75 }
                    : false
                }
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.16 }}
              >
                {active ? languageLabels.on : languageLabels.off}
              </motion.span>
            ) : icon && icon !== "wifi" && icon !== "bluetooth" ? (
              <SwitchIcon
                name={icon}
                active={active}
                animated={mode === "expressive" && !reducedMotion}
              />
            ) : icon ? (
              <AnimatedIcon
                name={active ? icon : `${icon}-off`}
                animateOnMount
                animated
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
export interface SliderProps
  extends
    Slide.SliderProps,
    Omit<AppearanceProps, "variant" | "labelPosition"> {
  labelPosition?: "top";
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
    } = useAppearanceProps({
      ...rawProps,
      labelPosition: "top",
      variant: "outline",
    });

    const [current, set] = useControllable(value, defaultValue, onValueChange);
    const [positionReady, setPositionReady] = useState(false);
    useEffect(() => {
      let second = 0;
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setPositionReady(true));
      });
      return () => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
      };
    }, []);
    const { dir, motion: mode, reducedMotion } = useMaterialFluid();
    const fluid = mode === "expressive" && !reducedMotion;
    const sliderMode =
      requestedMode ?? (props.step === undefined ? "continuous" : "stepped");
    const step =
      sliderMode === "stepped"
        ? (props.step ?? 1)
        : ((props.max ?? 100) - (props.min ?? 0)) / 10000;
    const sliderElement = useRef<HTMLSpanElement | null>(null);
    const attachSlider = useCallback(
      (node: HTMLSpanElement | null) => {
        sliderElement.current = node;
        setRef(ref, node);
      },
      [ref],
    );
    const [usableLength, setUsableLength] = useState(0);
    useLayoutEffect(() => {
      const element = sliderElement.current;
      if (!element) return;
      const thumbs = Array.from(
        element.querySelectorAll<HTMLElement>(".mf-slider-thumb"),
      );
      const measure = () => {
        const vertical = props.orientation === "vertical";
        const length = vertical ? element.clientHeight : element.clientWidth;
        const handle = Math.max(
          0,
          ...thumbs.map((thumb) =>
            vertical ? thumb.offsetHeight : thumb.offsetWidth,
          ),
        );
        setUsableLength(Math.max(0, length - handle));
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(element);
      thumbs.forEach((thumb) => observer.observe(thumb));
      return () => observer.disconnect();
    }, [props.orientation, current.length]);
    const intervals = Math.ceil(((props.max ?? 100) - (props.min ?? 0)) / step);
    const snapMotion =
      sliderMode === "stepped" &&
      intervals > 0 &&
      Number.isFinite(intervals) &&
      usableLength / intervals >= 14;
    const [dragging, setDragging] = useState(false);
    const [pointerFocused, setPointerFocused] = useState(false);
    const [wheelMotion, setWheelMotion] = useState(false);
    const [keyboardHeld, setKeyboardHeld] = useState(false);
    const [keyboardMotion, setKeyboardMotion] = useState(false);
    const [pointerMotion, setPointerMotion] = useState(false);
    const [pointerDisplay, setPointerDisplay] = useState<{
      index: number;
      value: number;
    } | null>(null);
    const pointerVisual = useRef<{ index: number; value: number } | null>(null);
    const showPointer = useCallback(
      (display: { index: number; value: number } | null) => {
        pointerVisual.current = display;
        setPointerDisplay(display);
      },
      [],
    );
    // Damping ratio .7 gives the reference demo's .3 bounce, with physical
    // parameters so retargeting preserves velocity instead of restarting a tween.
    const pointerSpring = useCurveValue(0);
    const pointerSpringRange = useRef<{
      index: number;
      low: number;
      high: number;
      target: number;
    } | null>(null);
    const wheelMotionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined,
    );
    const keyboardMotionTimer = useRef<
      ReturnType<typeof setTimeout> | undefined
    >(undefined);
    useEffect(
      () => () => {
        clearTimeout(wheelMotionTimer.current);
        clearTimeout(keyboardMotionTimer.current);
        pointerSpring.stop();
      },
      [pointerSpring],
    );
    const clearPointerAnimation = () => {
      pointerSpringRange.current = null;
      pointerSpring.jump(pointerSpring.get());
      showPointer(null);
      setPointerMotion(false);
    };
    useEffect(() => {
      if (!fluid) {
        pointerSpringRange.current = null;
        pointerSpring.jump(pointerSpring.get());
        showPointer(null);
        setPointerMotion(false);
      }
    }, [fluid, showPointer, pointerSpring]);
    const wheelDelta = useRef(0);
    const activeThumb = useRef(0);
    const minimum = props.min ?? 0;
    const maximum = props.max ?? 100;
    // Values stay quantized for consumers; the held handle follows the pointer freely.
    const displayValues = current.map((value, index) =>
      pointerDisplay?.index === index ? pointerDisplay.value : value,
    );
    const orderedPositions = displayValues.map((value) =>
      maximum === minimum
        ? 0
        : Math.max(
            0,
            Math.min(100, ((value - minimum) / (maximum - minimum)) * 100),
          ),
    );
    const positions = props.inverted
      ? orderedPositions.map((position) => 100 - position).reverse()
      : orderedPositions;
    const stops = [0, ...positions, 100];
    const vertical = props.orientation === "vertical";
    const pointerDrag = useRef<{
      id: number;
      index: number;
      values: number[];
      initial: number[];
      display: number;
    } | null>(null);
    useMotionValueEvent(pointerSpring, "change", (value) => {
      const range = pointerSpringRange.current;
      if (range)
        showPointer({
          index: range.index,
          value: Math.max(range.low, Math.min(range.high, value)),
        });
    });
    useMotionValueEvent(pointerSpring, "animationComplete", () => {
      const range = pointerSpringRange.current;
      if (
        !pointerDrag.current &&
        range &&
        Math.abs(pointerSpring.get() - range.target) < 0.001
      ) {
        pointerSpringRange.current = null;
        showPointer(null);
        setPointerMotion(false);
      }
    });
    const pressedIndex = dragging
      ? pointerDrag.current?.index
      : keyboardHeld
        ? activeThumb.current
        : undefined;
    const pressedPosition =
      pressedIndex === undefined
        ? undefined
        : props.inverted
          ? current.length - 1 - pressedIndex
          : pressedIndex;
    const updatePointer = (x: number, y: number, follow = true) => {
      const drag = pointerDrag.current;
      const track = sliderElement.current?.querySelector(".mf-slider-track");
      if (!drag || !track) return;
      const rect = track.getBoundingClientRect();
      let fraction = vertical
        ? (rect.bottom - y) / rect.height
        : (x - rect.left) / rect.width;
      if (!vertical && (props.dir ?? dir) === "rtl") fraction = 1 - fraction;
      if (props.inverted) fraction = 1 - fraction;
      const gap = step * (props.minStepsBetweenThumbs ?? 0);
      const low = drag.index > 0 ? drag.values[drag.index - 1] + gap : minimum;
      const high =
        drag.index < drag.values.length - 1
          ? drag.values[drag.index + 1] - gap
          : maximum;
      const raw =
        minimum + Math.max(0, Math.min(1, fraction)) * (maximum - minimum);
      const snapped = minimum + Math.round((raw - minimum) / step) * step;
      const allowedLow =
        minimum + Math.ceil((low - minimum) / step - 1e-8) * step;
      const allowedHigh =
        minimum + Math.floor((high - minimum) / step + 1e-8) * step;
      const next = Number(
        Math.min(high, allowedHigh, Math.max(low, allowedLow, snapped)).toFixed(
          8,
        ),
      );
      if (!Number.isFinite(next)) return;
      drag.display = fluid ? Math.min(high, Math.max(low, raw)) : next;
      if (follow && fluid) springPointer(drag, drag.display);
      if (next === drag.values[drag.index]) return;
      drag.values = drag.values.map((value, index) =>
        index === drag.index ? next : value,
      );
      set(drag.values);
    };
    const springPointer = (
      drag: NonNullable<typeof pointerDrag.current>,
      target: number,
    ) => {
      const gap = step * (props.minStepsBetweenThumbs ?? 0);
      const low = drag.index > 0 ? drag.values[drag.index - 1] + gap : minimum;
      const high =
        drag.index < drag.values.length - 1
          ? drag.values[drag.index + 1] - gap
          : maximum;
      pointerSpringRange.current = { index: drag.index, low, high, target };
      pointerSpring.setTarget(target);
    };
    const finishPointer = (element: HTMLSpanElement, commit: boolean) => {
      const drag = pointerDrag.current;
      if (!drag) return;
      pointerDrag.current = null;
      setDragging(false);
      const target = drag.values[drag.index];
      const from =
        pointerVisual.current?.index === drag.index
          ? pointerVisual.current.value
          : target;
      if (
        fluid &&
        (Math.abs(from - target) > 1e-8 || pointerSpring.isAnimating())
      ) {
        springPointer(drag, target);
      } else clearPointerAnimation();
      if (element.hasPointerCapture(drag.id))
        element.releasePointerCapture(drag.id);
      if (commit && String(drag.initial) !== String(drag.values))
        props.onValueCommit?.(drag.values);
    };
    useEffect(() => {
      const element = sliderElement.current;
      if (!element || props.disabled || !current.length) return;
      const wheel = (event: WheelEvent) => {
        if (event.ctrlKey || (!event.deltaY && !event.deltaX)) return;
        event.preventDefault();
        const delta =
          (Math.abs(event.deltaX) > Math.abs(event.deltaY)
            ? -event.deltaX
            : event.deltaY) *
          (event.deltaMode === 1
            ? 16
            : event.deltaMode === 2
              ? element.clientHeight
              : 1);
        if (Math.sign(delta) !== Math.sign(wheelDelta.current))
          wheelDelta.current = 0;
        wheelDelta.current += delta;
        if (Math.abs(wheelDelta.current) < 40) return;
        const direction = wheelDelta.current > 0 ? -1 : 1;
        wheelDelta.current = 0;
        const thumbs = Array.from(
          element.querySelectorAll<HTMLElement>(".mf-slider-thumb"),
        );
        const targetIndex = thumbs.findIndex(
          (thumb) =>
            thumb === event.target || thumb.contains(event.target as Node),
        );
        const vertical = props.orientation === "vertical";
        const pointerPosition = vertical ? event.clientY : event.clientX;
        const nearest = thumbs.reduce(
          (best, thumb, i) => {
            const rect = thumb.getBoundingClientRect();
            const center = vertical
              ? rect.top + rect.height / 2
              : rect.left + rect.width / 2;
            const distance = Math.abs(center - pointerPosition);
            if (distance < best.distance - 0.5) return { index: i, distance };
            if (Math.abs(distance - best.distance) <= 0.5) {
              // Coincident handles choose the endpoint on the pointer's side.
              const higher =
                Math.abs(pointerPosition - center) <= 0.5
                  ? direction > 0
                  : vertical
                    ? pointerPosition < center
                    : (props.dir ?? dir) === "rtl"
                      ? pointerPosition < center
                      : pointerPosition > center;
              if (higher ? i > best.index : i < best.index)
                return { index: i, distance };
            }
            return best;
          },
          { index: activeThumb.current, distance: Infinity },
        );
        const index = Math.min(
          current.length - 1,
          targetIndex < 0 ? nearest.index : targetIndex,
        );
        const increment =
          sliderMode === "stepped"
            ? step
            : Math.abs((props.max ?? 100) - (props.min ?? 0)) / 20;
        const gap = step * (props.minStepsBetweenThumbs ?? 0);
        const low = index > 0 ? current[index - 1] + gap : (props.min ?? 0);
        const high =
          index < current.length - 1
            ? current[index + 1] - gap
            : (props.max ?? 100);
        const base = props.min ?? 0;
        const allowedLow =
          sliderMode === "stepped"
            ? base + Math.ceil((low - base) / step - 1e-8) * step
            : low;
        const allowedHigh =
          sliderMode === "stepped"
            ? base + Math.floor((high - base) / step + 1e-8) * step
            : high;
        const next = Math.min(
          allowedHigh,
          Math.max(
            allowedLow,
            Number((current[index] + direction * increment).toFixed(8)),
          ),
        );
        if (next === current[index]) return;
        clearPointerAnimation();
        const values = current.map((value, i) => (i === index ? next : value));
        activeThumb.current = index;
        clearTimeout(wheelMotionTimer.current);
        setWheelMotion(true);
        wheelMotionTimer.current = setTimeout(() => setWheelMotion(false), 420);
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
          {showValue && (
            <output>
              {current.map((value, index) => (
                <span key={index}>
                  {index > 0 && " – "}
                  <RollingNumber value={Number(value.toFixed(2))} />
                </span>
              ))}
            </output>
          )}
        </div>
        <Slide.Root
          {...props}
          dir={props.dir ?? dir}
          step={step}
          data-slider-mode={sliderMode}
          data-snap-motion={snapMotion ? "true" : "false"}
          data-wheel-motion={wheelMotion || undefined}
          data-key-held={keyboardHeld || undefined}
          data-keyboard-motion={keyboardMotion || undefined}
          data-pointer-motion={pointerMotion || undefined}
          data-fluid={fluid || undefined}
          data-position-ready={positionReady || undefined}
          data-dragging={dragging || undefined}
          data-pointer-focus={pointerFocused || undefined}
          onFocusCapture={(event) => {
            props.onFocusCapture?.(event);
            const thumbs = Array.from(
              event.currentTarget.querySelectorAll(".mf-slider-thumb"),
            );
            const index = thumbs.indexOf(event.target);
            if (index >= 0) activeThumb.current = index;
          }}
          onKeyDownCapture={(event) => {
            props.onKeyDownCapture?.(event);
            if (
              !event.defaultPrevented &&
              [
                "Tab",
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Home",
                "End",
                "PageUp",
                "PageDown",
              ].includes(event.key)
            )
              setPointerFocused(false);
            if (
              event.defaultPrevented ||
              props.disabled ||
              ![
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Home",
                "End",
                "PageUp",
                "PageDown",
              ].includes(event.key)
            )
              return;
            clearPointerAnimation();
            clearTimeout(keyboardMotionTimer.current);
            setKeyboardHeld(true);
            setKeyboardMotion(true);
          }}
          onKeyUpCapture={(event) => {
            props.onKeyUpCapture?.(event);
            if (
              ![
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Home",
                "End",
                "PageUp",
                "PageDown",
              ].includes(event.key)
            )
              return;
            setKeyboardHeld(false);
            clearTimeout(keyboardMotionTimer.current);
            keyboardMotionTimer.current = setTimeout(
              () => setKeyboardMotion(false),
              420,
            );
          }}
          onBlurCapture={(event) => {
            props.onBlurCapture?.(event);
            if (event.currentTarget.contains(event.relatedTarget)) return;
            setPointerFocused(false);
            setKeyboardHeld(false);
            setKeyboardMotion(false);
            clearTimeout(keyboardMotionTimer.current);
          }}
          onPointerDownCapture={(event) => {
            props.onPointerDownCapture?.(event);
            if (
              event.defaultPrevented ||
              props.disabled ||
              !event.isPrimary ||
              event.button !== 0 ||
              !current.length
            )
              return;
            event.preventDefault();
            setPointerFocused(true);
            const thumbs = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>(
                ".mf-slider-thumb",
              ),
            );
            const target = (event.target as HTMLElement).closest(
              ".mf-slider-thumb",
            );
            let index = target ? thumbs.indexOf(target as HTMLElement) : -1;
            if (index < 0) {
              const pointer = vertical ? event.clientY : event.clientX;
              index = thumbs.reduce(
                (nearest, thumb, i) => {
                  const rect = thumb.getBoundingClientRect();
                  const center = vertical
                    ? rect.top + rect.height / 2
                    : rect.left + rect.width / 2;
                  return Math.abs(center - pointer) < nearest.distance
                    ? { index: i, distance: Math.abs(center - pointer) }
                    : nearest;
                },
                { index: 0, distance: Infinity },
              ).index;
            }
            activeThumb.current = index;
            const from =
              pointerVisual.current?.index === index
                ? pointerVisual.current.value
                : current[index];
            if (pointerSpringRange.current?.index !== index) {
              pointerSpringRange.current = null;
              pointerSpring.jump(from);
            }
            if (fluid) showPointer({ index, value: from });
            pointerDrag.current = {
              id: event.pointerId,
              index,
              values: [...current],
              initial: [...current],
              display: current[index],
            };
            event.currentTarget.setPointerCapture(event.pointerId);
            thumbs[index]?.focus({ preventScroll: true });
            clearTimeout(wheelMotionTimer.current);
            clearTimeout(keyboardMotionTimer.current);
            setWheelMotion(false);
            setKeyboardHeld(false);
            setKeyboardMotion(false);
            setPointerMotion(true);
            setDragging(true);
            updatePointer(event.clientX, event.clientY);
          }}
          onPointerMoveCapture={(event) => {
            props.onPointerMoveCapture?.(event);
            if (
              pointerDrag.current?.id !== event.pointerId ||
              event.defaultPrevented
            )
              return;
            event.preventDefault();
            updatePointer(event.clientX, event.clientY);
          }}
          onPointerUpCapture={(event) => {
            props.onPointerUpCapture?.(event);
            if (pointerDrag.current?.id !== event.pointerId) return;
            event.preventDefault();
            updatePointer(event.clientX, event.clientY, false);
            finishPointer(event.currentTarget, true);
          }}
          onPointerCancel={(event) => {
            props.onPointerCancel?.(event);
            finishPointer(event.currentTarget, false);
          }}
          onLostPointerCapture={(event) => {
            props.onLostPointerCapture?.(event);
            finishPointer(event.currentTarget, false);
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
            {stops.slice(0, -1).map((start, index) => {
              const end = stops[index + 1];
              const active =
                current.length === 1
                  ? index === (props.inverted ? 1 : 0)
                  : index > 0 && index < current.length;
              return (
                <span
                  key={index}
                  aria-hidden="true"
                  className={cx(
                    "mf-slider-segment",
                    active && "mf-slider-range",
                  )}
                  data-edge-start={index === 0 || undefined}
                  data-edge-end={index === current.length || undefined}
                  data-round-start={start === 0 || undefined}
                  data-round-end={end === 100 || undefined}
                  data-pressed-start={
                    pressedPosition === index - 1 || undefined
                  }
                  data-pressed-end={pressedPosition === index || undefined}
                  style={
                    vertical
                      ? { bottom: `${start}%`, height: `${end - start}%` }
                      : {
                          insetInlineStart: `${start}%`,
                          width: `${end - start}%`,
                        }
                  }
                >
                  <span className="mf-slider-piece" />
                </span>
              );
            })}
          </Slide.Track>
          {current.map((value, i) => (
            <Slide.Thumb
              key={i}
              className="mf-slider-thumb"
              style={
                pointerDisplay?.index === i && maximum !== minimum
                  ? {
                      translate: (() => {
                        let offset =
                          ((pointerDisplay.value - value) /
                            (maximum - minimum)) *
                          usableLength;
                        if (props.inverted) offset *= -1;
                        if (vertical) return `0 ${-offset}px`;
                        if ((props.dir ?? dir) === "rtl") offset *= -1;
                        return `${offset}px 0`;
                      })(),
                    }
                  : undefined
              }
              data-active={activeThumb.current === i || undefined}
              data-pressed={pressedIndex === i || undefined}
              aria-valuetext={ariaValueText}
              aria-label={
                current.length > 1
                  ? `${label} ${i === 0 ? "minimum" : "maximum"}`
                  : label
              }
            >
              <span className="mf-slider-handle" aria-hidden="true" />
            </Slide.Thumb>
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

export { ExtendedFAB, extendedFABSizes } from "./extended-fab";
export type {
  ExtendedFABProps,
  ExtendedFABHandle,
  ExtendedFABSize,
  ExtendedFABWidth,
  ExtendedFABEvents,
} from "./extended-fab";
