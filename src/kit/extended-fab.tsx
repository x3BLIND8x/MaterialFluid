import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Button, type ButtonProps } from "./controls";
import {
  fabColors,
  type FABColor,
  type FABEvent,
  type FABPlacement,
  type FABPosition,
} from "./fab";
import { cx, setRef } from "./utils";
export const extendedFABSizes = ["small", "medium", "large"] as const;
export type ExtendedFABSize = (typeof extendedFABSizes)[number];
export type ExtendedFABWidth = "fixed" | "fluid";
export interface ExtendedFABProps extends Omit<
  ButtonProps,
  "size" | "variant" | "text"
> {
  text?:ReactNode;
  size?: ExtendedFABSize;
  variant?: FABColor;
  color?: FABColor;
  width?: ExtendedFABWidth;
  placement?: FABPlacement;
  position?: FABPosition;
  collapseOnScroll?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onCollapse?: () => void;
  onExpand?: () => void;
}
export interface ExtendedFABEvents {
  click: (event: FABEvent<MouseEvent>) => void;
  focus: (event: FABEvent<FocusEvent>) => void;
  blur: (event: FABEvent<FocusEvent>) => void;
  touchstart: (event: FABEvent<TouchEvent>) => void;
  touchmove: (event: FABEvent<TouchEvent>) => void;
  touchend: (event: FABEvent<TouchEvent>) => void;
  touchcancel: (event: FABEvent<TouchEvent>) => void;
  collapse: () => void;
  expand: () => void;
}
export interface ExtendedFABHandle extends HTMLButtonElement {
  element: HTMLButtonElement;
  setText(text: ReactNode): ExtendedFABHandle;
  getText(): string;
  setIcon(icon: ReactNode): ExtendedFABHandle;
  getIcon(): ReactNode;
  setValue(value: string): ExtendedFABHandle;
  getValue(): string;
  setSize(size: ExtendedFABSize): ExtendedFABHandle;
  getSize(): ExtendedFABSize;
  setWidth(width: ExtendedFABWidth): ExtendedFABHandle;
  getWidth(): ExtendedFABWidth;
  setVariant(variant: FABColor): ExtendedFABHandle;
  getVariant(): FABColor;
  setColor(color: FABColor): ExtendedFABHandle;
  getColor(): FABColor;
  setPosition(position: FABPosition | undefined): ExtendedFABHandle;
  getPosition(): FABPosition | null;
  setPlacement(placement: FABPlacement | undefined): ExtendedFABHandle;
  getPlacement(): FABPlacement;
  collapse(): ExtendedFABHandle;
  expand(): ExtendedFABHandle;
  isCollapsed(): boolean;
  enable(): ExtendedFABHandle;
  disable(): ExtendedFABHandle;
  isDisabled(): boolean;
  on<K extends keyof ExtendedFABEvents>(
    event: K,
    listener: ExtendedFABEvents[K],
  ): ExtendedFABHandle;
  off<K extends keyof ExtendedFABEvents>(
    event: K,
    listener: ExtendedFABEvents[K],
  ): ExtendedFABHandle;
  addClass(...classes: string[]): ExtendedFABHandle;
  getClass(name: string): string;
  destroy(): void;
}
export const ExtendedFAB = forwardRef<
  HTMLButtonElement | ExtendedFABHandle,
  ExtendedFABProps
>(function ExtendedFAB(raw, ref) {
  const [overrides, setOverrides] = useState<Partial<ExtendedFABProps>>({}),
    [internal, setInternal] = useState(raw.defaultCollapsed ?? false),
    [extras, setExtras] = useState<string[]>([]),
    [destroyed, setDestroyed] = useState(false),
    [available, setAvailable] = useState(0);
  const {
    size: askedSize = "small",
    variant = "primary-container",
    color: askedColor,
    width: askedWidth = "fixed",
    placement,
    position,
    collapseOnScroll = false,
    collapsed: controlled,
    defaultCollapsed: _initial,
    onCollapsedChange,
    onCollapse,
    onExpand,
    icon,
    text,
    children,
    disabled = false,
    className,
    style,
    ...props
  } = { ...raw, ...overrides };
  const size: ExtendedFABSize = extendedFABSizes.includes(askedSize)
      ? askedSize
      : "small",
    width: ExtendedFABWidth = askedWidth === "fluid" ? "fluid" : "fixed",
    color: FABColor = fabColors.includes(askedColor ?? variant)
      ? (askedColor ?? variant)
      : "primary-container";
  const collapsed = controlled ?? internal,
    content = children ?? text;
  const button = useRef<HTMLButtonElement>(null),
    lastButton = useRef<HTMLButtonElement | null>(null),
    alive = useRef(true);
  const current = useRef({
    size,
    width,
    color,
    placement,
    position,
    collapsed,
    controlled,
    disabled,
    icon,
    content,
  });
  current.current = {
    size,
    width,
    color,
    placement,
    position,
    collapsed,
    controlled,
    disabled,
    icon,
    content,
  };
  const callbacks = useRef({ onCollapsedChange, onCollapse, onExpand });
  callbacks.current = { onCollapsedChange, onCollapse, onExpand };
  const listeners = useRef(
    new Map<
      keyof ExtendedFABEvents,
      Map<ExtendedFABEvents[keyof ExtendedFABEvents], EventListener>
    >(),
  );
  function cleanup() {
    for (const [name, map] of listeners.current)
      for (const listener of map.values())
        lastButton.current?.removeEventListener(name, listener);
    listeners.current.clear();
  }
  function change(next: boolean, force = false) {
    if (!alive.current) return;
    const changed = next !== current.current.collapsed;
    if (changed) {
      if (current.current.controlled === undefined) {
        current.current.collapsed = next;
        setInternal(next);
      }
      callbacks.current.onCollapsedChange?.(next);
    }
    if (changed || force) {
      (next ? callbacks.current.onCollapse : callbacks.current.onExpand)?.();
      button.current?.dispatchEvent(
        new CustomEvent(next ? "collapse" : "expand", {
          bubbles: true,
          cancelable: true,
          composed: true,
        }),
      );
    }
  }
  useLayoutEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      cleanup();
    };
  }, []);
  useEffect(() => {
    if (!collapseOnScroll || destroyed) return;
    let previous = window.scrollY,
      frame = 0;
    const scroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!alive.current) return;
        const y = window.scrollY,
          delta = y - previous;
        if (y <= 0 || delta < -10) change(false);
        else if (delta > 10) change(true);
        previous = y;
      });
    };
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", scroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [collapseOnScroll, destroyed]);
  useLayoutEffect(() => {
    if (width !== "fluid" || destroyed || !button.current?.parentElement)
      return;
    const parent = button.current.parentElement;
    const measure = () => {
      const css = getComputedStyle(parent);
      setAvailable(
        Math.max(
          0,
          parent.clientWidth -
            parseFloat(css.paddingLeft || "0") -
            parseFloat(css.paddingRight || "0"),
        ),
      );
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [width, destroyed]);
  const measuredStyle = useMemo(
    () =>
      ({
        ...style,
        ...(width === "fluid" && available
          ? { "--mf-efab-available-width": `${available}px` }
          : {}),
      }) as CSSProperties,
    [style, width, available],
  );
  if (destroyed) return null;
  return (
    <Button
      {...props}
      ref={(node) => {
        button.current = node;
        if (!node) {
          setRef(ref, null);
          return;
        }
        lastButton.current = node;
        const handle = node as ExtendedFABHandle;
        const update = (patch: Partial<ExtendedFABProps>) => {
          if (alive.current)
            setOverrides((previous) => ({ ...previous, ...patch }));
          return handle;
        };
        Object.assign(handle, {
          element: node,
          setText: (next: ReactNode) => {
            current.current.content = next;
            return update({ text: next, children: undefined });
          },
          getText: () =>
            typeof current.current.content === "string" ||
            typeof current.current.content === "number"
              ? String(current.current.content)
              : (node.querySelector(".mf-extended-fab-label")?.textContent ??
                ""),
          setIcon: (next: ReactNode) => {
            current.current.icon = next;
            return update({ icon: next });
          },
          getIcon: () => current.current.icon,
          setValue: (value: string) => {
            node.value = value;
            return update({ value });
          },
          getValue: () => node.value,
          setSize: (next: ExtendedFABSize) => {
            current.current.size = next;
            return update({ size: next });
          },
          getSize: () => current.current.size,
          setWidth: (next: ExtendedFABWidth) => {
            current.current.width = next;
            return update({ width: next });
          },
          getWidth: () => current.current.width,
          setVariant: (next: FABColor) => {
            current.current.color = next;
            return update({ variant: next, color: undefined });
          },
          getVariant: () => current.current.color,
          setColor: (next: FABColor) => {
            current.current.color = next;
            return update({ color: next });
          },
          getColor: () => current.current.color,
          setPosition: (next: FABPosition | undefined) => {
            current.current.position = next;
            return update({ position: next });
          },
          getPosition: () =>
            current.current.placement === undefined
              ? (current.current.position ?? null)
              : null,
          setPlacement: (next: FABPlacement | undefined) => {
            current.current.placement = next;
            return update({ placement: next });
          },
          getPlacement: () => current.current.placement ?? "none",
          collapse: () => {
            change(true, true);
            return handle;
          },
          expand: () => {
            change(false, true);
            return handle;
          },
          isCollapsed: () => current.current.collapsed,
          enable: () => {
            current.current.disabled = false;
            node.disabled = false;
            return update({ disabled: false });
          },
          disable: () => {
            current.current.disabled = true;
            node.disabled = true;
            return update({ disabled: true });
          },
          isDisabled: () => current.current.disabled,
          on: <K extends keyof ExtendedFABEvents>(
            name: K,
            callback: ExtendedFABEvents[K],
          ) => {
            if (!alive.current) return handle;
            if (!listeners.current.has(name))
              listeners.current.set(name, new Map());
            const map = listeners.current.get(name)!;
            if (!map.has(callback)) {
              const listener: EventListener = (event) => {
                if (name === "collapse" || name === "expand")
                  (callback as () => void)();
                else if (name !== "click" || !node.disabled)
                  (callback as (event: FABEvent) => void)({
                    event,
                    originalEvent: event,
                    element: node,
                  });
              };
              map.set(callback, listener);
              node.addEventListener(name, listener);
            }
            return handle;
          },
          off: <K extends keyof ExtendedFABEvents>(
            name: K,
            callback: ExtendedFABEvents[K],
          ) => {
            const listener = listeners.current.get(name)?.get(callback);
            if (listener) node.removeEventListener(name, listener);
            listeners.current.get(name)?.delete(callback);
            return handle;
          },
          addClass: (...classes: string[]) => {
            node.classList.add(...classes);
            setExtras((previous) => [...new Set([...previous, ...classes])]);
            return handle;
          },
          getClass: (name: string) =>
            (
              ({
                root: "mf-extended-fab",
                icon: "mf-action-icon",
                text: "mf-extended-fab-label",
                label: "mf-extended-fab-label",
                ripple: "mf-button-ripple",
              }) as Record<string, string>
            )[name] ?? `mf-extended-fab-${name}`,
          destroy: () => {
            alive.current = false;
            cleanup();
            setDestroyed(true);
          },
        });
        setRef(ref, handle);
      }}
      icon={icon || null}
      disabled={disabled}
      variant="filled"
      size={size === "small" ? "md" : size === "medium" ? "lg" : "xl"}
      className={cx(
        "mf-fab",
        "mf-extended-fab",
        `mf-extended-fab--${size}`,
        `mf-extended-fab--${width}`,
        collapsed && "mf-extended-fab--collapsed",
        className,
        ...extras,
      )}
      data-efab-size={size}
      data-efab-width={width}
      data-collapsed={collapsed || undefined}
      data-fab-color={color}
      data-fab-placement={placement}
      data-fab-position={placement === undefined ? position : undefined}
      style={measuredStyle}
    >
      {content !== undefined && content !== null && (
        <span className="mf-extended-fab-label">{content}</span>
      )}
    </Button>
  );
});
