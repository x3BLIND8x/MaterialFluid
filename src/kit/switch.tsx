import {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  useAppearanceProps,
  useComponentAppearance,
  type AppearanceProps,
} from "./appearance";
import { AnimatedIcon, type IconName } from "./icons";
import { SwitchIcon, type SwitchStateIcon } from "./switch-icon";
import { useMaterialFluid } from "./provider";
import { motionTransition } from "./bounded-motion";
import { cx, setRef, useControllable } from "./utils";

export interface SwitchChangePayload {
  checked: boolean;
  value: boolean;
  valueAttribute: string;
  nativeEvent?: Event;
}
export interface SwitchTapPayload {
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  target: EventTarget | null;
  preventDefault: () => void;
  stopPropagation: () => void;
  type: string;
}
export interface SwitchSwipePayload {
  direction: "left" | "right";
  deltaX: number;
  deltaY: number;
}
export interface SwitchEvents {
  change: (payload: SwitchChangePayload) => void;
  focus: (event: FocusEvent) => void;
  blur: (event: FocusEvent) => void;
  tap: (payload: SwitchTapPayload) => void;
  swipe: (payload: SwitchSwipePayload) => void;
}
export interface SwitchProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value">,
    Omit<AppearanceProps, "variant" | "labelPosition"> {
  labelPosition?: "start" | "end";
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (value: boolean) => void;
  onChange?: (event: SwitchChangePayload) => void;
  label?: ReactNode;
  ariaLabel?: string;
  supportingText?: string;
  error?: boolean;
  required?: boolean;
  /** Selected glyph, optional catalogue name or React artwork. Existing animated names remain supported. */
  icon?: ReactNode;
  unselectedIcon?: ReactNode;
  languageLabels?: { off: string; on: string };
  name?: string;
  value?: string;
}
export interface SwitchHandle extends HTMLButtonElement {
  readonly element: HTMLLabelElement | null;
  readonly input: HTMLInputElement | null;
  readonly supportingTextElement: HTMLElement | null;
  getValue(): boolean;
  setValue(value: boolean | string): SwitchHandle;
  getValueAttribute(): string;
  setValueAttribute(value: string): SwitchHandle;
  check(): SwitchHandle;
  uncheck(): SwitchHandle;
  toggle(): SwitchHandle;
  isChecked(): boolean;
  setLabel(value: string): SwitchHandle;
  getLabel(): string;
  setSupportingText(value: string, isError?: boolean): SwitchHandle;
  removeSupportingText(): SwitchHandle;
  setError(value: boolean): SwitchHandle;
  isError(): boolean;
  enable(): SwitchHandle;
  disable(): SwitchHandle;
  isDisabled(): boolean;
  on<K extends keyof SwitchEvents>(
    name: K,
    callback: SwitchEvents[K],
  ): SwitchHandle;
  off<K extends keyof SwitchEvents>(
    name: K,
    callback: SwitchEvents[K],
  ): SwitchHandle;
  destroy(): void;
}
const legacyIcons = new Set([
  "check",
  "lock",
  "hotspot",
  "vpn",
  "bell",
  "theme",
  "flashlight",
  "airplane",
  "mobile-data",
  "usb-tether",
  "mute",
  "color-inversion",
]);
function Glyph({ value, size }: { value: ReactNode; size: number }) {
  return typeof value === "string" ? (
    value && value !== "none" ? (
      <AnimatedIcon name={value as IconName} size={size} />
    ) : null
  ) : (
    <>{value}</>
  );
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch(rawProps, ref) {
    const defaults = useComponentAppearance(),
      [overrides, setOverrides] = useState<Partial<SwitchProps>>({}),
      configuration = { ...rawProps, ...overrides };
    const labelPosition = configuration.labelPosition ?? "end";
    const {
      checked,
      defaultChecked = false,
      onCheckedChange,
      onChange,
      label,
      children,
      ariaLabel,
      supportingText,
      error = false,
      required = false,
      size,
      icon,
      unselectedIcon,
      languageLabels,
      name,
      value = "on",
      form,
      className,
      disabled,
      onClick,
      onKeyDown,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onFocus,
      onBlur,
      ...props
    } = useAppearanceProps(
      {
        ...configuration,
        labelPosition,
        variant: "primary" as const,
        size: configuration.size ?? defaults.size ?? "md",
      },
      { preserveSize: true },
    );
    const [active, set] = useControllable(
        checked,
        defaultChecked,
        onCheckedChange,
      ),
      [destroyed, setDestroyed] = useState(false),
      [pressing, setPressing] = useState(false),
      [dragPosition, setDragPosition] = useState<number | null>(null);
    const { dir, motion: mode, reducedMotion } = useMaterialFluid(),
      animated = mode === "expressive" && !reducedMotion,
      travel = size === "sm" ? 16 : size === "lg" ? 22 : 20,
      glyphSize = size === "sm" ? 12 : size === "lg" ? 20 : 16;
    const input = useRef<HTMLInputElement>(null),
      button = useRef<HTMLButtonElement>(null),
      root = useRef<HTMLLabelElement>(null),
      helper = useRef<HTMLSpanElement>(null),
      labelNode = useRef<HTMLSpanElement>(null),
      id = useId(),
      initial = useRef(defaultChecked || checked === true),
      alive = useRef(true);
    const latest = useRef({
      active,
      disabled,
      error,
      value,
      label: label ?? children,
      controlled: checked !== undefined,
      set,
      onChange,
    });
    latest.current = {
      active,
      disabled,
      error,
      value,
      label: label ?? children,
      controlled: checked !== undefined,
      set,
      onChange,
    };
    const listeners = useRef(
      new Map<keyof SwitchEvents, Set<SwitchEvents[keyof SwitchEvents]>>(),
    );
    function emit<K extends keyof SwitchEvents>(
      name: K,
      event: Parameters<SwitchEvents[K]>[0],
    ) {
      if (alive.current)
        for (const callback of listeners.current.get(name) ?? [])
          (callback as (payload: Parameters<SwitchEvents[K]>[0]) => void)(
            event,
          );
    }
    function update(next: boolean) {
      if (!alive.current) return;
      if (!latest.current.controlled) {
        latest.current.active = next;
        if (input.current) input.current.checked = next;
      }
      latest.current.set(next);
    }
    function activate(next?: boolean) {
      const control = input.current;
      if (!control || control.matches(":disabled")) return;
      if (next === undefined) control.click();
      else if (next !== latest.current.active) {
        control.checked = next;
        control.dispatchEvent(new Event("input", { bubbles: true }));
        control.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
    useLayoutEffect(() => {
      if (input.current) {
        input.current.defaultChecked = initial.current;
        input.current.checked = active;
      }
    }, [active]);
    useEffect(() => {
      const control = input.current;
      if (!control) return;
      const change = (event: Event) => {
        if(!alive.current)return;
        const next = control.checked;
        update(next);
        const payload = {
          checked: next,
          value: next,
          valueAttribute: control.value,
          nativeEvent: event,
        };
        latest.current.onChange?.(payload);
        emit("change", payload);
        if (latest.current.controlled) control.checked = latest.current.active;
      };
      control.addEventListener("change", change);
      return () => control.removeEventListener("change", change);
    }, [destroyed]);
    useEffect(() => {
      const owner = input.current?.form;
      if (!owner) return;
      const reset = () => update(initial.current);
      owner.addEventListener("reset", reset);
      return () => owner.removeEventListener("reset", reset);
    }, [form, destroyed]);
    const pointer = useRef<{
        id: number;
        start: number;
        last: number;
        y: number;
        lastY: number;
        at: number;
        touch: boolean;
        moved: boolean;
        base: number;
      } | null>(null),
      suppressClick = useRef(false),
      timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => {
      alive.current = true;
      return () => {
        alive.current = false;
        listeners.current.clear();
        clearTimeout(timer.current);
      };
    }, []);
    const position = (state: NonNullable<typeof pointer.current>) =>
      Math.max(
        0,
        Math.min(
          travel,
          state.base + (state.last - state.start) * (dir === "rtl" ? -1 : 1),
        ),
      );
    const stop = (
      element: HTMLButtonElement,
      cancel: boolean,
      nativeEvent: PointerEvent,
    ) => {
      const state = pointer.current;
      if (!state) return;
      pointer.current = null;
      setDragPosition(null);
      setPressing(false);
      if (element.hasPointerCapture?.(state.id))
        element.releasePointerCapture(state.id);
      if (cancel) {
        suppressClick.current = false;
        return;
      }
      suppressClick.current = true;
      activate(
        state.moved ? position(state) >= travel / 2 : !latest.current.active,
      );
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        suppressClick.current = false;
      }, 400);
      if (state.touch) {
        const dx = state.last - state.start,
          dy = state.lastY - state.y;
        if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy))
          emit("swipe", {
            direction: dx < 0 ? "left" : "right",
            deltaX: dx,
            deltaY: dy,
          });
        else if (Math.hypot(dx, dy) < 10 && performance.now() - state.at < 250)
          emit("tap", {
            clientX: state.last,
            clientY: state.lastY,
            pageX: state.last + scrollX,
            pageY: state.lastY + scrollY,
            target: nativeEvent.target,
            preventDefault: () => nativeEvent.preventDefault(),
            stopPropagation: () => nativeEvent.stopPropagation(),
            type: nativeEvent.type,
          });
      }
    };
    const special =
      typeof icon === "string" &&
      legacyIcons.has(icon) &&
      unselectedIcon === undefined;
    const content = languageLabels ? (
      <span className="mf-switch-language" dir="auto">
        {active ? languageLabels.on : languageLabels.off}
      </span>
    ) : special ? (
      <SwitchIcon
        name={icon as SwitchStateIcon}
        active={active}
        animated={animated}
      />
    ) : typeof icon === "string" &&
      (icon === "wifi" || icon === "bluetooth") &&
      unselectedIcon === undefined ? (
      <AnimatedIcon
        name={(active ? icon : `${icon}-off`) as IconName}
        animateOnMount
        animated={animated}
        active={active}
        size={glyphSize}
      />
    ) : (
      <Glyph
        value={active ? (icon === undefined ? "check" : icon) : unselectedIcon}
        size={glyphSize}
      />
    );
    if (destroyed) return null;
    return (
      <label
        ref={root}
        className={cx("mf-choice", className)}
        data-switch=""
        data-label-position={labelPosition}
        data-error={error || undefined}
        onClick={(event) => {
          if (
            !(event.target as Element).closest("button,input,a,select,textarea")
          ) {
            event.preventDefault();
            activate();
          }
        }}
      >
        <button
          {...props}
          type="button"
          form={form}
          value={value}
          ref={(node) => {
            button.current = node;
            if (!node) {
              setRef(ref, null);
              return;
            }
            const handle = node as SwitchHandle;
            const patch = (value: Partial<SwitchProps>) => {
              if (alive.current) {
                if (value.error !== undefined)
                  latest.current.error = value.error;
                if (value.disabled !== undefined)
                  latest.current.disabled = value.disabled;
                if ("label" in value) latest.current.label = value.label;
                setOverrides((previous) => ({ ...previous, ...value }));
              }
              return handle;
            };
            Object.assign(handle, {
              getValue: () => latest.current.active,
              isChecked: () => latest.current.active,
              setValue: (value: boolean | string) => {
                update(value === true || value === "true" || value === "1");
                return handle;
              },
              check: () => {
                update(true);
                return handle;
              },
              uncheck: () => {
                update(false);
                return handle;
              },
              toggle: () => {
                update(!latest.current.active);
                return handle;
              },
              getValueAttribute: () =>
                input.current?.value ?? latest.current.value,
              setValueAttribute: (value: string) => {
                if (input.current) input.current.value = value;
                return patch({ value });
              },
              getLabel: () =>
                typeof latest.current.label === "string"
                  ? latest.current.label
                  : (labelNode.current?.textContent ?? ""),
              setLabel: (label: string) => patch({ label }),
              setSupportingText: (supportingText: string, isError?: boolean) =>
                patch({
                  supportingText,
                  ...(isError === undefined ? {} : { error: isError }),
                }),
              removeSupportingText: () => patch({ supportingText: undefined }),
              setError: (error: boolean) => patch({ error }),
              isError: () => latest.current.error,
              enable: () => {
                node.disabled = false;
                if (input.current) input.current.disabled = false;
                return patch({ disabled: false });
              },
              disable: () => {
                node.disabled = true;
                if (input.current) input.current.disabled = true;
                return patch({ disabled: true });
              },
              isDisabled: () =>
                !!latest.current.disabled ||
                !!input.current?.matches(":disabled"),
              on: <K extends keyof SwitchEvents>(
                name: K,
                callback: SwitchEvents[K],
              ) => {
                if (alive.current) {
                  let callbacks = listeners.current.get(name);
                  if (!callbacks) {
                    callbacks = new Set();
                    listeners.current.set(name, callbacks);
                  }
                  callbacks.add(callback);
                }
                return handle;
              },
              off: <K extends keyof SwitchEvents>(
                name: K,
                callback: SwitchEvents[K],
              ) => {
                listeners.current.get(name)?.delete(callback);
                return handle;
              },
              destroy: () => {
                alive.current = false;
                listeners.current.clear();
                clearTimeout(timer.current);
                setDestroyed(true);
              },
            });
            Object.defineProperties(handle, {
              element: { get: () => root.current, configurable: true },
              input: { get: () => input.current, configurable: true },
              supportingTextElement: {
                get: () => helper.current,
                configurable: true,
              },
            });
            setRef(ref, handle);
          }}
          role="switch"
          aria-checked={active}
          aria-label={props["aria-label"] ?? ariaLabel}
          aria-labelledby={
            props["aria-labelledby"] ??
            (!ariaLabel &&
            !props["aria-label"] &&
            (label !== undefined || children !== undefined)
              ? `${id}-label`
              : undefined)
          }
          aria-describedby={
            [props["aria-describedby"], supportingText ? `${id}-helper` : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
          aria-invalid={error || props["aria-invalid"]}
          aria-required={required || undefined}
          disabled={disabled}
          className="mf-switch"
          data-state={active ? "checked" : "unchecked"}
          onClick={(event) => {
            onClick?.(event);
            const prevented = event.defaultPrevented;
            event.preventDefault();
            if (suppressClick.current && event.detail > 0) {
              suppressClick.current = false;
              return;
            }
            if (!prevented) activate();
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (
              !event.defaultPrevented &&
              (event.key === " " || event.key === "Enter")
            ) {
              event.preventDefault();
              if (!event.repeat) activate();
            }
          }}
          onFocus={(event) => {
            onFocus?.(event);
            emit("focus", event.nativeEvent);
          }}
          onBlur={(event) => {
            onBlur?.(event);
            emit("blur", event.nativeEvent);
          }}
          onPointerDown={(event) => {
            onPointerDown?.(event);
            if (
              event.defaultPrevented ||
              disabled ||
              !event.isPrimary ||
              event.button !== 0
            )
              return;
            suppressClick.current = false;
            setPressing(true);
            pointer.current = {
              id: event.pointerId,
              start: event.clientX,
              last: event.clientX,
              y: event.clientY,
              lastY: event.clientY,
              at: performance.now(),
              touch: event.pointerType === "touch",
              moved: false,
              base: active ? travel : 0,
            };
            if (event.nativeEvent.isTrusted)
              event.currentTarget.setPointerCapture?.(event.pointerId);
          }}
          onPointerMove={(event) => {
            onPointerMove?.(event);
            if (pointer.current?.id === event.pointerId) {
              pointer.current.last = event.clientX;
              pointer.current.lastY = event.clientY;
              pointer.current.moved ||=
                Math.abs(event.clientX - pointer.current.start) > 7;
              if (pointer.current.moved)
                setDragPosition(position(pointer.current));
            }
          }}
          onPointerUp={(event) => {
            onPointerUp?.(event);
            stop(event.currentTarget, false, event.nativeEvent);
          }}
          onPointerCancel={(event) => {
            onPointerCancel?.(event);
            stop(event.currentTarget, true, event.nativeEvent);
          }}
          onLostPointerCapture={() => {
            pointer.current = null;
            setDragPosition(null);
            setPressing(false);
          }}
        >
          <motion.span
            className="mf-switch-thumb"
            initial={false}
            animate={{
              x:
                (dragPosition === null
                  ? (active ? travel : 0) +
                    (pressing ? (active ? -1 : 1) * travel * 0.18 : 0)
                  : dragPosition >= travel / 2
                    ? travel
                    : 0) * (dir === "rtl" ? -1 : 1),
            }}
            transition={animated ? motionTransition("press") : { duration: 0 }}
          >
            {special || icon === "wifi" || icon === "bluetooth" ? (
              content
            ) : (
              <AnimatePresence initial={false}>
                <motion.span
                  className="mf-switch-glyph"
                  key={active ? "on" : "off"}
                  initial={{ opacity: animated ? 0 : 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: animated ? 0.12 : 0 }}
                >
                  {content}
                </motion.span>
              </AnimatePresence>
            )}
          </motion.span>
        </button>
        <span className="mf-switch-content">
          {label !== undefined || children !== undefined ? (
            <span
              id={`${id}-label`}
              ref={labelNode}
              className="mf-switch-label"
            >
              {label ?? children}
            </span>
          ) : null}
          {supportingText ? (
            <span
              id={`${id}-helper`}
              ref={helper}
              className="mf-switch-supporting"
            >
              {supportingText}
            </span>
          ) : null}
        </span>
        <input
          ref={input}
          className="mf-checkbox-native"
          type="checkbox"
          defaultChecked={initial.current}
          tabIndex={-1}
          aria-hidden="true"
          name={name}
          value={value}
          form={form}
          disabled={disabled}
          required={required}
          aria-invalid={error || undefined}
          onInvalid={(event) => {
            event.preventDefault();
            button.current?.focus();
          }}
          onFocus={(event) => emit("focus", event.nativeEvent)}
          onBlur={(event) => emit("blur", event.nativeEvent)}
        />
      </label>
    );
  },
);
