import { selectionTransition } from "./selection-motion";
import { settledSpring } from "./motion-engine";
import { motionTransition } from "./bounded-motion";
import { forwardRef, useId, useState, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAppearanceProps, type AppearanceProps } from "./appearance";
import { Button } from "./controls";
import { AnimatedIcon } from "./icons";
import { useMaterialFluid } from "./provider";
import { cx, useControllable } from "./utils";

export interface TreeItem {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  href?: string;
  disabled?: boolean;
  children?: TreeItem[];
}

export interface TreeProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">, AppearanceProps {
  label: string;
  items: TreeItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  /** Also activate branch headings (for nested document navigation). */
  selectBranches?: boolean;
  /** Show supplied icons everywhere, nowhere, or on top-level parents only. */
  iconMode?: "all" | "none" | "parents";
  showExpandControls?: boolean;
  expandAllLabel?: string;
  collapseAllLabel?: string;
}

function branches(items: TreeItem[]): string[] {
  return items.flatMap(item => item.children?.length ? [item.value, ...branches(item.children)] : []);
}

/** A nested selection tree with controlled or uncontrolled selection and expansion. */
export const Tree = forwardRef<HTMLDivElement, TreeProps>(function Tree(rawProps, ref) {
  const { label, items, value, defaultValue, onValueChange, expanded, defaultExpanded = [], onExpandedChange,
    iconMode = "all", selectBranches = false, showExpandControls = true, expandAllLabel, collapseAllLabel, className, ...props } = useAppearanceProps(rawProps);
  const [selected, setSelected] = useControllable(value, defaultValue ?? "", onValueChange);
  const [open, setOpen] = useControllable(expanded, defaultExpanded, onExpandedChange);
  const { motion: mode, reducedMotion, dir, locale } = useMaterialFluid();
  const animated = mode === "expressive" && !reducedMotion;
  const treeId = useId();
  const [focused, setFocused] = useState<string | null>(null);
  const toggle = (id: string) => setOpen(open.includes(id) ? open.filter(key => key !== id) : [...open, id]);
  const allBranches = branches(items);
  const keyHandler = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.getAttribute("role") !== "treeitem") return;
    const visible = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="treeitem"]')).filter(el => !el.closest('[inert]') && el.getClientRects().length > 0 && el.getAttribute("aria-disabled") !== "true");
    const index = visible.indexOf(target);
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    let next: HTMLElement | undefined;
    if (event.key === "ArrowDown") next = visible[index + 1];
    else if (event.key === "ArrowUp") next = visible[index - 1];
    else if (event.key === "Home") next = visible[0];
    else if (event.key === "End") next = visible[visible.length - 1];
    else if (event.key === forward) {
      if (target.getAttribute("aria-expanded") === "false") target.click();
      else if (target.getAttribute("aria-expanded") === "true") next = visible[index + 1];
    } else if (event.key === backward) {
      if (target.getAttribute("aria-expanded") === "true") target.click();
      else next = target.parentElement?.parentElement?.previousElementSibling as HTMLElement | undefined;
    } else if (event.key === " " && target.tagName === "A") {
      target.click();
    } else return;
    event.preventDefault();
    next?.focus();
  };
  const renderItems = (nodes: TreeItem[], depth = 0): ReactNode => nodes.map(item => {
    const showIcon = iconMode === "all" || (iconMode === "parents" && depth === 0);
    const branch = !!item.children?.length;
    const isOpen = branch && open.includes(item.value);
    const isSelected = (!branch || selectBranches) && selected === item.value;
    const common = {
      role: "treeitem" as const,
      "aria-expanded": branch ? isOpen : undefined,
      "aria-owns": isOpen ? `${treeId}-${encodeURIComponent(item.value)}` : undefined,
      "aria-selected": branch && !selectBranches ? undefined : isSelected,
      "aria-disabled": item.disabled || undefined,
      tabIndex: item.disabled ? -1 : (focused === item.value || (focused === null && item.value === items[0]?.value) ? 0 : -1),
      className: cx("mf-tree-item", branch && "mf-tree-branch", isSelected && "mf-tree-item--selected"),
      onFocus: () => setFocused(item.value),
      onClick: (event: MouseEvent<HTMLElement>) => {
        if (item.disabled) { event.preventDefault(); return; }
        if (branch) toggle(item.value);
        if (!branch || selectBranches) setSelected(item.value);
      },
    };
    const content = <>{isSelected && <motion.span className="mf-tree-selection" aria-hidden="true" layoutId={animated ? `${treeId}-selection` : undefined} transition={animated ? selectionTransition : { duration: 0 }} />}{branch && <span className="mf-tree-chevron" aria-hidden="true"><motion.span animate={{ rotate: isOpen ? 90 : (dir === "rtl" ? 180 : 0) }} transition={animated ? motionTransition("resize") : { duration: 0 }}><AnimatedIcon name="chevron-right" size={18} /></motion.span></span>}{showIcon && item.icon && <span className="mf-tree-icon" aria-hidden="true">{item.icon}</span>}<span className="mf-tree-label">{item.label}</span>{branch && <span className="mf-tree-count" aria-hidden="true">{item.children!.length.toLocaleString(locale)}</span>}</>;
    return <div className="mf-tree-node" key={item.value}>
      {item.href && !branch ? <a {...common} href={item.disabled ? undefined : item.href}>{content}</a> : <button {...common} type="button" disabled={item.disabled}>{content}</button>}
      {branch && <AnimatePresence initial={false}>{isOpen && <motion.div id={`${treeId}-${encodeURIComponent(item.value)}`} role="group" className="mf-tree-group" initial={animated ? { height: 0, opacity: 0 } : false} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={animated ? settledSpring({ type: "spring", stiffness: 420, damping: 38 }) : { duration: 0 }}>{renderItems(item.children!, depth + 1)}</motion.div>}</AnimatePresence>}
    </div>;
  });
  return <div {...props} ref={ref} className={cx("mf-tree", className)}>
    {showExpandControls && <div className="mf-tree-actions"><Button size="sm" variant="ghost" onClick={() => setOpen(allBranches)}>{expandAllLabel ?? (locale === "fa" ? "باز کردن همه" : "Expand all")}</Button><Button size="sm" variant="ghost" onClick={() => { setFocused(null); setOpen([]); }}>{collapseAllLabel ?? (locale === "fa" ? "بستن همه" : "Collapse all")}</Button></div>}
    <div id={treeId} role="tree" aria-label={label} className="mf-tree-list" onKeyDown={keyHandler}>{renderItems(items)}</div>
  </div>;
});
