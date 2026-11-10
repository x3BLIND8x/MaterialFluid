import {
  Children,
  Fragment,
  forwardRef,
  isValidElement,
  useEffect,
  useContext,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Button } from "./controls";
import { FAB, type FABColor, type FABSize } from "./fab";
import { Menu, type MenuItem } from "./overlays";
import { AnimatedIcon, type IconName } from "./icons";
import { useMaterialFluid } from "./provider";
import { ButtonCompositionContext } from "./internal-motion";
import { boundedMotionCurve } from "./bounded-motion";
import { useCurveValue } from "./curve-value";
import { cx } from "./utils";
export type FABMenuColor = "primary" | "secondary" | "tertiary";
export type FABMenuPresentation = "auto" | "list" | "menu";
export type FABMenuPlacement = "none" | "bottom-start" | "bottom-end";
export type FABMenuItem = Omit<MenuItem, "label" | "icon"> & {
  text?: string;
  label?: ReactNode;
  icon?: ReactNode;
};
export interface FABMenuItemProps extends Omit<FABMenuItem, "id"> {
  id?: string;
  value?: string;
  children?: ReactNode;
}
export function FABMenuItem(_props: FABMenuItemProps) {
  return null;
}
export interface FABMenuSelection {
  id: string;
  value: string;
  item?: FABMenuItem;
  originalEvent?: Event;
}
export interface FABMenuEvents {
  open: () => void;
  close: () => void;
  select: (event: FABMenuSelection) => void;
}
export interface FABMenuSurface {
  element: HTMLElement;
  open(event?: Event, interactionType?: "mouse" | "keyboard"): unknown;
  close(event?: Event, restoreFocus?: boolean): unknown;
  isOpen(): boolean;
  on(
    event: "close" | "select",
    handler: (event: { itemId?: string }) => void,
  ): unknown;
  destroy(): void;
}
export interface FABMenuProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onSelect" | "onChange" | "color"
> {
  label?: string;
  ariaLabel?: string;
  icon?: ReactNode;
  closeIcon?: ReactNode;
  items?: FABMenuItem[];
  color?: FABMenuColor;
  size?: FABSize;
  variant?: import("./appearance").ComponentVariant;
  presentation?: FABMenuPresentation;
  placement?: FABMenuPlacement;
  disabled?: boolean;
  active?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onSelect?: (event: FABMenuSelection) => void;
  on?: Partial<FABMenuEvents>;
  menu?: (opener: HTMLElement, items: FABMenuItem[]) => FABMenuSurface;
}
export interface FABMenuHandle {
  element: HTMLDivElement | null;
  fab: HTMLButtonElement | null;
  list: HTMLDivElement | null;
  open(event?: Event): FABMenuHandle;
  close(): FABMenuHandle;
  toggle(event?: Event): FABMenuHandle;
  isOpen(): boolean;
  getPresentation(): "list" | "menu";
  on<K extends keyof FABMenuEvents>(
    event: K,
    handler: FABMenuEvents[K],
  ): FABMenuHandle;
  off<K extends keyof FABMenuEvents>(
    event: K,
    handler: FABMenuEvents[K],
  ): FABMenuHandle;
  addClass(...classes: string[]): FABMenuHandle;
  getClass(name: string): string;
  setItems(items: FABMenuItem[]): FABMenuHandle;
  getItems(): FABMenuItem[];
  enable(): FABMenuHandle;
  disable(): FABMenuHandle;
  isDisabled(): boolean;
  destroy(): void;
}
const curve = boundedMotionCurve("popup");
/** Nearest-first reveal and top-first exit on MaterialFluid's finite popup curve. */
export function fabMenuStagger(
  count: number,
  opening: boolean,
  reduced = false,
) {
  return Array.from({ length: count }, (_, index) => {
    if (reduced || count < 2) return 0;
    const progress = opening
      ? Math.min(count - index, Math.max(count - 1, 1)) / count
      : index / count;
    for (let ms = 0; ms <= curve.duration; ms++)
      if (curve.at(ms) >= progress) return ms;
    return Math.ceil(curve.duration);
  });
}
const flatten = (children: ReactNode): ReactNode[] =>
  Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flatten(child.props.children)
      : [child],
  );
const glyph = (icon: ReactNode) =>
  typeof icon === "string" ? (
    icon ? (
      <AnimatedIcon name={icon as IconName} />
    ) : null
  ) : (
    icon
  );
export const FABMenu = forwardRef<FABMenuHandle, FABMenuProps>(
  function FABMenu(raw, ref) {
    const { motion: mode, reducedMotion, locale } = useMaterialFluid();
    const composition = useContext(ButtonCompositionContext);
    const expressive = mode === "expressive" && !reducedMotion;
    const [overrides, setOverrides] = useState<Partial<FABMenuProps>>({}),
      [destroyed, setDestroyed] = useState(false),
      [extras, setExtras] = useState<string[]>([]);
    const {
      label,
      ariaLabel,
      icon = "plus",
      closeIcon = "close",
      items: providedItems,
      children,
      color: askedColor = "primary",
      size: askedSize = "default",
      presentation: askedPresentation = "auto",
      placement: askedPlacement = "none",
      disabled = false,
      active = false,
      open: controlled,
      defaultOpen = false,
      onOpenChange,
      onOpen,
      onClose,
      onSelect,
      on,
      menu,
      variant: _variant,
      className,
      ...props
    } = { ...raw, ...overrides };
    const size: FABSize = [
      "default",
      "medium",
      "large",
      "xs",
      "sm",
      "md",
      "lg",
      "xl",
      "s",
      "m",
      "l",
    ].includes(askedSize)
      ? askedSize
      : "default";
    const color: FABMenuColor = ["primary", "secondary", "tertiary"].includes(
      askedColor,
    )
      ? askedColor
      : "primary";
    const presentation: FABMenuPresentation = ["auto", "list", "menu"].includes(
      askedPresentation,
    )
      ? askedPresentation
      : "auto";
    const placement: FABMenuPlacement = [
      "none",
      "bottom-start",
      "bottom-end",
    ].includes(askedPlacement)
      ? askedPlacement
      : "none";
    const items = useMemo<FABMenuItem[]>(
      () =>
        providedItems ??
        flatten(children)
          .filter(
            (child) => isValidElement(child) && child.type === FABMenuItem,
          )
          .map((child, index) => {
            const { id, value, children, ...item } = (
              child as React.ReactElement<FABMenuItemProps>
            ).props;
            return {
              ...item,
              id: id ?? value ?? String(index),
              label: item.label ?? children,
              text: item.text,
            };
          }),
      [providedItems, children],
    );
    const root = useRef<HTMLDivElement>(null),
      fab = useRef<HTMLButtonElement>(null),
      list = useRef<HTMLDivElement>(null),
      popup = useRef<HTMLDivElement>(null);
    const resolve = () =>
      presentation === "auto"
        ? typeof window !== "undefined" &&
          window.matchMedia?.("(min-width: 600px)").matches
          ? "menu"
          : "list"
        : presentation;
    const [resolved, setResolved] = useState<"list" | "menu">(
        presentation === "auto" ? "list" : presentation,
      ),
      [internal, setInternal] = useState(defaultOpen),
      [windowSize, setWindowSize] = useState(0);
    const open = !disabled && (controlled ?? internal),
      id = `mf-fab-menu-${useId().replaceAll(":", "")}`,
      listMode = resolved === "list",
      expandedList = open && listMode;
    const restingRadius = {
      default: 24,
      medium: 29,
      large: 29,
      xs: 12,
      sm: 14,
      md: 24,
      lg: 29,
      xl: 48,
      s: 14,
      m: 24,
      l: 29,
    }[size];
    const corner = useCurveValue(expandedList ? 28 : restingRadius);
    useLayoutEffect(() => {
      const target = expandedList ? 28 : restingRadius;
      if (expressive) corner.setTarget(target);
      else corner.jump(target);
    }, [expandedList, restingRadius, expressive, corner]);
    const current = useRef({ open, resolved, disabled, items, controlled });
    current.current = { open, resolved, disabled, items, controlled };
    const callbacks = useRef({ onOpenChange, onOpen, onClose, onSelect, on });
    callbacks.current = { onOpenChange, onOpen, onClose, onSelect, on };
    const listeners = useRef(new Map<keyof FABMenuEvents, Set<() => void>>());
    const custom = useRef<FABMenuSurface | null>(null),
      alive = useRef(true),
      api = useRef<FABMenuHandle>(null),
      lastEvent = useRef<Event | undefined>(undefined),
      pointerIntent = useRef(false);
    const delays = useRef<number[]>([]);
    delays.current = fabMenuStagger(items.length, expandedList, !expressive);
    function emit<K extends keyof FABMenuEvents>(
      name: K,
      event?: FABMenuSelection,
    ) {
      if (!alive.current) return;
      const c = callbacks.current;
      const invoke = (fn: unknown) => {
        if (typeof fn === "function")
          (fn as (event?: FABMenuSelection) => void)(event);
      };
      invoke(
        name === "open" ? c.onOpen : name === "close" ? c.onClose : c.onSelect,
      );
      invoke(c.on?.[name]);
      for (const listener of listeners.current.get(name) ?? [])
        invoke(listener);
    }
    function focusFAB() {
      queueMicrotask(() => {
        if (alive.current) fab.current?.focus();
      });
    }
    function change(next: boolean, event?: Event, restore = false) {
      if (
        !alive.current ||
        next === current.current.open ||
        (next && current.current.disabled)
      )
        return;
      const hadFocus = list.current?.contains(document.activeElement);
      if (event) lastEvent.current = event;
      if (current.current.controlled === undefined) {
        current.current.open = next;
        setInternal(next);
      }
      callbacks.current.onOpenChange?.(next);
      emit(next ? "open" : "close");
      if (!next) {
        if (custom.current?.isOpen()) custom.current.close(event, restore);
        const now = resolve();
        current.current.resolved = now;
        setResolved(now);
        if (restore || hadFocus) focusFAB();
      }
    }
    function select(item: FABMenuItem, event?: Event) {
      if (item.disabled || disabled) return;
      item.onSelect?.(event);
      if (event?.defaultPrevented) return;
      emit("select", {
        id: item.id,
        value: item.id,
        item,
        originalEvent: event,
      });
      change(false, event, true);
    }
    function focusItem(index: number) {
      const enabled = Array.from(
        list.current?.querySelectorAll<HTMLButtonElement>(
          '[role="menuitem"]:not(:disabled)',
        ) ?? [],
      );
      if (enabled.length)
        enabled[
          ((index % enabled.length) + enabled.length) % enabled.length
        ].focus();
    }
    useLayoutEffect(() => {
      alive.current = true;
      return () => {
        alive.current = false;
        listeners.current.clear();
        custom.current?.destroy();
        custom.current = null;
      };
    }, []);
    const initiallyResolved = useRef(false);
    useLayoutEffect(() => {
      if (!initiallyResolved.current) {
        initiallyResolved.current = true;
        setResolved(resolve());
      }
    }, []);
    useEffect(() => {
      const resize = () => {
        setWindowSize((value) => value + 1);
        if (!current.current.open) {
          const next = resolve();
          current.current.resolved = next;
          setResolved(next);
        }
      };
      window.addEventListener("resize", resize);
      resize();
      return () => window.removeEventListener("resize", resize);
    }, [presentation]);
    useLayoutEffect(() => {
      if (disabled && internal) setInternal(false);
    }, [disabled, internal]);
    useLayoutEffect(() => {
      if (!open) {
        const next = resolve();
        if (next !== resolved) setResolved(next);
      }
    }, [open, presentation, resolved]);
    useLayoutEffect(() => {
      if (!listMode || !list.current) return;
      for (const button of list.current.querySelectorAll<HTMLElement>(
        ".mf-fab-menu-item",
      )) {
        const content = button.querySelector<HTMLElement>(".mf-button-content");
        button.style.setProperty(
          "--mf-fab-menu-item-width",
          `${Math.ceil(content?.scrollWidth ?? 0)}px`,
        );
      }
      const top = root.current?.getBoundingClientRect().top ?? 0;
      list.current.style.maxHeight =
        top > 0 ? `${Math.max(0, top - 24)}px` : "";
    }, [expandedList, listMode, items, windowSize]);
    useEffect(() => {
      if (!expandedList) return;
      const outside = (event: PointerEvent) => {
        if (root.current && !event.composedPath().includes(root.current))
          change(false, event);
      };
      document.addEventListener("pointerdown", outside, true);
      return () => document.removeEventListener("pointerdown", outside, true);
    }, [expandedList]);
    useLayoutEffect(
      () => () => {
        custom.current?.destroy();
        custom.current = null;
      },
      [menu, providedItems],
    );
    useLayoutEffect(() => {
      if (resolved !== "menu" || !menu || !fab.current) return;
      if (open) {
        if (!custom.current) {
          try {
            const created = menu(fab.current, current.current.items);
            custom.current = created;
            created.on("select", (event) => {
              if (custom.current !== created) return;
              const item = current.current.items.find(
                (item) => item.id === event.itemId,
              );
              if (item) select(item);
            });
            created.on("close", () => {
              if (custom.current === created) change(false);
            });
            if (created.element.id)
              fab.current.setAttribute("aria-controls", created.element.id);
          } catch {
            change(false);
            return;
          }
        }
        if (!custom.current.isOpen())
          try {
            custom.current.open(
              lastEvent.current,
              pointerIntent.current ? "mouse" : "keyboard",
            );
          } catch {
            change(false);
          }
      } else if (custom.current?.isOpen()) custom.current.close();
    }, [open, resolved, menu, providedItems]);
    useImperativeHandle(ref, () => {
      const handle: FABMenuHandle = {
        get element() {
          return root.current;
        },
        get fab() {
          return fab.current;
        },
        get list() {
          return list.current;
        },
        open(event) {
          pointerIntent.current =
            !!event && event instanceof MouseEvent && event.detail > 0;
          lastEvent.current = event;
          change(true, event);
          return handle;
        },
        close() {
          change(false);
          return handle;
        },
        toggle(event) {
          change(!current.current.open, event);
          return handle;
        },
        isOpen: () => current.current.open,
        getPresentation: () => current.current.resolved,
        on(name, listener) {
          if (!listeners.current.has(name))
            listeners.current.set(name, new Set());
          listeners.current.get(name)!.add(listener as () => void);
          return handle;
        },
        off(name, listener) {
          listeners.current.get(name)?.delete(listener as () => void);
          return handle;
        },
        addClass(...classes) {
          root.current?.classList.add(...classes);
          setExtras((previous) => [...new Set([...previous, ...classes])]);
          return handle;
        },
        getClass: (name) =>
          (
            ({
              root: "mf-fab-menu",
              fab: "mf-fab-menu-trigger",
              list: "mf-fab-menu-list",
              item: "mf-fab-menu-item",
            }) as Record<string, string>
          )[name] ?? `mf-fab-menu-${name}`,
        setItems(next) {
          current.current.items = next;
          setOverrides((previous) => ({ ...previous, items: next }));
          return handle;
        },
        getItems: () => current.current.items,
        enable() {
          current.current.disabled = false;
          setOverrides((previous) => ({ ...previous, disabled: false }));
          return handle;
        },
        disable() {
          change(false);
          current.current.disabled = true;
          setOverrides((previous) => ({ ...previous, disabled: true }));
          return handle;
        },
        isDisabled: () => current.current.disabled,
        destroy() {
          if (!alive.current) return;
          change(false);
          alive.current = false;
          custom.current?.destroy();
          custom.current = null;
          listeners.current.clear();
          setDestroyed(true);
        },
      };
      api.current = handle;
      return handle;
    });
    if (destroyed) return null;
    const trigger = (
      <FAB
        ref={(node) => {
          fab.current = node;
        }}
        color={`${color}${expandedList ? "" : "-container"}` as FABColor}
        size={expandedList ? "default" : size}
        icon={(expandedList ? closeIcon : icon) || null}
        ariaLabel={
          ariaLabel || label || (locale === "fa" ? "اقدام‌ها" : "Actions")
        }
        className={cx(
          "mf-fab-menu-trigger",
          expandedList && "mf-fab-menu-trigger--close",
        )}
        data-fab-menu-close={expandedList || undefined}
        disabled={disabled}
        active={active}
        aria-haspopup="menu"
        aria-expanded={open}
        {...(listMode || menu
          ? {
              "aria-controls": custom.current?.element.id || `${id}-list`,
              id: `${id}-fab`,
            }
          : {})}
        onPointerDown={(event) => {
          if (event.pointerType) {
            pointerIntent.current = true;
            lastEvent.current = event.nativeEvent;
          }
        }}
        onClick={(event) => {
          if (listMode || menu)
            change(!current.current.open, event.nativeEvent);
        }}
        onKeyDown={(event) => {
          pointerIntent.current = false;
          lastEvent.current = event.nativeEvent;
          if (!listMode || !current.current.open) return;
          if (
            event.key === "ArrowDown" ||
            (event.key === "Tab" && !event.shiftKey)
          ) {
            event.preventDefault();
            focusItem(0);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            focusItem(-1);
          }
        }}
      />
    );
    const menuItems: MenuItem[] = items.map((item) => ({
      ...item,
      label: item.text ?? item.label,
      icon: glyph(item.icon),
      onSelect: (event) => select(item, event),
    }));
    return (
      <div
        {...props}
        ref={root}
        className={cx(
          "mf-fab-menu",
          `mf-fab-menu--${size}`,
          className,
          ...extras,
        )}
        data-color={color}
        data-presentation={resolved}
        data-placement={placement}
        data-open={open || undefined}
        data-motion={expressive ? "expressive" : "minimal"}
        style={
          {
            ...props.style,
            "--mf-fab-menu-duration": `${expressive ? curve.duration : 0}ms`,
            "--mf-fab-menu-curve": curve.easing,
            "--mf-fab-menu-exit": `${expressive ? Math.max(0, ...delays.current) + curve.duration : 0}ms`,
          } as CSSProperties
        }
        onKeyDown={(event) => {
          props.onKeyDown?.(event);
          if (
            !event.defaultPrevented &&
            listMode &&
            open &&
            event.key === "Escape"
          ) {
            event.preventDefault();
            change(false, event.nativeEvent, true);
          }
        }}
      >
        <ButtonCompositionContext.Provider
          value={{ ...composition, radius: corner }}
        >
          {listMode || menu ? (
            trigger
          ) : (
            <Menu
              ref={popup}
              trigger={trigger}
              items={menuItems}
              label={ariaLabel || label}
              open={open}
              onOpenChange={(next) => change(next)}
              layer="top"
              side="top"
              align={placement === "bottom-start" ? "start" : "end"}
              sideOffset={4}
              focusFirst={!pointerIntent.current}
            />
          )}
        </ButtonCompositionContext.Provider>
        <div
          ref={list}
          id={`${id}-list`}
          role="menu"
          aria-labelledby={`${id}-fab`}
          aria-hidden={!expandedList}
          inert={!expandedList}
          className="mf-fab-menu-list"
          onKeyDown={(event) => {
            const enabled = Array.from(
              list.current!.querySelectorAll<HTMLButtonElement>(
                '[role="menuitem"]:not(:disabled)',
              ),
            );
            const index = enabled.indexOf(event.target as HTMLButtonElement);
            if (event.key === "ArrowDown") focusItem(index + 1);
            else if (event.key === "ArrowUp") focusItem(index - 1);
            else if (event.key === "Home") focusItem(0);
            else if (event.key === "End") focusItem(-1);
            else if (event.key === "Tab")
              change(false, event.nativeEvent, true);
            else return;
            event.preventDefault();
          }}
        >
          <ButtonCompositionContext.Provider
            value={{ size: false, press: true, color: true, ripple: true }}
          >
            {items
              .filter((item) => !item.kind || item.kind === "item")
              .map((item, index) => (
                <Button
                  key={item.id}
                  role="menuitem"
                  tabIndex={-1}
                  disabled={disabled || item.disabled}
                  variant="tonal"
                  className="mf-fab-menu-item"
                  style={
                    {
                      "--mf-fab-menu-delay": `${delays.current[index] ?? 0}ms`,
                    } as CSSProperties
                  }
                  icon={item.icon || null}
                  onClick={(event) => select(item, event.nativeEvent)}
                >
                  {item.text ?? item.label}
                </Button>
              ))}
          </ButtonCompositionContext.Provider>
        </div>
      </div>
    );
  },
);
