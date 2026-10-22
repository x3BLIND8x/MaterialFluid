import { useAppearanceProps, type AppearanceProps } from "./appearance";
import {
  forwardRef,
  useId,
  useState,
  useEffect,
  type HTMLAttributes,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { AnimatePresence, motion } from "motion/react";
import { useMaterialFluid } from "./provider";
import { useControllable, cx } from "./utils";
import { Button, IconButton } from "./controls";
import { GhostLink } from "./ghost-link";
import { AnimatedIcon } from "./icons";
function NavigationSelection({ id, held = false, className }: { id: string; held?: boolean; className?: string }) {
  const { motion: mode, reducedMotion } = useMaterialFluid();
  const animated = mode === "expressive" && !reducedMotion;
  return <motion.span className={cx("mf-selection", className)} aria-hidden="true" initial={false}
    layoutId={animated ? id : undefined}
    animate={{ scale: animated && held ? 1.025 : 1 }}
    transition={animated ? { type: "spring", stiffness: 420, damping: 28, mass: .8 } : { duration: 0 }} />;
}

export interface NavItem {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  href?: string;
  className?: string;
}
export interface NavigationProps
  extends
    Omit<HTMLAttributes<HTMLElement>, "defaultValue" | "onChange">,
    AppearanceProps {
  items: NavItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label: string;
  /** Share the moving indicator across visually grouped navigation lists. */
  selectionId?: string;
}
export interface TabsProps extends Omit<NavigationProps, "items"> {
  items: (NavItem & { content: ReactNode })[];
}
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  function Tabs(rawProps, ref) {
    const {
      items,
      selectionId,
      label,
      value,
      defaultValue,
      onValueChange,
      className,
      ...props
    } = useAppearanceProps({ ...rawProps, variant: "primary" });

    const [selected, set] = useControllable(
      value,
      defaultValue ?? items[0]?.value ?? "",
      onValueChange,
    );
    const { dir } = useMaterialFluid();
    const id = useId();
    return (
      <TabsPrimitive.Root
        {...props}
        ref={ref}
        dir={dir}
        value={selected}
        onValueChange={set}
        className={cx("mf-tabs", className)}
      >
        <TabsPrimitive.List aria-label={label} className="mf-tab-list">
          {items.map((item) => (
            <TabsPrimitive.Trigger
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              className="mf-tab"
            >
              {selected === item.value && (
                <NavigationSelection id={selectionId ?? id} />
              )}
              <span>
                {item.icon}
                {item.label}
              </span>
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
        {items.map((item) => (
          <TabsPrimitive.Content
            key={item.value}
            value={item.value}
            className="mf-tab-content"
          >
            {item.content}
          </TabsPrimitive.Content>
        ))}
      </TabsPrimitive.Root>
    );
  },
);
export interface BreadcrumbsProps
  extends HTMLAttributes<HTMLElement>, AppearanceProps {
  items: { label: ReactNode; href?: string }[];
  label?: string;
}
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  function Breadcrumbs(rawProps, ref) {
    const {
      items,
      label = "Breadcrumb",
      className,
      ...props
    } = useAppearanceProps({ ...rawProps, variant: "ghost" });

    return (
      <nav
        {...props}
        ref={ref}
        aria-label={label}
        className={cx("mf-breadcrumbs", className)}
      >
        <ol>
          {items.map((item, i) => (
            <li key={i}>
              {i > 0 && <AnimatedIcon name="chevron-right" size={16} />}{" "}
              {item.href ? (
                <GhostLink href={item.href} aria-current={i === items.length - 1 ? "page" : undefined}>{item.label}</GhostLink>
              ) : (
                <Button variant="ghost" aria-current={i === items.length - 1 ? "page" : undefined}>{item.label}</Button>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  },
);
export interface PaginationProps
  extends HTMLAttributes<HTMLElement>, AppearanceProps {
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  totalPages: number;
  label?: string;
}
export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(rawProps, ref) {
    const {
      page,
      defaultPage = 1,
      onPageChange,
      totalPages,
      label,
      className,
      ...props
    } = useAppearanceProps({ ...rawProps, variant: "primary" });

    const [selected, set] = useControllable(page, defaultPage, onPageChange);
    const { locale } = useMaterialFluid();
    const id = useId();
    const count = Math.max(1, totalPages);
    const current = Math.min(count, Math.max(1, selected));
    return (
      <nav
        {...props}
        ref={ref}
        aria-label={label ?? (locale === "fa" ? "صفحه‌بندی" : "Pagination")}
        className={cx("mf-pagination", className)}
      >
        <IconButton
          variant="ghost"
          label={locale === "fa" ? "صفحه قبل" : "Previous page"}
          disabled={current === 1}
          onClick={() => set(current - 1)}
        >
          <AnimatedIcon name="arrow-left" />
        </IconButton>
        {Array.from({ length: count }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === count || Math.abs(p - current) < 2)
          .map((p, i, visible) => (
            <span key={p}>
              {i > 0 && p - visible[i - 1] > 1 && (
                <span className="mf-muted">…</span>
              )}
              <motion.button
                type="button"
                className="mf-page-button mf-nav-item"
                aria-current={current === p ? "page" : undefined}
                aria-label={`${locale === "fa" ? "صفحه" : "Page"} ${p}`}
                onClick={() => set(p)}
              >
                {current === p && <NavigationSelection id={id} />}
                <span>{p.toLocaleString(locale)}</span>
              </motion.button>
            </span>
          ))}
        <IconButton
          variant="ghost"
          label={locale === "fa" ? "صفحه بعد" : "Next page"}
          disabled={current === count}
          onClick={() => set(current + 1)}
        >
          <AnimatedIcon name="arrow-right" />
        </IconButton>
      </nav>
    );
  },
);
export interface TopAppBarProps
  extends Omit<HTMLAttributes<HTMLElement>, "title">, AppearanceProps {
  title: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
}
export const TopAppBar = forwardRef<HTMLElement, TopAppBarProps>(
  function TopAppBar(rawProps, ref) {
    const { title, leading, actions, className, ...props } =
      useAppearanceProps({ ...rawProps, variant: "ghost" });

    return (
      <header {...props} ref={ref} className={cx("mf-appbar", className)}>
        <div>
          {leading}
          <div className="mf-appbar-title">{title}</div>
        </div>
        <div>{actions}</div>
      </header>
    );
  },
);
function NavBase(rawProps: NavigationProps & { kind: string }) {
  const {
    items,
    value,
    defaultValue,
    onValueChange,
    label,
    kind,
    selectionId,
    className,
    ...props
  } = useAppearanceProps({ ...rawProps, variant: "primary" });

  const [selected, set] = useControllable(
    value,
    defaultValue ?? items[0]?.value ?? "",
    onValueChange,
  );
  const id = useId();
  const [held, setHeld] = useState<string | null>(null);
  return (
    <nav
      {...props}
      aria-label={label}
      className={cx("mf-navigation", `mf-navigation--${kind}`, className)}
    >
      {items.map(item => {
        const selectedItem = item.value === selected;
        const content = <>{selectedItem && <NavigationSelection id={selectionId ?? id} held={held === item.value} />}<span className="mf-nav-item-label">{item.icon}{item.label}</span></>;
        const shared = {
          className: cx("mf-nav-item", item.className),
          "aria-current": selectedItem ? "page" as const : undefined,
          onPointerDown: () => setHeld(item.value),
          onPointerUp: () => setHeld(null),
          onPointerCancel: () => setHeld(null),
          onPointerLeave: () => setHeld(null),
          onKeyDown: (event: React.KeyboardEvent) => { if (["Enter", " "].includes(event.key)) setHeld(item.value); },
          onKeyUp: () => setHeld(null),
          onBlur: () => setHeld(null),
          onClick: () => { if (!item.disabled) set(item.value); },
        };
        return item.href && !item.disabled
          ? <motion.a key={item.value} href={item.href} {...shared}>{content}</motion.a>
          : <motion.button key={item.value} type="button" disabled={item.disabled} {...shared}>{content}</motion.button>;
      })}
    </nav>
  );
}
export const NavigationRail = forwardRef<HTMLElement, NavigationProps>(
  function NavigationRail(props, ref) {
    return (
      <div ref={ref as React.Ref<HTMLDivElement>}>
        <NavBase {...props} kind="rail" />
      </div>
    );
  },
);
export const SideNavigation = forwardRef<HTMLElement, NavigationProps>(
  function SideNavigation(props, ref) {
    return (
      <div ref={ref as React.Ref<HTMLDivElement>}>
        <NavBase {...props} kind="side" />
      </div>
    );
  },
);
/** In-page navigation. Item values are the IDs of their destination sections. */
export const TableOfContents = forwardRef<HTMLElement, NavigationProps>(
  function TableOfContents({ items, value, defaultValue, onValueChange, ...props }, ref) {
    const [selected, set] = useControllable(value, defaultValue ?? items[0]?.value ?? "", onValueChange);
    const { motion: mode, reducedMotion } = useMaterialFluid();
    useEffect(() => {
      const sections = items.map(item => document.getElementById(item.value)).filter((element): element is HTMLElement => !!element);
      if (!sections.length) return;
      const update = () => {
        const current = sections.filter(section => section.getBoundingClientRect().top <= window.innerHeight * .3).at(-1) ?? sections[0];
        set(current.id);
      };
      window.addEventListener("scroll", update, { passive: true });
      return () => window.removeEventListener("scroll", update);
    }, [items, set]);
    return <div ref={ref as React.Ref<HTMLDivElement>}><NavBase {...props} kind="toc" items={items} value={selected}
      onValueChange={next => {
        set(next);
        document.getElementById(next)?.scrollIntoView({ behavior: mode === "expressive" && !reducedMotion ? "smooth" : "instant", block: "start" });
      }} /></div>;
  },
);
export interface StepperProps extends NavigationProps {
  allowNavigation?: boolean;
}
export const Stepper = forwardRef<HTMLOListElement, StepperProps>(
  function Stepper(rawProps, ref) {
    const {
      items,
      value,
      defaultValue,
      onValueChange,
      label,
      allowNavigation = true,
      selectionId,
      className,
      ...props
    } = useAppearanceProps({ ...rawProps, variant: "primary" });

    const [selected, set] = useControllable(
      value,
      defaultValue ?? items[0]?.value ?? "",
      onValueChange,
    );
    const index = items.findIndex((item) => item.value === selected);
    const { motion: mode, reducedMotion, dir } = useMaterialFluid();
    const expressive = mode === "expressive" && !reducedMotion;
    const id = useId();
    return (
      <ol
        {...props}
        ref={ref}
        aria-label={label}
        className={cx("mf-stepper", className)}
      >
        {items.map((item, i) => (
          <li key={item.value}>
            {i < items.length - 1 && <span className="mf-step-connector" aria-hidden="true"><motion.span initial={false} animate={{ scaleX: i < index ? 1 : 0 }} style={{ transformOrigin: dir === "rtl" ? "right" : "left" }} transition={{ duration: expressive ? .28 : 0, ease: [.2, 0, 0, 1] }} /></span>}
            <motion.button
              type="button"
              disabled={!allowNavigation || item.disabled}
              aria-current={i === index ? "step" : undefined}
              onClick={() => set(item.value)}
            >
              {i === index && <NavigationSelection id={selectionId ?? id} className="mf-step-selection" />}
              <span
                className="mf-step-dot"
                data-complete={i < index || undefined}
                aria-hidden="true"
              >
                <AnimatePresence initial={false} mode="wait">
                  {i < index ? <motion.span className="mf-step-symbol" key="complete" initial={expressive ? { opacity: 0, scale: .7 } : false} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: expressive ? .7 : 1 }} transition={{ duration: expressive ? .14 : 0 }}><AnimatedIcon name="check" size={16} animated animateOnMount /></motion.span> : <motion.span className="mf-step-symbol" key="number" initial={expressive ? { opacity: 0, scale: .8 } : false} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: expressive ? .8 : 1 }} transition={{ duration: expressive ? .1 : 0 }}>{i + 1}</motion.span>}
                </AnimatePresence>
              </span>
              <span className="mf-step-label">{item.label}</span>
            </motion.button>
          </li>
        ))}
      </ol>
    );
  },
);
export const Link = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & AppearanceProps>(function Link(props, ref) {
  return <GhostLink {...props} ref={ref} />;
});
