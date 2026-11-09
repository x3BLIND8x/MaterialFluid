import { forwardRef, type HTMLAttributes, type ReactNode, type SVGProps } from "react";
import { Button, ButtonGroup, FAB, IconButton, Toggle, type ButtonProps, type ChoiceOption } from "./controls";
import { AnimatedIcon } from "./icons";
import { Drawer, Menu, type DrawerProps, type MenuItem } from "./overlays";
import { useAppearanceProps, type AppearanceProps, type ComponentSize } from "./appearance";
import { useMaterialFluid } from "./provider";
import { cx, useControllable } from "./utils";
import "./compositions.css";

export interface SplitButtonProps extends Omit<ButtonProps, "children" | "size"> {
  size?: ComponentSize;
  label: string;
  menuLabel: string;
  items: MenuItem[];
}
export const SplitButton = forwardRef<HTMLButtonElement, SplitButtonProps>(function SplitButton(
  { label, menuLabel, items, disabled, size, variant, className, ...props }, ref,
) {
  return <ButtonGroup label={label} size={size} className={className}>
    <Button {...props} ref={ref} disabled={disabled} size={size} variant={variant}>{label}</Button>
    <Menu label={menuLabel} size={size} items={items} trigger={<IconButton disabled={disabled} size={size} variant={variant} label={menuLabel}><AnimatedIcon name="chevron-down" /></IconButton>} />
  </ButtonGroup>;
});

export interface FABMenuProps extends AppearanceProps {
  label: string;
  items: MenuItem[];
  icon?: ReactNode;
  disabled?: boolean;
}
export function FABMenu({ label, items, icon, disabled, size }: FABMenuProps) {
  return <Menu label={label} size={size} items={items} trigger={<FAB size={size} aria-label={label} disabled={disabled}>{icon ?? <AnimatedIcon name="plus" />}</FAB>} />;
}

export interface ChipsProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange">, AppearanceProps {
  label: string;
  options: ChoiceOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
}
export const Chips = forwardRef<HTMLDivElement, ChipsProps>(function Chips(
  rawProps, ref,
) {
  const { label, options, value, defaultValue = [], onValueChange, disabled, size, className, ...props } = useAppearanceProps(rawProps, { preserveSize: true });
  const [selected, setSelected] = useControllable(value, defaultValue, onValueChange);
  return <div {...props} ref={ref} role="group" aria-label={label} className={cx("mf-chips", className)}>
    {options.map(option => <Toggle key={option.value} size={size} pressed={selected.includes(option.value)} disabled={disabled || option.disabled}
      onPressedChange={pressed => setSelected(pressed ? [...selected, option.value] : selected.filter(item => item !== option.value))}>{option.label}</Toggle>)}
  </div>;
});

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement>, AppearanceProps { label: string }
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(rawProps, ref) {
  const { label, className, onKeyDown, ...props } = useAppearanceProps(rawProps);
  const { dir } = useMaterialFluid();
  return <div {...props} ref={ref} role="toolbar" aria-label={label} className={cx("mf-toolbar", className)} onKeyDown={event => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    if ((event.target as HTMLElement).closest("input,textarea,select,[contenteditable=true]")) return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],[tabindex="0"]')).filter(item => !item.closest('[hidden],[inert],[aria-disabled="true"]'));
    const current = controls.indexOf(document.activeElement as HTMLElement);
    if (current < 0 || controls.length < 2) return;
    const delta = (event.key === "ArrowRight" ? 1 : -1) * (dir === "rtl" ? -1 : 1);
    const next = event.key === "Home" ? 0 : event.key === "End" ? controls.length - 1 : (current + delta + controls.length) % controls.length;
    event.preventDefault(); controls[next].focus();
  }} />;
});

export const SideSheet = forwardRef<HTMLDivElement, DrawerProps>(function SideSheet(props, ref) {
  return <Drawer {...props} side={props.side ?? "end"} ref={ref} />;
});

export type ShapeForm = "circle" | "square" | "flower" | "star" | "diamond" | "oval";
export interface ShapeProps extends Omit<SVGProps<SVGSVGElement>, "form"> {
  form?: ShapeForm;
  label?: string;
}
export const Shape = forwardRef<SVGSVGElement, ShapeProps>(function Shape({ form = "flower", label, className, ...props }, ref) {
  const points = Array.from({ length: 160 }, (_, i) => {
    const angle = i / 160 * Math.PI * 2;
    const radius = form === "flower" ? 36 + 8 * Math.cos(6 * angle) : form === "star" ? 34 + 10 * Math.cos(5 * angle) : 43;
    return `${50 + radius * Math.cos(angle)},${50 + radius * Math.sin(angle)}`;
  }).join(" ");
  return <svg {...props} ref={ref} viewBox="0 0 100 100" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={cx("mf-shape", className)}>
    {form === "square" ? <rect x="7" y="7" width="86" height="86" rx="24" /> : form === "diamond" ? <rect x="19" y="19" width="62" height="62" rx="14" transform="rotate(45 50 50)" /> : form === "oval" ? <ellipse cx="50" cy="50" rx="45" ry="32" /> : <polygon points={points} />}
  </svg>;
});
